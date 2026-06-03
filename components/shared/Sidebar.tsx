"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Boxes,
  PackageCheck,
  ShoppingCart,
  Server,
  CalendarDays,
  KeySquare,
  Files,
  Layers,
  Tags,
  Users,
  Settings,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { Icon } from "./Icon";
import { PatternAccent } from "./PatternAccent";
import { useIsAdmin } from "@/lib/auth/roles";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  href: string;
  icon: LucideIcon;
  labelKey: string;
  adminOnly?: boolean;
}

const PRIMARY: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, labelKey: "nav.dashboard" },
  { href: "/assets", icon: Boxes, labelKey: "nav.assets" },
];

const REQUESTS: NavItem[] = [
  { href: "/requests/borrow", icon: PackageCheck, labelKey: "nav.borrows" },
  { href: "/requests/procurement", icon: ShoppingCart, labelKey: "nav.procurement" },
  { href: "/requests/infra", icon: Server, labelKey: "nav.infra" },
  { href: "/requests/room", icon: CalendarDays, labelKey: "nav.rooms" },
  { href: "/requests/license", icon: KeySquare, labelKey: "nav.licenses" },
  { href: "/requests/general", icon: Files, labelKey: "nav.general" },
];

const CATALOGS: NavItem[] = [
  { href: "/catalogs/infra", icon: Layers, labelKey: "infra.title" },
  { href: "/catalogs/software-ai", icon: KeySquare, labelKey: "license.title" },
  { href: "/catalogs/stickers", icon: Tags, labelKey: "asset.actions.generateSticker" },
];

const ADMIN: NavItem[] = [
  { href: "/admin/users", icon: Users, labelKey: "nav.users", adminOnly: true },
  { href: "/admin/settings", icon: Settings, labelKey: "nav.settings", adminOnly: true },
  { href: "/admin/stats", icon: BarChart3, labelKey: "nav.dashboard", adminOnly: true },
];

function NavLink({ item, current }: { item: NavItem; current: string }) {
  const t = useTranslations();
  const active = current === item.href || current.startsWith(item.href + "/");
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-DEFAULT px-3 py-2 text-body-sm transition-colors",
        active ? "bg-brand-blue-50 text-ink" : "text-ink-2 hover:bg-surface-muted",
      )}
    >
      <Icon icon={item.icon} size={20} />
      <span>{t(item.labelKey as never)}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname() ?? "";
  const isAdmin = useIsAdmin();

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-surface lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-line px-5">
        <PatternAccent motif="plus" color="blue" size={28} />
        <span className="font-display text-h3 text-ink">Hearth</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {PRIMARY.map((item) => (
            <li key={item.href}>
              <NavLink item={item} current={pathname} />
            </li>
          ))}
        </ul>
        <p className="mt-6 px-3 font-mono text-eyebrow uppercase tracking-[0.12em] text-ink-3">
          Requests
        </p>
        <ul className="mt-2 space-y-1">
          {REQUESTS.map((item) => (
            <li key={item.href}>
              <NavLink item={item} current={pathname} />
            </li>
          ))}
        </ul>
        <p className="mt-6 px-3 font-mono text-eyebrow uppercase tracking-[0.12em] text-ink-3">
          Catalogs
        </p>
        <ul className="mt-2 space-y-1">
          {CATALOGS.map((item) => (
            <li key={item.href}>
              <NavLink item={item} current={pathname} />
            </li>
          ))}
        </ul>
        {isAdmin ? (
          <>
            <p className="mt-6 px-3 font-mono text-eyebrow uppercase tracking-[0.12em] text-ink-3">
              Admin
            </p>
            <ul className="mt-2 space-y-1">
              {ADMIN.map((item) => (
                <li key={item.href}>
                  <NavLink item={item} current={pathname} />
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </nav>
      <div className="relative h-16 border-t border-line">
        <div className="absolute bottom-2 right-3 opacity-60">
          <PatternAccent motif="domes" color="yellow" size={48} />
        </div>
      </div>
    </aside>
  );
}
