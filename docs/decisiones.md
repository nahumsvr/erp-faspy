# Decisiones del ERP EcoStream

## Confirmadas por el usuario

- Cierre actual aprobado: demo ERP local en Windows con el único escenario acordado. Conservar diseño y transiciones, mostrar importes MXN y tasas/margen como porcentajes sin cambiar JSON, y añadir «Volver al inicio» mediante GET `/emision`.
- Se acepta cerrar el alcance funcional sin persistencia, recuperación, secuencia ni idempotencia. El enlace solo abre un formulario vacío; no borra ni revierte operaciones. No añadir reintentos automáticos.
- Auditoría, motor general, más escenarios y dashboard quedan fuera de este cierre. macOS permanece pendiente y no bloquea la entrega Windows. Se autorizan commits locales del pulido y documentación; no push, merge ni deploy.
- Se autoriza incluir el JSON exacto del escenario existente para reproducir la demo, sin nuevas respuestas mock ni datos financieros inventados. Consultar el checklist vigente para los límites de las comprobaciones visuales y del build local usado.

- Entrega anterior: adoptar únicamente decision?: ScoringDecision en emisión con aprobada, revision y rechazada. Ausencia permitida; presente exige un valor de la unión, sin nulos ni conversiones. No deducir decisiones desde score o compliance.
- ComplianceAuditItem queda aplazado explícitamente. La entrega anterior cubrió tipos, cliente, pruebas y documentación; la integración se amplió posteriormente al escenario aprobado.

- Continuación autorizada: el usuario confirmó implementar en `faspy` el escenario sintético documentado de emisión, aceptación y pago, con fixtures y motor deterministas. Las entradas distintas se rechazan explícitamente con `SCENARIO_NOT_SUPPORTED`; no se extrapolan reglas ni se usa fallback. Core actualizado en `feature/contrato-facturacion-compliance-scoring`, commit `a754a0d` (escenario introducido en `4f71ceb`).
- La primera emisión real desde el ERP se ejecutó con `pnpm probar:emision` contra `http://127.0.0.1:3000`, código 0 y CLABE recibida como `string`. La Ruta Dorada posterior también se verificó desde la pantalla server-side con emisión, aceptación y pago reales; no valida CORS de navegador.
- Arquitectura confirmada para la interfaz: prioridad escritorio y llamadas server-side desde Express. La ruta `/emision` recibe el formulario, centraliza la llamada en `lib/api.ts` y no expone `NEXT_PUBLIC_API_URL` al navegador. CORS de navegador no es requisito de este recorrido.
- Presentación confirmada para `margen_neto_pct`: conservar `0.02` como fracción en el JSON y mostrar `2 %` en la interfaz. Es una conversión de presentación, no un recálculo financiero.


- El usuario solicitó instrucciones persistentes para consultar las fuentes y verificar coherencia. Se incorporan en `AGENTS.md` del ERP y se documenta el origen previsto de resultados en `docs/origen-resultados.md`. No autorizan implementar reglas pendientes ni amplían el alcance del motor.

- La autorización inicial permitió implementar endpoints en faspy sin redefinir el contrato financiero. La confirmación posterior amplió ese alcance al escenario sintético acotado y su motor determinista, sin cambiar el contrato. Fuente vigente: `C:/Users/hecto/faspy/docs/faspy/contract.md`, rama `feature/contrato-facturacion-compliance-scoring`, commit `4f71ceb`. La comparación contra `08f652e` queda como registro histórico.

- El usuario identificó `C:/Users/hecto/faspy` como el repositorio de ecostream-core. Se permite consultarlo y modificarlo dentro del alcance confirmado; la entrega `4f71ceb` contiene el escenario sintético y sus endpoints.

- ERP y core correrán en la misma computadora como procesos separados. ERP: `http://127.0.0.1:3001`; core: `http://127.0.0.1:3000`. Se configura `NEXT_PUBLIC_API_URL=http://127.0.0.1:3000` en el entorno local y su ejemplo. Confirmar la dirección no acredita que el core esté ejecutándose ni que el contrato sea compatible.

- El repositorio de trabajo es `erp-faspy`, aunque la planeación lo denomina `ecostream-erp`.
- Se utilizará Express. La propuesta de migrar a Next.js fue rechazada.
- Se aprueba el backlog de ocho entregas de la solicitud original; no se sustituye por el desglose propuesto posteriormente por el asistente.
- La imagen proporcionada sirve como referencia de arquitectura: ERP y core independientes, unidos por contrato HTTP y CORS. No especifica el diseño de las pantallas.
- Solo se construye el ERP: emisión de factura, oferta de anticipo, depósito en tesorería y simulación del cobro con split settlement.
- El ERP muestra los resultados del core; no implementa el motor financiero ni integraciones financieras reales.
- Las llamadas al core se centralizan en `lib/api.ts`; los componentes no hacen llamadas directas. Los tipos acordados viven en `types/schema.ts`.
- Se solicita configurar la URL con `NEXT_PUBLIC_API_URL`. Express no publica esa variable al navegador automáticamente; su exposición depende de la arquitectura de frontend pendiente.
- Los mocks requieren confirmar previamente valores y escenarios. Nunca se usarán como fallback automático ante fallos de la API.
- Se autorizan commits locales de entregas validadas. El usuario autorizó publicar los cambios actuales mediante push después de revisar la documentación y comprobar la base. La publicación corresponde a `origin/dev`; no incluye merge, deploy ni reescritura del historial.

## Estado observado al iniciar

