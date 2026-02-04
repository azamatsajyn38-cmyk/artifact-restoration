"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Save, Key } from "lucide-react";

interface ApiConfigData {
  id: string;
  serviceName: string;
  apiKey: string;
  model: string | null;
  temperature: number | null;
  maxTokens: number | null;
  extraConfig: string | null;
  isActive: boolean;
}

const serviceInfo: Record<string, { label: string; description: string; capabilities: string; keyPlaceholder: string; modelPlaceholder: string }> = {
  openai: {
    label: "OpenAI",
    description: "GPT-4o Vision (анализ) + DALL-E 3 (реставрация изображений)",
    capabilities: "Анализ, Реставрация",
    keyPlaceholder: "sk-proj-...",
    modelPlaceholder: "gpt-4o",
  },
  gemini: {
    label: "Google Gemini",
    description: "Gemini 2.0 Flash (анализ). Бесплатный тариф: 15 запросов/мин",
    capabilities: "Анализ",
    keyPlaceholder: "AIza...",
    modelPlaceholder: "gemini-2.0-flash",
  },
  grok: {
    label: "xAI Grok",
    description: "Grok-2 Vision (анализ) + Aurora (реставрация изображений)",
    capabilities: "Анализ, Реставрация",
    keyPlaceholder: "xai-...",
    modelPlaceholder: "grok-2-vision-latest",
  },
  meshy: {
    label: "Meshy AI",
    description: "Text-to-3D генерация моделей",
    capabilities: "3D модели",
    keyPlaceholder: "msy_...",
    modelPlaceholder: "",
  },
};

// Show model/temperature/maxTokens for these providers
const PROVIDERS_WITH_MODEL_SETTINGS = ["openai", "gemini", "grok"];

export default function AdminApiConfigsPage() {
  const [configs, setConfigs] = useState<ApiConfigData[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/api-configs")
      .then((res) => res.json())
      .then((data) => {
        setConfigs(data);
        setLoading(false);
      });
  }, []);

  function updateConfig(id: string, field: string, value: string | boolean) {
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  }

  async function handleSave(config: ApiConfigData) {
    setSavingId(config.id);

    await fetch(`/api/admin/api-configs/${config.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    setSavingId(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Конфигурация</h1>
        <p className="text-muted-foreground mt-1">
          Настройте API-ключи и параметры. Система автоматически использует первый
          активный провайдер с заполненным ключом.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-sm space-y-1">
            <p><strong>Приоритет для анализа:</strong> OpenAI → Gemini → Grok</p>
            <p><strong>Приоритет для реставрации:</strong> OpenAI → Grok</p>
            <p><strong>3D модели:</strong> Meshy AI</p>
            <p className="text-muted-foreground">
              Активируйте провайдер и укажите API-ключ. Если основной недоступен — используется следующий по приоритету.
            </p>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">Загрузка...</p>
      ) : (
        <div className="space-y-6">
          {configs.map((config) => {
            const info = serviceInfo[config.serviceName] || {
              label: config.serviceName,
              description: "",
              capabilities: "",
              keyPlaceholder: "",
              modelPlaceholder: "",
            };

            return (
              <Card key={config.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{info.label}</CardTitle>
                      <CardDescription>{info.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {info.capabilities && (
                      <Badge variant="outline" className="text-xs">
                        {info.capabilities}
                      </Badge>
                    )}
                    <Badge variant={config.isActive ? "default" : "secondary"}>
                      {config.isActive ? "Активен" : "Отключён"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                <form autoComplete="off" onSubmit={(e) => { e.preventDefault(); handleSave(config); }}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>API Ключ</Label>
                      <Input
                        type="password"
                        autoComplete="off"
                        value={config.apiKey}
                        onChange={(e) =>
                          updateConfig(config.id, "apiKey", e.target.value)
                        }
                        placeholder={info.keyPlaceholder}
                      />
                    </div>

                    {PROVIDERS_WITH_MODEL_SETTINGS.includes(config.serviceName) && (
                      <>
                        <div className="space-y-2">
                          <Label>Модель</Label>
                          <Input
                            value={config.model || ""}
                            onChange={(e) =>
                              updateConfig(config.id, "model", e.target.value)
                            }
                            placeholder={info.modelPlaceholder}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Temperature (0-2)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="2"
                            value={config.temperature ?? ""}
                            onChange={(e) =>
                              updateConfig(config.id, "temperature", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Tokens</Label>
                          <Input
                            type="number"
                            value={config.maxTokens ?? ""}
                            onChange={(e) =>
                              updateConfig(config.id, "maxTokens", e.target.value)
                            }
                            placeholder="2000"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Дополнительные параметры (JSON)</Label>
                    <Textarea
                      value={config.extraConfig || ""}
                      onChange={(e) =>
                        updateConfig(config.id, "extraConfig", e.target.value)
                      }
                      rows={3}
                      className="font-mono text-sm"
                      placeholder='{"imageSize": "1024x1024"}'
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      type="submit"
                      disabled={savingId === config.id}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {savingId === config.id ? "Сохранение..." : "Сохранить"}
                    </Button>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.isActive}
                        onChange={(e) =>
                          updateConfig(config.id, "isActive", e.target.checked)
                        }
                      />
                      Активен
                    </label>
                  </div>
                </form>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
