import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { artifacts: true } },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Все проекты</h1>

      <Card>
        <CardHeader>
          <CardTitle>Проекты пользователей ({projects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Пользователь</TableHead>
                <TableHead>Артефакты</TableHead>
                <TableHead>Дата создания</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>
                    {project.user.name || project.user.email}
                  </TableCell>
                  <TableCell>{project._count.artifacts}</TableCell>
                  <TableCell>
                    {project.createdAt.toLocaleDateString("ru-RU")}
                  </TableCell>
                </TableRow>
              ))}
              {projects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Пока нет проектов
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
