"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import type { AnalysisResult } from "@/types";

interface RestorationPanelProps {
  artifactId: string;
  analysis: AnalysisResult;
  initialImageUrl?: string | null;
  onRestored?: (url: string) => void;
}

export function RestorationPanel({
  artifactId,
  analysis,
  initialImageUrl,
  onRestored,
}: RestorationPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRestore() {
    setLoading(true);
    setError("");

    try {
      const prompt = `${analysis.type}, ${analysis.period}, ${analysis.culture}, ${analysis.material}, ${analysis.description}`;

      const res = await fetch(`/api/artifacts/${artifactId}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Ошибка реставрации");
      }

      onRestored?.(data.imageUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Реставрация изображения</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Генерация изображения...</p>
          </div>
        ) : (
          <div className="text-center">
            {!initialImageUrl && (
              <p className="text-sm text-muted-foreground mb-4">
                AI сгенерирует изображение отреставрированного артефакта на основе анализа
              </p>
            )}
            <Button
              onClick={handleRestore}
              variant={initialImageUrl ? "outline" : "default"}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {initialImageUrl ? "Сгенерировать заново" : "Создать реставрацию"}
            </Button>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
