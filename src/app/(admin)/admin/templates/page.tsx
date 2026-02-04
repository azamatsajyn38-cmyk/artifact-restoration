"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Pencil } from "lucide-react";
import Link from "next/link";

interface Template {
  id: string;
  name: string;
  description: string | null;
  template: string;
  updatedAt: string;
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/templates")
      .then((res) => res.json())
      .then((data) => {
        setTemplates(data);
        setLoading(false);
      });
  }, []);

  const nameLabels: Record<string, string> = {
    analysis: "Анализ артефакта",
    restoration: "Реставрация изображения",
    "3d_generation": "Генерация 3D модели",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Шаблоны промптов</h1>
      <p className="text-muted-foreground">
        Здесь вы можете настроить промпт-шаблоны для каждой AI-операции.
        Изменения применяются немедленно ко всем пользователям.
      </p>

      {loading ? (
        <p className="text-sm text-muted-foreground">Загрузка...</p>
      ) : (
        <div className="grid gap-4">
          {templates.map((tpl) => (
            <Card key={tpl.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">
                      {nameLabels[tpl.name] || tpl.name}
                    </CardTitle>
                    {tpl.description && (
                      <p className="text-sm text-muted-foreground">
                        {tpl.description}
                      </p>
                    )}
                  </div>
                </div>
                <Link href={`/admin/templates/${tpl.id}`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4 mr-2" />
                    Редактировать
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <pre className="rounded-md bg-muted p-4 text-sm overflow-auto max-h-40">
                  {tpl.template}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
