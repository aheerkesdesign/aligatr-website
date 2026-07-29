const FALLBACK_SITE_URL = "http://localhost:3000";

export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return new URL(explicit.replace(/\/$/, ""));
  }

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) {
    const host = vercelProduction.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return new URL(`https://${host}`);
  }

  return new URL(FALLBACK_SITE_URL);
}
