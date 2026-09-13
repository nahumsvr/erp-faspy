import express from "express";
import { fileURLToPath } from "node:url";

export function createApp(apiUrl?: string) {
  const app = express();
  app.disable("x-powered-by");

  // Comprueba solo el proceso ERP; no acredita conexión con el core.
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "erp-faspy", simulation: true });
  });

  app.get("/demo-config", (_req, res) => {
    res.json({ apiUrl: apiUrl ?? null });
  });
  app.use(express.static(fileURLToPath(new URL("../public/", import.meta.url))));
  return app;
}
