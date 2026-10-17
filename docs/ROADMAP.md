# ROADMAP.md

Estado: marcar `[x]` al completar. Un sprint dura aproximadamente una semana. Objetivo: un MVP usable en un mes, y **usarlo en la vida real desde el final del Sprint 2**.

Regla de recorte si hay atraso: primero se mueve a v1.1 el tablero Kanban, luego la recurrencia compleja y la escritura hacia Google Calendar. **Nunca** se recortan los recordatorios ni las facturas.

---

## Sprint 0 — Preparación (lo hace la persona, con ayuda guiada de Claude)
- [ ] Instalar Node.js (versión LTS), Git y Claude Code siguiendo la guía oficial.
- [ ] Crear cuentas gratuitas: **GitHub**, **Supabase**, **Vercel**, **Google Cloud** (proyecto con pantalla de consentimiento OAuth y credenciales OAuth para login) y **Resend** (email).
- [ ] Crear un repositorio privado en GitHub y clonarlo en la computadora.
- [ ] Copiar al repositorio `CLAUDE.md` (raíz) y `PRODUCT.md`, `ARCHITECTURE.md`, `ROADMAP.md`, `PROMPTS.md` (carpeta `docs/`).
- [ ] Abrir Claude Code dentro de la carpeta y pegar el prompt del Sprint 1 de `PROMPTS.md`.

Listo cuando: el repositorio tiene los documentos y Claude Code los lee al arrancar.

---

## Sprint 1 — Fundaciones y facturas (semana 1)
Objetivo: app desplegada con login de Google, y los vencimientos de facturas funcionando de punta a punta (sin avisos todavía).

