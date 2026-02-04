import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const MODELS_DIR = path.join(process.cwd(), "public", "uploads", "models");

/**
 * Отдаёт кэшированные 3D модели.
 * GET /api/models/{artifactId}/model.glb
 * Без авторизации — файлы не содержат конфиденциальных данных,
 * а ID артефактов — случайные CUID.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // Защита от path traversal
  const segments = params.path;
  if (segments.some((s) => s.includes("..") || s.includes("/"))) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const filePath = path.join(MODELS_DIR, ...segments);

  if (!filePath.startsWith(MODELS_DIR) || !fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();

  const contentType =
    ext === ".glb" ? "model/gltf-binary" :
    ext === ".fbx" ? "application/octet-stream" :
    ext === ".png" ? "image/png" :
    ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" :
    "application/octet-stream";

  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
