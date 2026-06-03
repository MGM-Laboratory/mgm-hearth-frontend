import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PatternAccent } from "@/components/shared/PatternAccent";

export async function PublicNotFound({ publicId }: { publicId?: string }) {
  const t = await getTranslations();
  const pinjam = process.env.NEXT_PUBLIC_PINJAM_URL ?? "https://pinjam.labmgm.org";
  return (
    <main className="grid min-h-screen place-items-center bg-bg px-6">
      <div className="relative max-w-prose text-center">
        <div className="pointer-events-none absolute -left-16 -top-12 hidden md:block">
          <PatternAccent motif="x" color="red" size={120} />
        </div>
        <div className="pointer-events-none absolute -right-12 -bottom-8 hidden md:block">
          <PatternAccent motif="circle" color="blue" size={100} />
        </div>
        <p className="font-mono text-caption uppercase tracking-[0.18em] text-ink-3">404 · Not found</p>
        <h1 className="mt-3 font-display text-display-xl text-ink">No asset here.</h1>
        <p className="mx-auto mt-4 text-body-lg text-ink-2">
          {publicId ? (
            <>The QR code <span className="font-mono text-ink">{publicId}</span> doesn't match any asset in our system.</>
          ) : (
            t("errors.resourceNotFound")
          )}
        </p>
        <div className="mt-8">
          <Link href={pinjam} className="rounded-DEFAULT bg-brand-blue px-5 py-2.5 text-body-sm font-medium text-white shadow-1 hover:bg-brand-blue/90">
            Go to Pinjam →
          </Link>
        </div>
      </div>
    </main>
  );
}
