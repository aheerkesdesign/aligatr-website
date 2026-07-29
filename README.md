# ALIGATR website

Next.js App Router site for ALIGATR — allround DJ (House | Hardstyle | Reggaeton).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production URL (SEO)

Set this in **Vercel → Project → Settings → Environment Variables** (Production):

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.tld
```

No trailing slash. See [`.env.example`](.env.example). Redeploy after saving.

This powers:

- `/robots.txt`
- `/sitemap.xml`
- Open Graph / canonical URLs

## Google Search Console (your steps)

1. Open [Google Search Console](https://search.google.com/search-console) and add your domain (or URL-prefix property).
2. Verify ownership (DNS TXT at your registrar, or the HTML/meta method Google offers).
3. Submit sitemap: `https://your-domain.tld/sitemap.xml`
4. Use **URL inspection** on the homepage → **Request indexing**.
5. Add the site link to Instagram, SoundCloud, TikTok, and YouTube bios.

Check later with `site:your-domain.tld` in Google. Indexing can take a few days.

## Deploy

Deploy on [Vercel](https://vercel.com). Connect your custom domain in the Vercel project settings.
