# ADR 001 — Cron, límites de los planes gratuitos y uso comercial

- Fecha: 2026-10-17
- Estado: aceptada, con un punto pendiente de verificar (ver abajo)

## Contexto
Los recordatorios necesitan un disparador cada 5 minutos (`ARCHITECTURE.md`, decisión 6). Había que verificar en la documentación oficial qué permiten los planes gratuitos de Vercel y Supabase, y si se pueden usar para comercializar.

## Lo verificado (documentación oficial, consultada el 2026-10-17)

**Vercel Cron Jobs** (vercel.com/docs/cron-jobs/usage-and-pricing)
- Plan Hobby: como máximo **una ejecución por día** y precisión de ±59 minutos. Una expresión más frecuente hace **fallar el despliegue**.
- Plan Pro: hasta una vez por minuto, con precisión por minuto.
- Conclusión: **Vercel Cron no sirve** para recordatorios en Hobby. Confirma la decisión 6.

**Vercel Hobby: uso comercial** (vercel.com/docs/limits/fair-use-guidelines)
- Hobby es solo para **uso personal no comercial**. Es comercial cualquier despliegue que genere ganancia a *cualquier* persona involucrada, por ejemplo cobrar a visitantes o recibir pago por crear o alojar el sitio.
- Conclusión: el **piloto personal** entra en Hobby. **Para comercializar hay que pasar a Pro.**
- Límites típicos de Hobby (más que suficientes para el piloto): 1.000.000 de invocaciones de funciones por mes y 100 GB de transferencia.

**Supabase plan gratuito** (supabase.com/pricing)
- 2 proyectos activos (los pausados no cuentan), base de 500 MB, 50.000 usuarios activos por mes, 5 GB de transferencia, 1 GB de archivos.
- **Los proyectos gratuitos se pausan tras 1 semana de inactividad.**
- **No incluye backups automáticos.**

**Supabase Cron / pg_cron** (supabase.com/docs/guides/cron)
- Permite tareas desde "cada segundo hasta una vez al año" y llamadas HTTP.
- Recomienda no más de 8 tareas simultáneas y que cada una dure menos de 10 minutos.

## Decisión
1. Se **mantiene `pg_cron` de Supabase** como disparador de `/api/cron/reminders` cada 5 minutos. Vercel Cron queda descartado en Hobby.
2. El piloto corre en Vercel Hobby y Supabase gratuito. Antes de comercializar se pasa a **Vercel Pro** y se evalúa Supabase Pro.
3. Como no hay backups automáticos, el respaldo del piloto es la **exportación JSON** de datos (Sprint 4) y, si se puede, una copia manual periódica.

## Pendiente de verificar (no está confirmado en la documentación consultada)
- Que **`pg_cron` y `pg_net` estén disponibles en el plan gratuito**. Se prueba activándolas en el proyecto real (Database → Extensions) durante el Sprint 1/2.
- Si el cron interno de la base cuenta como "actividad" para evitar la **pausa por inactividad de 7 días**. El uso diario de la app debería evitarla, pero hay que vigilarlo en el piloto.
- Plan B si `pg_cron` no estuviera disponible o fallara: un disparador externo gratuito que llame al endpoint con el secreto compartido, o pasar a Vercel Pro.

## Consecuencias
- El endpoint del despachador debe ser seguro frente a ejecuciones repetidas (ya previsto: idempotencia y `FOR UPDATE SKIP LOCKED`).
- Riesgo de pausa del proyecto: si el piloto se interrumpe una semana, hay que reactivarlo a mano.
