import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import http from "node:http";

const ipv4Agent = new https.Agent({ family: 4 });
const ipv4HttpAgent = new http.Agent({ family: 4 });

const CACHE_DIR = path.join(process.cwd(), "public", "uploads", "models");

/**
 * Скачивает файл по URL и сохраняет локально.
 * Возвращает публичный путь (для отдачи клиенту).
 */
export async function cacheModelFile(
  artifactId: string,
  remoteUrl: string,
  filename: string
): Promise<string> {
  const dir = path.join(CACHE_DIR, artifactId);
  const filePath = path.join(dir, filename);
  const publicPath = `/api/models/${artifactId}/${filename}`;

  // Если файл уже кэширован — вернуть путь
  if (fs.existsSync(filePath)) {
    return publicPath;
  }

  fs.mkdirSync(dir, { recursive: true });

  const data = await downloadBinary(remoteUrl);
  fs.writeFileSync(filePath, data);

  return publicPath;
}

function downloadBinary(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const isHttps = parsed.protocol === "https:";
    const agent = isHttps ? ipv4Agent : ipv4HttpAgent;
    const lib = isHttps ? https : http;

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: "GET",
      agent,
      timeout: 120000,
    };

    const req = lib.request(options, (res) => {
      // Follow redirects
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadBinary(res.headers.location).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
        reject(new Error(`Download failed: HTTP ${res.statusCode}`));
        return;
      }

      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
    });

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Download timeout"));
    });
    req.end();
  });
}
