# Checklist MVP: alineación del contrato ERP / core

Estado: el usuario indicó `faspy/docs/faspy/contract.md` como fuente de verdad. Revisado en `921fd4e`, rama `feature/contrato-facturacion-compliance-scoring`. El core ya declara los cinco tipos. Endpoints financieros e integración siguen pendientes; el diagnóstico de `08f652e` que aparece abajo es histórico.

## Actualización de contrato — revisión 921fd4e

- Los cinco tipos solicitados ya existen en `faspy/types/schema.ts`. Los campos originales del ERP coinciden; el core incorpora `decision?: ScoringDecision` a `EmitirFacturaResponse`.
- `contract.md` presenta `decision` con la unión literal `aprobada`/`revision`/`rechazada`. El schema referenciado por ese documento la declara opcional.
- Ambos schemas declaran `clabe_virtual: string`; el contrato describe 18 dígitos. Falta comprobar su intercambio real.
- El contrato documenta un caso de éxito: factura 150000, anticipo/depósito 120000, comisión 3000, remanente 27000, fecha fija y margen 0.02. Son ejemplos documentados, no reglas de cálculo para cualquier factura.
- No existen motor ni endpoints financieros en esa revisión. Tampoco hay reglas acordadas para solicitudes distintas, reenvíos, secuencia de pasos ni contratos de error financieros.
- El usuario autorizó únicamente implementar endpoints usando ese documento. Pendiente confirmar si se usará el caso fijo como escenario ejecutable y cómo tratar entradas fuera de ese caso; no se ha convertido el ejemplo en un mock automáticamente.
- No se redefinió el contrato ni se modificaron los archivos de la rama del core durante esta inspección.

## Revisión del core — 2026-09-13

- Ruta confirmada por el usuario: `C:/Users/hecto/faspy`; remoto `nahumsvr/faspy`.
- Copia local: rama `develop`, commit `90705a5`, sin cambios pendientes. Contiene base Next.js, sin `types/schema.ts` ni rutas API.
- GitHub: rama `develop`, commit `08f652eb9de9625174b5096638ed8f64b4d1b348`, consultado en modo lectura. La copia local está atrasada; no se hizo pull ni se modificó el core.
- [Contrato remoto revisado](https://github.com/nahumsvr/faspy/blob/08f652eb9de9625174b5096638ed8f64b4d1b348/types/schema.ts): solo `HealthResponse` y `ApiError`. Declara que el contrato de facturas queda pendiente de sincronización con ERP.
- El árbol remoto tiene únicamente `app/api/health/route.ts` como endpoint. No existen `emitir-factura`, `aceptar-anticipo` ni `simular-pago`.
- La colección remota de Bruno contiene health y OPTIONS; no hay archivo de factura ni petición de emisión. `lib/data` y `lib/engine` contienen solo README.

### Diferencias observadas con la revisión remota

| Punto | ERP | Core remoto | Resolución pendiente |
| --- | --- | --- | --- |
| Los cinco tipos solicitados | Implementados como propuesta | Ninguno declarado en schema.ts | Acordar esquema antes de incorporarlo al core |
| InvoiceCFDI | Campos originales de Factura | Checklist propone RFC emisor/receptor, conceptos y vencimiento | Ampliación de producto pendiente de acuerdo; no añadida al ERP |
| ComplianceReport | CFDI y EFOS de la planeación | Checklist propone estados 69-B, OFAC y SPEI | No hay equivalencia implementada ni mapeo autorizado |
| ScoringDecision | Unión propuesta aprobada/revision/rechazada | Checklist propone objeto con riskScore, tier, aforo, tasas e importes | Nombre coincidente con significado distinto; no convertir ni reemplazar unilateralmente |
| CLABE | clabe_virtual: string | No hay campo financiero implementado | No puede confirmarse todavía el tipo del core |
| Errores | ApiError es una clase local del cliente | ApiError es un body JSON con error.code y error.message | Son conceptos distintos; no copiar como equivalentes. Su uso en endpoints financieros aún no existe |
| CORS | ERP documentado en http://127.0.0.1:3001 | corsHeaders usa ERP_ORIGIN o http://localhost:3001 | Coordinar ERP_ORIGIN=http://127.0.0.1:3001 si se abre con esa dirección; comprobar desde navegador |

Las propuestas ampliadas provienen del [checklist del core](https://github.com/nahumsvr/faspy/blob/08f652eb9de9625174b5096638ed8f64b4d1b348/docs/mvp-checklist.md), no de un contrato implementado. No autorizan construir el motor ni cambiar las reglas del ERP. La configuración CORS se verificó en [lib/api/response.ts](https://github.com/nahumsvr/faspy/blob/08f652eb9de9625174b5096638ed8f64b4d1b348/lib/api/response.ts); no se ejecutó una prueba de navegador.

## Fuentes y alcance de la revisión

- ERP: `erp-faspy`, rama `dev`, base revisada `76dca49`, sin cambios pendientes al iniciar la revisión.
- Referencia original: `planeacion_3_tareas_paralelas.md` proporcionada por el usuario.
- Solicitud actual: comparar cinco tipos nuevos, acordar estados y validar CLABE como string.
- Al iniciar no existía contrato en el ERP. El usuario autorizó posteriormente crear y documentar los cinco tipos. La ubicación y revisión del core se identificaron después; ver revisión de 2026-09-13 arriba.

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

- [x] Preparar `pnpm probar:emision` para ejecutar la prueba temprana desde un JSON acordado, sin mocks. Guía: `docs/prueba-integracion.md`.
- [ ] Ejecutar la primera emisión real con el core disponible y registrar el resultado. La preparación del comando no cierra este punto.

- [x] URL local confirmada: core en `http://127.0.0.1:3000` y ERP en `http://127.0.0.1:3001`, en la misma computadora. Configuración incluida en `.env.example`; conexión real pendiente.

- [x] Crear y documentar los cinco tipos como propuesta autorizada, sin cambiar campos HTTP de la planeación.

- [x] Identificar ubicación y versión disponible del core: revisión remota `08f652e`, sin contrato financiero implementado.
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
