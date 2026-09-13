# Primera prueba real: emisión de factura

## Guía vigente de la demo Windows — 2026-09-13

Usar Node 24.14 o posterior de la rama 24 y la versión de pnpm de cada package.json (ERP 11.19.0, core 11.2.2). Si faltan dependencias, ejecutar `pnpm install --frozen-lockfile` en cada repositorio. No copiar node_modules entre sistemas.

En una terminal PowerShell para el core:

```powershell
Set-Location C:/Users/hecto/faspy
pnpm dev
```

En otra terminal para el ERP:

```powershell
Set-Location C:/Users/hecto/erp-faspy
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
pnpm typecheck
pnpm test
pnpm dev
```

Configurar `NEXT_PUBLIC_API_URL=http://127.0.0.1:3000` conservando las demás variables. ERP escucha en 3001. No iniciar otra instancia si el puerto está ocupado.

### Caso y recorrido

El archivo [demo-factura.json](demo-factura.json) reproduce exactamente la entrada autorizada:

```json
{
  "monto_mxn": 150000,
  "cliente": "Distribuidora Industrial S.A. de C.V.",
  "rfc_cliente": "DIN890214ABC",
  "plazo_dias": 60,
  "uuid_cfdi": "4a71d8be-b51f-46df-9a84-18ef5560965e"
}
```

