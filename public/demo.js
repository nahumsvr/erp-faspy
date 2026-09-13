const form = document.querySelector('#invoice');
const scenario = document.querySelector('#scenario');
const status = document.querySelector('#status');
const result = document.querySelector('#result');
const fields = document.querySelector('#fields');
const submit = document.querySelector('#submit');
let apiUrl;
const examples = {
  approved: ['Distribuidora Industrial S.A. de C.V.', 'DIN890214ABC', 150000, 60],
  rejected: ['Construcciones del Sureste S.A. de C.V.', 'CON950603VWX', 100000, 30],
  review: ['Empresa Demo Sin Historial', 'XXX000101ABC', 100000, 90]
};
function clearResult() {
  result.hidden = true;
  status.textContent = apiUrl ? 'Lista para evaluar. Envía la factura al motor.' : 'Configura NEXT_PUBLIC_API_URL en el ERP y reinicia el servidor.';
}
function loadExample() {
  const values = [...examples[scenario.value], '4a71d8be-b51f-46df-9a84-18ef5560965e'];
  ['cliente', 'rfc_cliente', 'monto_mxn', 'plazo_dias', 'uuid_cfdi'].forEach((key, i) => { form.elements.namedItem(key).value = values[i]; });
  clearResult();
}
scenario.addEventListener('change', loadExample);
form.addEventListener('input', clearResult);
loadExample();
fetch('/demo-config').then(r => { if (!r.ok) throw Error(); return r.json(); }).then(config => {
  apiUrl = config.apiUrl;
  submit.disabled = !apiUrl;
  clearResult();
}).catch(() => { status.textContent = 'No se pudo cargar la configuración. Recarga la página.'; });
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!apiUrl || fields.disabled) return;
  const body = Object.fromEntries(new FormData(form));
  body.monto_mxn = Number(body.monto_mxn);
  body.plazo_dias = Number(body.plazo_dias);
  result.hidden = true;
  fields.disabled = true;
  scenario.disabled = true;
  status.textContent = 'Evaluando cumplimiento y riesgo en Faspy…';
  try {
    const response = await fetch(apiUrl, {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body), signal: AbortSignal.timeout(15000)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || `Error HTTP ${response.status}`);
    if (!['aprobada', 'revision', 'rechazada'].includes(data.decision) ||
      typeof data.clabe_virtual !== 'string' || !/^\d{18}$/.test(data.clabe_virtual) ||
      !['monto_anticipo','tasa_aplicada','dias_promedio_pago'].every(k => typeof data[k] === 'number' && Number.isFinite(data[k]) && data[k] >= 0) ||
      !['VIGENTE','RECHAZADO'].includes(data.cfdi_status) || !['LIMPIO','SANCIONADO'].includes(data.efos_status) ||
      !['ALTO','MEDIO','BAJO'].includes(data.score) || typeof data.factura_id !== 'string') {
      throw new Error('La respuesta del core no tiene el formato esperado. Revisa que estés usando la versión actual de Faspy.');
    }
    const descriptions = {
      aprobada: ['Oferta disponible', 'El motor aprobó la evaluación. Este es el anticipo simulado disponible para tu factura.'],
      rechazada: ['Solicitud rechazada', 'El motor rechazó la evaluación. No hay una oferta de anticipo para esta factura.'],
      revision: ['Revisión requerida', 'El motor solicita revisión. No hay una oferta de anticipo disponible por ahora.']
    };
    document.querySelector('#decision').textContent = descriptions[data.decision][0];
    document.querySelector('#explanation').textContent = descriptions[data.decision][1];
    result.parentElement.dataset.state = data.decision;
    const money = new Intl.NumberFormat('es-MX', {style:'currency', currency:'MXN'});
    const entries = [['CFDI',data.cfdi_status],['Estado fiscal',data.efos_status],['Score',data.score],['Anticipo',money.format(data.monto_anticipo)],['Tasa aplicada',new Intl.NumberFormat('es-MX',{style:'percent',maximumFractionDigits:2}).format(data.tasa_aplicada)],['Días promedio de pago',data.dias_promedio_pago],['CLABE virtual',data.clabe_virtual]];
    document.querySelector('#values').replaceChildren(...entries.map(([label, value]) => {
      const row = document.createElement('div');
      const dt = document.createElement('dt'); dt.textContent = label;
      const dd = document.createElement('dd'); dd.textContent = value;
      row.append(dt, dd); return row;
    }));
    document.querySelector('#raw').textContent = JSON.stringify(data, null, 2);
    status.textContent = `Evaluación recibida · ${data.factura_id}`;
    result.hidden = false;
  } catch (error) {
    status.textContent = error instanceof TypeError || error.name === 'TimeoutError'
      ? 'No se pudo conectar con Faspy. Comprueba que el core esté disponible y revisa NEXT_PUBLIC_API_URL en el servidor ERP.'
      : error.message;
  } finally { fields.disabled = false; scenario.disabled = false; }
});
