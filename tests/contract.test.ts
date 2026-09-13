import assert from "node:assert/strict";
import test from "node:test";
import type { EmitirFacturaResponse, ScoringDecision } from "../types/schema.ts";
import { decisionShape, matches, type Shape } from "../lib/validation.ts";

// Verificaciones estáticas; no constituyen respuestas mock del core.
type Equal<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Assert<T extends true> = T;
export type ClabeIsString = Assert<Equal<EmitirFacturaResponse["clabe_virtual"], string>>;
export type DecisionValues = Assert<Equal<ScoringDecision, "aprobada" | "revision" | "rechazada">>;
export type OptionalDecision = Assert<Equal<EmitirFacturaResponse["decision"], ScoringDecision | undefined>>;
type RequiredEmission = Omit<EmitirFacturaResponse, "decision">;
export type WithoutDecision = Assert<RequiredEmission extends EmitirFacturaResponse ? true : false>;
export type WithDecisions = Assert<Equal<{
  [D in ScoringDecision]: RequiredEmission & { decision: D } extends EmitirFacturaResponse ? true : false
}[ScoringDecision], true>>;
export type InvalidDecision = Assert<Equal<RequiredEmission & { decision: "APROBADA" } extends EmitirFacturaResponse ? true : false, false>>;
export type NullDecision = Assert<Equal<RequiredEmission & { decision: null } extends EmitirFacturaResponse ? true : false, false>>;

test("decision permite ausencia y los tres valores sin modificar el objeto", () => {
  const absent = {};
  assert.equal(matches(absent, decisionShape), true);
  assert.equal(Object.hasOwn(absent, "decision"), false);
  for (const decision of ["aprobada", "revision", "rechazada"]) {
    const value = Object.freeze({ decision });
    assert.equal(matches(value, decisionShape), true);
    assert.equal(value.decision, decision);
  }
});

test("decision presente rechaza nulos, tipos distintos y valores desconocidos", () => {
  for (const decision of [null, undefined, 0, true, {}, [], "", "APROBADA", "revisión", "pendiente"]) {
    assert.equal(matches({ decision }, decisionShape), false);
  }
});

test("los campos obligatorios siguen requiriendo presencia y tipo", () => {
  const shape: Shape<{ clabe_virtual: string; decision?: ScoringDecision }> = {
    ...decisionShape,
    clabe_virtual: value => typeof value === "string",
  };
  for (const value of [null, [], {}, { decision: "aprobada" }, { clabe_virtual: 123 }, { clabe_virtual: null }]) {
    assert.equal(matches(value, shape), false);
  }
  assert.equal(matches({ clabe_virtual: "000123" }, shape), true);
});

test("una CLABE string conserva ceros al serializar JSON", () => {
  // Cadena sintética para probar serialización, no una CLABE bancaria del demo.
  const value: EmitirFacturaResponse["clabe_virtual"] = "000123";
  assert.equal(JSON.parse(JSON.stringify({ clabe_virtual: value })).clabe_virtual, value);
});
