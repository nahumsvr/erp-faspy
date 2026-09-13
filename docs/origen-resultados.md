# De dónde salen los resultados financieros

Esta guía documenta la arquitectura prevista en la [checklist del core](../../faspy/docs/mvp-checklist.md). El [contrato HTTP](../../faspy/docs/faspy/contract.md) determina la interfaz de intercambio. Ninguna de las dos fuentes debe reemplazarse por suposiciones del ERP.

## Flujo previsto

Datos sintéticos del core → funciones de simulación del core → endpoints HTTP → cliente `lib/api.ts` → pantallas ERP.

| Resultado | Fuente prevista en faspy | Qué debe confirmarse antes de implementarlo |
| --- | --- | --- |
| Cumplimiento | `lib/engine/compliance.ts` y listas sintéticas de `lib/data` | Escenarios, validaciones y correspondencia con `cfdi_status`/`efos_status` |
| Score y decisión | `lib/engine/scoring.ts` | Umbrales, influencia del pagador/monto/plazo y criterios de revisión/rechazo |
| Días promedio de pago | Catálogo `lib/data/debtors.json` | Datos por pagador y comportamiento si no existe |
| Oferta y desembolso | `lib/engine/factoring.ts` | Aforo, tasa, comisión, unidades y redondeo |
| ID de factura, CLABE y fecha de depósito | No especificada completamente | Generación determinista, asociación con la factura y política de fechas |
| Depósito y split | Tipos y ejemplos definidos en el contrato | Origen de importes, secuencia de operaciones, repetición y persistencia |

Las rutas de esta tabla describen trabajo previsto, no garantizan que los archivos existan. Verificar código y revisión antes de usarlos. En la inspección de `921fd4e`, `lib/data` y `lib/engine` solo contenían README.

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

El alcance autorizado actualmente es implementar endpoints, no construir el motor. Si el motor no existe, documentar esa dependencia y acordar cómo avanzar. Un caso fijo solo puede usarse si se aprueba explícitamente; no constituye un motor financiero.

## Evidencia de coherencia

Para cerrar una parte del checklist, registrar en `docs/mvp-checklist.md`: fuente y revisión consultadas, diferencias concretas, decisión del usuario o equipo, implementación afectada y resultado de las pruebas. Una prueba de tipos no prueba reglas financieras; una petición desde Node no prueba CORS del navegador; un ejemplo de éxito no define errores.
