# De dónde salen los resultados financieros

Esta guía documenta la arquitectura prevista en la [checklist del core](../../faspy/docs/mvp-checklist.md). El [contrato HTTP](../../faspy/docs/faspy/contract.md) determina la interfaz de intercambio. Ninguna de las dos fuentes debe reemplazarse por suposiciones del ERP.

## Flujo previsto

Datos sintéticos del core → funciones de simulación del core → endpoints HTTP → cliente `lib/api.ts` → pantallas ERP.

| Resultado | Fuente prevista en faspy | Qué debe confirmarse antes de implementarlo |
| --- | --- | --- |
| Cumplimiento | `lib/engine/compliance.ts` y listas sintéticas de `lib/data` | Caso aprobado disponible; listas y reglas generales siguen pendientes |
| Score y decisión | `lib/engine/scoring.ts` | Resultado del caso aprobado disponible; umbrales generales no definidos |
| Días promedio de pago | Catálogo `lib/data/debtors.json` | Un pagador del escenario; catálogo ampliado pendiente |
| Oferta y desembolso | `lib/engine/factoring.ts` | Resultado fijo del caso aprobado; aforo, cálculo y redondeo generales pendientes |
| ID de factura, CLABE y fecha de depósito | `lib/data/scenario.json` y `lib/engine/scenario.ts` | Deterministas solo para el caso aprobado |
| Depósito y split | `lib/engine/scenario.ts` y `lib/engine/factoring.ts` | Caso aprobado disponible; secuencia, repetición y persistencia generales pendientes |

Las rutas de esta tabla describen el origen actual del escenario acordado en el core `4f71ceb`. El motor y los fixtures son deliberadamente mínimos; las reglas generales y auditoría siguen pendientes.

## Fórmula propuesta y coherencia del ejemplo

La tarea 1.3 del checklist propone:

```text
Desembolso = Monto factura × Aforo × (1 − Tasa descuento) − Comisión
```

El contrato muestra factura de 150000, anticipo y depósito de 120000, tasa 0.02 y comisión de liquidación de 3000. No identifica el aforo ni determina si la comisión de la fórmula es la misma comisión cobrada en la liquidación. Por tanto, no basta para obtener todos los parámetros ni para extender el ejemplo a cualquier factura.

Antes de implementar cálculos, acordar la relación entre fórmula y campos del contrato, el momento del cobro, unidades, redondeo y criterios de elegibilidad. No deducir reglas faltantes ni modificar ejemplos para hacerlos coincidir por cuenta propia.

## Separación de responsabilidades

- **Motor:** produce resultados de acuerdo con datos y reglas aprobados; previsto en tareas 1.2 y 1.3 del core.
- **Endpoints:** reciben solicitudes, invocan las funciones disponibles y devuelven el contrato acordado. Los errores y comportamiento de secuencia también requieren definición.
- **ERP:** envía datos y muestra la respuesta. No calcula importes faltantes ni decide elegibilidad.

El alcance vigente permite el motor y endpoints acotados al caso fijo aprobado explícitamente. El ERP sigue presentando resultados y no calcula importes ni elegibilidad. La primera emisión desde Node ya se verificó; aceptación/pago desde pantallas, CORS de navegador y persistencia siguen pendientes.

## Evidencia de coherencia

Para cerrar una parte del checklist, registrar en `docs/mvp-checklist.md`: fuente y revisión consultadas, diferencias concretas, decisión del usuario o equipo, implementación afectada y resultado de las pruebas. Una prueba de tipos no prueba reglas financieras; una petición desde Node no prueba CORS del navegador; un ejemplo de éxito no define errores.
