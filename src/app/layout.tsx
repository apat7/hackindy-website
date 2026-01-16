import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://hackindy.com'),
  title: "Hack Indy 2026 | Purdue Indianapolis Hackathon",
  description: "Indianapolis' premier student-run hackathon at Purdue University Indianapolis. Join 200+ hackers for a weekend of innovation, learning, and $5K+ in prizes. March 27-29, 2026.",
  keywords: ["hackathon", "purdue", "indianapolis", "hack indy", "coding", "programming", "student", "competition"],
  authors: [{ name: "Hack Indy Team" }],
  openGraph: {
    title: "Hack Indy 2026 | Start Your Engines",
    description: "Indianapolis' premier student-run hackathon. 200+ hackers. $5K+ in prizes. March 27-29, 2026.",
    type: "website",
  },
  icons: {
    icon: '/Purdue Boilermakers Logo.png',
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
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
