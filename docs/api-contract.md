# Contrato HTTP del ERP — alineación con core 4f71ceb

Fuente de tipos: [types/schema.ts](../types/schema.ts). Los cinco tipos financieros coinciden estáticamente con el core y conservan `decision` opcional por acuerdo del usuario. `ComplianceAuditItem` queda aplazado. El core `4f71ceb` ya expone emisión, aceptación y pago para el escenario sintético acordado; la primera emisión real desde Node y desde la pantalla de emisión server-side fueron verificadas. La URL local confirmada es `http://127.0.0.1:3000`, con ERP y core en la misma computadora. El cliente está en [lib/api.ts](../lib/api.ts) y no implementa fórmulas ni mocks.

## Consumo

Revisión vigente: core en feature/contrato-facturacion-compliance-scoring, commit 4f71ceb. Los fixtures y el motor están acotados al único escenario acordado; auditoría, scoring dinámico y reglas generales siguen pendientes. Emisión, aceptación y pago se probaron desde Node y desde la experiencia server-side `/emision`; no hay persistencia local. El checklist conserva las revisiones anteriores como historial.

Todas las llamadas al core se centralizan en `lib/api.ts`. `createApiClient(baseUrl)` recibe la URL de `NEXT_PUBLIC_API_URL` desde la configuración del servidor Express. El módulo no lee variables globales de entorno ni realiza llamadas al importarse o al crear el cliente. La pantalla `/emision` usa esta ruta server-side; el navegador no llama directamente al core ni requiere CORS para este recorrido.

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

Todos los campos declarados son obligatorios salvo `decision?: ScoringDecision` en emisión. Ninguno admite `null` en JSON. Límites de monto/plazo, validaciones de RFC, códigos HTTP concretos, cuerpo de error, reglas de rechazo e idempotencia quedan pendientes. No deducirlos de estos tipos.

## Los cinco tipos solicitados

| Tipo | Definición propuesta | Efecto en el JSON original |
| --- | --- | --- |
| `InvoiceCFDI` | Los cinco campos originales de `Factura` | Ninguno |
| `EmitirFacturaRequest` | Alias de `InvoiceCFDI` | Ninguno; body plano |
| `EmitirFacturaResponse` | Campos originales y decision opcional | Respuesta plana; decision puede estar ausente |
| `ComplianceReport` | `cfdi_status` y `efos_status`, incorporados por extensión | Ninguno; no añade un campo `compliance` |
| `ScoringDecision` | Unión confirmada `"aprobada" \| "revision" \| "rechazada"` | Campo opcional decision de emisión |

Se mantienen `Factura` y `ValidacionFactura` como alias para facilitar la transición de nombres en TypeScript. No se cambia la forma del JSON. Los cinco tipos coinciden con la revisión del core indicada; no se afirma que los archivos completos sean idénticos.

## Estados y resultados

`ScoringDecision` conserva literalmente los tres valores solicitados, incluido `revision` sin acento. Se aprobó como campo opcional decision en EmitirFacturaResponse. El score de la referencia sigue siendo `ALTO | MEDIO | BAJO`; no existe un mapeo confirmado entre ese score, compliance y la decisión. El ERP no realizará ese cálculo.

La interfaz server-side ya presenta `monto_anticipo`, `tasa_aplicada`, `dias_promedio_pago`, `monto_depositado` y los cuatro resultados del split tal como los recibe para el escenario acordado. `tasa_aplicada` y `margen_neto_pct` se transportan como fracciones; por acuerdo de presentación, `0.02` se muestra como `2 %` sin modificar el JSON. Los estados y números de la respuesta no definen por sí solos cuándo bloquear o habilitar acciones.

## CLABE como string

`EmitirFacturaResponse.clabe_virtual` es `string`. Debe viajar como cadena JSON y conservarse literalmente en la interfaz y en cualquier persistencia que se acuerde. No usar `Number`, `parseInt`, `parseFloat` ni un control numérico para manejarla. Los ceros perdidos por un backend que envíe un número no pueden recuperarse de forma fiable; esa respuesta debe tratarse como incompatible cuando se implemente la validación.

## Seguridad de tipos e integración pendiente

Las interfaces TypeScript se eliminan al ejecutar el programa. El cliente comprueba en ejecución objetos planos, presencia de los campos requeridos, tipos primitivos, números finitos y uniones documentadas. Acepta campos adicionales de respuesta, sin deducir su significado. No convierte valores: una CLABE numérica es incompatible y una CLABE string conserva su contenido. Fechas y UUID se comprueban como cadenas, sin imponer validaciones de formato o reglas de negocio adicionales.

Un estado `RECHAZADO` o `SANCIONADO` permitido por el contrato se devuelve como dato; no se convierte en error HTTP ni determina una acción de pantalla. No se calcula ScoringDecision: se conserva decision si llega y se deja ausente si no llega. Presente, debe ser aprobada, revision o rechazada; null, tipos distintos y valores desconocidos producen ApiError.kind = contract.

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

Las pruebas del cliente cubren creación sin URL, configuración inválida, cancelación previa y entradas incompatibles; todas se detienen antes de `fetch`. Se añaden pruebas aisladas del validador de decision opcional y de conservación de requisitos obligatorios, sin respuestas financieras ficticias ni modo mock. La Ruta Dorada del escenario acordado se validó por HTTP real desde Node y desde `/emision`; los errores de negocio generales e idempotencia aún requieren escenarios acordados antes de declararse cubiertos.

No se incluye `GET /api/mercado` ni tipos del dashboard. No se crean valores ficticios de demo. La emisión real y la presentación literal de CLABE ya se comprobaron en la pantalla server-side; CORS de navegador solo aplicará si se autoriza una llamada directa desde una futura pantalla.

La alineación estática de los cinco tipos queda cerrada y registrada en docs/mvp-checklist.md. Siguen pendientes errores financieros, persistencia, idempotencia y auditoría; la Ruta Dorada visual server-side ya está implementada para el escenario acordado.
