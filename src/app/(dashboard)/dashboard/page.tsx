import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, ImageIcon, Plus } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const [projectCount, artifactCount, recentArtifacts] = await Promise.all([
    prisma.project.count({ where: { userId: session.user.id } }),
    prisma.artifact.count({
      where: { project: { userId: session.user.id } },
    }),
    prisma.artifact.findMany({
      where: { project: { userId: session.user.id } },
      include: { project: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Дашборд</h1>
        <Link href="/projects/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Новый проект
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Проекты
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Артефакты
            </CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{artifactCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Последние артефакты</CardTitle>
        </CardHeader>
        <CardContent>
          {recentArtifacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Пока нет артефактов.{" "}
              <Link href="/projects/new" className="text-primary hover:underline">
                Создайте проект
              </Link>{" "}
              и загрузите первый артефакт.
            </p>
          ) : (
            <div className="space-y-3">
              {recentArtifacts.map((artifact) => {
                const analysis = artifact.analysisResult
                  ? JSON.parse(artifact.analysisResult)
                  : null;
                return (
                  <Link
                    key={artifact.id}
                    href={`/projects/${artifact.projectId}/artifacts/${artifact.id}`}
                    className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-muted"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {analysis?.type || "Без анализа"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {artifact.project.name} &middot;{" "}
                        {artifact.createdAt.toLocaleDateString("ru-RU")}
                      </p>
                    </div>
                    {artifact.meshyStatus && (
                      <span className="text-xs text-muted-foreground">
                        3D: {artifact.meshyStatus}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
