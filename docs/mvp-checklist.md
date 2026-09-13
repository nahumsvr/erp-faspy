# Checklist MVP: alineación del contrato ERP / core

Estado: propuesta ERP v0.1.0 creada por solicitud posterior del usuario en `types/schema.ts`, con guía en `docs/api-contract.md`. Pendiente recibir el contrato vigente del core y confirmar la unión de estados. No se confirma compatibilidad entre contratos todavía.

## Fuentes y alcance de la revisión

- ERP: `erp-faspy`, rama `dev`, base revisada `76dca49`, sin cambios pendientes al iniciar la revisión.
- Referencia original: `planeacion_3_tareas_paralelas.md` proporcionada por el usuario.
- Solicitud actual: comparar cinco tipos nuevos, acordar estados y validar CLABE como string.
- Al iniciar no existía contrato en el ERP. El usuario autorizó posteriormente crear y documentar los cinco tipos. No se dispone aún de una ubicación o versión identificada del contrato vigente del core.

## Diferencias y pendientes

| Tipo solicitado | ERP actual | Referencia original | Acción pendiente |
| --- | --- | --- | --- |
| `InvoiceCFDI` | Propuesta con los campos de `Factura`; alias original conservado | Define `Factura`, no `InvoiceCFDI` | Comparar con core; equivalencia propuesta, no verificada |
| `EmitirFacturaRequest` | Alias de `InvoiceCFDI`, body plano | Body `Factura` | Comparar campos, tipos y obligatoriedad con core |
| `EmitirFacturaResponse` | Campos originales de `ValidacionFactura`; alias original conservado | Respuesta `ValidacionFactura` | Comparar estructura vigente con core |
| `ComplianceReport` | Dos campos planos: `cfdi_status` y `efos_status` | Campos en `ValidacionFactura` | Confirmar agrupación; no confundir con `EstadoCompliance` del dashboard |
| `ScoringDecision` | Unión propuesta `aprobada`/`revision`/`rechazada`, sin campo HTTP nuevo | No aparece; score usa `ALTO`, `MEDIO`, `BAJO` | Confirmar unión y campo HTTP; no equiparar score con decisión |

La planeación original no documenta la unión `"aprobada" | "revision" | "rechazada"`. Contiene otros estados (`VIGENTE`/`RECHAZADO`, `LIMPIO`/`SANCIONADO`) que no deben mapearse a esa unión sin contrato confirmado.

## Estados

- [ ] Confirmación del responsable: conservar literalmente `"aprobada" | "revision" | "rechazada"`.
- [ ] Identificar en el contrato vigente el campo y tipo que utilizan esa unión.
- [ ] Verificar que ambos contratos coincidan sin traducciones, cambios de mayúsculas ni acentos en los valores transmitidos.

Propuesta del lado ERP: conservar esos valores exactamente si corresponden al contrato vigente. Su comportamiento en la interfaz sigue pendiente; los nombres no bastan para deducir reglas de rechazo o revisión.

## CLABE

- [x] La referencia original declara `ValidacionFactura.clabe_virtual: string`.
- [x] Requisito de esta solicitud: tratar la CLABE como string para preservar ceros iniciales.
- [x] La propuesta ERP declara `EmitirFacturaResponse.clabe_virtual: string` y documenta que no debe convertirse a número.
- [ ] Confirmar nombre y ubicación del campo en el contrato vigente.
- [ ] Verificar tipo string en ambos contratos e intercambio JSON como cadena.
- [ ] Comprobar que captura, transporte, almacenamiento si se acuerda y presentación preserven el valor literal, sin conversiones numéricas.

El cliente provisional valida en ejecución los tipos requeridos, incluida CLABE como string, sin conversiones. Falta probar respuestas reales y presentación en pantallas. No se han creado datos mock ni reglas adicionales sobre longitud o validación bancaria.

## Cierre de integración

- [x] URL local confirmada: core en `http://127.0.0.1:3000` y ERP en `http://127.0.0.1:3001`, en la misma computadora. Configuración incluida en `.env.example`; conexión real pendiente.

- [x] Crear y documentar los cinco tipos como propuesta autorizada, sin cambiar campos HTTP de la planeación.

- [ ] Recibir ubicación y versión del contrato vigente del core.
- [ ] Comparar los cinco tipos campo por campo, incluyendo opcionales, nulos, estructuras anidadas y uniones.
- [ ] Registrar las diferencias concretas y acordar los cambios necesarios.
- [ ] Incorporar el contrato confirmado a `types/schema.ts` del ERP.
- [ ] Actualizar el contrato del core si procede, una vez identificado y revisadas sus instrucciones; no se ha modificado otro repositorio.
- [x] Ejecutar comprobaciones de tipos y serialización de CLABE en la base disponible; integración real y presentación pendientes.
- [ ] Registrar confirmación final del responsable del ERP y la versión compartida de ambos contratos.

## Validación local de la propuesta

- Cliente provisional añadido en `lib/api.ts`. Pruebas de configuración, cancelación y entradas inválidas sin ejecutar `fetch`. Respuestas HTTP y compatibilidad real aún pendientes de prueba con core o escenarios acordados.

- `node --check types/schema.ts`: sintaxis válida; no sustituye comprobación de tipos.
- `git diff --check`: sin errores de formato.
- Bloqueo inicial de dependencias macOS resuelto al reinstalar para Windows con `pnpm install --frozen-lockfile`, sin cambiar versiones del lockfile.
- `pnpm typecheck`: correcto; incluye el contrato, servidor y pruebas estáticas de CLABE y unión de decisiones.
- `pnpm test`: ocho pruebas correctas de configuración, HTTP local, serialización de CLABE y fallos del cliente previos al envío. La prueba de CLABE utiliza una cadena sintética, no una respuesta del core.
- `pnpm start`: comprobado en puerto 3001 sin `.env`; `/health` respondió correctamente y el proceso se detuvo al finalizar la verificación.
- No se realizó prueba HTTP contra el core ni validación de CLABE en una respuesta suya: el core no está disponible en esta sesión.
