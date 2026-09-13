# Decisiones del ERP EcoStream

## Confirmadas por el usuario

- El repositorio de trabajo es `erp-faspy`, aunque la planeación lo denomina `ecostream-erp`.
- Se utilizará Express. La propuesta de migrar a Next.js fue rechazada.
- Se aprueba el backlog de ocho entregas de la solicitud original; no se sustituye por el desglose propuesto posteriormente por el asistente.
- La imagen proporcionada sirve como referencia de arquitectura: ERP y core independientes, unidos por contrato HTTP y CORS. No especifica el diseño de las pantallas.
- Solo se construye el ERP: emisión de factura, oferta de anticipo, depósito en tesorería y simulación del cobro con split settlement.
- El ERP muestra los resultados del core; no implementa el motor financiero ni integraciones financieras reales.
- Las llamadas al core se centralizan en `lib/api.ts`; los componentes no hacen llamadas directas. Los tipos acordados viven en `types/schema.ts`.
- Se solicita configurar la URL con `NEXT_PUBLIC_API_URL`. Express no publica esa variable al navegador automáticamente; su exposición depende de la arquitectura de frontend pendiente.
- Los mocks requieren confirmar previamente valores y escenarios. Nunca se usarán como fallback automático ante fallos de la API.
- Se autorizan commits locales de entregas validadas. No se autoriza push, merge, deploy ni reescritura del historial.

## Estado observado al iniciar

- Rama `dev`, árbol limpio, commit inicial `f626781`.
- Base mínima Express con TypeScript, `pnpm-lock.yaml` y sin pantallas.
- `index.js` contiene sintaxis TypeScript; aún no se corrigió el arranque.
- No hay scripts de desarrollo o build; el script de test es un marcador que falla.
- No se encontró un `AGENTS.md` aplicable. Los bloques del documento de planeación son referencias, no archivos instalados.

## Pendientes antes de implementar la parte afectada

- Forma de servir/renderizar el frontend con Express y ubicación de las llamadas HTTP (navegador o servidor ERP).
- Diseño visual, dispositivo prioritario y animaciones.
- Oferta como página, modal o ambos.
- Disponibilidad y URL del core, versión vigente del contrato y contrato de errores.
- Datos ficticios y autorización de mocks, con valores y escenarios.
- Validaciones de entrada, rechazo, reintentos y prevención de acciones duplicadas.
- Persistencia, recarga, acceso directo a pasos posteriores y reinicio del demo.

## Limpieza solicitada

- Se retira `node_modules` del seguimiento de Git y se conserva instalado localmente; `.gitignore` excluye dependencias, salidas de compilación, cobertura, logs y archivos de entorno locales.
- Se elimina el ejemplo `index.js` y su referencia `main`, junto con el script de prueba de marcador. La base queda sin servidor ejecutable hasta la entrega de configuración de Express.
- Se conservan las dependencias de Express y TypeScript, el lockfile, `tsconfig.json` y la documentación del proyecto.

## Conflictos resueltos y por resolver

- La solicitud de alineación del contrato exige manejar la CLABE como `string` para conservar ceros iniciales. Falta identificar el campo en la versión vigente del core.
- El usuario autorizó crear y documentar los cinco tipos solicitados. Se creó la propuesta ERP v0.1.0 en `types/schema.ts`, conservando los campos HTTP de la planeación y los nombres originales como alias. La guía está en `docs/api-contract.md` y la comparación pendiente en `docs/mvp-checklist.md`.
- `ScoringDecision` declara la unión propuesta `aprobada`/`revision`/`rechazada`; su confirmación con el core y el campo HTTP que la transportaría siguen pendientes. No se agregó un campo nuevo ni una regla de conversión del score.

- Express reemplaza la suposición de Next.js de la planeación. No se crearán rutas `app/*/page.tsx` por inercia.
- El uso automático de mocks sugerido por la planeación queda subordinado a la confirmación explícita exigida por el usuario.
- La referencia propone HTTP desde el navegador con CORS; confirmar la arquitectura de frontend antes de introducir un proxy o cambiar ese punto de integración.
