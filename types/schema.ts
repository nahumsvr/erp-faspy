/**
 * Cinco tipos financieros alineados con ecostream-core 921fd4e.
 * decision opcional adoptada; auditoría pendiente por acuerdo del usuario.
 * Estos tipos no validan JSON en ejecución ni confirman soporte del backend.
 */

/** Factura de entrada. Los importes y plazos se envían sin cálculo financiero local. */
export interface InvoiceCFDI {
  monto_mxn: number;
  cliente: string;
  rfc_cliente: string;
  plazo_dias: number;
  /** UUID del CFDI con formato xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx. */
  uuid_cfdi: string;
}

/** POST /api/emitir-factura: body directo, sin envoltorio adicional. */
export type EmitirFacturaRequest = InvoiceCFDI;

/** Campos de compliance planos de la respuesta; no es un objeto JSON anidado. */
export interface ComplianceReport {
  cfdi_status: "VIGENTE" | "RECHAZADO";
  efos_status: "LIMPIO" | "SANCIONADO";
}

/**
 * Vocabulario confirmado para decision opcional en la respuesta de emisión.
 * No convertir score o compliance a esta decisión mediante reglas del ERP.
 */
export type ScoringDecision = "aprobada" | "revision" | "rechazada";

/** POST /api/emitir-factura: respuesta plana de la planeación original. */
export interface EmitirFacturaResponse extends ComplianceReport {
  factura_id: string;
  score: "ALTO" | "MEDIO" | "BAJO";
  monto_anticipo: number;
  /** Fracción recibida del core: 0.02 representa 2 %, según la planeación. */
  tasa_aplicada: number;
  dias_promedio_pago: number;
  /** Cadena literal: nunca convertir a number, para conservar ceros iniciales. */
  clabe_virtual: string;
  /** Se conserva cuando la envía el core; no se calcula si está ausente. */
  decision?: ScoringDecision;
}

/** Alias de compatibilidad con los nombres de la planeación original. */
export type Factura = InvoiceCFDI;
export type ValidacionFactura = EmitirFacturaResponse;

/** POST /api/aceptar-anticipo. Se conserva facturaId en camelCase. */
export interface AceptarAnticipoRequest {
  facturaId: string;
}

export interface AnticipoConfirmado {
  factura_id: string;
  estado: "FONDEADA";
  monto_depositado: number;
  /** Fecha ISO recibida del core. */
  fecha_deposito: string;
}

/** POST /api/simular-pago. */
export interface SimularPagoRequest {
  facturaId: string;
}

export interface ResultadoPago {
  factura_id: string;
  principal_retenido: number;
  comision_cobrada: number;
  remanente_dispersado: number;
  /** Fracción decimal recibida del core; la interfaz puede mostrarla como porcentaje. */
  margen_neto_pct: number;
}
