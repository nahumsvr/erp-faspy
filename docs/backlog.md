# Backlog aprobado: Frente 3

Se conserva el orden de las ocho entregas de la solicitud original. Cada entrega incorpora carga, errores, navegación y validaciones pertinentes. Las responsabilidades independientes pueden dividirse en commits pequeños. Las dependencias pendientes no se consideran aprobadas por silencio.

## Estado actual

- Entrega 1: base sin pantallas completada y validada en Windows. Instrucciones de macOS disponibles; ejecución en una Mac pendiente. Arquitectura de frontend aún pendiente.
- Entrega 2: cinco tipos alineados estáticamente con core 921fd4e, incluida decision opcional; cliente y guía actualizados. ComplianceAuditItem aplazado. Falta probar respuestas reales. Sin mocks ni integración desde pantallas o rutas del servidor.
- Entregas 3 a 8: pendientes. No existe todavía la Ruta Dorada ejecutable.

## Entregas

| Entrega | Objetivo y alcance | Dependencias o preguntas | Aceptación observable | Validación prevista | Commit propuesto |
| --- | --- | --- | --- | --- | --- |
| 1 | Base Express, configuración y documentación de arranque | Arquitectura de frontend y configuración pública | Arranque reproducible en puerto 3001; decisiones documentadas | Arranque, comprobación de tipos y revisión documental | `chore: configurar base Express del ERP`; documentación separada |
| 2 | Contrato de tipos y cliente HTTP; mocks solo si se acuerdan | Contrato vigente, URL, errores, valores y escenarios mock | Tres endpoints centralizados en lib/api.ts; sin fallback mock automático | Pruebas del cliente para respuestas y fallos acordados | `feat: agregar contrato y cliente HTTP del core`; mocks en commit separado si se autorizan |
| 3 | Formulario de emisión de factura | Diseño, datos y validaciones acordados | Envío de Factura con carga, errores y avance según respuesta | Validación de formulario e integración temprana real | `feat: agregar formulario de emisión de factura` |
| 4 | Oferta y confirmación de aceptación | Página/modal, rechazo y navegación acordados | Presentación de resultados del core y aceptación comprobable | Interacciones, carga y fallos acordados | `feat: agregar oferta y aceptación de anticipo` |
| 5 | Tesorería y depósito | Persistencia, recarga y acceso directo acordados | Monto y fecha del depósito recibidos del core visibles | Respuesta de aceptación y navegación | `feat: mostrar depósito en tesorería` |
| 6 | Simulación del pago y split settlement | Comportamiento de simulación y repetición acordados | Resultados del core visibles sin fórmulas financieras locales | Simulación, carga y fallos acordados | `feat: agregar simulación de pago y split settlement` |
| 7 | Pulido visual, accesibilidad y animaciones acordadas | Referencias, dispositivos y movimiento acordados | Flujo consistente y usable con teclado | Revisión visual, foco y movimiento reducido | `feat: pulir experiencia visual y accesibilidad` |
| 8 | Verificación completa y documentación final | Flujo integrado y disponibilidad del core | Ruta Dorada comprobada; arranque y limitaciones documentados | Recorrido completo y comprobaciones disponibles | `test: verificar ruta dorada`; `docs: documentar demo del ERP` |

## Checkpoint temprano

Probar `POST /api/emitir-factura` real en cuanto esté disponible, incluso si las demás pantallas no están terminadas. Comprobar el contrato y CORS desde el navegador si se confirma esa arquitectura. Documentar necesidades del backend sin modificar su repositorio. No desplegar sin solicitud explícita.

## Ciclo de entrega

Explicar alcance, aclarar bloqueos, implementar únicamente lo acordado, validar, revisar el diff y crear un commit local con sus archivos. Reportar resultado, validación, hash, mensaje y siguiente paso. No incluir cambios ajenos, secretos ni generados innecesarios.
