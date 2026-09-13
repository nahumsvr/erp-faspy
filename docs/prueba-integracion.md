# Primera prueba real: emisión de factura

Estado: primera emisión real verificada contra core `4f71ceb`; aceptación y pago aún no se ejecutan desde el ERP. No se incluyen respuestas mock.

## Requisitos antes de ejecutar

1. Identificar el repositorio y versión del contrato del core y compararlo con `types/schema.ts`.
2. Levantar el core en `http://127.0.0.1:3000`, siguiendo sus instrucciones.
3. Disponer de un archivo JSON de factura acordado con el equipo. Debe contener el body directo de `EmitirFacturaRequest`, sin envoltorio. Consultar [contrato](api-contract.md).
4. Instalar dependencias del ERP y configurar `.env` a partir de `.env.example` conservando cualquier configuración local existente.

El comando ejecuta un POST real de emisión y puede crear una factura en el simulador. No acepta anticipos ni simula pagos. No es necesario levantar el servidor ERP para esta comprobación: se usa su cliente desde Node.

## Ejecutar en Windows o Mac

Desde la raíz de `erp-faspy`:

```bash
pnpm probar:emision "RUTA_AL_ARCHIVO_JSON_ACORDADO"
```

Reemplazar el argumento por un archivo existente del equipo. La ruta entre comillas puede contener espacios. El archivo se lee en UTF-8 y admite BOM. No se genera ni modifica ese archivo; no añadirlo a Git si contiene datos que no se hayan acordado para compartir.

El comando carga `.env`, pasa `NEXT_PUBLIC_API_URL` al cliente y llama solo a `POST /api/emitir-factura`. La respuesta se valida estructuralmente contra la propuesta actual, incluida `clabe_virtual` como cadena. No aplica fórmulas ni interpreta la elegibilidad a partir de los estados.

## Interpretación del resultado

- Código de salida 0: llegó una respuesta compatible con la propuesta. La terminal muestra ID, estados de compliance, score y tipo de CLABE; no imprime la CLABE ni importes.
- Código de salida 1: argumento/archivo inválido o error del cliente. No significa que la factura haya sido rechazada por una regla financiera.
- Un estado `RECHAZADO` permitido por el contrato es una respuesta válida; no se transforma en fallo de la herramienta.
- Un fallo de red o cancelación no garantiza que el core no procesara la factura. Consultar el estado con su responsable antes de repetir.

## Evidencias para cerrar el checkpoint

Registrar en `docs/mvp-checklist.md` las versiones de ambos contratos, quién proporcionó el caso, comando usado, código de salida y campos que no coincidan. La ejecución verificada de esta entrega fue contra `http://127.0.0.1:3000` con el escenario acordado y código de salida 0; no valida los otros dos endpoints ni todos los escenarios de rechazo o errores.

Esta prueba desde Node no valida CORS. Si las futuras pantallas llaman directamente al core, habrá que probar desde el navegador con el origen real del ERP (`http://127.0.0.1:3001` si se abre con esa dirección). Dos puertos distintos son orígenes distintos aunque compartan computadora.
