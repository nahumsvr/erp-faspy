import { readFile } from "node:fs/promises";
import { ApiError, createApiClient } from "../lib/api.ts";
import { readConfig } from "../server/config.ts";
import type { EmitirFacturaRequest } from "../types/schema.ts";

const args = process.argv.slice(2);

async function main(): Promise<void> {
  if (args.length !== 1) {
    throw new Error("Uso: pnpm probar:ruta-dorada <ruta-al-JSON-de-factura-acordada>");
  }

  let source: string;
  try {
    source = await readFile(args[0]!, "utf8");
  } catch {
    throw new Error("No se pudo leer el archivo de factura. Revisa su ruta y permisos.");
  }

  let input: unknown;
  try {
    input = JSON.parse(source.replace(/^\uFEFF/, ""));
  } catch {
    throw new Error("El archivo no contiene JSON válido. No se envió una solicitud.");
  }

  const api = createApiClient(readConfig().apiUrl);
  const emission = await api.emitirFactura(input as EmitirFacturaRequest);
  const advance = await api.aceptarAnticipo({ facturaId: emission.factura_id });
  const payment = await api.simularPago({ facturaId: emission.factura_id });

  console.log("Ruta Dorada respondida y compatible con el contrato del ERP.");
  console.log(JSON.stringify({
    emision: {
      factura_id: emission.factura_id,
      cfdi_status: emission.cfdi_status,
      efos_status: emission.efos_status,
      score: emission.score,
      clabe_tipo: typeof emission.clabe_virtual,
    },
    anticipo: {
      estado: advance.estado,
      monto_depositado: advance.monto_depositado,
      fecha_deposito: advance.fecha_deposito,
    },
    pago: payment,
  }, null, 2));
  console.log("La prueba usa el core real; no valida CORS del navegador ni persiste datos en el ERP.");
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
    console.error(error instanceof Error ? error.message : "No se pudo completar la Ruta Dorada.");
  }
  process.exitCode = 1;
}
