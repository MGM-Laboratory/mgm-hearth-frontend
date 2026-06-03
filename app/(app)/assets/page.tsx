"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Plus, Upload, Tag as TagIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/Icon";
import { AssetFilters } from "@/components/assets/AssetFilters";
import { AssetList } from "@/components/assets/AssetList";
import { useAssetFiltersStore } from "@/stores/assetFilters";

export default function AssetsPage() {
  const t = useTranslations();
  const { filters, setFilters } = useAssetFiltersStore();
  return (
    <div className="ds-container space-y-4">
      <PageHeader
        title={t("asset.title")}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" asChild>
              <Link href="/assets/import">
                <Icon icon={Upload} size={16} /> {t("asset.actions.import")}
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/catalogs/stickers">
                <Icon icon={TagIcon} size={16} /> {t("asset.actions.generateSticker")}
              </Link>
            </Button>
            <Button asChild>
              <Link href="/assets/new">
                <Icon icon={Plus} size={16} /> {t("common.create")}
              </Link>
            </Button>
          </div>
        }
      />
      <AssetFilters value={filters} onChange={setFilters} />
      <AssetList filters={filters} />
    </div>
  );
}
