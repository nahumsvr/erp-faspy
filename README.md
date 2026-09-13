# EcoStream — ERP simulado

Base Express del Frente 3 para una PyME mexicana. La Ruta Dorada prevista es emitir factura → oferta → depósito → simulación del cobro y split settlement.

Actualmente incluye servidor local, configuración, contrato TypeScript propuesto y comprobaciones de la base. Las pantallas y el cliente del core están pendientes. No contiene motor financiero, autenticación, base de datos ni conexiones a SAT/SPEI.

## Requisitos

- Node.js 24.14 o posterior de la rama 24.
- pnpm 11.19.0, declarado en `package.json`.

Node ejecuta directamente el TypeScript compatible con eliminación de tipos. No se requiere build ni se genera `dist`; la comprobación estática se ejecuta por separado.

## Arranque local

Desde la raíz del repositorio:

```powershell
pnpm install --frozen-lockfile
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
pnpm dev
```

Copiar `.env.example` solo si todavía no existe `.env`, para conservar tu configuración. El servidor escucha únicamente en `127.0.0.1`, puerto `3001` por defecto. Abrir [comprobación del servidor](http://127.0.0.1:3001/health):

```json
{"status":"ok","service":"erp-faspy","simulation":true}
```

`/health` confirma que el proceso ERP responde; no comprueba el core. No hay pantalla en `/` ni endpoints financieros locales: esas rutas responden 404.

| Comando | Función |
| --- | --- |
| `pnpm dev` | Arrancar y reiniciar al cambiar archivos |
| `pnpm start` | Arrancar sin vigilancia de archivos |
| `pnpm typecheck` | Comprobar tipos sin generar archivos |
| `pnpm test` | Probar configuración, HTTP local y serialización de CLABE |

Detener con Ctrl+C. Si el puerto está ocupado, detener el proceso correspondiente o cambiar `PORT` en `.env`.

## Configuración

| Variable | Valor por defecto | Uso |
| --- | --- | --- |
| `PORT` | `3001` | Puerto entero entre 1 y 65535 |
| `NEXT_PUBLIC_API_URL` | Sin configurar | URL HTTP(S) del core; completar cuando sea confirmada |

Los scripts cargan `.env` si existe; las variables del proceso tienen prioridad. Una URL configurada debe estar libre de credenciales, query y fragmento. No se publica automáticamente al navegador ni se devuelve por `/health`. Mientras falta, la base arranca y avisa; no intenta llamar al core ni devuelve mocks.

## Contrato y coordinación

- [Tipos propuestos](types/schema.ts)
- [Guía de consumo HTTP](docs/api-contract.md)
- [Checklist de integración](docs/mvp-checklist.md)
- [Decisiones](docs/decisiones.md)
- [Backlog](docs/backlog.md)

El contrato todavía debe contrastarse con el core. Las futuras llamadas se centralizarán en `lib/api.ts`. La prueba real de emisión se hará en cuanto exista URL confirmada; CORS debe comprobarse desde el navegador si se acuerda ese origen de las llamadas. No se ha configurado un proxy ni modificado el repositorio del core.

## Dependencias y Git

`node_modules` se instala para cada sistema operativo y está excluido de Git. No copiarlo entre macOS y Windows. Conservar `pnpm-lock.yaml` para reproducir versiones; no es necesario actualizar dependencias para levantar esta base. `.env` y los archivos generados también están excluidos.
