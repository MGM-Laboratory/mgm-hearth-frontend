import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PatternAccent } from "@/components/shared/PatternAccent";

export const metadata = { title: "Restricted — Hearth" };

export default async function NotItPage() {
  const t = await getTranslations("auth");
  return (
    <main className="grid min-h-screen place-items-center bg-bg px-6">
      <div className="relative max-w-prose text-center">
        <div className="pointer-events-none absolute -left-24 -top-16 hidden md:block">
          <PatternAccent motif="clover" color="yellow" size={140} />
        </div>
        <div className="pointer-events-none absolute -right-20 -bottom-12 hidden md:block">
          <PatternAccent motif="x" color="red" size={120} />
        </div>
        <p className="font-mono text-caption uppercase tracking-[0.18em] text-ink-3">403 · NOT_IT_MEMBER</p>
        <h1 className="mt-4 font-display text-display-xl text-ink">
          {t("notItMemberTitle")}
        </h1>
        <p className="mx-auto mt-6 text-body-lg text-ink-2">{t("notItMemberBody")}</p>
        <div className="mt-10 flex justify-center gap-3">
          <Link
            href="/api/auth/signout"
            className="rounded-DEFAULT border border-line bg-surface px-5 py-2.5 text-body-sm font-medium text-ink shadow-1 transition-colors hover:bg-surface-muted"
          >
            {t("signOut")}
          </Link>
          <a
            href={process.env.NEXT_PUBLIC_PINJAM_URL ?? "https://pinjam.labmgm.org"}
            className="rounded-DEFAULT bg-brand-blue px-5 py-2.5 text-body-sm font-medium text-white shadow-1 transition-colors hover:bg-brand-blue/90"
          >
            Pinjam →
          </a>
        </div>
      </div>
    </main>
  );
}
