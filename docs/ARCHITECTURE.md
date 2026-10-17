# ARCHITECTURE.md

## Visión general

```
iPhone (PWA instalada) ──► Next.js en Vercel ──► Supabase (Postgres + Auth + RLS)
                               │  ▲                    ▲
 Telegram ──webhook──────────► │  │                    │
 Google Calendar API ◄────────►│  │         pg_cron (cada 5 min)
 Resend (email) ◄──────────────┘  └──────── /api/cron/reminders
 Web Push (VAPID) ◄──────────────────────── despachador de recordatorios
```

Un solo repositorio, una sola app, un solo despliegue (monolito modular). Pocas piezas porque la persona que dirige el proyecto no programa y tiene que poder operarlo.

## Decisiones (ADR resumidas)
| # | Decisión | Motivo | Alternativa descartada |
|---|---|---|---|
| 1 | Monolito modular en Next.js | Simple de operar y desplegar | Microservicios |
| 2 | Supabase (Postgres + Auth + RLS) | Login con Google resuelto, aislamiento por usuario en la base | Auth propio, Firebase |
| 3 | PWA | Sin App Store, push en iPhone con iOS 16.4+ | App nativa (se evalúa tras el piloto) |
| 4 | Migraciones SQL con Supabase CLI y tipos generados | Menos piezas que un ORM, y RLS es SQL de todos modos | Prisma/Drizzle |
| 5 | Un modelo `items` con tipo | Una sola vista "Hoy" y recordatorios uniformes | Tablas por módulo |
| 6 | `pg_cron` en Supabase para disparar el despachador | Necesitamos frecuencia de minutos | Vercel Cron (verificar límites vigentes del plan gratuito; históricamente solo permitía ejecución diaria) |
| 7 | Telegram como canal de captura | API gratuita y simple | WhatsApp Business API (costosa y burocrática) |

**Pendiente de verificar en el Sprint 1** (documentar el resultado como ADR): límites vigentes de Vercel y Supabase en planes gratuitos, y que Vercel Hobby es solo para uso no comercial (para comercializar habrá que pasar a un plan de pago).

## Modelo de datos (referencia; las migraciones definen la versión final)

Todas las tablas llevan `user_id uuid not null references auth.users on delete cascade` y políticas RLS que limitan lectura y escritura a `user_id = auth.uid()`.

```sql
create type item_type    as enum ('task','event','appointment','bill','note');
create type item_status  as enum ('inbox','todo','doing','done','cancelled','skipped');
create type context_kind as enum ('work','personal','health','finance');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  timezone text not null default 'America/Argentina/Buenos_Aires',
  locale text not null default 'es-AR',
  reminder_hour smallint not null default 9,       -- hora local de avisos de fecha límite
  created_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  context context_kind,
  color text,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  project_id uuid references projects on delete set null,
  type item_type not null,
  title text not null,
  body_md text,
  status item_status not null default 'inbox',
  context context_kind,
  priority smallint not null default 0,
  due_date date,                       -- fecha límite o vencimiento, sin hora
  due_time time,                       -- opcional, hora local del usuario
  starts_at timestamptz,               -- eventos y citas
  ends_at timestamptz,
  all_day boolean not null default false,
  location text,
  recurrence_rrule text,               -- RFC 5545, solo para ítems que no son facturas
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Facturas
create table bill_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  provider text not null,
  category text not null,              -- luz, gas, agua, expensas, internet, celular, impuesto, otro
  customer_ref text,                   -- número de cliente: solo referencia
  pay_url text,
  typical_amount_cents bigint,
  currency char(3) not null default 'ARS',
  interval_months smallint not null default 1,
  typical_due_day smallint,
  remind_days_before smallint[] not null default '{5,1,0}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table bill_details (
  item_id uuid primary key references items on delete cascade,
  user_id uuid not null,
  plan_id uuid not null references bill_plans on delete cascade,
  period date not null,                -- primer día del mes del vencimiento
  confirmed boolean not null default false,   -- false = fecha/monto estimados
  second_due_date date,
  amount_cents bigint,
  paid_at timestamptz,
  paid_amount_cents bigint,
  unique (plan_id, period)
);
-- "Vencida" no se guarda: se calcula (due_date < hoy y status = 'todo').

create table checklist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  item_id uuid not null references items on delete cascade,
  text text not null,
  done boolean not null default false,
  position int not null default 0
);

create table reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  item_id uuid not null references items on delete cascade,
  remind_at timestamptz not null,
  channel text not null,               -- push | email | telegram
  status text not null default 'pending',   -- pending | sent | failed | cancelled
  attempts smallint not null default 0,
  sent_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);
create index on reminders (status, remind_at);

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create table telegram_links (            -- Sprint 4
  user_id uuid primary key,
  chat_id bigint not null unique,
  linked_at timestamptz not null default now()
);

create table calendar_connections (      -- Sprint 3
  user_id uuid primary key,
  refresh_token_encrypted text not null,
  scopes text[] not null,
  calendar_id text not null default 'primary',
  connected_at timestamptz not null default now()
);

create table external_event_links (      -- Sprint 3
  item_id uuid not null references items on delete cascade,
  user_id uuid not null,
  google_event_id text not null,
  primary key (item_id)
);
```

