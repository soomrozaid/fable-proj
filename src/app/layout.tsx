import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { envClient } from "@/config/env.client";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT", "WONK"],
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(envClient.APP_URL),
  title: {
    default: "Scanstone — QR codes that keep working. Set in stone.",
    template: "%s · Scanstone",
  },
  description:
    "Free QR codes that never expire, and dynamic QR codes you can edit after printing — with scan analytics and an ironclad promise: your codes keep redirecting even if you stop paying.",
  openGraph: {
    siteName: "Scanstone",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

function OrganizationJsonLd() {
  const base = envClient.APP_URL;
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Scanstone",
      url: base,
      logo: `${base}/icon`,
      description:
        "A QR code generator whose codes keep working even if you stop paying: free static codes that never expire, and dynamic codes with a written no-shutoff covenant.",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Scanstone",
      url: base,
    },
  ];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${inter.variable} ${plexMono.variable} grain min-h-screen`}
      >
        <OrganizationJsonLd />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
