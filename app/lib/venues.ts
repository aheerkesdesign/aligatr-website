import fs from "node:fs";
import path from "node:path";

/**
 * Drop real venue logos into /public/venues/ (svg, png, jpg, webp, avif).
 * Placeholders stay until that folder has 3 or more image files.
 */
export type Venue = {
  name: string;
  src: string;
};

const VENUES_DIR = path.join(process.cwd(), "public", "venues");
const IMAGE_EXT = new Set([".svg", ".png", ".jpg", ".jpeg", ".webp", ".avif"]);
const MIN_VENUE_LOGOS = 3;

export const placeholderVenues: Venue[] = [
  { name: "Paasparty", src: "/venue-placeholders/paasparty.svg" },
  { name: "La Costa", src: "/venue-placeholders/la-costa.svg" },
  { name: "HBO Feest", src: "/venue-placeholders/hbo-feest.svg" },
  { name: "Nacht van Hengelo", src: "/venue-placeholders/nacht-van-hengelo.svg" },
  { name: "De Musketier", src: "/venue-placeholders/de-musketier.svg" },
  { name: "Koningsdag", src: "/venue-placeholders/koningsdag.svg" },
];

function nameFromFilename(filename: string) {
  const base = filename.replace(/\.[^.]+$/, "");
  return base
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function readVenueFiles(): Venue[] {
  if (!fs.existsSync(VENUES_DIR)) return [];

  return fs
    .readdirSync(VENUES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => {
      const ext = path.extname(name).toLowerCase();
      return IMAGE_EXT.has(ext) && !name.startsWith(".");
    })
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
    .map((filename) => ({
      name: nameFromFilename(filename),
      src: `/venues/${filename.split("/").map(encodeURIComponent).join("/")}`,
    }));
}

export function getVenues(): Venue[] {
  const files = readVenueFiles();
  if (files.length >= MIN_VENUE_LOGOS) return files;
  return placeholderVenues;
}
