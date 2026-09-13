import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { apiErrorState, createApp } from "../server/app.ts";
import { ApiError } from "../lib/api.ts";
import { formatMargin, renderEmissionPage } from "../server/emision-page.ts";

async function withServer(callback: (base: string) => Promise<void>): Promise<void> {
  const server = createApp().listen(0, "127.0.0.1");
  try {
    await once(server, "listening");
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    await callback(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
}

test("GET /emision entrega un formulario accesible de escritorio", async () => {
  await withServer(async base => {
    const response = await fetch(`${base}/emision`);
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /text\/html/);
    assert.match(html, /<form method="post" action="\/emision" aria-describedby=/);
    assert.match(html, /id="monto_mxn"/);
    assert.match(html, /aria-live="polite"/);
    assert.match(html, /href="#main-content"/);
    assert.match(html, /id="main-content"/);
    assert.match(html, /prefers-reduced-motion/);
    assert.match(html, /idempotencia del core/);
    assert.match(html, /submit\.disabled = true/);
  });
});

test("POST /emision valida campos y escapa valores antes de llamar al core", async () => {
  await withServer(async base => {
    const response = await fetch(`${base}/emision`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ cliente: "<script>alert(1)</script>" }),
    });
    const html = await response.text();
    assert.equal(response.status, 400);
    assert.match(html, /Completa todos los campos requeridos/);
    assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
    assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
    assert.match(html, /aria-describedby="form-hint emision-error"/);
  });
});

test("POST /emision válido informa configuración ausente sin inventar una respuesta", async () => {
  await withServer(async base => {
    const response = await fetch(`${base}/emision`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        monto_mxn: "150000",
        cliente: "Distribuidora Industrial S.A. de C.V.",
        rfc_cliente: "DIN890214ABC",
        plazo_dias: "60",
        uuid_cfdi: "4a71d8be-b51f-46df-9a84-18ef5560965e",
      }),
    });
    assert.equal(response.status, 503);
    assert.match(await response.text(), /El core no está configurado en el ERP/);
  });
});

test("POST /emision/aceptar y /emision/pago requieren facturaId", async () => {
  await withServer(async base => {
    for (const path of ["/emision/aceptar", "/emision/pago"]) {
      const response = await fetch(`${base}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(),
      });
      assert.equal(response.status, 400);
      assert.match(await response.text(), /Falta el identificador de la factura/);
    }
  });
});

test("las acciones financieras no inventan respuestas sin URL del core", async () => {
  await withServer(async base => {
    for (const path of ["/emision/aceptar", "/emision/pago"]) {
      const response = await fetch(`${base}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ facturaId: "FAC-2026-001" }),
      });
      assert.equal(response.status, 503);
      assert.match(await response.text(), /El core no está configurado en el ERP/);
    }
  });
});

test("la interfaz presenta el margen recibido como porcentaje", () => {
  assert.match(formatMargin(0.02), /^2(?:\u00a0|\s)?%$/u);
});

test("los resultados presentan importes y el regreso al inicio", () => {
  const html = renderEmissionPage({ result: {
    factura_id: "FAC-2026-001",
    cfdi_status: "VIGENTE",
    efos_status: "LIMPIO",
    score: "ALTO",
    monto_anticipo: 120000,
    tasa_aplicada: 0.02,
    dias_promedio_pago: 45,
    clabe_virtual: "012180001234567890",
    decision: "aprobada",
  } });
  assert.match(html, /MXN[\s\u00a0]+120,000\.00/);
  assert.match(html, />2%<\/dd>/);
  assert.match(html, /href="\/emision">Volver al inicio/);
  assert.match(html, /let submitted = false/);
  assert.match(html, /form\.setAttribute\("aria-busy", "true"\)/);
  assert.match(html, /Procesando la solicitud/);
});
test("la pantalla conserva los estados de error 400 y 422 definidos por el core", () => {
  assert.deepEqual(apiErrorState(new ApiError("http", "", 400)), {
    status: 400,
    message: "El core rechazó la solicitud; revisa los datos de la factura.",
  });
  assert.deepEqual(apiErrorState(new ApiError("http", "", 422)), {
    status: 422,
    message: "El core no tiene habilitado este escenario.",
  });
  assert.equal(apiErrorState(new ApiError("http", "", 500)).status, 502);
});
