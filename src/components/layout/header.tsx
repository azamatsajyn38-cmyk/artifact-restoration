"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, User } from "lucide-react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div />
      <div className="flex items-center gap-4">
        {session?.user && (
          <>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {session.user.name || session.user.email}
              </span>
              <Badge variant={session.user.role === "ADMIN" ? "default" : "secondary"}>
                {session.user.role === "ADMIN" ? "Админ" : "Пользователь"}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Выйти
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
