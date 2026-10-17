# CLAUDE.md — Contexto del proyecto

## Qué es
App personal "todo en uno" para la rutina (nombre provisorio: **Rutina**): calendario, pendientes, deadlines, citas médicas, vencimientos de facturas y notas. Reemplaza el caos de WhatsApp + herramientas sueltas.

- Usuario piloto: el dueño del proyecto (Buenos Aires, Argentina, iPhone 13).
- Después del piloto podría comercializarse, por eso es **multiusuario desde el día 1**.

Antes de trabajar en cualquier tarea, leé:
- `docs/PRODUCT.md` (qué se construye y por qué)
- `docs/ARCHITECTURE.md` (stack, modelo de datos, decisiones)
- `docs/ROADMAP.md` (sprints y estado actual)

## Sobre quien dirige el proyecto
**No programa.** Esto condiciona cómo trabajás:
- Explicá en lenguaje simple qué hiciste y qué tiene que hacer él (crear cuentas, pegar variables de entorno, hacer clic en algo).
- Dale los comandos exactos cuando tenga que usar la terminal. No asumas que sabe git.
- Pedí confirmación antes de decisiones irreversibles (borrar datos, cambiar el modelo de datos en producción, gastar dinero).
- Hacé cambios chicos y verificables. Después de cada tarea: qué cambió, cómo probarlo, qué sigue.
- Usá plan mode antes de tareas que toquen varias partes del sistema.

## Stack
- Next.js (App Router) + TypeScript estricto, como **PWA**
- Tailwind CSS + shadcn/ui
- Supabase: Postgres, Auth (Google) y Row Level Security
- Despliegue en Vercel; el código vive en GitHub
- Zod para validar entradas, date-fns para fechas, `rrule` para recurrencias, `chrono-node` (locale `es`) para lenguaje natural
- Tests: Vitest (unitarios e integración) y Playwright (flujos de punta a punta)
- Versiones: usar la última estable al arrancar y fijarla en `package.json`

## Comandos
(Completar en Sprint 1 y mantener actualizado.)
- `npm run dev` — servidor local
- `npm run lint` / `npm run typecheck` / `npm test` / `npm run test:e2e`
- `npm run build` — build de producción
- `npx supabase db reset` — recrear la base local desde las migraciones

## Convenciones
- Código, tablas, columnas y commits en **inglés**. Textos de la interfaz en **español rioplatense (es-AR)**, y los textos van en un solo lugar para poder traducirlos después.
- Organización por funcionalidad: `src/features/<feature>/` (componentes, acciones, consultas y tests juntos).
- Cada cambio de base de datos es una **migración SQL** en `supabase/migrations/`. Nunca se edita la base a mano.
- Commits chicos, mensaje claro. Una rama por tarea y pull request hacia `main`. El CI debe pasar antes de mergear.
- Mobile-first: se diseña primero para un iPhone 13 (390 px de ancho) y después se adapta a escritorio.

## Reglas duras (no negociables)
1. **Toda tabla con datos del usuario tiene `user_id` y políticas RLS.** Ninguna consulta confía solo en el código de la app para aislar usuarios.
2. **Nunca guardar** números de tarjeta, CBU/CVU, claves ni credenciales de servicios de terceros. Solo referencias (por ejemplo, número de cliente) y enlaces de pago.
3. **Dinero** en centavos como entero (`bigint`), con moneda explícita (default `ARS`). Nunca `float`.
4. **Fechas:** los vencimientos son `date` sin hora. Los eventos y recordatorios son `timestamptz` en UTC. Todo se muestra en `America/Argentina/Buenos_Aires` por defecto, configurable por usuario.
5. **Secretos** solo en variables de entorno. Nunca en el repositorio. Mantener `.env.example` actualizado.
6. Toda lógica de fechas, dinero, recurrencias y recordatorios lleva **tests unitarios**. Un recordatorio que falla destruye la confianza en la app.
7. No agregar dependencias nuevas sin explicar por qué y si hay alternativa más simple.
8. Los datos de salud y pagos son sensibles: no loguear su contenido ni enviarlo a servicios de terceros fuera de los definidos en la arquitectura.

## Definición de "terminado" para una tarea
- Funciona en el flujo real (probado en navegador o en el iPhone si es PWA o push).
- Tiene tests donde corresponde y el CI pasa.
- Está documentado lo necesario (`.env.example`, esta guía, ADRs).
- Se actualizó el estado en `docs/ROADMAP.md`.
