"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  _count: { projects: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  async function handleRoleChange(userId: string, role: string) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role } : u))
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Пользователи</h1>

      <Card>
        <CardHeader>
          <CardTitle>Все пользователи</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Загрузка...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Имя</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Проекты</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Дата регистрации</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name || "—"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user._count.projects}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="w-40"
                      >
                        <option value="USER">Пользователь</option>
                        <option value="ADMIN">Админ</option>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
