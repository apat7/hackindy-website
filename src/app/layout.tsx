import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hackindy.com';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Hack Indy 2026 | Purdue Indianapolis Hackathon",
    template: "%s | Hack Indy 2026",
  },
  description: "Indianapolis' premier student-run hackathon at Purdue University Indianapolis. Join 200+ hackers for a weekend of innovation, learning, and $5K+ in prizes. March 27-29, 2026.",
  keywords: ["hackathon", "purdue", "indianapolis", "hack indy", "coding", "programming", "student", "competition", "tech", "innovation", "IUPUI", "Purdue Indianapolis"],
  authors: [{ name: "Hack Indy Team" }],
  creator: "Hack Indy Team",
  publisher: "Hack Indy",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: "Hack Indy 2026 | Start Your Engines",
    description: "Indianapolis' premier student-run hackathon. 200+ hackers. $5K+ in prizes. March 27-29, 2026.",
    url: baseUrl,
    siteName: "Hack Indy",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hack Indy 2026 | Start Your Engines",
    description: "Indianapolis' premier student-run hackathon. 200+ hackers. $5K+ in prizes. March 27-29, 2026.",
  },
  icons: {
    icon: '/Purdue Boilermakers Logo.png',
  },
  verification: {
    // Add your verification codes here when you have them
    // google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Indie+Flower&family=Press+Start+2P&family=VT323&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