Registro histórico anterior a la base actual. Hoy existe el servidor Express y sus scripts; consultar el README para arrancarlo.

- Rama `dev`, árbol limpio, commit inicial `f626781`.
- Base mínima Express con TypeScript, `pnpm-lock.yaml` y sin pantallas.
- `index.js` contiene sintaxis TypeScript; aún no se corrigió el arranque.
- No hay scripts de desarrollo o build; el script de test es un marcador que falla.
- No se encontró un `AGENTS.md` aplicable. Los bloques del documento de planeación son referencias, no archivos instalados.

## Historial — preguntas iniciales (resueltas o aplazadas arriba)

La arquitectura server-side, escritorio, oferta en la misma pantalla, escenario y pulido actuales están confirmados. Persistencia e idempotencia se excluyeron del cierre. Esta lista registra preguntas iniciales, no bloqueos vigentes:

- Forma de servir/renderizar el frontend con Express y ubicación de las llamadas HTTP (navegador o servidor ERP).
- Diseño visual, dispositivo prioritario y animaciones.
- Oferta como página, modal o ambos.
- Disponibilidad del core en la URL local confirmada, versión vigente del contrato y contrato de errores.
- Datos ficticios y autorización de mocks, con valores y escenarios.
- Validaciones de entrada, rechazo, reintentos y prevención de acciones duplicadas.
- Persistencia, recarga, acceso directo a pasos posteriores y reinicio del demo.

## Limpieza solicitada

- Se retira `node_modules` del seguimiento de Git y se conserva instalado localmente; `.gitignore` excluye dependencias, salidas de compilación, cobertura, logs y archivos de entorno locales.
- Se eliminó el ejemplo `index.js` y su referencia `main`, junto con el test de marcador. Posteriormente se incorporó el servidor ejecutable en `server/index.ts` y las pruebas actuales.
- Se conservan las dependencias de Express y TypeScript, el lockfile, `tsconfig.json` y la documentación del proyecto.

## Historial de conflictos y resoluciones

Las referencias a ScoringDecision pendiente se resuelven con la decisión actual anterior; los demás pendientes conservan su alcance.

- Se prepara la prueba temprana mediante `pnpm probar:emision <archivo>`: lee un JSON aportado por el equipo y usa `lib/api.ts`. El comando no genera datos, acepta anticipos ni simula pagos. La ejecución real queda pendiente del contrato y archivo acordados; no se ha ejecutado contra el core.

- El usuario autorizó avanzar sin URL ni pantallas con un cliente HTTP provisional, validaciones estructurales y errores locales. Implementado en `lib/api.ts` con `createApiClient(baseUrl)` y las tres operaciones acordadas; la URL se pasa desde `NEXT_PUBLIC_API_URL` cuando esté disponible.
- La clasificación `ApiError.kind` es interna del cliente, no modifica el contrato HTTP del core. No hay reintentos, redirecciones automáticas ni fallback mock. El invocador puede cancelar mediante `AbortSignal`; no se impone un timeout.
- La prueba del cliente se limita por ahora a fallos previos al envío. No se han creado respuestas mock, datos financieros ficticios ni supuestos sobre errores del core. La prueba de integración permanece pendiente.

- El usuario autorizó avanzar con la base sin pantallas: dependencias Windows, servidor Express, configuración de entorno, documentación y consistencia interna de tipos.
- La base usa Node 24 (mínimo 24.14) para ejecutar TypeScript directamente y pnpm 11.19.0. `typecheck` comprueba tipos por separado; no hay artefactos de build.
- El servidor local escucha en `127.0.0.1:3001` por defecto. `/health` identifica el proceso como simulación y no comprueba conectividad con el core.
- `NEXT_PUBLIC_API_URL` puede quedar vacía durante esta entrega. Si se configura, se valida como URL HTTP(S) sin credenciales, query ni fragmento; no se publica automáticamente al navegador. La arquitectura de frontend sigue pendiente.

- La solicitud de alineación del contrato exige manejar la CLABE como `string` para conservar ceros iniciales. Falta identificar el campo en la versión vigente del core.
- El usuario autorizó crear y documentar los cinco tipos solicitados. Se creó la propuesta ERP v0.1.0 en `types/schema.ts`, conservando los campos HTTP de la planeación y los nombres originales como alias. La guía está en `docs/api-contract.md` y la comparación pendiente en `docs/mvp-checklist.md`.
- `ScoringDecision` declara la unión propuesta `aprobada`/`revision`/`rechazada`; su confirmación con el core y el campo HTTP que la transportaría siguen pendientes. No se agregó un campo nuevo ni una regla de conversión del score.

- Express reemplaza la suposición de Next.js de la planeación. No se crearán rutas `app/*/page.tsx` por inercia.
- El uso automático de mocks sugerido por la planeación queda subordinado a la confirmación explícita exigida por el usuario.
- La referencia propone HTTP desde el navegador con CORS; confirmar la arquitectura de frontend antes de introducir un proxy o cambiar ese punto de integración.

## Integración autorizada de ramas de demo

Se conserva `/emision` y se incorpora la demo de tres escenarios en `/`. Las llamadas de la nueva pantalla pasan por `/demo/evaluar` y `lib/api.ts`, sin exponer la URL del core al navegador. Las comprobaciones anteriores de CORS describen la versión previa al merge. El usuario autorizó publicar la rama demo, integrarla a `dev` y después a `main`. Aceptación y pago existentes dependen de la versión del core; no se añaden endpoints financieros en este merge.
