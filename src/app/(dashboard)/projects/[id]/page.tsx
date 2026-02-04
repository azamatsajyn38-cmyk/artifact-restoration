import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArtifactWorkspace } from "@/components/artifacts/artifact-workspace";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ImageIcon } from "lucide-react";
import Link from "next/link";

export default async function ProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const project = await prisma.project.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      artifacts: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!project) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Проекты
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-muted-foreground">{project.description}</p>
          )}
        </div>
      </div>

      {/* Existing artifacts */}
      {project.artifacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Артефакты ({project.artifacts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {project.artifacts.map((artifact) => {
                const analysis = artifact.analysisResult
                  ? JSON.parse(artifact.analysisResult)
                  : null;
                return (
                  <Link
                    key={artifact.id}
                    href={`/projects/${project.id}/artifacts/${artifact.id}`}
                    className="group rounded-lg border p-3 transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                        <ImageIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {analysis?.type || "Без анализа"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {artifact.createdAt.toLocaleDateString("ru-RU")}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* New artifact workspace */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Добавить артефакт</CardTitle>
        </CardHeader>
        <CardContent>
          <ArtifactWorkspace projectId={project.id} />
        </CardContent>
      </Card>
    </div>
  );
}
