import assert from "node:assert/strict";
import test from "node:test";
import type { EmitirFacturaResponse, ScoringDecision } from "../types/schema.ts";

// Verificaciones estáticas; no constituyen respuestas mock del core.
type Equal<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Assert<T extends true> = T;
export type ClabeIsString = Assert<Equal<EmitirFacturaResponse["clabe_virtual"], string>>;
export type DecisionValues = Assert<Equal<ScoringDecision, "aprobada" | "revision" | "rechazada">>;

test("una CLABE string conserva ceros al serializar JSON", () => {
  // Cadena sintética para probar serialización, no una CLABE bancaria del demo.
  const value: EmitirFacturaResponse["clabe_virtual"] = "000123";
  assert.equal(JSON.parse(JSON.stringify({ clabe_virtual: value })).clabe_virtual, value);
});
