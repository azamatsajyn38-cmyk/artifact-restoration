"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function EditTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    template: "",
  });

  useEffect(() => {
    fetch(`/api/admin/templates/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          name: data.name,
          description: data.description || "",
          template: data.template,
        });
        setLoading(false);
      });
  }, [params.id]);

  async function handleSave() {
    setSaving(true);

    await fetch(`/api/admin/templates/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
    router.push("/admin/templates");
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Загрузка...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/templates">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Назад
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Редактирование шаблона</h1>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Шаблон: {form.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Системное имя</Label>
            <Input value={form.name} disabled />
            <p className="text-xs text-muted-foreground">
              Системное имя нельзя менять
            </p>
          </div>

          <div className="space-y-2">
            <Label>Описание</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Описание шаблона..."
            />
          </div>

          <div className="space-y-2">
            <Label>Текст промпта</Label>
            <Textarea
              value={form.template}
              onChange={(e) =>
                setForm({ ...form, template: e.target.value })
              }
              rows={15}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {"Используйте {{prompt}} как плейсхолдер для пользовательского ввода"}
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Сохранение..." : "Сохранить"}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/templates")}
            >
              Отмена
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
