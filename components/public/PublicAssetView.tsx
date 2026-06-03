import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { PatternAccent } from "@/components/shared/PatternAccent";
import { Badge } from "@/components/ui/badge";

interface PublicAsset {
  publicId: string;
  modelName: string;
  modelDescription?: string;
  categoryName?: string;
  tags?: string[];
  coverPhotoUrl?: string;
  gallery?: Array<{ id: string; url: string }>;
  unitStatus: "available" | "in_use" | "unavailable";
  usageSopHtml?: string;
  companions?: Array<{ name: string; coverPhotoUrl?: string; publicHref?: string }>;
}

export async function PublicAssetView({ asset }: { asset: PublicAsset }) {
  const t = await getTranslations();
  const pinjam = process.env.NEXT_PUBLIC_PINJAM_URL ?? "https://pinjam.labmgm.org";
  const statusTone = asset.unitStatus === "available" ? "green" : asset.unitStatus === "in_use" ? "default" : "outline";

  return (
    <main className="min-h-screen bg-bg">
      <header className="border-b border-line">
        <div className="ds-container relative flex h-16 items-center justify-between">
          <Link href={pinjam} className="flex items-center gap-2 font-display text-h3 text-ink">
            <PatternAccent motif="plus" color="blue" size={28} />
            MGM Lab
          </Link>
          <Link
            href={pinjam}
            className="rounded-DEFAULT bg-brand-blue px-4 py-2 text-body-sm font-medium text-white hover:bg-brand-blue/90"
          >
            Borrow on Pinjam →
          </Link>
        </div>
      </header>

      <section className="ds-container relative grid gap-10 py-10 lg:grid-cols-5">
        <div className="pointer-events-none absolute -left-12 top-0 hidden lg:block">
          <PatternAccent seed={asset.publicId} variant="stack-2" size={64} />
        </div>

        <div className="lg:col-span-3">
          <p className="font-mono text-eyebrow uppercase tracking-[0.12em] text-ink-3">
            {asset.categoryName ?? "—"}
          </p>
          <h1 className="mt-2 font-display text-display-xl text-ink">{asset.modelName}</h1>
          {asset.modelDescription ? (
            <p className="mt-4 max-w-prose text-body-lg text-ink-2">{asset.modelDescription}</p>
          ) : null}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Badge variant={statusTone}>{t(`asset.publicStatus.${asset.unitStatus}` as never)}</Badge>
            {(asset.tags ?? []).map((tg) => <Badge key={tg} variant="outline">{tg}</Badge>)}
          </div>

          {asset.usageSopHtml ? (
            <section className="mt-10">
              <h2 className="font-display text-h2 text-ink">{t("asset.usageSop")}</h2>
              <div
                className="prose prose-sm mt-3 max-w-prose"
                dangerouslySetInnerHTML={{ __html: asset.usageSopHtml }}
              />
            </section>
          ) : null}

          {(asset.companions?.length ?? 0) > 0 ? (
            <section className="mt-10">
              <h2 className="font-display text-h2 text-ink">{t("asset.companions")}</h2>
              <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {(asset.companions ?? []).map((c, i) => {
                  const href = c.publicHref;
                  const body = (
                    <div className="ds-card flex items-center gap-3 p-3">
                      {c.coverPhotoUrl ? <img src={c.coverPhotoUrl} alt="" className="h-10 w-10 rounded-sm object-cover" /> : <div className="h-10 w-10 rounded-sm bg-surface-muted" />}
                      <span className="text-body-sm text-ink">{c.name}</span>
                    </div>
                  );
                  return (
                    <li key={i}>
                      {href ? <Link href={href}>{body}</Link> : body}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="lg:col-span-2">
          <div className="grid gap-3">
            {asset.coverPhotoUrl ? (
              <img src={asset.coverPhotoUrl} alt="" className="aspect-video w-full rounded-DEFAULT border border-line object-cover" />
            ) : null}
            {(asset.gallery?.length ?? 0) > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {(asset.gallery ?? []).map((p) => (
                  <div key={p.id} className="aspect-square overflow-hidden rounded-sm border border-line">
                    <img src={p.url} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </aside>
      </section>

      <footer className="border-t border-line">
        <div className="ds-container flex h-16 items-center justify-between text-caption text-ink-3">
          <span>QR ID <span className="font-mono">{asset.publicId}</span></span>
          <Link href={pinjam} className="text-brand-blue hover:underline">Pinjam →</Link>
        </div>
      </footer>
    </main>
  );
}
