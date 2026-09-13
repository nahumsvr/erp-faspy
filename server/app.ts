import express from "express";
import { fileURLToPath } from "node:url";
import { ApiError, createApiClient } from "../lib/api.ts";
import type { AceptarAnticipoRequest, EmitirFacturaRequest, SimularPagoRequest } from "../types/schema.ts";
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

export function apiErrorState(error: unknown): NonNullable<EmisionPageState["error"]> {
  if (error instanceof ApiError) {
    if (error.kind === "configuration") return { status: 503, message: "El core no está configurado en el ERP." };
    if (error.kind === "request") return { status: 400, message: "Revisa los datos de la factura." };
    if (error.kind === "contract") return { status: 502, message: "El core devolvió una respuesta incompatible." };
    if (error.kind === "http" && error.status === 400) {
      return { status: 400, message: "El core rechazó la solicitud; revisa los datos de la factura." };
    }
    if (error.kind === "http" && error.status === 422) {
      return { status: 422, message: "El core no tiene habilitado este escenario." };
    }
    if (error.kind === "http") return { status: 502, message: `El core respondió con HTTP ${error.status ?? "desconocido"}.` };
    return { status: 502, message: "No se pudo completar la conexión con el core." };
  }
  return { status: 500, message: "No se pudo completar la emisión." };
}

function parseFacturaId(body: unknown): { input?: AceptarAnticipoRequest | SimularPagoRequest; error?: string } {
  const record = body && typeof body === "object" && !Array.isArray(body)
    ? body as Record<string, unknown> : {};
  if (typeof record.facturaId !== "string") {
    return { error: "Falta el identificador de la factura." };
  }
  return { input: { facturaId: record.facturaId } };
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

  app.post("/emision/aceptar", async (req, res) => {
    const parsed = parseFacturaId(req.body);
    if (!parsed.input) {
      res.type("html").status(400).send(renderEmissionPage({ error: { status: 400, message: parsed.error ?? "Datos inválidos." } }));
      return;
    }
    try {
      const advance = await createApiClient(apiUrl).aceptarAnticipo(parsed.input);
      res.type("html").status(200).send(renderEmissionPage({ advance }));
    } catch (error) {
      const errorState = apiErrorState(error);
      res.type("html").status(errorState.status).send(renderEmissionPage({ error: errorState }));
    }
  });

  app.post("/emision/pago", async (req, res) => {
    const parsed = parseFacturaId(req.body);
    if (!parsed.input) {
      res.type("html").status(400).send(renderEmissionPage({ error: { status: 400, message: parsed.error ?? "Datos inválidos." } }));
      return;
    }
    try {
      const payment = await createApiClient(apiUrl).simularPago(parsed.input);
      res.type("html").status(200).send(renderEmissionPage({ payment }));
    } catch (error) {
      const errorState = apiErrorState(error);
      res.type("html").status(errorState.status).send(renderEmissionPage({ error: errorState }));
    }
  });

  app.get("/demo-config", (_req, res) => {
    res.json({ apiUrl: apiUrl ? "/demo/evaluar" : null });
  });
  app.post("/demo/evaluar", express.json(), async (req, res) => {
    try {
      const result = await createApiClient(apiUrl).emitirFactura(req.body, { signal: AbortSignal.timeout(14000) });
      res.json(result);
    } catch (error) {
      const state = apiErrorState(error);
      res.status(state.status).json({ error: { message: state.message } });
    }
  });
  app.use(express.static(fileURLToPath(new URL("../public/", import.meta.url))));
  return app;
}
