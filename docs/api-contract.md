# Contrato HTTP del ERP — propuesta v0.1.0

Fuente de tipos: [types/schema.ts](../types/schema.ts). Esta propuesta conserva los campos de la planeación original. No está verificada contra el core: falta contrastar su contrato vigente. La URL local confirmada es `http://127.0.0.1:3000`, con ERP y core en la misma computadora. El cliente provisional está en [lib/api.ts](../lib/api.ts); no está conectado a pantallas ni rutas del servidor. No se implementaron endpoints financieros ni mocks. El endpoint actual del ERP es `GET /health`, descrito en el [README](../README.md).

## Consumo

Todas las llamadas al core se centralizan en `lib/api.ts`. `createApiClient(baseUrl)` recibe la URL de `NEXT_PUBLIC_API_URL` desde la configuración de quien lo invoque. El módulo no lee variables globales de entorno ni realiza llamadas al importarse o al crear el cliente. Express todavía no invoca estas operaciones; sigue pendiente decidir si las futuras pantallas llamarán desde navegador o servidor. No colocar secretos en configuración pública.

Ejemplo de conexión futura desde código del servidor, sin valores ficticios de factura:

```typescript
import { createApiClient, ApiError } from "../lib/api.ts";
import { readConfig } from "../server/config.ts";
import type { EmitirFacturaRequest } from "../types/schema.ts";

const api = createApiClient(readConfig().apiUrl);

export async function emitir(datos: EmitirFacturaRequest, signal?: AbortSignal) {
  try {
    return await api.emitirFactura(datos, { signal });
  } catch (error) {
    if (error instanceof ApiError) {
      // error.kind identifica el fallo local; error.status contiene HTTP si está disponible.
      // La presentación del error al usuario sigue pendiente de acordar.
    }
    throw error;
  }
}
```

La URL debe ser la base anterior a `/api`: cada método añade su ruta completa. Se conservan prefijos de ruta y se elimina la barra final de la base antes de concatenar. No incluir el endpoint completo en la variable. Con URL ausente, crear el cliente es válido, pero cualquier operación falla con `configuration` antes de enviar datos.

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

Las interfaces TypeScript se eliminan al ejecutar el programa. El cliente comprueba en ejecución objetos planos, presencia de los campos requeridos, tipos primitivos, números finitos y uniones documentadas. Acepta campos adicionales de respuesta, sin deducir su significado. No convierte valores: una CLABE numérica es incompatible y una CLABE string conserva su contenido. Fechas y UUID se comprueban como cadenas, sin imponer validaciones de formato o reglas de negocio adicionales.

Un estado `RECHAZADO` o `SANCIONADO` permitido por el contrato se devuelve como dato; no se convierte en error HTTP ni determina una acción de pantalla. No se calcula `ScoringDecision` ni se añade a la respuesta.

### Errores locales del cliente

`ApiError.kind` es una clasificación interna del ERP, no un contrato JSON del backend:

| kind | Significado |
| --- | --- |
| `configuration` | URL ausente o incompatible |
| `request` | Campos de entrada incompatibles o serialización fallida |
| `aborted` | Cancelación indicada por el `AbortSignal` del invocador |
| `network` | Fallo de conexión o lectura; puede incluir CORS o redirección rechazada |
| `http` | Respuesta HTTP fuera de 200–299; `status` conserva el código |
| `json` | Respuesta HTTP exitosa cuyo contenido no es JSON válido |
| `contract` | JSON exitoso incompatible con el esquema provisional |

El cliente no interpreta ni devuelve el body de los errores HTTP del core. No reintenta, no sigue redirecciones ni usa mocks de respaldo. No fija un timeout: el invocador puede pasar `{ signal }`. Cancelar o perder la conexión no demuestra que el core no haya procesado la operación; la política de repetición e idempotencia sigue pendiente.

### Alcance de las pruebas

Las pruebas del cliente cubren creación sin URL, configuración inválida, cancelación previa y entradas incompatibles; todas se detienen antes de `fetch`. No hay respuestas financieras ficticias ni modo mock. La validación de respuestas y los caminos HTTP/red/JSON están implementados y revisados, pero aún requieren pruebas de integración reales o escenarios de prueba acordados. No se declara compatibilidad con el core hasta completar ese checkpoint.

No se incluye `GET /api/mercado` ni tipos del dashboard. No se crean valores ficticios de demo. La prueba temprana de emisión real, incluida CORS si se consume desde el navegador, sigue pendiente de disponibilidad del core.

Para cerrar la propuesta: comparar con la versión del core, acordar el campo de `ScoringDecision` y los errores, actualizar ambos contratos cuando proceda y registrar el resultado en `docs/mvp-checklist.md`.