Etiquetas (`tags`, `item_tags`) se agregan cuando haga falta.

## Recordatorios: cómo funciona
1. **Generación:** al crear o editar un ítem con fecha, `rebuildReminders(itemId)` borra los recordatorios pendientes de ese ítem y crea los nuevos. Para facturas usa `remind_days_before` del plan; para fechas límite usa `reminder_hour`; para eventos y citas, offsets configurables (default: 1 día antes y 1 hora antes). Es idempotente.
2. **Despachador:** `pg_cron` llama cada 5 minutos a `/api/cron/reminders`, protegido con un secreto compartido. La ruta toma los recordatorios `pending` con `remind_at <= now()` usando `FOR UPDATE SKIP LOCKED`, envía por el canal, marca `sent` o suma un intento. Hasta 3 intentos con espera creciente, luego `failed` y queda visible en Ajustes.
3. **Entrega:** al menos una vez. Cada envío usa una clave de idempotencia (id del recordatorio + canal) para evitar duplicados en reintentos.
4. **Respaldo:** si el push falla (suscripción vencida, 410/404), se envía por email y se elimina la suscripción inválida.
5. **Ciclo de facturas:** al marcar pagada u omitir, se crea la siguiente factura estimada. Un job diario verifica que cada plan activo tenga una factura abierta (red de seguridad).
6. **Observabilidad mínima:** cada ejecución del despachador registra cantidad enviada, fallida y demora máxima. Eso alimenta la métrica del piloto.

**iPhone:** la PWA debe tener `manifest.webmanifest` con `display: standalone` y un service worker que muestre siempre una notificación por cada push (iOS no admite pushes silenciosos). La suscripción se solicita tras un toque del usuario dentro de la app instalada. Probar siempre en el dispositivo real.

## Autenticación y Google Calendar
- **Login:** Supabase Auth con proveedor Google, pidiendo solo `openid email profile`.
- **Calendar (Sprint 3):** flujo aparte y opcional, con permisos incrementales (scope de Calendar) desde Ajustes. Supabase no conserva el refresh token de Google, así que la app lo guarda **cifrado** en `calendar_connections` durante el callback.
- **Alcance de Calendar:** primero lectura de eventos para mostrarlos en Hoy; luego escritura de ítems con fecha hacia un calendario dedicado de la app (un solo sentido). La sincronización bidireccional queda para después del piloto.
- **Verificación de Google:** los scopes de Calendar son sensibles. Con hasta 100 usuarios de prueba funciona con una advertencia de "app no verificada". Para comercializar hace falta la verificación (dominio propio, política de privacidad, video demo).

## Seguridad
- RLS en todas las tablas; tests que comprueban que un usuario no accede a datos de otro.
- Secretos en variables de entorno de Vercel y Supabase; `.env.example` sin valores reales.
- Validación con Zod en cada acción del servidor y ruta API.
- Webhook de Telegram validado por token secreto de ruta y cabecera secreta.
- Tokens de terceros cifrados en reposo (clave en variable de entorno).
- Sin datos sensibles en logs. Backups: activar los de Supabase y definir una exportación periódica del propio usuario (export JSON) antes de comercializar.

## Estructura del repositorio

```
.
├── CLAUDE.md
├── docs/            PRODUCT.md, ARCHITECTURE.md, ROADMAP.md, PROMPTS.md, decisions/
├── supabase/migrations/
├── public/          manifest, íconos, service worker
├── src/
│   ├── app/         rutas: (auth)/login, (app)/hoy, inbox, facturas, proyectos, notas,
│   │                calendario, ajustes; api/cron/reminders, api/telegram/webhook
│   ├── features/    items, bills, reminders, calendar, capture
│   ├── components/  ui/ (shadcn) y piezas compartidas
│   └── lib/         supabase, dates, money, rrule, i18n
└── tests/           e2e
```

## Entornos
- **local:** Supabase local (CLI) + `npm run dev`.
- **staging:** proyecto Supabase aparte y despliegue de previsualización de Vercel (se puede omitir en el piloto si el costo de mantenerlo es alto, pero nunca probar migraciones directo en producción sin respaldo).
- **producción:** proyecto Supabase y Vercel de producción, con despliegue automático desde `main` solo si pasa el CI.

## Estrategia de tests
- **Unitarios (Vitest):** cálculo del próximo vencimiento (fin de mes, periodicidad), generación de recordatorios, parser de fechas en español, formateo de dinero.
- **Integración:** políticas RLS, ciclo completo de una factura (estimada → confirmada → pagada → siguiente), despachador con envío simulado.
- **E2E (Playwright):** login simulado, alta de servicio, confirmar y pagar factura, ver Hoy.
- **Manual en iPhone** (lista en ROADMAP): instalación de la PWA, permiso de notificaciones, recepción real de un aviso.
