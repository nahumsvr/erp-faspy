export interface ServerConfig {
  port: number;
  apiUrl: string | undefined;
}

export function readConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const portText = env.PORT ?? "3001";
  if (!/^\d+$/.test(portText)) {
    throw new Error("PORT debe ser un entero entre 1 y 65535.");
  }
  const port = Number(portText);
  if (port < 1 || port > 65535) {
    throw new Error("PORT debe ser un entero entre 1 y 65535.");
  }

  const apiUrl = env.NEXT_PUBLIC_API_URL?.trim() || undefined;
  if (apiUrl) {
    let parsed: URL;
    try {
      parsed = new URL(apiUrl);
    } catch {
      throw new Error("NEXT_PUBLIC_API_URL debe ser una URL HTTP(S) válida.");
    }
    if (
      !["http:", "https:"].includes(parsed.protocol) ||
      parsed.username || parsed.password || parsed.search || parsed.hash
    ) {
      throw new Error("NEXT_PUBLIC_API_URL debe usar HTTP(S), sin credenciales, query ni fragmento.");
    }
  }
  return { port, apiUrl };
}
