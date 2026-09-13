import assert from "node:assert/strict";

// Comprobación HTTP de errores ya acordados. Requiere ERP y core locales activos.
// Envía solicitudes inválidas al simulador; no inventa respuestas financieras.
const base = "http://127.0.0.1:3001";
for (const [path, body, status, message] of [
  ["/emision", "", 400, "Completa todos los campos requeridos."],
  ["/emision/aceptar", "facturaId=", 400, "El core rechazó la solicitud"],
  ["/emision/aceptar", "facturaId=NO-SOPORTADA", 422, "El core no tiene habilitado este escenario."],
] as const) {
  const response = await fetch(`${base}${path}`, {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body,
    signal: AbortSignal.timeout(10000),
  });
  const html = await response.text();
  assert.equal(response.status, status);
  assert.ok(html.includes(message));
  assert.ok(html.includes('href="/emision">Volver al inicio</a>'));
  console.log(`${path}: HTTP ${status}, mensaje y enlace de inicio correctos.`);
}
const start = await fetch(`${base}/emision`, { signal: AbortSignal.timeout(10000) });
assert.equal(start.status, 200);
const html = await start.text();
assert.equal((html.match(/required value=""/g) ?? []).length, 5);
assert.ok(!html.includes('action="/emision/aceptar"'));
assert.ok(!html.includes('action="/emision/pago"'));
console.log("GET /emision: cinco campos vacíos, sin acciones financieras posteriores.");
