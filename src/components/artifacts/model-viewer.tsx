"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Box, Download, Image } from "lucide-react";
import type { AnalysisResult, ModelStatusResult } from "@/types";

const SceneViewer = dynamic(
  () => import("./scene-viewer").then((m) => m.SceneViewer),
  { ssr: false }
);

interface ModelViewerProps {
  artifactId: string;
  analysis?: AnalysisResult;
  imageData?: string;
  initialModelUrls?: { glb?: string; fbx?: string; thumbnail?: string } | null;
  initialStatus?: string | null;
}

export function ModelViewer({
  artifactId,
  analysis,
  imageData,
  initialModelUrls,
  initialStatus,
}: ModelViewerProps) {
  const [status, setStatus] = useState<ModelStatusResult | null>(() => {
    if (initialStatus === "SUCCEEDED" && initialModelUrls) {
      return {
        status: "SUCCEEDED",
        modelUrls: initialModelUrls,
        progress: 100,
      };
    }
    return null;
  });
  const [loading, setLoading] = useState(() => {
    return initialStatus === "PENDING" || initialStatus === "IN_PROGRESS";
  });
  const [error, setError] = useState("");
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-poll if generation was already in progress
  useEffect(() => {
    if (initialStatus === "PENDING" || initialStatus === "IN_PROGRESS") {
      pollStatus();
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleGenerate(mode: "text" | "image") {
    setLoading(true);
    setError("");
    setStatus(null);

    try {
      let bodyData: Record<string, string>;

      if (mode === "image" && imageData) {
        bodyData = { imageData };
      } else if (analysis) {
        bodyData = { prompt: `${analysis.type}, ${analysis.period}, ${analysis.material}` };
      } else {
        throw new Error("Нет данных для генерации");
      }

      const res = await fetch(`/api/artifacts/${artifactId}/generate-3d`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Ошибка генерации");
      }

      pollStatus();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function pollStatus() {
    let attempts = 0;
    const maxAttempts = 60;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/artifacts/${artifactId}/generate-3d`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error);
        }

        setStatus(data.data);

        if (data.data.status === "SUCCEEDED" || data.data.status === "FAILED") {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setLoading(false);
        }

        attempts++;
        if (attempts >= maxAttempts) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setLoading(false);
          setError("Превышено время ожидания");
        }
      } catch (err: any) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setLoading(false);
        setError(err.message);
      }
    }, 5000);
  }

  const hasAnalysis = !!analysis;
  const hasImage = !!imageData;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">3D Модель</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Generate buttons (no model yet and not loading) */}
        {!status && !loading && (
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              {hasAnalysis && hasImage
                ? "Выберите способ создания 3D модели"
                : hasImage
                  ? "AI создаст 3D модель из загруженного изображения"
                  : "AI создаст 3D модель на основе анализа"}
            </p>
            <div className="flex justify-center gap-3">
              {hasImage && (
                <Button onClick={() => handleGenerate("image")}>
                  <Image className="h-4 w-4 mr-2" />
                  3D из изображения
                </Button>
              )}
              {hasAnalysis && (
                <Button onClick={() => handleGenerate("text")} variant={hasImage ? "outline" : "default"}>
                  <Box className="h-4 w-4 mr-2" />
                  3D из описания
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Loading / in progress */}
        {loading && (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">
              {status?.status === "IN_PROGRESS"
                ? `Генерация 3D модели... ${status.progress || 0}%`
                : "Запуск генерации..."}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Success: show 3D viewer */}
        {status?.status === "SUCCEEDED" && status.modelUrls && (
          <div className="space-y-4">
            {status.modelUrls.glb ? (
              <SceneViewer glbUrl={status.modelUrls.glb} />
            ) : status.modelUrls.thumbnail ? (
              <img
                src={status.modelUrls.thumbnail}
                alt="3D превью"
                className="w-full rounded-lg"
              />
            ) : null}
            <div className="flex flex-wrap gap-2">
              {status.modelUrls.glb && (
                <Button
                  variant="outline"
                  onClick={() => window.open(status.modelUrls!.glb, "_blank")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Скачать GLB
                </Button>
              )}
              {status.modelUrls.fbx && (
                <Button
                  variant="outline"
                  onClick={() => window.open(status.modelUrls!.fbx, "_blank")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Скачать FBX
                </Button>
              )}
              {hasImage && (
                <Button variant="outline" onClick={() => handleGenerate("image")} disabled={loading}>
                  Заново из изображения
                </Button>
              )}
              {hasAnalysis && (
                <Button variant="outline" onClick={() => handleGenerate("text")} disabled={loading}>
                  Заново из описания
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Failed */}
        {status?.status === "FAILED" && (
          <div className="text-center space-y-3">
            <p className="text-sm text-destructive">Генерация не удалась</p>
            <div className="flex justify-center gap-3">
              {hasImage && (
                <Button onClick={() => handleGenerate("image")}>
                  Попробовать из изображения
                </Button>
              )}
              {hasAnalysis && (
                <Button onClick={() => handleGenerate("text")} variant={hasImage ? "outline" : "default"}>
                  Попробовать из описания
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
