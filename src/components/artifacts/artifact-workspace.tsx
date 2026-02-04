"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "./image-upload";
import { AnalysisPanel } from "./analysis-panel";
import { RestorationPanel } from "./restoration-panel";
import { ModelViewer } from "./model-viewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Search } from "lucide-react";
import type { AnalysisResult } from "@/types";

interface ArtifactWorkspaceProps {
  projectId: string;
  artifact?: {
    id: string;
    originalImageUrl: string;
    analysisResult: string | null;
    restoredImageUrl: string | null;
    meshyStatus: string | null;
    modelUrls: string | null;
  };
}

export function ArtifactWorkspace({ projectId, artifact }: ArtifactWorkspaceProps) {
  const router = useRouter();
  const [artifactId, setArtifactId] = useState(artifact?.id || "");
  const [imageData, setImageData] = useState(artifact?.originalImageUrl || "");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(
    artifact?.analysisResult ? JSON.parse(artifact.analysisResult) : null
  );
  const [restoredImageUrl, setRestoredImageUrl] = useState<string | null>(
    artifact?.restoredImageUrl || null
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const initialModelUrls = (() => {
    try {
      return artifact?.modelUrls ? JSON.parse(artifact.modelUrls) : null;
    } catch {
      return null;
    }
  })();
  const initialMeshyStatus = artifact?.meshyStatus || null;

  async function handleUpload(dataUrl: string) {
    setImageData(dataUrl);
    setError("");

    const res = await fetch("/api/artifacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, originalImageUrl: dataUrl }),
    });

    if (res.ok) {
      const data = await res.json();
      setArtifactId(data.id);
    }
  }

  async function handleAnalyze() {
    if (!artifactId || !imageData) return;
    setAnalyzing(true);
    setError("");

    try {
      const res = await fetch(`/api/artifacts/${artifactId}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Ошибка анализа");
      }

      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  }

  // Step 1: Upload
  if (!imageData) {
    return <ImageUpload onUpload={handleUpload} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/projects/${projectId}`)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          К проекту
        </Button>
        <h2 className="text-xl font-semibold">
          {analysis ? analysis.type : "Артефакт"}
        </h2>
      </div>

      {/* Images comparison */}
      <div className={`grid gap-4 ${restoredImageUrl ? "sm:grid-cols-2" : "max-w-md mx-auto"}`}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Оригинал</CardTitle>
          </CardHeader>
          <CardContent>
            <img src={imageData} alt="Оригинал" className="w-full rounded-lg" />
          </CardContent>
        </Card>

        {restoredImageUrl && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Реставрация</CardTitle>
            </CardHeader>
            <CardContent>
              <img src={restoredImageUrl} alt="Реставрация" className="w-full rounded-lg" />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Analyze button (if not yet analyzed) */}
      {!analysis && (
        <div className="flex justify-center">
          <Button onClick={handleAnalyze} disabled={analyzing} size="lg">
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Анализ...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Анализировать артефакт
              </>
            )}
          </Button>
        </div>
      )}

      {/* Analysis results */}
      {analysis && <AnalysisPanel analysis={analysis} />}

      {/* Restoration */}
      {analysis && (
        <RestorationPanel
          artifactId={artifactId}
          analysis={analysis}
          initialImageUrl={restoredImageUrl}
          onRestored={setRestoredImageUrl}
        />
      )}

      {/* 3D Model */}
      <ModelViewer
        artifactId={artifactId}
        analysis={analysis || undefined}
        imageData={imageData}
        initialModelUrls={initialModelUrls}
        initialStatus={initialMeshyStatus}
      />
    </div>
  );
}
