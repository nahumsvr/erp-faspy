# Backlog aprobado: Frente 3

Se conserva el orden de las ocho entregas de la solicitud original. Cada entrega incorpora carga, errores, navegación y validaciones pertinentes. Las responsabilidades independientes pueden dividirse en commits pequeños. Las dependencias pendientes no se consideran aprobadas por silencio.

## Estado actual

- Entrega 1: base Express completada y validada en Windows. Instrucciones de macOS disponibles; ejecución en una Mac pendiente. La arquitectura server-side quedó confirmada para las pantallas actuales.
- Entrega 2: cinco tipos alineados con core a754a0d, incluida decision opcional; cliente y guía actualizados. ComplianceAuditItem aplazado. Ruta Dorada técnica verificada desde Node con el escenario acordado.
- Entrega 3: formulario de emisión de escritorio en `/emision`, con validación básica, errores y llamada server-side a `lib/api.ts`; la pantalla ya mostró una respuesta real del core.
- Entregas 4 a 6: aceptación, tesorería y pago server-side encadenados desde la pantalla; la Ruta Dorada visual fue verificada con el escenario acordado. No hay persistencia ni reintentos automáticos.
- Entrega 7: diseño y transiciones actuales aceptados, importes MXN, tasa/margen como porcentaje y enlace de inicio implementados. Formulario y oferta revisados en 1366×768 y 1440×900 sin overflow horizontal. Movimiento reducido revisado en CSS; activación visual y observación dinámica de carga/doble clic pendientes.
- Entrega 8 (escenario acordado): Ruta Dorada repetida por CLI y navegador; HTTP 400/422 y regreso al inicio verificados. Guía reproducible y JSON acordado disponibles. El core se ejecutó con build local existente por falta de memoria al compilar; ver límites en el checklist.

Alcance de cierre: demo Windows, escenario único y pulido actual. Auditoría, reglas generales/scoring, dashboard, persistencia e idempotencia quedan fuera de esta entrega por decisión explícita; macOS sigue sin validar y no bloquea Windows. No se añade CORS de navegador al recorrido server-side. Quedan las comprobaciones visuales dinámicas descritas en el checklist, sin confundirlas con ampliaciones de producto.

## Entregas

| Entrega | Objetivo y alcance | Dependencias o preguntas | Aceptación observable | Validación prevista | Commit propuesto |
| --- | --- | --- | --- | --- | --- |
| 1 | Base Express, configuración y documentación de arranque | Arquitectura de frontend y configuración pública | Arranque reproducible en puerto 3001; decisiones documentadas | Arranque, comprobación de tipos y revisión documental | `chore: configurar base Express del ERP`; documentación separada |
| 2 | Contrato de tipos y cliente HTTP; mocks solo si se acuerdan | Contrato vigente, URL, errores, valores y escenarios mock | Tres endpoints centralizados en lib/api.ts; sin fallback mock automático | Pruebas del cliente para respuestas y fallos acordados | `feat: agregar contrato y cliente HTTP del core`; mocks en commit separado si se autorizan |
| 3 | Formulario de emisión de factura | Diseño, datos y validaciones acordados | Envío de factura con carga, errores y respuesta del core en pantalla | Validación de formulario e integración temprana real | `feat: agregar formulario de emisión de factura` |
| 4 | Oferta y confirmación de aceptación | Página/modal, rechazo y navegación acordados | Presentación de resultados del core y aceptación comprobable | Interacciones, carga y fallos acordados | `feat: agregar oferta y aceptación de anticipo` |
| 5 | Tesorería y depósito | Persistencia, recarga y acceso directo acordados | Monto y fecha del depósito recibidos del core visibles | Respuesta de aceptación y navegación | `feat: mostrar depósito en tesorería` |
| 6 | Simulación del pago y split settlement | Comportamiento de simulación y repetición acordados | Resultados del core visibles sin fórmulas financieras locales | Simulación, carga y fallos acordados | `feat: agregar simulación de pago y split settlement` |
| 7 | Pulido visual, accesibilidad y animaciones acordadas | Referencias, dispositivos y movimiento acordados | Flujo consistente y usable con teclado | Revisión visual, foco y movimiento reducido | `feat: pulir experiencia visual y accesibilidad` |
| 8 | Verificación completa y documentación final | Flujo integrado y disponibilidad del core | Ruta Dorada comprobada; arranque y limitaciones documentados | Recorrido completo y comprobaciones disponibles | `test: verificar ruta dorada`; `docs: documentar demo del ERP` |

## Checkpoint temprano

Probar `POST /api/emitir-factura` real en cuanto esté disponible, incluso si las demás pantallas no están terminadas. La arquitectura vigente usa `/emision` server-side; CORS de navegador solo será necesario si se autoriza una llamada directa desde una pantalla. Documentar necesidades del backend sin modificar su repositorio. No desplegar sin solicitud explícita.

## Ciclo de entrega

Explicar alcance, aclarar bloqueos, implementar únicamente lo acordado, validar, revisar el diff y crear un commit local con sus archivos. Reportar resultado, validación, hash, mensaje y siguiente paso. No incluir cambios ajenos, secretos ni generados innecesarios.

## Integración autorizada de ramas de demo

Se conserva `/emision` y se incorpora la demo conectada en `/`. Las llamadas de la nueva pantalla pasan por `/demo/evaluar` y `lib/api.ts`, sin exponer la URL del core al navegador. Solo «Empresa elegible» es compatible con el core actual; las opciones de sanción y revisión devuelven `422 SCENARIO_NOT_SUPPORTED`. Aceptación y pago existentes dependen de la versión del core; no se añaden endpoints financieros en este merge.
