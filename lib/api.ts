import type {
  AceptarAnticipoRequest, AnticipoConfirmado, EmitirFacturaRequest,
  EmitirFacturaResponse, ResultadoPago, SimularPagoRequest,
} from "../types/schema.ts";

/** Errores locales del cliente; no representan códigos JSON del core. */
export type ApiErrorKind = "configuration" | "request" | "network" | "http" | "json" | "contract" | "aborted";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | undefined;

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

type Check = (value: unknown) => boolean;
const string: Check = value => typeof value === "string";
const number: Check = value => typeof value === "number" && Number.isFinite(value);
const oneOf = (...values: string[]): Check => value => typeof value === "string" && values.includes(value);
type Shape<T> = { [K in keyof T]-?: Check };

const invoiceShape: Shape<EmitirFacturaRequest> = {
  monto_mxn: number, cliente: string, rfc_cliente: string, plazo_dias: number, uuid_cfdi: string,
};
const idShape: Shape<AceptarAnticipoRequest> = { facturaId: string };
const emissionShape: Shape<EmitirFacturaResponse> = {
  factura_id: string,
  cfdi_status: oneOf("VIGENTE", "RECHAZADO"),
  efos_status: oneOf("LIMPIO", "SANCIONADO"),
  score: oneOf("ALTO", "MEDIO", "BAJO"),
  monto_anticipo: number, tasa_aplicada: number, dias_promedio_pago: number, clabe_virtual: string,
};
const advanceShape: Shape<AnticipoConfirmado> = {
  factura_id: string, estado: oneOf("FONDEADA"), monto_depositado: number, fecha_deposito: string,
};
const paymentShape: Shape<ResultadoPago> = {
  factura_id: string, principal_retenido: number, comision_cobrada: number,
  remanente_dispersado: number, margen_neto_pct: number,
};

function matches<T>(value: unknown, shape: Shape<T>): value is T {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return Object.entries<Check>(shape).every(([key, check]) =>
    Object.hasOwn(record, key) && check(record[key]));
}

function endpoint(baseUrl: string | undefined, path: string): string {
  if (!baseUrl?.trim()) {
    throw new ApiError("configuration", "Falta configurar NEXT_PUBLIC_API_URL.");
  }
  let url: URL;
  try {
    url = new URL(baseUrl.trim());
  } catch {
    throw new ApiError("configuration", "NEXT_PUBLIC_API_URL debe ser una URL HTTP(S) válida.");
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new ApiError("configuration", "NEXT_PUBLIC_API_URL debe usar HTTP(S), sin credenciales, query ni fragmento.");
  }
  url.pathname = `${url.pathname.replace(/\/+$/, "")}${path}`;
  return url.href;
}

export interface RequestOptions {
  /** Cancelación o plazo definidos por quien invoca; no hay timeout implícito. */
  signal?: AbortSignal;
}

/**
 * No realiza llamadas al crearse. Pasar NEXT_PUBLIC_API_URL desde la configuración.
 * Contrato provisional: no calcula scoring, rechazos ni importes.
 */
export function createApiClient(baseUrl: string | undefined) {
  async function post<Input, Output>(
    path: string, input: Input, inputShape: Shape<Input>, outputShape: Shape<Output>,
    options: RequestOptions = {},
  ): Promise<Output> {
    const url = endpoint(baseUrl, path);
    if (options.signal?.aborted) throw new ApiError("aborted", "Solicitud cancelada.");
    if (!matches(input, inputShape)) {
      throw new ApiError("request", "Los datos de entrada no coinciden con los tipos del contrato provisional.");
    }
    let body: string;
    try {
      body = JSON.stringify(input);
    } catch {
      throw new ApiError("request", "No se pudo serializar la solicitud como JSON.");
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body,
        signal: options.signal,
        redirect: "error",
      });
    } catch {
      if (options.signal?.aborted) throw new ApiError("aborted", "Solicitud cancelada.");
      throw new ApiError("network", "No se pudo completar la conexión con el core.");
    }
    if (!response.ok) {
      // El formato del error del core no está acordado: no interpretar ni exponer su body.
      throw new ApiError("http", `El core respondió con HTTP ${response.status}.`, response.status);
    }

    let text: string;
    try {
      text = await response.text();
    } catch {
      if (options.signal?.aborted) throw new ApiError("aborted", "Solicitud cancelada.");
      throw new ApiError("network", "No se pudo leer la respuesta del core.", response.status);
    }
    let result: unknown;
    try {
      result = JSON.parse(text);
    } catch {
      throw new ApiError("json", "El core no devolvió JSON válido.", response.status);
    }
    if (!matches(result, outputShape)) {
      throw new ApiError("contract", "La respuesta no coincide con el contrato provisional del ERP.", response.status);
    }
    return result;
  }

  return {
    emitirFactura: (input: EmitirFacturaRequest, options?: RequestOptions) =>
      post("/api/emitir-factura", input, invoiceShape, emissionShape, options),
    aceptarAnticipo: (input: AceptarAnticipoRequest, options?: RequestOptions) =>
      post("/api/aceptar-anticipo", input, idShape, advanceShape, options),
    simularPago: (input: SimularPagoRequest, options?: RequestOptions) =>
      post("/api/simular-pago", input, idShape, paymentShape, options),
  };
}
