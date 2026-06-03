/* Verify messages/{en,id}.json mirror the keys in ../i18n/{en,id}.json. */
import fs from "node:fs";
import path from "node:path";

type Json = Record<string, unknown>;

function flatten(obj: Json, prefix = ""): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) out.push(...flatten(v as Json, key));
    else out.push(key);
  }
  return out;
}

function load(p: string): Json {
  return JSON.parse(fs.readFileSync(p, "utf8")) as Json;
}

const repoRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(repoRoot, "..");
const locales = ["en", "id"] as const;

let bad = 0;
for (const loc of locales) {
  const upstream = load(path.join(workspaceRoot, "i18n", `${loc}.json`));
  const local = load(path.join(repoRoot, "messages", `${loc}.json`));
  const upstreamKeys = new Set(flatten(upstream));
  const localKeys = new Set(flatten(local));

  const missingLocal = [...upstreamKeys].filter((k) => !localKeys.has(k));
  if (missingLocal.length > 0) {
    bad++;
    console.error(`[${loc}] missing in messages/${loc}.json: ${missingLocal.join(", ")}`);
  }
}

if (bad > 0) {
  process.exit(1);
} else {
  console.log("i18n keys in sync");
}
