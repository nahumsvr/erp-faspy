import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { createApp } from "../server/app.ts";
import { readConfig } from "../server/config.ts";

test("la base arranca sin URL del core y sin inventar una", () => {
  assert.deepEqual(readConfig({}), { port: 3001, apiUrl: undefined });
});

test("configuración acepta HTTP(S) y rechaza puertos o URLs inválidos", () => {
  assert.deepEqual(readConfig({ PORT: "3101", NEXT_PUBLIC_API_URL: "https://core.example.test" }), {
    port: 3101, apiUrl: "https://core.example.test",
  });
  for (const port of ["", "0", "65536", "3001abc", "1.5", "-1"]) {
    assert.throws(() => readConfig({ PORT: port }), /PORT/);
  }
  for (const url of ["invalid", "ftp://example.test", "https://user:pass@example.test", "https://example.test?key=value", "https://example.test#fragment"]) {
    assert.throws(() => readConfig({ NEXT_PUBLIC_API_URL: url }), /NEXT_PUBLIC_API_URL/);
  }
});

test("health responde por HTTP sin exponer configuración ni simular endpoints del core", async () => {
  const server = createApp().listen(0, "127.0.0.1");
  try {
    await once(server, "listening");
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const base = `http://127.0.0.1:${address.port}`;
    const response = await fetch(`${base}/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: "ok", service: "erp-faspy", simulation: true });
    assert.equal((await fetch(`${base}/api/emitir-factura`, { method: "POST" })).status, 404);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
