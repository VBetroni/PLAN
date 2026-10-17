# PRODUCT.md — Rutina (nombre provisorio)

## Problema
Las notas viven en WhatsApp, los pendientes de trabajo en una plataforma y los personales en otra. No hay un lugar único y confiable, y eso termina en olvidos (sobre todo vencimientos de pagos y turnos médicos).

## Usuario piloto
El dueño del proyecto: usa iPhone 13, vive en Buenos Aires, paga servicios como Edenor, MetroGas y expensas, y mezcla vida laboral y personal.

## Principios
1. **La captura tiene que ser más fácil que escribirse por WhatsApp.** Si no, la app pierde.
2. **Un solo modelo de ítem** con tipo (tarea, evento, cita médica, factura, nota) y distintas vistas. No cinco módulos separados.
3. **Los recordatorios son la promesa central.** Si falla uno, se deja de usar la app.
4. **Hoy es la pantalla principal:** lo que vence, lo agendado y lo atrasado, todo junto.
5. **Mobile-first**, instalada en el iPhone como PWA.
6. **Mínimo viable de gestor de proyectos**: lo que la mayoría usa de Notion, Asana o Trello, sin colaboración.

## Tipos de ítem
| Tipo | Ejemplo | Campos clave |
|---|---|---|
| `task` | Mandar informe al cliente | fecha límite (opcional), prioridad, proyecto, checklist |
| `event` | Cumpleaños de mamá | inicio, fin, todo el día, lugar |
| `appointment` | Turno dentista | inicio, lugar, notas |
| `bill` | Edenor octubre | vencimiento, monto, estado de pago (ver más abajo) |
| `note` | Idea para el regalo | texto en markdown |

Contextos: trabajo, personal, salud, finanzas. Estados: inbox, por hacer, en curso, hecho, cancelado.

## Pantallas del MVP
- **Hoy:** atrasados arriba, luego lo de hoy (con eventos de Google Calendar cuando esté conectado) y los próximos 7 días en resumen.
- **Inbox:** captura rápida; se clasifica después.
- **Facturas:** vencimientos del mes, estado de cada una, total estimado vs. confirmado.
- **Proyectos / listas:** lista por proyecto con estados; tablero Kanban si da el tiempo.
- **Notas:** listado y editor markdown simple.
- **Calendario:** vista mensual y semanal de ítems con fecha.
- **Ajustes:** zona horaria, horario de avisos, canales de aviso, conexión con Google Calendar y Telegram.

## Facturas y vencimientos (especificación)

### Alta de un servicio (plantilla)
Se hace una vez por servicio. Campos:
- Proveedor: catálogo sugerido (Edenor, Edesur, MetroGas, Naturgy, AySA, ABL/AGIP, internet, celular, expensas) o texto libre.
- Categoría: luz, gas, agua, expensas, internet, celular, impuesto, otro.
- Número de cliente o cuenta (opcional, solo referencia).
- Enlace de pago (opcional, lo carga el usuario; la app no inventa links).
- Monto típico (opcional).
- Periodicidad en meses (1 = mensual, 2 = bimestral, etc.).
- Día típico de vencimiento.
- Avisos: por defecto 5 días antes, 1 día antes y el mismo día a las 9:00.

### Ciclo de cada factura
1. El sistema mantiene siempre **una factura abierta** por servicio activo, con vencimiento **estimado** (el anterior + periodicidad; si el día no existe en ese mes, se usa el último día del mes). Se marca visualmente como estimada.
2. Cuando llega la factura real, el usuario toca **"Confirmar factura"** y carga: primer vencimiento, segundo vencimiento (opcional, muchas facturas lo tienen con recargo) y monto. Se recalculan los avisos.
3. Con **"Marcar como pagada"** se registra fecha y monto pagado. Se genera la siguiente factura estimada.
4. **"Omitir este período"** cierra el ciclo sin pago (por ejemplo, un mes sin consumo) y genera el siguiente.
5. Si hay enlace de pago, aparece el botón **"Ir a pagar"**.

### Estados
Estimada → Confirmada → Pagada. También: Omitida y Vencida (se calcula: pasó la fecha y no está pagada ni omitida).

### Avisos de facturas
- Según los días configurados, a las 9:00 hora local.
- Si el vencimiento es estimado, el texto lo aclara: "Vence ~25/10 (estimado). Confirmá la fecha cuando llegue la factura."
- Si hay segundo vencimiento, se agrega un aviso un día antes de ese segundo plazo.
- Vencida: aviso diario durante 3 días; después queda destacada en Hoy hasta que se resuelva.

### Fuera del MVP
Lectura automática de PDF o mail, conciliación bancaria, pago desde la app, gráfico histórico por servicio (v1.1).

## Recordatorios
Canales, por orden de prioridad: **notificación push** (PWA instalada), **email**, **Telegram**. Cada aviso se registra con estado (pendiente, enviado, fallido) y se reintenta. Detalle técnico en `ARCHITECTURE.md`.

**iPhone:** las notificaciones push solo funcionan con la PWA instalada en la pantalla de inicio (iOS 16.4 o superior). El permiso se pide dentro de la app instalada, con un toque del usuario, y la app debe guiar ese paso.

## Captura rápida
- Campo "quick-add" siempre accesible: "pagar luz el 25", "turno dentista mañana 10hs", "llamar a Juan viernes".
- Interpretación de fechas con `chrono-node`, mostrando una **vista previa editable** antes de guardar. Si no entiende la fecha, guarda en Inbox sin fecha.
- Bot de Telegram: lo que se le escribe cae en el Inbox.
- Compartir desde el iPhone hacia la app (Web Share Target) si el soporte de PWA lo permite; si no, queda para v1.1.

## Fuera del MVP (v1.1 o posterior)
Colaboración entre usuarios, comentarios, bases de datos personalizables tipo Notion, adjuntos con OCR, lectura de Gmail, WhatsApp, app nativa, importadores desde Trello/Notion/CSV. El feed ICS queda para v1.1, salvo que la prueba del Sprint 2 muestre que el Calendario de iOS entrega alertas nativas; en ese caso se suma como canal de respaldo.

## Métricas del piloto (4 a 6 semanas)
- Cero facturas vencidas por olvido.
- 100 % de los avisos enviados dentro de los 5 minutos de su hora programada.
- Al menos 80 % de las notas y pendientes nuevos se anotan en la app y no en WhatsApp.
- Uso diario durante al menos 25 de 30 días.
- Registro de fricciones: cada vez que se vuelve a WhatsApp, anotar por qué.

## Privacidad
Se almacenan datos de salud (citas) y de pagos (referencias y montos). Se guardan solo fechas, montos de referencia y notas del usuario. Nunca datos de tarjetas ni bancarios. Antes de comercializar: política de privacidad, términos, cifrado de campos sensibles y revisión legal local (Ley 25.326 de Protección de Datos Personales).
