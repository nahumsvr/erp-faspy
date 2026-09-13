# EcoStream — ERP simulado

Base Express del Frente 3 para una PyME mexicana. La Ruta Dorada prevista es emitir factura → oferta → depósito → simulación del cobro y split settlement.

Actualmente incluye servidor local, configuración, contrato TypeScript, cliente HTTP y una experiencia de escritorio que encadena emisión, aceptación, depósito y pago server-side en `/emision`. La Ruta Dorada visual del escenario acordado está verificada en resolución compacta y amplia; la pantalla tiene pulido base de accesibilidad, movimiento reducido y bloqueo de doble clic. Quedan seis pendientes vigentes: auditoría, reglas generales/scoring, política de errores e idempotencia, persistencia, aceptación de animaciones y validación en macOS. El bloqueo de doble clic no sustituye una política de idempotencia del core. No contiene motor financiero propio, autenticación, base de datos ni conexiones a SAT/SPEI.

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

`/health` confirma que el proceso ERP responde; no comprueba el core. La pantalla de emisión está en [`/emision`](http://127.0.0.1:3001/emision) y llama al core desde el servidor; `/` y los endpoints financieros locales no implementados responden 404.

| Comando | Función |
| --- | --- |
| `pnpm dev` | Arrancar y reiniciar al cambiar archivos |
| `pnpm start` | Arrancar sin vigilancia de archivos |
| `pnpm typecheck` | Comprobar tipos sin generar archivos |
| `pnpm test` | Probar la base y los casos del cliente que no requieren core ni mocks |
| `pnpm probar:emision "RUTA_AL_JSON"` | Emitir una factura real del simulador con un archivo acordado; requiere core disponible |
| `pnpm probar:ruta-dorada "RUTA_AL_JSON"` | Ejecutar emisión, aceptación y pago desde Node; requiere core disponible |

Detener con Ctrl+C. Si el puerto está ocupado, detener el proceso correspondiente o cambiar `PORT` en `.env`.

La base se ha validado en Windows. Los scripts y dependencias permiten instalación en macOS, pero falta ejecutar las comprobaciones en una Mac. Cada equipo debe instalar sus dependencias localmente.

## Qué puede probar el equipo hoy

- Arranque de Express y respuesta JSON de `/health`.
- Validación de puerto y URL configurada, sin conectar con el core.
- Tipos del contrato propuesto, incluida CLABE como `string` y los valores de `ScoringDecision`.
- Serialización de una cadena con ceros iniciales; no es validación bancaria ni una prueba del core.

El cliente provisional está en `lib/api.ts` y se describe en la guía de consumo. Puede crearse sin URL; las operaciones fallan explícitamente hasta configurarla. La pantalla `/emision` cubre el recorrido server-side del escenario acordado y presenta los resultados del core; no persiste datos ni implementa reglas financieras.

## Problemas frecuentes

| Síntoma | Qué revisar |
| --- | --- |
| `node` o `pnpm` no se encuentran | Instalar las versiones indicadas y abrir una terminal nueva |
| Error de `sh` o de plataforma al ejecutar TypeScript | Retirar solo la carpeta local `node_modules` copiada de otro sistema y repetir la instalación del lockfile |
| Puerto ocupado | Cambiar `PORT` o detener el proceso que ya lo utiliza |
| `/` devuelve 404 | Es esperado: la pantalla de emisión está en `/emision`; usar `/health` para comprobar el proceso |
| Aviso de core sin configurar | Es esperado con `NEXT_PUBLIC_API_URL` vacía; no bloquea esta entrega |
| Instalación o pruebas fallan | Compartir el error y versiones de Node/pnpm; no borrar el lockfile ni actualizar versiones para ocultarlo |

## Configuración

| Variable | Valor por defecto | Uso |
| --- | --- | --- |
| `PORT` | `3001` | Puerto entero entre 1 y 65535 |
| `NEXT_PUBLIC_API_URL` | Sin valor implícito en código; `.env.example` configura `http://127.0.0.1:3000` | URL local confirmada del core |

Los scripts cargan `.env` si existe; las variables del proceso tienen prioridad. Una URL configurada debe estar libre de credenciales, query y fragmento. No se publica automáticamente al navegador ni se devuelve por `/health`. Mientras falta, la base arranca y avisa; no intenta llamar al core ni devuelve mocks.

ERP y core se ejecutarán en la misma computadora, en dos terminales y desde sus respectivos repositorios. El ERP usa el puerto `3001` y el core el `3000`. El comando de arranque del core debe consultarse en su repositorio. Si ya tienes `.env`, actualiza `NEXT_PUBLIC_API_URL=http://127.0.0.1:3000` sin sobrescribir las demás variables. No añadas `/api` al valor base.

La URL confirmada no garantiza que el core esté levantado. `/health` solo comprueba el ERP y no inicia ni consulta el core. Los puertos distintos también implican orígenes distintos: si las llamadas salen del navegador, el core deberá permitir por CORS el origen del ERP utilizado.

## Contrato y coordinación

Antes de contribuir, consultar [AGENTS.md](AGENTS.md), que define las fuentes obligatorias y las comprobaciones de coherencia, y la [guía de origen de resultados](docs/origen-resultados.md).

- [Tipos propuestos](types/schema.ts)
- [Guía de consumo HTTP](docs/api-contract.md)
- [Checklist de integración](docs/mvp-checklist.md)
- [Primera prueba de emisión real](docs/prueba-integracion.md)
- [Decisiones](docs/decisiones.md)
- [Backlog](docs/backlog.md)

Los cinco tipos están alineados con core 4f71ceb, incluida decision?: ScoringDecision. ComplianceAuditItem queda pendiente por decisión del usuario. La Ruta Dorada real se verificó con `pnpm probar:ruta-dorada` y desde `/emision` server-side; las tres operaciones siguen centralizadas en `lib/api.ts`. El navegador no llama directamente al core en esta arquitectura, por lo que CORS queda fuera de este recorrido. No se ha configurado un proxy.

## Dependencias y Git

`node_modules` se instala para cada sistema operativo y está excluido de Git. No copiarlo entre macOS y Windows. Conservar `pnpm-lock.yaml` para reproducir versiones; no es necesario actualizar dependencias para levantar esta base. `.env` y los archivos generados también están excluidos.
