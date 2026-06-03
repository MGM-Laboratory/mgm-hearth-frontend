import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StickerPreview } from "@/components/assets/StickerPreview";

const unit = {
  id: "u1",
  modelId: "m1",
  serialNumber: "SN-123",
  assetTag: "MGM-CAM-001",
  publicId: "ABCDEFGH1234",
  status: "available",
  condition: "good",
};

const template = {
  id: "tpl-1",
  name: "Small",
  widthMm: 50,
  heightMm: 25,
  dpi: 300,
  visibleFields: ["name", "serial", "qr"] as Array<"name" | "serial" | "qr">,
};

describe("StickerPreview", () => {
  it("renders model name when visible", () => {
    render(<StickerPreview unit={unit} modelName="Sony A7 IV" template={template} />);
    expect(screen.getByText("Sony A7 IV")).toBeInTheDocument();
    expect(screen.getByText(/SN SN-123/)).toBeInTheDocument();
  });

  it("hides serial when not in visibleFields", () => {
    render(<StickerPreview unit={unit} modelName="Sony A7 IV" template={{ ...template, visibleFields: ["name", "qr"] }} />);
    expect(screen.queryByText(/SN-123/)).not.toBeInTheDocument();
  });
});
