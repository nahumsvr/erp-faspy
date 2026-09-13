# Contrato HTTP del ERP — propuesta v0.1.0

Fuente de tipos: [types/schema.ts](../types/schema.ts). Esta propuesta fue solicitada por el usuario y conserva los campos de la planeación original. No es una especificación verificada contra el core: falta su URL y contrato vigente. No se implementaron endpoints financieros, cliente HTTP ni mocks. El endpoint actual del ERP es `GET /health`, descrito en el [README](../README.md).

## Consumo

Todas las llamadas al core deberán implementarse en `lib/api.ts`, con URL base tomada de `NEXT_PUBLIC_API_URL`. La aplicación usa Express; todavía debe acordarse cómo exponer esa configuración al navegador si este realiza las llamadas. No colocar secretos en configuración pública.

| Método y ruta | JSON de entrada | JSON de respuesta según planeación |
| --- | --- | --- |
| `POST /api/emitir-factura` | `EmitirFacturaRequest` | `EmitirFacturaResponse` |
| `POST /api/aceptar-anticipo` | `AceptarAnticipoRequest` | `AnticipoConfirmado` |
| `POST /api/simular-pago` | `SimularPagoRequest` | `ResultadoPago` |

Enviar el objeto de entrada directamente con `Content-Type: application/json`. No envolverlo en `data` ni `factura`. En emisión se envían `monto_mxn`, `cliente`, `rfc_cliente`, `plazo_dias` y `uuid_cfdi`. Para aceptar o simular, pasar el `factura_id` recibido como el campo `facturaId` del body; ambos nombres son intencionalmente distintos en la planeación.

Todos los campos declarados en las interfaces HTTP son obligatorios y no admiten `null`, tal como en la referencia. Límites de monto/plazo, validaciones de RFC, códigos HTTP concretos, cuerpo de error, reglas de rechazo e idempotencia quedan pendientes. No deducirlos de estos tipos.

## Los cinco tipos solicitados

| Tipo | Definición propuesta | Efecto en el JSON original |
| --- | --- | --- |
| `InvoiceCFDI` | Los cinco campos originales de `Factura` | Ninguno |
| `EmitirFacturaRequest` | Alias de `InvoiceCFDI` | Ninguno; body plano |
| `EmitirFacturaResponse` | Campos originales de `ValidacionFactura` | Ninguno; respuesta plana |
| `ComplianceReport` | `cfdi_status` y `efos_status`, incorporados por extensión | Ninguno; no añade un campo `compliance` |
| `ScoringDecision` | Unión propuesta `"aprobada" \| "revision" \| "rechazada"` | Ninguno por ahora: no se inventa un campo nuevo para enviarla |

Se mantienen `Factura` y `ValidacionFactura` como alias para facilitar la transición de nombres en TypeScript. No se cambia la forma del JSON. Estos nombres y equivalencias son la propuesta del ERP, no una confirmación de equivalencia con tipos del core que aún no se han recibido.

## Estados y resultados

`ScoringDecision` conserva literalmente los tres valores solicitados, incluido `revision` sin acento. Su aprobación y ubicación en la API siguen pendientes. El score de la referencia sigue siendo `ALTO | MEDIO | BAJO`; no existe un mapeo confirmado entre ese score, compliance y la decisión. El ERP no realizará ese cálculo.

Cuando se implementen las pantallas, el ERP presentará `monto_anticipo`, `tasa_aplicada`, `dias_promedio_pago`, `monto_depositado` y los cuatro resultados del split tal como los reciba. La referencia define `tasa_aplicada` como fracción; la escala de `margen_neto_pct` debe confirmarse antes de formatearla. Los estados y números de la respuesta no definen por sí solos cuándo bloquear o habilitar acciones.

## CLABE como string

`EmitirFacturaResponse.clabe_virtual` es `string`. Debe viajar como cadena JSON y conservarse literalmente en la interfaz y en cualquier persistencia que se acuerde. No usar `Number`, `parseInt`, `parseFloat` ni un control numérico para manejarla. Los ceros perdidos por un backend que envíe un número no pueden recuperarse de forma fiable; esa respuesta debe tratarse como incompatible cuando se implemente la validación.

## Seguridad de tipos e integración pendiente

Las interfaces TypeScript se eliminan al ejecutar el programa: una aserción `as EmitirFacturaResponse` no valida una respuesta HTTP. El cliente deberá comprobar el status HTTP y la estructura del JSON antes de usarlo; el manejo visible de errores se acordará sin inventar un contrato de error del core. Nunca devolver un mock automáticamente si falla la API real.

No se incluye `GET /api/mercado` ni tipos del dashboard. No se crean valores ficticios de demo. La prueba temprana de emisión real, incluida CORS si se consume desde el navegador, sigue pendiente de disponibilidad del core.

Para cerrar la propuesta: comparar con la versión del core, acordar el campo de `ScoringDecision` y los errores, actualizar ambos contratos cuando proceda y registrar el resultado en `docs/mvp-checklist.md`.
