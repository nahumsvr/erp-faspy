import assert from "node:assert/strict";
import test from "node:test";
import { ApiError, createApiClient } from "../lib/api.ts";
import type { EmitirFacturaRequest } from "../types/schema.ts";

// Estas pruebas detienen cada operación antes de fetch. No crean respuestas mock del core.
test("el cliente puede crearse sin URL y falla al invocar cualquiera de sus operaciones", async () => {
  const api = createApiClient(undefined);
  for (const operation of [
    () => api.emitirFactura(undefined as unknown as EmitirFacturaRequest),
    () => api.aceptarAnticipo({ facturaId: "" }),
    () => api.simularPago({ facturaId: "" }),
  ]) {
    await assert.rejects(operation, (error: unknown) => error instanceof ApiError && error.kind === "configuration");
  }
});

test("rechaza URLs no configuradas o incompatibles antes de enviar datos", async () => {
  for (const url of ["", " ", "not-a-url", "ftp://example.test", "https://user:pass@example.test", "https://example.test?key=value", "https://example.test#fragment"]) {
    await assert.rejects(createApiClient(url).simularPago({ facturaId: "" }),
      (error: unknown) => error instanceof ApiError && error.kind === "configuration");
  }
});

test("una señal ya cancelada impide el envío", async () => {
  await assert.rejects(createApiClient("https://example.test").simularPago(
    { facturaId: "" }, { signal: AbortSignal.abort() }),
  (error: unknown) => error instanceof ApiError && error.kind === "aborted");
});

test("rechaza entradas sin los campos requeridos antes de serializar o enviar", async () => {
  const api = createApiClient("https://example.test");
  await assert.rejects(api.emitirFactura({} as EmitirFacturaRequest),
    (error: unknown) => error instanceof ApiError && error.kind === "request");
  await assert.rejects(api.aceptarAnticipo({ facturaId: 1 } as unknown as { facturaId: string }),
    (error: unknown) => error instanceof ApiError && error.kind === "request");
});
