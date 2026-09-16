import type { Metadata } from "next";
import {
  Big_Shoulders,
  Barlow,
  IBM_Plex_Mono,
  Lobster_Two,
} from "next/font/google";
import { promises as fs } from "fs";
import path from "path";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import Analytics from "@/components/Analytics";
import { LanguageProvider } from "@/lib/i18n";
import { BUSINESS } from "@/lib/pricing";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL || "https://caddtruckparking.com";

const bigShoulders = Big_Shoulders({
  subsets: ["latin"],
  variable: "--font-big-shoulders",
  weight: ["500", "600", "700", "800", "900"],
});

const barlow = Barlow({
  subsets: ["latin"],
  variable: "--font-barlow",
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "600"],
});

const lobster = Lobster_Two({
  subsets: ["latin"],
  variable: "--font-lobster",
  weight: ["700"],
  style: ["normal", "italic"],
});

/* Site-wide defaults. Canonical URLs are set per page (a canonical here would be
   inherited by every child route and point them all at the homepage). */
export const metadata: Metadata = {
  title: "24/7 Secure Truck Parking in Midland, TX | CADD Truck Parking",
  description:
    "Fenced, gated, camera-watched semi-truck parking in Midland–Odessa, TX. Assigned spaces from $25/day, hot showers, laundry & driver lounge. Open 24/7 — reserve online in two minutes.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://caddtruckparking.com",
  ),
  openGraph: {
    title: "CADD Truck Parking — 24/7 Secure Truck Parking, Midland TX",
    description:
      "Secure parking. Real comfort. Built for truckers. Assigned spaces from $25/day in the Permian Basin.",
    type: "website",
    siteName: "CADD Truck Parking",
    locale: "en_US",
    url: "/",
    images: [
      {
        url: "/brand/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CADD Truck Parking — secure truck parking in Midland, Texas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CADD Truck Parking — 24/7 Secure Truck Parking, Midland TX",
    description:
      "Secure parking. Real comfort. Built for truckers. Reserve your space in the Permian Basin.",
    images: ["/brand/og-image.jpg"],
  },
};

/** Which brand image files exist in public/brand/ (drop-in slots). */
async function getBrandAssets() {
  const dir = path.join(process.cwd(), "public", "brand");
  let files: string[] = [];
  try {
    files = await fs.readdir(dir);
  } catch {
    /* no brand folder yet */
  }
  const find = (re: RegExp) => {
    const f = files.find((x) => re.test(x));
    return f ? `/brand/${f}` : null;
  };
  return {
    logoNight: find(/^logo-night\.(png|svg|webp)$/i),
    logoDay: find(/^logo-day\.(png|svg|webp)$/i),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const brand = await getBrandAssets();
  return (
    <html
      lang="en"
      className={`${bigShoulders.variable} ${barlow.variable} ${plexMono.variable} ${lobster.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Apply saved theme before paint (no flash) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('cadd-theme')==='day')document.documentElement.classList.add('day')}catch(e){}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              // Both types: ParkingFacility describes what it is, LocalBusiness
              // is the business-level signal search engines and assistants read.
              "@type": ["ParkingFacility", "LocalBusiness"],
              "@id": `${SITE}/#business`,
              name: BUSINESS.name,
              legalName: BUSINESS.legalName,
              url: SITE,
              telephone: "+1-877-607-2233",
              email: BUSINESS.email,
              image: `${SITE}/brand/og-image.jpg`,
              logo: `${SITE}/brand/logo-day.png`,
              description:
                "Fenced, gated, 24/7 commercial truck and trailer parking in Midland, Texas, serving the Permian Basin. Assigned spaces, hot showers, laundry, and a driver lounge.",
              address: {
                "@type": "PostalAddress",
                streetAddress: "4500 East County Road 130",
                addressLocality: "Midland",
                addressRegion: "TX",
                postalCode: "79706",
                addressCountry: "US",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 31.959558,
                longitude: -101.989633,
              },
              hasMap: BUSINESS.mapsUrl,
              // Ties the social accounts to this same business entity.
              sameAs: BUSINESS.socials.map((sn) => sn.url),
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ],
                  opens: "00:00",
                  closes: "23:59",
                },
              ],
              priceRange: "$25–$3,500",
              currenciesAccepted: "USD",
              paymentAccepted: "Credit Card, Debit Card, Zelle, Cash App, Cash",
              areaServed: [
                { "@type": "City", name: "Midland" },
                { "@type": "City", name: "Odessa" },
                { "@type": "AdministrativeArea", name: "Permian Basin" },
              ],
              amenityFeature: [
                "Hot showers",
                "Laundry",
                "Restrooms",
                "Driver lounge",
                "Pre-trip inspection areas",
                "Assigned spaces",
              ].map((n) => ({
                "@type": "LocationFeatureSpecification",
                name: n,
                value: true,
              })),
              foundingDate: "2018-07",
            }),
          }}
        />
      </head>
      <body>
        <Analytics />
        <LanguageProvider>
          <Header logoNight={brand.logoNight} logoDay={brand.logoDay} />
          <main>{children}</main>
          <Footer />
          {/* Big D appears once ANTHROPIC_API_KEY is set (always in dev) */}
          {(process.env.ANTHROPIC_API_KEY ||
            process.env.NODE_ENV !== "production") && <ChatWidget />}
        </LanguageProvider>
      </body>
    </html>
  );
}
