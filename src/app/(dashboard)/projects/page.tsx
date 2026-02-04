import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProjectCard } from "@/components/projects/project-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { artifacts: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Проекты</h1>
        <Link href="/projects/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Новый проект
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground mb-4">У вас пока нет проектов</p>
          <Link href="/projects/new">
            <Button>Создать первый проект</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={{
                ...project,
                createdAt: project.createdAt.toISOString(),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
