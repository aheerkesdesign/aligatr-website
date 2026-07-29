import type { Metadata } from "next";
import { Bebas_Neue, Space_Grotesk } from "next/font/google";
import { LanguageProvider } from "./i18n/LanguageProvider";
import { getSiteUrl } from "./lib/site";
import "./globals.css";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const siteUrl = getSiteUrl();

const title = "ALIGATR | Allround DJ — House | Hardstyle | Reggaeton";
const description =
  "ALIGATR is een allround DJ met ruim 7 jaar ervaring in Twente en Delft. House, Hardstyle en Reggaeton — boeken voor clubs, feesten en events.";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title,
  description,
  applicationName: "ALIGATR",
  authors: [{ name: "ALIGATR" }],
  creator: "ALIGATR",
  keywords: [
    "ALIGATR",
    "DJ",
    "Allround DJ",
    "House",
    "Hardstyle",
    "Reggaeton",
    "Twente",
    "Delft",
    "DJ boeken",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "/",
    siteName: "ALIGATR",
    title,
    description,
    images: [
      {
        url: "/press-photo-front.png",
        width: 1200,
        height: 800,
        alt: "ALIGATR",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/press-photo-front.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
