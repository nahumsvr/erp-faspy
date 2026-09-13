import { createApp } from "./app.ts";
import { readConfig } from "./config.ts";

const config = readConfig();
const server = createApp(config.apiUrl).listen(config.port, "127.0.0.1", () => {
  console.log(`ERP simulado: http://localhost:${config.port}/`);
  if (!config.apiUrl) {
    console.log("Core sin configurar: NEXT_PUBLIC_API_URL está vacía. No se realizan llamadas HTTP.");
  }
});

server.on("error", (error: NodeJS.ErrnoException) => {
  console.error(error.code === "EADDRINUSE"
    ? `El puerto ${config.port} está ocupado. Libéralo o configura PORT.`
    : "No se pudo iniciar el servidor ERP.");
  process.exitCode = 1;
});
