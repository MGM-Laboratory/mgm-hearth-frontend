import { describe, expect, it } from "vitest";
import { formatIDR, formatDateShort, jakartaDateKey } from "@/lib/i18n/formats";

describe("formatIDR", () => {
  it("formats integers as IDR with thousands grouping in id-ID", () => {
    expect(formatIDR(1_000_000, "id")).toMatch(/Rp.?1\.000\.000/);
  });
  it("no decimal places", () => {
    expect(formatIDR(123_456, "id")).not.toMatch(/[,.]\d{2}/);
  });
});

describe("formatDateShort", () => {
  it("formats in Jakarta TZ", () => {
    const iso = "2026-06-02T00:00:00.000Z"; // = 07:00 in Jakarta
    expect(formatDateShort(iso, "en")).toMatch(/Jun.*2026/);
  });
});

describe("jakartaDateKey", () => {
  it("returns YYYY-MM-DD", () => {
    expect(jakartaDateKey(new Date("2026-06-02T12:00:00Z"))).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
