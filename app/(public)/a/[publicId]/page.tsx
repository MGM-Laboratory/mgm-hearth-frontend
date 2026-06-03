import type { Metadata } from "next";
import { PublicAssetView } from "@/components/public/PublicAssetView";
import { PublicNotFound } from "@/components/public/PublicNotFound";

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

function apiBase() {
  return (
    process.env.HEARTH_API_URL_INTERNAL ??
    process.env.HEARTH_API_URL ??
    "http://localhost:8080/api/v1"
  );
}

async function fetchPublicAsset(publicId: string): Promise<PublicAsset | null> {
  try {
    const res = await fetch(`${apiBase()}/public/assets/${encodeURIComponent(publicId)}`, {
      // Public endpoint — always live, no caching.
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as PublicAsset;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ publicId: string }> }): Promise<Metadata> {
  const { publicId } = await params;
  const asset = await fetchPublicAsset(publicId);
  if (!asset) return { title: "Not found — MGM Lab" };
  return {
    title: `${asset.modelName} — MGM Lab`,
    description: asset.modelDescription ?? `MGM Lab asset ${asset.modelName}`,
  };
}

export default async function PublicAssetPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const asset = await fetchPublicAsset(publicId);
  if (!asset) return <PublicNotFound publicId={publicId} />;
  return <PublicAssetView asset={asset} />;
}
