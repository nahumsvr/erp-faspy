import type {
  AnticipoConfirmado, EmitirFacturaRequest, EmitirFacturaResponse, ResultadoPago,
} from "../types/schema.ts";

export interface EmisionPageState {
  values?: Partial<Record<keyof EmitirFacturaRequest, string>>;
  result?: EmitirFacturaResponse;
  advance?: AnticipoConfirmado;
  payment?: ResultadoPago;
  error?: { status: number; message: string };
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function fieldValue(state: EmisionPageState, key: keyof EmitirFacturaRequest): string {
  return escapeHtml(state.values?.[key] ?? "");
}

function resultPanel(result: EmitirFacturaResponse): string {
  const decision = result.decision
    ? `<div><dt>Decisión</dt><dd>${escapeHtml(result.decision)}</dd></div>`
    : "";
  return `<section class="result" aria-labelledby="result-title" aria-live="polite">
    <p class="eyebrow">Respuesta del core</p>
    <h2 id="result-title">Oferta disponible</h2>
    <dl class="metrics">
      <div><dt>Factura</dt><dd>${escapeHtml(result.factura_id)}</dd></div>
      <div><dt>Cumplimiento CFDI</dt><dd>${escapeHtml(result.cfdi_status)}</dd></div>
      <div><dt>EFOS</dt><dd>${escapeHtml(result.efos_status)}</dd></div>
      <div><dt>Score</dt><dd>${escapeHtml(result.score)}</dd></div>
      ${decision}
      <div><dt>Monto de anticipo</dt><dd>${escapeHtml(result.monto_anticipo)}</dd></div>
      <div><dt>Tasa aplicada</dt><dd>${escapeHtml(result.tasa_aplicada)}</dd></div>
      <div><dt>Días promedio de pago</dt><dd>${escapeHtml(result.dias_promedio_pago)}</dd></div>
      <div><dt>CLABE virtual</dt><dd><code>${escapeHtml(result.clabe_virtual)}</code></dd></div>
    </dl>
    <form class="action" method="post" action="/emision/aceptar">
      <input type="hidden" name="facturaId" value="${escapeHtml(result.factura_id)}">
      <button type="submit">Aceptar anticipo</button>
    </form>
  </section>`;
}

function advancePanel(advance: AnticipoConfirmado): string {
  return `<section class="result" aria-labelledby="advance-title" aria-live="polite">
    <p class="eyebrow">Tesorería</p>
    <h2 id="advance-title">Anticipo aceptado</h2>
    <dl class="metrics">
      <div><dt>Factura</dt><dd>${escapeHtml(advance.factura_id)}</dd></div>
      <div><dt>Estado</dt><dd>${escapeHtml(advance.estado)}</dd></div>
      <div><dt>Monto depositado</dt><dd>${escapeHtml(advance.monto_depositado)}</dd></div>
      <div><dt>Fecha de depósito</dt><dd>${escapeHtml(advance.fecha_deposito)}</dd></div>
    </dl>
    <form class="action" method="post" action="/emision/pago">
      <input type="hidden" name="facturaId" value="${escapeHtml(advance.factura_id)}">
      <button type="submit">Simular pago</button>
    </form>
  </section>`;
}

function paymentPanel(payment: ResultadoPago): string {
  return `<section class="result" aria-labelledby="payment-title" aria-live="polite">
    <p class="eyebrow">Liquidación</p>
    <h2 id="payment-title">Pago simulado</h2>
    <dl class="metrics">
      <div><dt>Factura</dt><dd>${escapeHtml(payment.factura_id)}</dd></div>
      <div><dt>Principal retenido</dt><dd>${escapeHtml(payment.principal_retenido)}</dd></div>
      <div><dt>Comisión cobrada</dt><dd>${escapeHtml(payment.comision_cobrada)}</dd></div>
      <div><dt>Remanente dispersado</dt><dd>${escapeHtml(payment.remanente_dispersado)}</dd></div>
      <div><dt>Margen neto (valor recibido)</dt><dd>${escapeHtml(payment.margen_neto_pct)}</dd></div>
    </dl>
    <p class="hint">Los importes y el margen se muestran tal como los devolvió el core.</p>
  </section>`;
}

export function renderEmissionPage(state: EmisionPageState = {}): string {
  const error = state.error
    ? `<p id="emision-error" class="alert" role="alert">${escapeHtml(state.error.message)}</p>`
    : "";
  const result = state.payment
    ? paymentPanel(state.payment)
    : state.advance
      ? advancePanel(state.advance)
      : state.result
        ? resultPanel(state.result)
        : `<section class="panel" aria-live="polite"><p class="eyebrow">Resultado</p><h2>La respuesta aparecerá aquí</h2><p class="lede">Completa el formulario para iniciar la validación del escenario acordado.</p></section>`;
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Emitir factura · EcoStream</title>
    <style>
      :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, sans-serif; background: #eef5f7; color: #153042; }
      * { box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      body { margin: 0; min-height: 100vh; }
      .skip-link { background: #153042; border-radius: 0 0 10px 10px; color: #fff; left: 16px; padding: 10px 14px; position: absolute; top: -48px; z-index: 2; }
      .skip-link:focus { top: 0; }
      main { width: min(1120px, calc(100% - 48px)); margin: 0 auto; padding: 56px 0 72px; }
      .shell { display: grid; grid-template-columns: minmax(0, 1fr) minmax(360px, .9fr); gap: 28px; align-items: start; }
      .panel { background: #fff; border: 1px solid #d8e5e8; border-radius: 20px; box-shadow: 0 14px 34px rgb(27 63 77 / 12%); padding: 32px; }
      h1, h2, p { margin-top: 0; } h1 { font-size: clamp(2rem, 4vw, 3.2rem); line-height: 1.05; letter-spacing: -.03em; margin-bottom: 14px; } h2 { margin-bottom: 20px; }
      .eyebrow { color: #006d77; font-size: .78rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
      .lede { color: #526b76; font-size: 1.05rem; line-height: 1.6; margin-bottom: 28px; }
      form { display: grid; gap: 18px; } .action { margin-top: 24px; } .field { display: grid; gap: 7px; } label { font-weight: 700; } input { background: #fff; border: 1px solid #b9cdd2; border-radius: 10px; color: inherit; font: inherit; min-height: 46px; padding: 10px 12px; transition: border-color .18s ease, box-shadow .18s ease; } input:focus-visible { border-color: #006d77; box-shadow: 0 0 0 3px rgb(0 109 119 / 18%); outline: 0; }
      .row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; } .hint { color: #617880; font-size: .88rem; margin: 0; }
      button { background: #006d77; border: 0; border-radius: 10px; color: #fff; cursor: pointer; font: inherit; font-weight: 800; min-height: 48px; padding: 12px 18px; transition: background-color .18s ease, transform .18s ease; } button:hover { background: #00515a; transform: translateY(-1px); } button:focus-visible { outline: 3px solid #f4b942; outline-offset: 3px; }
      .result { background: #f2fbf8; border: 1px solid #b8e2d4; border-radius: 16px; padding: 24px; } .metrics { display: grid; gap: 13px; margin: 0; } .metrics div { border-bottom: 1px solid #d6eee7; display: flex; gap: 18px; justify-content: space-between; padding-bottom: 10px; } dt { color: #52706f; font-size: .9rem; } dd { font-weight: 800; margin: 0; text-align: right; } code { font-size: .92rem; letter-spacing: .06em; }
      .alert { background: #fff4e8; border: 1px solid #edc693; border-radius: 10px; color: #744d1d; margin-bottom: 20px; padding: 12px 14px; }
      @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } input, button { transition: none; } button:hover { transform: none; } }
      @media (forced-colors: active) { .panel, .result, .alert { border: 1px solid CanvasText; } button { border: 1px solid ButtonText; } }
      @media (max-width: 780px) { main { width: min(100% - 28px, 620px); padding-top: 28px; } .shell { grid-template-columns: 1fr; } .panel { padding: 24px; } }
      @media (max-width: 500px) { .row { grid-template-columns: 1fr; } .metrics div { align-items: start; flex-direction: column; gap: 4px; } dd { text-align: left; overflow-wrap: anywhere; } }
    </style>
  </head>
  <body>
    <a class="skip-link" href="#main-content">Saltar al contenido</a>
    <main id="main-content">
      <p class="eyebrow">EcoStream · Centro de operaciones</p>
      <h1>Emite una factura y revisa su oferta.</h1>
      <p class="lede">El ERP envía la información al core simulado y presenta la respuesta sin calcular scoring ni importes financieros localmente.</p>
      <div class="shell">
        <section class="panel" aria-labelledby="form-title">
          <h2 id="form-title">Datos de la factura</h2>
          ${error}
          <form method="post" action="/emision" aria-describedby="form-hint${state.error ? " emision-error" : ""}">
            <div class="field"><label for="monto_mxn">Monto (MXN)</label><input id="monto_mxn" name="monto_mxn" type="number" min="0" step="0.01" inputmode="decimal" autocomplete="off" required value="${fieldValue(state, "monto_mxn")}"></div>
            <div class="field"><label for="cliente">Cliente</label><input id="cliente" name="cliente" type="text" autocomplete="organization" required value="${fieldValue(state, "cliente")}"></div>
            <div class="field"><label for="rfc_cliente">RFC del cliente</label><input id="rfc_cliente" name="rfc_cliente" type="text" autocomplete="off" required value="${fieldValue(state, "rfc_cliente")}"></div>
            <div class="row">
              <div class="field"><label for="plazo_dias">Plazo (días)</label><input id="plazo_dias" name="plazo_dias" type="number" min="0" step="1" inputmode="numeric" required value="${fieldValue(state, "plazo_dias")}"></div>
              <div class="field"><label for="uuid_cfdi">UUID del CFDI</label><input id="uuid_cfdi" name="uuid_cfdi" type="text" autocomplete="off" required value="${fieldValue(state, "uuid_cfdi")}"></div>
            </div>
            <p id="form-hint" class="hint">La validación de elegibilidad y la oferta provienen del core.</p>
            <button type="submit">Validar factura</button>
          </form>
        </section>
        ${result}
      </div>
    </main>
  </body>
</html>`;
}
