import { readFile } from "node:fs/promises";
import { ApiError, createApiClient } from "../lib/api.ts";
import { readConfig } from "../server/config.ts";
import type { EmitirFacturaRequest } from "../types/schema.ts";

const args = process.argv.slice(2);

async function main(): Promise<void> {
  if (args.length !== 1) {
    throw new Error("Uso: pnpm probar:emision <ruta-al-JSON-de-factura-acordada>");
  }

  let source: string;
  try {
    source = await readFile(args[0]!, "utf8");
  } catch {
    throw new Error("No se pudo leer el archivo de factura. Revisa su ruta y permisos.");
  }

  let input: unknown;
  try {
    // Tolera BOM UTF-8 de archivos creados por algunos editores de Windows.
    input = JSON.parse(source.replace(/^\uFEFF/, ""));
  } catch {
    throw new Error("El archivo no contiene JSON válido. No se envió una solicitud.");
  }

  const api = createApiClient(readConfig().apiUrl);
  // El cliente valida los campos en ejecución antes de enviar; la aserción no valida el JSON.
  const result = await api.emitirFactura(input as EmitirFacturaRequest);
  console.log("Emisión respondida y compatible con el contrato provisional del ERP.");
  console.log(JSON.stringify({
    factura_id: result.factura_id,
    cfdi_status: result.cfdi_status,
    efos_status: result.efos_status,
    score: result.score,
    clabe_tipo: typeof result.clabe_virtual,
  }, null, 2));
  console.log("Esta prueba no acepta el anticipo, no simula el pago y no verifica CORS del navegador.");
}

try {
  await main();
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`${error.kind}: ${error.message}`);
    if (error.kind === "network" || error.kind === "aborted") {
      console.error("Consulta el estado en el core antes de repetir: la operación podría haberse procesado.");
    }
  } else {
    console.error(error instanceof Error ? error.message : "No se pudo completar la prueba de emisión.");
  }
  process.exitCode = 1;
}