1. Abrir [la pantalla](http://127.0.0.1:3001/emision), capturar esos valores y pulsar «Validar factura».
2. Verificar FAC-2026-001, VIGENTE, LIMPIO, ALTO, aprobada, anticipo MXN 120,000.00, tasa 2 %, 45 días y CLABE literal `012180001234567890`.
3. Pulsar «Aceptar anticipo»: FONDEADA, depósito MXN 120,000.00 y fecha `2026-09-13T10:00:00.000Z`.
4. Pulsar «Simular pago»: principal MXN 120,000.00, comisión MXN 3,000.00, remanente MXN 27,000.00 y margen 2 %.
5. Pulsar «Volver al inicio»: abre los cinco campos vacíos, sin borrar ni revertir operaciones del core.

Desde una tercera terminal en el ERP:

```powershell
pnpm probar:ruta-dorada docs/demo-factura.json
node scripts/verificar-demo.ts
```

El primer comando efectúa los tres POST al simulador. El segundo comprueba entradas inválidas, errores 400/422 y el GET inicial. Ambos terminaron con código 0. El JSON conserva importes numéricos y fracciones 0.02; el formato es visual.

### Evidencia y límites

Fuentes: ERP dev@9d82491 antes del pulido y core feature/contrato-facturacion-compliance-scoring@a754a0d. Tipos y escenario contrastados con los archivos actuales. Typecheck correcto y 18 pruebas aprobadas.

La primera ejecución falló por core apagado. El arranque de desarrollo agotó memoria, también al limitar el heap. Se validó con `pnpm start` usando el build local existente: CLI, emisión/aceptación/pago desde navegador y errores 400/422 correctos. No se recompiló el core ni se certifica que ese build reproduzca exactamente HEAD. En una instalación nueva se requiere `pnpm dev` o `pnpm build` correcto antes de `pnpm start`.

Formulario y oferta revisados en 1366×768 y 1440×900 sin overflow horizontal. Foco visible, entrada al formulario y regreso al inicio por teclado comprobados. Depósito y liquidación mostraron los valores anteriores. Core inaccesible observado en navegador; configuración ausente cubierta por pruebas.

Pendiente manual: activar movimiento reducido y confirmar ausencia de transiciones; observar «Procesando…», botón deshabilitado y doble clic durante envío. Las reglas CSS y el script existen, pero la herramienta no expone emulación de movimiento y perdió el nodo al intentar doble clic durante la navegación. No se contabilizaron POST para acreditar un único envío. Estos límites están registrados en el checklist.

Sin persistencia ni recuperación. Recargar un POST puede reenviar la operación; ante fallo de red no asumir que el core no la procesó. Sin garantía de secuencia ni idempotencia. Auditoría, escenarios generales y dashboard quedan fuera; macOS no se ejecutó. CORS del navegador no interviene en este flujo server-side.

## Historial de la primera integración

Lo siguiente conserva la guía anterior; para reproducir el cierre usar la sección vigente de arriba.


Estado: primera emisión, Ruta Dorada técnica desde Node y Ruta Dorada visual server-side verificadas contra core `a754a0d` (escenario introducido en `4f71ceb`). La pantalla de escritorio encadena emisión, aceptación, depósito y pago con respuestas reales. No se incluyen respuestas mock ni persistencia del ERP.

## Requisitos antes de ejecutar

1. Identificar el repositorio y versión del contrato del core y compararlo con `types/schema.ts`.
2. Levantar el core en `http://127.0.0.1:3000`, siguiendo sus instrucciones.
3. Disponer de un archivo JSON de factura acordado con el equipo. Debe contener el body directo de `EmitirFacturaRequest`, sin envoltorio. Consultar [contrato](api-contract.md).
4. Instalar dependencias del ERP y configurar `.env` a partir de `.env.example` conservando cualquier configuración local existente.

El comando `probar:emision` ejecuta un POST real de emisión y puede crear una factura en el simulador. No acepta anticipos ni simula pagos. Para recorrer las tres operaciones existe `pnpm probar:ruta-dorada`, que encadena emisión, aceptación y pago usando los datos devueltos por el core. No es necesario levantar el servidor ERP para estas comprobaciones: se usa su cliente desde Node.

## Ejecutar en Windows o Mac

Desde la raíz de `erp-faspy`:

```bash
pnpm probar:emision "RUTA_AL_ARCHIVO_JSON_ACORDADO"
```

Reemplazar el argumento por un archivo existente del equipo. La ruta entre comillas puede contener espacios. El archivo se lee en UTF-8 y admite BOM. No se genera ni modifica ese archivo; no añadirlo a Git si contiene datos que no se hayan acordado para compartir.

El comando carga `.env`, pasa `NEXT_PUBLIC_API_URL` al cliente y llama solo a `POST /api/emitir-factura`. La respuesta se valida estructuralmente contra la propuesta actual, incluida `clabe_virtual` como cadena. No aplica fórmulas ni interpreta la elegibilidad a partir de los estados.

Para ejecutar la Ruta Dorada completa:

```bash
pnpm probar:ruta-dorada "RUTA_AL_ARCHIVO_JSON_ACORDADO"
```

La salida resume emisión, anticipo y pago, sin imprimir la CLABE. La ejecución verificada el 13 de septiembre de 2026 devolvió `FAC-2026-001`, `FONDEADA`, `120000`, `27000` y `margen_neto_pct: 0.02`; la pantalla presenta ese último valor como `2 %`. El comando no crea persistencia en el ERP y solo es válido para el escenario que el core tenga habilitado.

## Interpretación del resultado

- Código de salida 0: llegó una respuesta compatible con la propuesta. La terminal muestra ID, estados de compliance, score y tipo de CLABE; no imprime la CLABE ni importes.
- Código de salida 1: argumento/archivo inválido o error del cliente. No significa que la factura haya sido rechazada por una regla financiera.
- Un estado `RECHAZADO` permitido por el contrato es una respuesta válida; no se transforma en fallo de la herramienta.
- Un fallo de red o cancelación no garantiza que el core no procesara la factura. Consultar el estado con su responsable antes de repetir.

## Evidencias para cerrar el checkpoint

Registrar en `docs/mvp-checklist.md` las versiones de ambos contratos, quién proporcionó el caso, comando usado, código de salida y campos que no coincidan. La emisión verificada fue contra `http://127.0.0.1:3000` con el escenario acordado y código de salida 0; una ejecución de Ruta Dorada debe registrar por separado sus tres respuestas. Ninguna de estas pruebas valida todos los escenarios de rechazo o errores.

La pantalla `/emision` y sus acciones usan el servidor Express como intermediario, por lo que el navegador no llama directamente al core y CORS queda fuera de este recorrido. Si una futura pantalla llama directamente al core, habrá que probar entonces desde el navegador con el origen real del ERP (`http://127.0.0.1:3001` si se abre con esa dirección). Dos puertos distintos son orígenes distintos aunque compartan computadora.
