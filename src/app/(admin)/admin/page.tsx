import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FolderOpen, ImageIcon, FileText } from "lucide-react";

export default async function AdminDashboard() {
  const [userCount, projectCount, artifactCount, templateCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.artifact.count(),
      prisma.promptTemplate.count(),
    ]);

  const stats = [
    { label: "Пользователи", value: userCount, icon: Users },
    { label: "Проекты", value: projectCount, icon: FolderOpen },
    { label: "Артефакты", value: artifactCount, icon: ImageIcon },
    { label: "Шаблоны", value: templateCount, icon: FileText },
  ];

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Статистика</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Последние пользователи</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{user.name || user.email}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <span className="text-xs font-medium">
                  {user.role === "ADMIN" ? "Админ" : "Пользователь"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
