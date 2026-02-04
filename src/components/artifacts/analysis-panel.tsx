"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisResult } from "@/types";

interface AnalysisPanelProps {
  analysis: AnalysisResult;
}

export function AnalysisPanel({ analysis }: AnalysisPanelProps) {
  const fields = [
    { label: "Тип", value: analysis.type },
    { label: "Период", value: analysis.period },
    { label: "Культура", value: analysis.culture },
    { label: "Материал", value: analysis.material },
    { label: "Назначение", value: analysis.purpose },
    {
      label: "Размеры",
      value: `Высота: ${analysis.dimensions.height}см, Основание: ${analysis.dimensions.baseWidth}см, Горловина: ${analysis.dimensions.topWidth}см`,
    },
    { label: "Форма профиля", value: analysis.shapeProfile },
    { label: "Состояние", value: analysis.condition },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Результаты анализа</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.label}>
                <dt className="text-sm font-medium text-muted-foreground">
                  {field.label}
                </dt>
                <dd className="text-sm">{field.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Рекомендации по реставрации</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{analysis.restoration}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Описание</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{analysis.description}</p>
        </CardContent>
      </Card>
    </div>
  );
}
