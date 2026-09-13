# Checklist MVP: alineación del contrato ERP / core

## Estado vigente — cierre acotado de la demo Windows, 2026-09-13

Alcance confirmado: escenario único, diseño y transiciones actuales, Express server-side, sin persistencia ni idempotencia. Auditoría, scoring general, dashboard y macOS no bloquean esta entrega. Las casillas de las secciones históricas no son pendientes actuales.

Fuentes revisadas: ERP `dev@9d824914d868eeb6d728546a9509963f6a5ad1db` antes del pulido; core `feature/contrato-facturacion-compliance-scoring@a754a0dae28a31b72aec3eda5eebe0595cb53e7c`. Ambos árboles limpios al inicio. Los cinco tipos coinciden, con `decision` opcional y CLABE string. No se modificó el contrato ni el core.

### Entregas y evidencia actual

- [x] 1. Base Express en Windows y configuración local.
- [x] 2. Cinco tipos alineados y tres llamadas centralizadas en `lib/api.ts`; sin fallback.
- [x] 3. Formulario de emisión, validación y oferta real del escenario acordado.
- [x] 4. Aceptación real: `FAC-2026-001`, `FONDEADA`.
- [x] 5. Depósito real de `120000`, fecha `2026-09-13T10:00:00.000Z`.
- [x] 6. Pago real: principal `120000`, comisión `3000`, remanente `27000`, margen JSON `0.02`.
- [x] 7. Pulido actual aceptado: importes MXN, tasa y margen en porcentaje, CLABE literal, textos para demo y enlace GET de regreso al inicio.
- [x] 8. Ruta Dorada CLI y recorrido completo en navegador repetidos; guía y JSON exacto publicados en el repositorio.
- [x] `pnpm typecheck` y `pnpm test`: 18 pruebas correctas; `git diff --check` sin errores de formato.
- [x] `pnpm probar:ruta-dorada docs/demo-factura.json`: salida 0 contra el core local.
- [x] `node scripts/verificar-demo.ts`: salida 0; campos faltantes 400, rechazo del core 400, escenario no soportado 422 y GET con cinco campos vacíos.
- [x] Error de core inaccesible observado en navegador; configuración ausente cubierta por las pruebas locales.
- [x] Formulario y oferta revisados en 1366×768 y 1440×900, sin overflow horizontal; depósito y liquidación revisados en navegador. Desplazamiento vertical normal para alcanzar acciones y regreso al inicio.
- [x] Foco visible, salto al contenido, entrada al formulario y regreso al inicio mediante teclado; enlace también comprobado tras liquidación.

### Límites de la evidencia

- El primer intento de integración falló por core apagado. `pnpm dev` del core agotó la memoria del equipo, incluso con límite de heap. Se detuvieron los procesos de core iniciados para esa prueba y se verificó con `pnpm start` usando el build local existente. No se reconstruyó ese build ni se acredita su correspondencia exacta con HEAD; sí se comprobó su compatibilidad HTTP para el caso acordado.
- El CSS cargado contiene `prefers-reduced-motion: reduce` que elimina transiciones, transformación y scroll suave. La preferencia del navegador estaba desactivada; la herramienta no expone emulación de movimiento. Esta revisión es estática, no una prueba visual con la preferencia activada.
- El script deshabilita el botón y cambia su texto a «Procesando…». El intento de doble clic llegó a la oferta, pero el controlador perdió el nodo al navegar; no acredita conteo de peticiones ni observación del estado transitorio. Queda pendiente una comprobación manual de carga y doble clic con navegador visible.

El pulido y el recorrido funcional están entregados. La aceptación visual dinámica completa conserva las dos comprobaciones anteriores pendientes; no se marcan como aprobadas por la revisión estática.

### Ampliaciones y limitaciones aceptadas

- Auditoría `ComplianceAuditItem`, scoring dinámico, catálogos ampliados y dashboard: fuera del cierre.
- Persistencia, recuperación, secuencia e idempotencia: no implementadas por decisión explícita. Recargar un POST puede reenviar; volver al inicio no borra ni revierte operaciones del core.
- macOS: instalación y ejecución pendientes; no bloquean la entrega Windows.
- No se prueban reglas generales de rechazo, servicios financieros reales ni CORS desde navegador; el recorrido es server-side.

## Historial — estado anterior de decision opcional, 2026-09-13

Todo lo que sigue conserva las evidencias y pendientes de revisiones anteriores; no representa el cierre vigente.

Fuentes: ERP en rama dev, commit local deb2f68 (sobre el historial publicado hasta 1223b86); core en feature/contrato-facturacion-compliance-scoring, commit a754a0d (con el escenario determinista de 4f71ceb y el contrato de 921fd4e). Ambos árboles estaban limpios al revisarse.

