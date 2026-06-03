import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export function InfraSpecWarnings({ warnings }: { warnings: string[] }) {
  const t = useTranslations();
  if (!warnings || warnings.length === 0) return null;
  return (
    <div className="rounded-DEFAULT border border-brand-yellow bg-brand-yellow-50 p-3">
      <p className="mb-2 font-mono text-eyebrow uppercase tracking-[0.12em] text-ink">{t("errors.infraSpecWarning")}</p>
      <ul className="space-y-1">
        {warnings.map((w, i) => (
          <li key={i} className="text-body-sm text-ink">• {w}</li>
        ))}
      </ul>
    </div>
  );
}
