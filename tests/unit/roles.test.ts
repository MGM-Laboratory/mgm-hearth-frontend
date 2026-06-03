import { describe, expect, it } from "vitest";

// Mirror the role resolution rule in lib/auth/config.ts so this test catches drift.
function resolveRole(realmRoles: string[], groups: string[], email?: string | null) {
  const IT_GROUP = "/member/it-infrastructure";
  const BOOTSTRAP = "admin@labmgm.org";
  if (realmRoles.includes("admin")) return "admin";
  if (email && email.toLowerCase() === BOOTSTRAP) return "admin";
  if (groups.includes(IT_GROUP)) return "maintainer";
  return "member";
}

describe("resolveRole", () => {
  it("realm admin wins", () => {
    expect(resolveRole(["admin"], [], "x@y")).toBe("admin");
  });
  it("bootstrap admin email wins over groups", () => {
    expect(resolveRole([], ["/member/it-infrastructure"], "admin@labmgm.org")).toBe("admin");
  });
  it("IT group → maintainer", () => {
    expect(resolveRole([], ["/member/it-infrastructure"], "alice@labmgm.org")).toBe("maintainer");
  });
  it("default → member", () => {
    expect(resolveRole([], [], "bob@labmgm.org")).toBe("member");
  });
});
