"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FolderOpen, Settings } from "lucide-react";
import { useSession } from "next-auth/react";

const userNav = [
  { href: "/dashboard", label: "Дашборд", icon: LayoutDashboard },
  { href: "/projects", label: "Проекты", icon: FolderOpen },
];

const adminNav = [
  { href: "/admin", label: "Админ-панель", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="text-lg font-bold text-primary">
          Реставратор
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {userNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === item.href || pathname.startsWith(item.href + "/")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
        {session?.user?.role === "ADMIN" && (
          <>
            <div className="my-4 h-px bg-border" />
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname.startsWith(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}
