"use client";

import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "./Icon";
import { LogOut, UserCircle2 } from "lucide-react";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationBell } from "./NotificationBell";
import { LocaleSwitcher } from "./LocaleSwitcher";

export function Topbar() {
  const { data } = useSession();
  const t = useTranslations();
  const accountUrl = process.env.NEXT_PUBLIC_KEYCLOAK_ACCOUNT_URL ?? "https://iam.labmgm.org/realms/mgm/account";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-surface/80 px-4 backdrop-blur md:px-6">
      <div className="flex-1">
        <GlobalSearch />
      </div>
      <div className="flex items-center gap-2">
        <LocaleSwitcher />
        <NotificationBell />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-DEFAULT border border-line bg-surface px-3 text-body-sm text-ink-2 transition-colors hover:bg-surface-muted"
              aria-label="Account menu"
            >
              <Icon icon={UserCircle2} size={20} />
              <span className="hidden max-w-[160px] truncate md:inline">{data?.user?.email ?? "—"}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <span className="block text-body-sm text-ink">{data?.user?.name ?? data?.user?.email ?? "—"}</span>
              <span className="block font-mono text-caption uppercase text-ink-3">{data?.role}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href={accountUrl} target="_blank" rel="noreferrer">
                Edit profile
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => signOut({ callbackUrl: "/" })}>
              <Icon icon={LogOut} size={16} />
              {t("auth.signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
