# Checklist MVP: alineación del contrato ERP / core

Estado: revisión parcial; pendiente recibir el contrato vigente del core y confirmar la unión de estados. No se confirma compatibilidad entre contratos todavía.

## Fuentes y alcance de la revisión

- ERP: `erp-faspy`, rama `dev`, base revisada `76dca49`, sin cambios pendientes al iniciar la revisión.
- Referencia original: `planeacion_3_tareas_paralelas.md` proporcionada por el usuario.
- Solicitud actual: comparar cinco tipos nuevos, acordar estados y validar CLABE como string.
- No existe `types/schema.ts` ni otra implementación del contrato en el ERP. No se dispone aún de una ubicación o versión identificada del contrato vigente del core.

## Diferencias y pendientes

| Tipo solicitado | ERP actual | Referencia original | Acción pendiente |
| --- | --- | --- | --- |
| `InvoiceCFDI` | No definido | Define `Factura`, no `InvoiceCFDI` | Obtener definición vigente; no asumir que es un simple cambio de nombre |
| `EmitirFacturaRequest` | No definido | El body de emisión se describe como `Factura` | Comparar campos, tipos, obligatoriedad y estructura del request vigente |
| `EmitirFacturaResponse` | No definido | Describe la respuesta como `ValidacionFactura` | Comparar estructura vigente; no crear alias por suposición |
| `ComplianceReport` | No definido | No aparece; contiene `EstadoCompliance` para uso interno del dashboard | Obtener definición; no reutilizar el tipo del dashboard como equivalente |
| `ScoringDecision` | No definido | No aparece; `ValidacionFactura.score` usa `ALTO`, `MEDIO`, `BAJO` | Obtener definición; no equiparar score con estado de aprobación |

La planeación original no documenta la unión `"aprobada" | "revision" | "rechazada"`. Contiene otros estados (`VIGENTE`/`RECHAZADO`, `LIMPIO`/`SANCIONADO`) que no deben mapearse a esa unión sin contrato confirmado.

## Estados

- [ ] Confirmación del responsable: conservar literalmente `"aprobada" | "revision" | "rechazada"`.
- [ ] Identificar en el contrato vigente el campo y tipo que utilizan esa unión.
- [ ] Verificar que ambos contratos coincidan sin traducciones, cambios de mayúsculas ni acentos en los valores transmitidos.

Propuesta del lado ERP: conservar esos valores exactamente si corresponden al contrato vigente. Su comportamiento en la interfaz sigue pendiente; los nombres no bastan para deducir reglas de rechazo o revisión.

## CLABE

- [x] La referencia original declara `ValidacionFactura.clabe_virtual: string`.
- [x] Requisito de esta solicitud: tratar la CLABE como string para preservar ceros iniciales.
- [ ] Confirmar nombre y ubicación del campo en el contrato vigente.
- [ ] Verificar tipo string en ambos contratos e intercambio JSON como cadena.
- [ ] Comprobar que captura, transporte, almacenamiento si se acuerda y presentación preserven el valor literal, sin conversiones numéricas.

La validación del comportamiento del ERP está pendiente porque aún no existe implementación. No se han creado datos mock ni reglas adicionales sobre longitud o validación bancaria.

## Cierre de integración

- [ ] Recibir ubicación y versión del contrato vigente del core.
- [ ] Comparar los cinco tipos campo por campo, incluyendo opcionales, nulos, estructuras anidadas y uniones.
- [ ] Registrar las diferencias concretas y acordar los cambios necesarios.
- [ ] Incorporar el contrato confirmado a `types/schema.ts` del ERP.
- [ ] Actualizar el contrato del core si procede, una vez identificado y revisadas sus instrucciones; no se ha modificado otro repositorio.
- [ ] Ejecutar comprobaciones de tipos y preservación de CLABE en la implementación disponible.
- [ ] Registrar confirmación final del responsable del ERP y la versión compartida de ambos contratos.
