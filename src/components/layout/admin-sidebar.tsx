"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, FileText, Key, FolderOpen, ArrowLeft } from "lucide-react";

const adminNav = [
  { href: "/admin", label: "Статистика", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Пользователи", icon: Users },
  { href: "/admin/templates", label: "Шаблоны промптов", icon: FileText },
  { href: "/admin/api-configs", label: "API конфигурация", icon: Key },
  { href: "/admin/projects", label: "Все проекты", icon: FolderOpen },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin" className="text-lg font-bold text-primary">
          Админ-панель
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {adminNav.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        <div className="my-4 h-px bg-border" />
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          К дашборду
        </Link>
      </nav>
    </aside>
  );
}
