import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-background to-primary/5">
      <div className="text-center space-y-6 max-w-2xl px-4">
        <h1 className="text-5xl font-bold tracking-tight">
          Реставратор Артефактов
        </h1>
        <p className="text-xl text-muted-foreground">
          AI-платформа для анализа древних артефактов, реставрации изображений
          и генерации 3D моделей
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/login">
            <Button size="lg">Войти</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg">
              Регистрация
            </Button>
          </Link>
        </div>
        <div className="grid gap-4 pt-8 md:grid-cols-3 text-left">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-1">AI Анализ</h3>
            <p className="text-sm text-muted-foreground">
              GPT-4o Vision определяет тип, период, культуру и состояние артефакта
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-1">Реставрация</h3>
            <p className="text-sm text-muted-foreground">
              DALL-E 3 генерирует изображение восстановленного артефакта
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-1">3D Модели</h3>
            <p className="text-sm text-muted-foreground">
              Meshy AI создаёт 3D модель для визуализации и печати
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
