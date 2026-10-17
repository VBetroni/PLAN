# PROMPTS.md — Prompts para Claude Code

Cómo usarlos: abrí Claude Code dentro de la carpeta del proyecto, pegá el prompt del sprint que toca y dejá que primero te proponga un plan (plan mode). Revisalo, pedí cambios si algo no se entiende y recién después aprobá. Al terminar cada sprint, pedile que actualice `docs/ROADMAP.md`.

---

## Antes de todo: cómo hablarle
- Si algo no se entiende, decile: "Explicámelo como si no programara".
- Si algo falla, copiá y pegá el mensaje de error completo.
- Antes de aprobar cambios grandes, preguntale: "¿Qué puede salir mal con esto y cómo lo probamos?".

---

## Sprint 1 — Fundaciones y facturas

**Prompt 1.1 (arranque)**
```
Leé CLAUDE.md y los documentos de docs/. Soy quien dirige el proyecto y no programo,
así que guiame paso a paso. Estamos en el Sprint 1 de docs/ROADMAP.md.
Primero proponé un plan en plan mode para: crear el proyecto Next.js con TypeScript
estricto, Tailwind y shadcn/ui, configurar el CI (lint, typecheck, tests) y dejarlo
listo para desplegar en Vercel. Decime qué cuentas o claves tengo que preparar yo y
en qué orden, con instrucciones concretas. No avances hasta que apruebe el plan.
```

**Prompt 1.2 (base de datos y login)**
```
Siguiente tarea del Sprint 1: configurar Supabase (local con la CLI y remoto), crear
las migraciones iniciales del modelo de docs/ARCHITECTURE.md (profiles, projects,
items, bill_plans, bill_details, checklist_items) con RLS en todas las tablas, e
implementar el login con Google. Escribí tests que demuestren que un usuario no puede
leer ni modificar datos de otro. Explicame cómo configuro el cliente OAuth en Google
Cloud, paso a paso.
```

**Prompt 1.3 (límites y decisiones)**
```
Antes de seguir, verificá en la documentación oficial vigente los límites de los planes
gratuitos de Vercel y Supabase (especialmente cron y uso comercial) y registrá el
resultado como ADR en docs/decisions/. Decime si la decisión de usar pg_cron sigue
siendo la correcta.
```

**Prompt 1.4 (items e Inbox)**
```
Implementá items e Inbox: crear, editar, completar y borrar, con captura rápida desde
un campo siempre visible. Mobile-first, pensado para un iPhone 13. Con tests y con los
textos de la interfaz en español rioplatense en un único lugar.
```

**Prompt 1.5 (facturas, el corazón del sprint)**
```
Implementá la funcionalidad de facturas siguiendo exactamente la sección "Facturas y
vencimientos" de docs/PRODUCT.md y el modelo bill_plans / bill_details:
alta de servicios con catálogo sugerido (Edenor, Edesur, MetroGas, Naturgy, AySA,
ABL/AGIP, expensas, etc.), generación de la factura estimada, "Confirmar factura",
"Marcar como pagada", "Omitir período", estados y "vencida" calculada, y generación de
la siguiente. Empezá escribiendo los tests unitarios del cálculo del próximo vencimiento
(fin de mes, periodicidad bimestral) y del ciclo completo. Después hacé la pantalla
Facturas y una primera versión de Hoy. Mostrá las facturas estimadas con una marca
visual clara.
```

**Prompt 1.6 (PWA y despliegue)**
```
Dejá la app instalable como PWA (manifest, íconos, display standalone), desplegada en
Vercel desde main solo si pasa el CI. Explicame cómo instalarla en mi iPhone 13 desde
Safari y cómo verificar que quedó bien.
```

---

## Sprint 2 — Recordatorios y uso real

