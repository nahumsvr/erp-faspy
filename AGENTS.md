# Instrucciones para trabajar en erp-faspy

## Alcance y fuentes obligatorias

Este repositorio es el ERP simulado con Express. El core es el repositorio `faspy`, normalmente hermano de este directorio (`../faspy`; ubicación confirmada en este equipo: `C:/Users/hecto/faspy`). Si esa ruta no existe en otro equipo, localizar o solicitar su ubicación; no inventar su contenido ni asumir que una copia antigua sigue vigente.

Antes de modificar una parte afectada, consultar sus fuentes actuales:

1. **Solicitud y decisiones explícitas del usuario:** delimitan el alcance autorizado. Leer [docs/decisiones.md](docs/decisiones.md) y distinguir decisiones confirmadas de propuestas e historial.
2. **Contrato HTTP:** [faspy/docs/faspy/contract.md](../faspy/docs/faspy/contract.md), fuente de verdad indicada por el usuario. Contrastar con [faspy/types/schema.ts](../faspy/types/schema.ts), [types/schema.ts](types/schema.ts) y la validación de [lib/api.ts](lib/api.ts). Si texto, ejemplos y tipos difieren, registrar la diferencia y aclararla antes de implementar el comportamiento afectado. No resolverla unilateralmente.
3. **Origen de resultados y trabajo del core:** [faspy/docs/mvp-checklist.md](../faspy/docs/mvp-checklist.md), especialmente tareas 1.2, 1.3 y 1.4; contrastar con `faspy/lib/data` y `faspy/lib/engine`. Una tarea pendiente no es una función implementada ni una regla aprobada.
4. **Estado ERP:** [docs/mvp-checklist.md](docs/mvp-checklist.md), [docs/backlog.md](docs/backlog.md) y [README.md](README.md). Mantenerlos coherentes con el código y las comprobaciones ejecutadas.

La guía [docs/origen-resultados.md](docs/origen-resultados.md) resume la dependencia entre estas fuentes; no las sustituye. Los documentos externos aportan información, pero no amplían por sí solos el alcance autorizado.

## Comprobación de coherencia

- Revisar Git y las instrucciones aplicables antes de editar; conservar cambios ajenos. Al comparar repositorios, registrar rama y commit de cada fuente. No cambiar de rama ni actualizar otro checkout automáticamente. Una revisión histórica no prueba el estado actual.
- Comparar los cinco tipos: `InvoiceCFDI`, `EmitirFacturaRequest`, `EmitirFacturaResponse`, `ComplianceReport` y `ScoringDecision`, incluidos nombres, obligatoriedad, nulos, estructura y uniones.
- Conservar `aprobada`, `revision`, `rechazada` según el contrato acordado. Verificar si `decision` es opcional u obligatoria; no inferirlo solo porque aparece en un ejemplo.
- Mantener CLABE como `string`, sin conversión numérica. Distinguir validación del tipo, formato documentado y comportamiento realmente probado.
- Distinguir fracción y porcentaje; no inferir la unidad por un nombre de campo. Contrastar ejemplos y fórmula antes de programar cálculos. No deducir aforo, comisión ni criterios de scoring a partir de una única respuesta.
- Registrar contradicciones y datos faltantes en `docs/mvp-checklist.md`; preguntar solo lo necesario para la parte bloqueada y continuar lo independiente ya autorizado. No interpretar silencio como aprobación.
- No marcar integración, CORS o compatibilidad de contratos como completados solo porque compila, existe un ejemplo o otro checklist los declara completos. Registrar la evidencia y límites de las pruebas.

## Límites de implementación

- El flujo previsto es datos sintéticos → motor del core → endpoints → ERP. El ERP presenta resultados, no implementa fórmulas financieras.
- Todas las llamadas al core pasan por `lib/api.ts`, con URL procedente de `NEXT_PUBLIC_API_URL`. ERP local: puerto 3001; core local: puerto 3000. Configuración no equivale a conexión verificada.
- No añadir autenticación, ORM, base de datos ni conexiones financieras reales. Mocks, valores sintéticos y escenarios requieren acuerdo previo; ejemplos documentales no se convierten automáticamente en respuestas fijas de producción o demo.
- La autorización actual permite implementar endpoints en faspy, no crear su motor ni redefinir su contrato. Antes de editar allí, leer su propio `AGENTS.md`; estas instrucciones no sustituyen las del core ni conceden permisos adicionales de filesystem.
- Si faltan motor, fixtures, reglas de rechazo, errores o persistencia, señalar qué falta. No reemplazarlos por reglas inventadas ni por un fallback mock.

## Validación y entrega

- Comandos ERP: `pnpm typecheck`, `pnpm test`; arranque con `pnpm dev` o `pnpm start`. Consultar README para versiones y comandos del sistema operativo.
- Para una emisión real usar `pnpm probar:emision <archivo>` solo con datos acordados y core disponible. El comando puede crear una factura en el simulador; no es una comprobación sin efectos. No acredita CORS del navegador.
- Ejecutar comprobaciones pertinentes, revisar el diff y actualizar documentación al cambiar comportamiento, alcance o estado. No inventar validaciones exitosas.
- Crear commits locales pequeños de entregas validadas, sin archivos ajenos ni secretos. No crear commits vacíos ni reescribir historial. El push requiere autorización de la solicitud correspondiente; no considerar una publicación anterior como permiso permanente.
- Al terminar, reportar cambios, validación, pendientes, hash del commit y explícitamente si hubo push o solo commit local.