El usuario aprobó adoptar únicamente decision opcional. ComplianceAuditItem queda aplazado explícitamente: la afirmación de espejo exacto del checklist del core no describe ambos archivos completos.

| Tipo | Comparación ERP / core |
| --- | --- |
| InvoiceCFDI | Cinco campos obligatorios idénticos: monto_mxn y plazo_dias numéricos; cliente, rfc_cliente y uuid_cfdi string. Sin nulos. |
| EmitirFacturaRequest | Alias de InvoiceCFDI; body plano sin envoltorio en ambos. |
| ComplianceReport | cfdi_status: VIGENTE / RECHAZADO; efos_status: LIMPIO / SANCIONADO. Ambos obligatorios, sin nulos. |
| ScoringDecision | Unión idéntica aprobada / revision / rechazada, sin traducciones ni mapeo desde score. |
| EmitirFacturaResponse | Extiende ComplianceReport. Obligatorios: factura_id string, score ALTO / MEDIO / BAJO, monto_anticipo number, tasa_aplicada number, dias_promedio_pago number, clabe_virtual string. Único opcional: decision?: ScoringDecision. Plano y sin nulos en JSON. |

### Avance comprobado

- [x] Comparar los cinco tipos, nombres, obligatoriedad, nulos, estructuras y uniones.
- [x] Confirmar e incorporar decision opcional y sus tres valores literales.
- [x] Validar el campo presente; no completar ausencia ni inferir decisiones. Valores incompatibles siguen el error local contract.
- [x] Confirmar CLABE string en ambos schemas. El contrato documenta 18 dígitos; el cliente comprueba tipo, no formato bancario.
- [x] pnpm typecheck correcto; pnpm test: 17 pruebas correctas, incluyendo opcionalidad, campos obligatorios, la pantalla y el guardado de doble clic. Sin respuestas financieras mock. El primer intento tuvo EPERM de dependencias en sandbox; la ejecución autorizada fuera de él pasó.
- [x] Datos y motor acotados al escenario acordado en el core: fixtures mínimos en `lib/data` y funciones puras en `lib/engine`; no hay reglas generales.
- [x] Endpoints financieros del escenario: `POST /api/emitir-factura`, `POST /api/aceptar-anticipo` y `POST /api/simular-pago`. Auditoría y scoring dinámico siguen pendientes.
- [x] Probar el core por HTTP real: smoke test correcto contra `localhost:3000`, incluida latencia de emisión, CORS, anticipo y pago. Esto no prueba aún el cliente ERP ni CORS desde navegador.
- [x] Primera emisión desde el ERP ejecutada con `pnpm probar:emision` contra core `4f71ceb`: salida 0, `FAC-2026-001`, `VIGENTE/LIMPIO`, `ALTO` y `clabe_tipo: string`. No verifica CORS de navegador.
- [x] Ruta Dorada técnica ejecutada con `pnpm probar:ruta-dorada`: emisión, aceptación y pago respondieron con contrato compatible. No persiste datos ni prueba CORS de navegador.
- [x] Entrega 3: formulario de escritorio `/emision` con validación, carga, errores y oferta renderizada server-side. La prueba HTTP real devolvió `200` y `FAC-2026-001`.
- [x] Entrega 4: la oferta incluye acción server-side de aceptación; el core respondió `200` con estado `FONDEADA`.
- [x] Entrega 5: la misma experiencia presenta `monto_depositado` y `fecha_deposito` recibidos del core, sin persistencia local.
- [x] Entrega 6: la acción server-side de pago presenta principal, comisión, remanente y `margen_neto_pct` sin recalcularlos.
- [x] Entrega 7 (base): foco visible, salto al contenido, asociaciones ARIA, diseño adaptable, alto contraste, movimiento reducido y bloqueo de doble clic durante cada envío en la pantalla de escritorio. Esto evita reenvíos accidentales de la interfaz; no acredita idempotencia del core.
- [x] Entrega 8 (escenario acordado): `pnpm probar:ruta-dorada` se repitió con el core disponible y devolvió emisión, aceptación y pago compatibles; documentación y limitaciones quedan registradas.
- [x] Revisión visual local: `/emision` cargó en navegador, el árbol accesible expuso los cinco campos y el foco recorrió el salto al contenido y el formulario por teclado.
- [x] Revisión visual a resolución de escritorio amplia: viewport 1440×900, dos columnas visibles (`574.729px` y `517.271px`), documento sin overflow horizontal. La aceptación de animaciones finales queda separada.
- [x] Verificar intercambio JSON real y presentación literal de CLABE: el core devolvió `clabe_virtual` como `string` y `/emision` la mostró sin conversión.
- [x] Decidir navegador o servidor: servidor Express; `/emision` llama al core mediante `lib/api.ts`. CORS de navegador queda fuera de este recorrido.
- [x] Presentar `margen_neto_pct` como `2 %` cuando el core devuelve `0.02`; el JSON conserva la fracción y la interfaz solo aplica formato visual.

