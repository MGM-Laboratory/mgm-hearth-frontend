import { rawFetch } from "./client";

export type FileKind =
  | "asset_photo"
  | "handover_photo"
  | "request_attachment"
  | "software_logo"
  | "sticker"
  | "misc";

export interface UploadedFile {
  id: string;
  url: string;
  kind: FileKind;
  size?: number;
  mime?: string;
  createdAt?: string;
}

/**
 * POST /files multipart upload. Returns the file record; caller must attach
 * the returned `id` to the owning entity within 24h or the janitor sweeps it.
 */
export async function uploadFile(file: File, kind: FileKind): Promise<UploadedFile> {
  const form = new FormData();
  form.append("file", file);
  form.append("kind", kind);
  const res = await rawFetch("/files", { method: "POST", body: form });
  return (await res.json()) as UploadedFile;
}

export async function deleteFile(id: string): Promise<void> {
  await rawFetch(`/files/${id}`, { method: "DELETE" });
}
