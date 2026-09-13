## Demo conectada a Faspy

La pantalla en `/` permite capturar una factura y consultar el motor real del simulador. Incluye casos precargados de aprobación, sanción fiscal y revisión. No realiza depósitos ni guarda facturas.

1. Iniciar `faspy` con `pnpm dev` en puerto 3000.
2. En `.env` del ERP configurar `NEXT_PUBLIC_API_URL=http://localhost:3000` y `PORT=3001`.
3. Iniciar el ERP con `pnpm dev` y abrir **http://localhost:3001** (usar localhost para coincidir con CORS).
4. Elegir un escenario y pulsar **Evaluar factura**. Los importes, estados y CLABE vienen del core; no se calculan ofertas en el ERP.

Faspy debe permitir `ERP_ORIGIN=http://localhost:3001`. Reiniciar los servidores al cambiar variables. La pantalla avisa si falta configuración, falla la conexión o el core devuelve errores. Los datos del dashboard de Faspy siguen siendo independientes de esta petición.

Lo siguiente es documentación de la base previa; sus referencias a pantallas pendientes quedan sustituidas por esta demo.

# EcoStream — ERP simulado

Base Express del Frente 3 para una PyME mexicana. La Ruta Dorada prevista es emitir factura → oferta → depósito → simulación del cobro y split settlement.

Actualmente incluye servidor local, configuración, contrato TypeScript propuesto y comprobaciones de la base. Las pantallas y el cliente del core están pendientes. No contiene motor financiero, autenticación, base de datos ni conexiones a SAT/SPEI.

## Requisitos

- Node.js 24.14 o posterior de la rama 24.
- pnpm 11.19.0, declarado en `package.json`.

Comprobar con `node --version` y `pnpm --version`. Si falta pnpm, después de instalar Node puedes instalarlo con `npm install --global pnpm@11.19.0`.

Node ejecuta directamente el TypeScript compatible con eliminación de tipos. No se requiere build ni se genera `dist`; la comprobación estática se ejecuta por separado.

## Arranque local

### Descargar la rama del equipo

Esta entrega se comparte en `dev`:

```bash
git clone --branch dev https://github.com/nahumsvr/erp-faspy.git
cd erp-faspy
```

Si ya tienes el repositorio, revisa `git status` y conserva tus cambios antes de cambiar de rama. Con el árbol limpio:

```bash
git fetch origin
git switch dev
git pull --ff-only origin dev
```

Si `dev` aún no existe localmente, usa `git switch --track origin/dev` en lugar de `git switch dev`. Usa tu acceso habitual a GitHub si solicita autenticación; no guardes credenciales en el proyecto.

### Windows — PowerShell

Desde la raíz del repositorio:

```powershell
pnpm install --frozen-lockfile
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
pnpm typecheck
pnpm test
pnpm dev
```

### macOS — Terminal (zsh o bash)

```bash
pnpm install --frozen-lockfile
if [ ! -e .env ]; then cp .env.example .env; fi
pnpm typecheck
pnpm test
pnpm dev
```

### Resultado esperado

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

La base y las cuatro pruebas se han validado en Windows. Los scripts y dependencias permiten instalación en macOS, pero falta ejecutar las comprobaciones en una Mac. Cada equipo debe instalar sus dependencias localmente.

## Qué puede probar el equipo hoy

- Arranque de Express y respuesta JSON de `/health`.
- Validación de puerto y URL configurada, sin conectar con el core.
- Tipos del contrato propuesto, incluida CLABE como `string` y los valores de `ScoringDecision`.
- Serialización de una cadena con ceros iniciales; no es validación bancaria ni una prueba del core.

Las cuatro pantallas, `lib/api.ts` y el recorrido financiero completo están pendientes. La guía del contrato es una propuesta, no una garantía de compatibilidad con el backend del otro repositorio.

## Problemas frecuentes

| Síntoma | Qué revisar |
| --- | --- |
| `node` o `pnpm` no se encuentran | Instalar las versiones indicadas y abrir una terminal nueva |
| Error de `sh` o de plataforma al ejecutar TypeScript | Retirar solo la carpeta local `node_modules` copiada de otro sistema y repetir la instalación del lockfile |
| Puerto ocupado | Cambiar `PORT` o detener el proceso que ya lo utiliza |
| `/` devuelve 404 | Es esperado: todavía no hay pantallas; usar `/health` |
| Aviso de core sin configurar | Es esperado con `NEXT_PUBLIC_API_URL` vacía; no bloquea esta entrega |
| Instalación o pruebas fallan | Compartir el error y versiones de Node/pnpm; no borrar el lockfile ni actualizar versiones para ocultarlo |

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