### Pendientes vigentes

- [ ] Auditoría `ComplianceAuditItem` y su endpoint: aplazada explícitamente.
- [ ] Scoring dinámico, catálogos ampliados y reglas generales del core: requieren contrato, escenarios y reglas aprobadas.
- [ ] Errores, rechazos, reenvíos, secuencia e idempotencia: el core ya define `400` y `422 SCENARIO_NOT_SUPPORTED`, y el ERP conserva esos estados en la pantalla; siguen requiriendo política acordada los rechazos generales, reenvíos, secuencia e idempotencia.
- [ ] Persistencia y recarga del flujo: requieren alcance y almacenamiento aprobados; la entrega actual no persiste datos.
- [ ] Aceptación de animaciones finales; las transiciones actuales respetan `prefers-reduced-motion`, pero falta la decisión visual final.
- [ ] Ejecutar las comprobaciones de instalación y pruebas en macOS.

La alineación estática está cerrada para los cinco tipos y la Ruta Dorada técnica y visual server-side se verificaron contra el core. La pantalla de escritorio cubre emisión, aceptación, tesorería y pago, incluida la CLABE literal. La resolución amplia ya está comprobada; queda acordar la aceptación final de animaciones. Quedan seis pendientes vigentes: cinco áreas de producto y la validación en macOS. CORS de navegador queda fuera de esta arquitectura.

## Historial de revisiones — no representa el estado vigente

Los estados siguientes son históricos; consultar la sección anterior para el avance actual.


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

El cliente provisional valida en ejecución los tipos requeridos, incluida CLABE como string, sin conversiones. La respuesta real de emisión y su presentación literal en `/emision` ya fueron comprobadas. No se han creado datos mock ni reglas adicionales sobre longitud o validación bancaria.

## Cierre de integración

- [x] Preparar `pnpm probar:emision` para ejecutar la prueba temprana desde un JSON acordado, sin mocks. Guía: `docs/prueba-integracion.md`.
- [ ] Ejecutar la primera emisión real con el core disponible y registrar el resultado. La preparación del comando no cierra este punto.

- [x] URL local confirmada y comprobada: core en `http://127.0.0.1:3000` y ERP en `http://127.0.0.1:3001`, en la misma computadora. Configuración incluida en `.env.example`.

- [x] Crear y documentar los cinco tipos como propuesta autorizada, sin cambiar campos HTTP de la planeación.

- [x] Identificar ubicación y versión disponible del core: revisión remota `08f652e`, sin contrato financiero implementado.
- [ ] Comparar los cinco tipos campo por campo, incluyendo opcionales, nulos, estructuras anidadas y uniones.
- [ ] Registrar las diferencias concretas y acordar los cambios necesarios.
- [ ] Incorporar el contrato confirmado a `types/schema.ts` del ERP.
- [ ] Actualizar el contrato del core si procede, una vez identificado y revisadas sus instrucciones; no se ha modificado otro repositorio.
- [x] Ejecutar comprobaciones de tipos, intercambio real y presentación literal de CLABE en la pantalla server-side.
- [ ] Registrar confirmación final del responsable del ERP y la versión compartida de ambos contratos.

## Validación local de la propuesta

- Cliente provisional añadido en `lib/api.ts`. Pruebas de configuración, cancelación y entradas inválidas, más Ruta Dorada HTTP real contra el escenario acordado. Errores de negocio generales e idempotencia siguen pendientes.

- `node --check types/schema.ts`: sintaxis válida; no sustituye comprobación de tipos.
- `git diff --check`: sin errores de formato.
- Bloqueo inicial de dependencias macOS resuelto al reinstalar para Windows con `pnpm install --frozen-lockfile`, sin cambiar versiones del lockfile.
- `pnpm typecheck`: correcto; incluye el contrato, servidor y pruebas estáticas de CLABE y unión de decisiones.
- `pnpm test`: ocho pruebas correctas de configuración, HTTP local, serialización de CLABE y fallos del cliente previos al envío. La prueba de CLABE utiliza una cadena sintética, no una respuesta del core.
- `pnpm start`: comprobado en puerto 3001 sin `.env`; `/health` respondió correctamente y el proceso se detuvo al finalizar la verificación.
- No se realizó prueba HTTP contra el core ni validación de CLABE en una respuesta suya: el core no está disponible en esta sesión.