- [x] Proyecto Next.js + TypeScript estricto + Tailwind + shadcn/ui, con CI (lint, typecheck, tests).
- [x] Verificar y documentar límites de Vercel y Supabase (ADR de cron y de uso comercial). Ver `docs/decisions/001-cron-y-limites.md`; queda por confirmar `pg_cron` en el plan gratuito al activarlo.
- [x] Supabase remoto (proyecto `rutina-dev`; sin Docker en esta PC, no hay base local), migraciones iniciales: `profiles`, `projects`, `items`, `bill_plans`, `bill_details`, `checklist_items`, con RLS y tests de aislamiento (`tests/integration/rls.test.ts`). **Pendiente:** aplicar las migraciones a `rutina-prod` antes del despliegue.
- [x] Login con Google (Supabase Auth), creación automática de perfil, cierre de sesión. Probado en local contra `rutina-dev`. **Pendiente:** configurar URLs de producción en Google y Supabase al desplegar.
- [x] Despliegue en Vercel desde `main` (https://plan-3c1c.vercel.app) con `rutina-prod` en Supabase; variables de entorno documentadas en `.env.example`. Login con Google probado en producción. El proyecto de Vercel duplicado (`plan-lovat-omega`) ya fue borrado.
- [x] PWA básica: manifest, íconos, instalable en iPhone. Instalada en el iPhone 13 desde Safari.
- [ ] Items: crear, editar, completar, borrar; Inbox de captura rápida.
- [ ] **Facturas:** alta y edición de servicios (con catálogo sugerido), generación de la factura estimada, "Confirmar factura", "Marcar como pagada", "Omitir período", estados y cálculo de "vencida", generación de la siguiente.
- [ ] Pantalla **Facturas** (vencimientos del mes y total estimado vs. confirmado) y primera versión de **Hoy** (atrasados, hoy, próximos 7 días).
- [ ] Tests unitarios del cálculo de próximo vencimiento (fin de mes, bimestral) y del ciclo completo.

Listo cuando: se cargan Edenor, MetroGas y expensas reales, se confirma una factura, se marca pagada y aparece la siguiente estimada. Todo desde el navegador en producción.

---

## Sprint 2 — Recordatorios y uso real (semana 2)
Objetivo: la app avisa en el iPhone y se empieza el piloto con facturas.

- [ ] Tabla `reminders`, `rebuildReminders`, despachador `/api/cron/reminders` y `pg_cron` cada 5 minutos.
- [ ] Web Push (VAPID): service worker, pantalla de activación dentro de la PWA instalada, tabla `push_subscriptions`.
- [ ] Email de respaldo con Resend.
- [ ] Avisos de facturas según la especificación (días antes, mismo día, segundo vencimiento, vencida).
- [ ] Recurrencia para tareas y eventos (diaria, semanal, mensual, anual) con `rrule`.
- [ ] Ajustes: zona horaria, hora de avisos, estado de los canales, historial de recordatorios y fallos.
- [ ] Tests del despachador (envío simulado, reintentos, idempotencia).
- [ ] **Prueba manual en el iPhone 13:** instalar la PWA, activar notificaciones, recibir un aviso real programado a 5 minutos, probar con la app cerrada y con el celular bloqueado.
- [ ] Probar si un feed ICS suscripto desde el Calendario de iOS entrega alertas nativas; si funciona, agregarlo como canal de respaldo (documentar el resultado).

Listo cuando: llega un aviso real de una factura al iPhone en la hora programada, y el piloto arranca cargando todos los servicios.

---

## Sprint 3 — Proyectos, citas, notas y Google Calendar (semana 3)
- [ ] Proyectos/listas con estados (por hacer, en curso, hecho), prioridades y checklist.
- [ ] Tipo `appointment` (citas médicas) con lugar, notas y avisos 1 día y 1 hora antes.
- [ ] Notas en markdown (sueltas o dentro de un ítem).
- [ ] Vista Calendario mensual y semanal.
- [ ] Conexión opcional con Google Calendar (permisos incrementales, token cifrado): lectura de eventos en Hoy y Calendario.
- [ ] Escritura de ítems con fecha hacia un calendario dedicado de la app (un solo sentido).
- [ ] Tablero Kanban (si hay tiempo; si no, v1.1).

Listo cuando: se ven en Hoy los eventos de Google Calendar junto con facturas y pendientes, y una cita médica avisa a tiempo.

---

## Sprint 4 — Captura y cierre del MVP (semana 4)
- [ ] Quick-add con lenguaje natural en español (`chrono-node`) y vista previa editable; set de tests con frases reales.
- [ ] Bot de Telegram: vinculación por código desde Ajustes, mensajes al Inbox, avisos por Telegram como canal adicional.
- [ ] Compartir hacia la app desde el iPhone (Web Share Target), si el soporte lo permite.
- [ ] Pulido de interfaz mobile-first, estados vacíos, mensajes de error claros.
- [ ] Exportación de datos del usuario (JSON).
- [ ] Revisión de seguridad (RLS, secretos, webhooks) y de rendimiento.
- [ ] Registro de fricciones del piloto en un documento simple.

Listo cuando: se anota un pendiente por Telegram o con el quick-add en menos de 10 segundos y el piloto sigue en marcha sin tener que volver a WhatsApp.

---

## Sprint 5 y siguientes — Piloto y comercialización (después del mes 1)
- Piloto de 4 a 6 semanas con las métricas de `PRODUCT.md`.
- Decisión: seguir, ajustar o pivotar.
- Si sigue: dominio propio, política de privacidad y términos, verificación de Google, cobros, onboarding, multiusuario robusto, revisión legal (Ley 25.326), plan de pago en Vercel, evaluación de app nativa y de lectura de facturas por email.

---

## Riesgos
| Riesgo | Mitigación |
|---|---|
| Push en iPhone poco confiable | Prueba temprana en dispositivo real (Sprint 2), respaldo por email, Telegram y posible ICS |
| Límite de cron en el plan gratuito | `pg_cron` de Supabase; verificar al inicio y registrar como ADR |
| Verificación de Google para Calendar | Fase de piloto con usuarios de prueba; trámite al comercializar |
| Ampliación constante del alcance | Regla de recorte de este documento y lista de "fuera del MVP" |
| Código que Claude Code genera sin que la persona lo entienda | Tests, CI obligatorio, commits chicos, explicaciones simples en cada tarea, revisión periódica con plan mode |
| Fecha de factura estimada incorrecta | Marcado visual de "estimada" y aviso que pide confirmar |
| Datos sensibles (salud y pagos) | Reglas duras de `CLAUDE.md`, RLS, cifrado de tokens, sin datos bancarios |
