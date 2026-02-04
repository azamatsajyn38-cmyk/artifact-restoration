"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, Trash2, ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
    _count: { artifacts: number };
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Удалить проект и все его артефакты?")) return;

    await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <Card className="group relative transition-shadow hover:shadow-md">
      <Link href={`/projects/${project.id}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{project.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {project.description && (
            <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ImageIcon className="h-3 w-3" />
            <span>{project._count.artifacts} артефактов</span>
          </div>
        </CardContent>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </Card>
  );
}
