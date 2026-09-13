import express from "express";
import { ApiError, createApiClient } from "../lib/api.ts";
import type { EmitirFacturaRequest } from "../types/schema.ts";
import { renderEmissionPage, type EmisionPageState } from "./emision-page.ts";

function parseEmissionForm(body: unknown): { input?: EmitirFacturaRequest; values: EmisionPageState["values"]; error?: string } {
  const record = body && typeof body === "object" && !Array.isArray(body)
    ? body as Record<string, unknown> : {};
  const values = {
    monto_mxn: String(record.monto_mxn ?? ""),
    cliente: String(record.cliente ?? ""),
    rfc_cliente: String(record.rfc_cliente ?? ""),
    plazo_dias: String(record.plazo_dias ?? ""),
    uuid_cfdi: String(record.uuid_cfdi ?? ""),
  };
  if (!values.monto_mxn || !values.cliente || !values.rfc_cliente || !values.plazo_dias || !values.uuid_cfdi) {
    return { values, error: "Completa todos los campos requeridos." };
  }
  const monto_mxn = Number(values.monto_mxn);
  const plazo_dias = Number(values.plazo_dias);
  if (!Number.isFinite(monto_mxn) || !Number.isFinite(plazo_dias)) {
    return { values, error: "Monto y plazo deben ser números válidos." };
  }
  return { values, input: { ...values, monto_mxn, plazo_dias } };
}

function apiErrorState(error: unknown): NonNullable<EmisionPageState["error"]> {
  if (error instanceof ApiError) {
    if (error.kind === "configuration") return { status: 503, message: "El core no está configurado en el ERP." };
    if (error.kind === "request") return { status: 400, message: "Revisa los datos de la factura." };
    if (error.kind === "contract") return { status: 502, message: "El core devolvió una respuesta incompatible." };
    if (error.kind === "http") return { status: 502, message: `El core respondió con HTTP ${error.status ?? "desconocido"}.` };
    return { status: 502, message: "No se pudo completar la conexión con el core." };
  }
  return { status: 500, message: "No se pudo completar la emisión." };
}

export function createApp(apiUrl?: string) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.urlencoded({ extended: false }));

  // Comprueba solo el proceso ERP; no acredita conexión con el core.
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "erp-faspy", simulation: true });
  });

  app.get("/emision", (_req, res) => {
    res.type("html").status(200).send(renderEmissionPage());
  });

  app.post("/emision", async (req, res) => {
    const parsed = parseEmissionForm(req.body);
    if (!parsed.input) {
      res.type("html").status(400).send(renderEmissionPage({ values: parsed.values, error: { status: 400, message: parsed.error ?? "Datos inválidos." } }));
      return;
    }
    try {
      const result = await createApiClient(apiUrl).emitirFactura(parsed.input);
      res.type("html").status(200).send(renderEmissionPage({ values: parsed.values, result }));
    } catch (error) {
      const errorState = apiErrorState(error);
      res.type("html").status(errorState.status).send(renderEmissionPage({ values: parsed.values, error: errorState }));
    }
  });

  return app;
}
