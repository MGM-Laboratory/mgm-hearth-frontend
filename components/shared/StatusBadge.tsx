import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

type Domain = "borrow" | "procurement" | "infra" | "room" | "license" | "general" | "asset";

const COLOR_BY_STATUS: Record<string, "default" | "green" | "red" | "yellow" | "outline" | "solid"> = {
  submitted: "outline",
  in_review: "outline",
  approved: "green",
  rejected: "red",
  ready_for_pickup: "yellow",
  borrowed: "default",
  returned: "green",
  overdue: "red",
  cancelled: "outline",
  closed: "solid",
  ordered: "default",
  received: "green",
  provisioned: "green",
  assigned: "green",
  pending: "outline",
  available: "green",
  reserved: "yellow",
  in_maintenance: "yellow",
  retired: "solid",
  lost: "red",
  in_use: "default",
  unavailable: "outline",
};

export function StatusBadge({ domain, status }: { domain: Domain; status: string }) {
  const t = useTranslations();
  const i18nKey = `${domain}.status.${status}`;
  const variant = COLOR_BY_STATUS[status] ?? "outline";
  return <Badge variant={variant}>{t(i18nKey as never)}</Badge>;
}
