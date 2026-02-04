import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import https from "node:https";
import http from "node:http";

const ipv4Agent = new https.Agent({ 
  family: 4,
  rejectUnauthorized: false
});

const ipv4HttpAgent = new http.Agent({ 
  family: 4 
});

/**
 * Proxy для загрузки GLB/FBX моделей с внешних CDN (Meshy).
 * Обходит CORS-ограничения при загрузке 3D моделей в браузере.
 * GET /api/proxy?url=https://assets.meshy.ai/...
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "URL required" }, { status: 400 });
  }

  // Разрешаем только Meshy CDN
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (!parsed.hostname.endsWith("meshy.ai")) {
    return NextResponse.json({ error: "Forbidden domain" }, { status: 403 });
  }

  try {
    const data = await fetchBinary(url);
    const ext = parsed.pathname.split(".").pop()?.toLowerCase();
    const contentType =
      ext === "glb" ? "model/gltf-binary" :
      ext === "fbx" ? "application/octet-stream" :
      "application/octet-stream";

    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("[PROXY ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch resource" },
      { status: 502 }
    );
  }
}

function fetchBinary(url: string): Promise<Buffer> {
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
      timeout: 60000,
    };

    const req = lib.request(options, (res) => {
      // Follow redirects
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchBinary(res.headers.location).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
    });

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Proxy timeout"));
    });

    req.end();
  });
}
