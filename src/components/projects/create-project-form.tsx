"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CreateProjectForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
    };

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const project = await res.json();
      router.push(`/projects/${project.id}`);
    } else {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Новый проект</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Например: Раскопки Помпеи 2024"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Описание (необязательно)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Краткое описание проекта..."
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Создание..." : "Создать проект"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
