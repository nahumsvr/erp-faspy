/** Validación estructural compartida por el cliente; no aplica reglas financieras. */
export type Check = (value: unknown) => boolean;
export type Shape<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? { optional: true; check: Check } : Check;
};

export function matches<T>(value: unknown, shape: Shape<T>): value is T {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return Object.entries<Check | { optional: true; check: Check }>(shape).every(([key, rule]) => {
    const present = Object.hasOwn(record, key);
    return typeof rule === "function"
      ? present && rule(record[key])
      : !present || rule.check(record[key]);
  });
}

export const decisionShape: Shape<{ decision?: import("../types/schema.ts").ScoringDecision }> = {
  decision: {
    optional: true,
    check: value => value === "aprobada" || value === "revision" || value === "rechazada",
  },
};