**Prompt 2.1**
```
Estamos en el Sprint 2. Proponé un plan para el sistema de recordatorios descrito en
"Recordatorios: cómo funciona" de docs/ARCHITECTURE.md: tabla reminders,
rebuildReminders idempotente, despachador en /api/cron/reminders con FOR UPDATE SKIP
LOCKED, reintentos, idempotencia y pg_cron cada 5 minutos. Los tests del despachador y
de la generación de avisos van primero.
```

**Prompt 2.2 (push en iPhone)**
```
Implementá Web Push con VAPID para PWA instalada en iPhone (iOS 16.4+): service worker
que siempre muestra una notificación, pantalla de activación que pida el permiso tras
un toque del usuario, tabla push_subscriptions y limpieza de suscripciones inválidas.
Dame una lista exacta de pasos para probar en mi iPhone 13, incluyendo con la app
cerrada y el celular bloqueado.
```

**Prompt 2.3 (avisos de facturas, email y recurrencia)**
```
Conectá los avisos de facturas con las reglas de docs/PRODUCT.md (días antes, mismo día,
segundo vencimiento, vencida con aviso diario por 3 días y textos que aclaren cuando el
vencimiento es estimado). Agregá el email de respaldo con Resend y la recurrencia de
tareas y eventos con rrule. Después investigá si un feed ICS suscripto desde el
Calendario de iOS entrega alertas nativas y proponé si conviene sumarlo como respaldo.
```

---

## Sprint 3 — Proyectos, citas, notas y Google Calendar

**Prompt 3.1**
```
Sprint 3. Implementá proyectos/listas con estados y checklist, el tipo appointment para
citas médicas con avisos 1 día y 1 hora antes, notas en markdown y la vista Calendario
mensual y semanal. Plan primero, tests donde haya lógica.
```

**Prompt 3.2**
```
Implementá la conexión opcional con Google Calendar desde Ajustes con permisos
incrementales, guardando el refresh token cifrado en calendar_connections. Primero
lectura de eventos en Hoy y Calendario; después escritura de ítems con fecha hacia un
calendario dedicado de la app, en un solo sentido. Explicame qué tengo que configurar
en Google Cloud y qué advertencias de "app no verificada" voy a ver.
```

---

## Sprint 4 — Captura y cierre

**Prompt 4.1**
```
Sprint 4. Implementá el quick-add con lenguaje natural en español usando chrono-node,
con vista previa editable antes de guardar. Armá un set de tests con frases reales como
"pagar luz el 25", "turno dentista mañana 10hs", "llamar a Juan viernes". Si el parser
no entiende la fecha, debe guardar en Inbox sin fecha.
```

**Prompt 4.2**
```
Implementá el bot de Telegram: webhook protegido, vinculación por código desde Ajustes,
mensajes que caen en el Inbox y avisos por Telegram como canal adicional. Guiame en la
creación del bot con BotFather y en la configuración del webhook.
```

**Prompt 4.3 (cierre)**
```
Hacé una revisión de seguridad completa del proyecto: RLS en todas las tablas, secretos,
webhooks, datos sensibles en logs, dependencias. Después agregá la exportación de datos
del usuario en JSON y dejá actualizado docs/ROADMAP.md con lo que quedó pendiente.
```

---

## Prompts de mantenimiento (usables en cualquier momento)

**Revisión periódica**
```
Revisá el repositorio como un ingeniero senior que no escribió este código: buscá
deuda técnica, tests faltantes, riesgos de seguridad y partes difíciles de mantener.
Dame una lista priorizada en lenguaje simple.
```

**Cuando algo falla en producción**
```
Algo falló en producción: [pegá acá el síntoma o el error]. Investigá la causa, no
parchees a ciegas: explicame qué pasó, cómo lo confirmaste, cuál es el arreglo mínimo y
cómo evitamos que se repita (test o alerta).
```

**Cierre de sprint**
```
Actualizá docs/ROADMAP.md marcando lo completado, listá lo que quedó pendiente y por
qué, y proponé si hace falta ajustar el plan del próximo sprint.
```
