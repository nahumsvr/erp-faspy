import express from "express";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");

  // Comprueba solo el proceso ERP; no acredita conexión con el core.
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "erp-faspy", simulation: true });
  });

  return app;
}
