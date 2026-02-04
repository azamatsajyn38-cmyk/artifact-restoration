import https from "node:https";
import http from "node:http";

const ipv4Agent = new https.Agent({ family: 4, rejectUnauthorized: false});
const ipv4HttpAgent = new http.Agent({ family: 4 });

/**
 * fetch() wrapper that forces IPv4 connections.
 * Works around Node.js undici failing on systems with broken IPv6.
 */
export function fetchIPv4(
  url: string,
  init?: { method?: string; headers?: Record<string, string>; body?: string }
): Promise<{ status: number; ok: boolean; json: () => Promise<any> }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const isHttps = parsed.protocol === "https:";
    const agent = isHttps ? ipv4Agent : ipv4HttpAgent;
    const lib = isHttps ? https : http;

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: init?.method || "GET",
      headers: init?.headers || {},
      agent,
      timeout: 30000,
    };

    const req = lib.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => {
        const body = Buffer.concat(chunks).toString("utf-8");
        const status = res.statusCode || 0;
        resolve({
          status,
          ok: status >= 200 && status < 300,
          json: () => Promise.resolve(JSON.parse(body)),
        });
      });
    });

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    if (init?.body) {
      req.write(init.body);
    }
    req.end();
  });
}
