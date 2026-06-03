import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

const SUPPORTED = new Set(["en", "id"]);
const DEFAULT_LOCALE = (process.env.APP_DEFAULT_LOCALE ?? "en") as "en" | "id";

async function resolveLocale(): Promise<"en" | "id"> {
  const cookieJar = await cookies();
  const cookieLocale = cookieJar.get("NEXT_LOCALE")?.value;
  if (cookieLocale && SUPPORTED.has(cookieLocale)) return cookieLocale as "en" | "id";

  const h = await headers();
  const accept = h.get("accept-language") ?? "";
  const first = accept.split(",")[0]?.split("-")[0]?.toLowerCase();
  if (first && SUPPORTED.has(first)) return first as "en" | "id";

  return DEFAULT_LOCALE;
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale();
  const messages = (await import(`@/messages/${locale}.json`)).default;
  return {
    locale,
    messages,
    timeZone: process.env.APP_TIMEZONE ?? "Asia/Jakarta",
    now: new Date(),
    formats: {
      dateTime: {
        short: { day: "numeric", month: "short", year: "numeric" },
        long: { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" },
        time: { hour: "2-digit", minute: "2-digit" },
      },
      number: {
        idr: { style: "currency", currency: "IDR", maximumFractionDigits: 0, minimumFractionDigits: 0 },
      },
    },
  };
});
