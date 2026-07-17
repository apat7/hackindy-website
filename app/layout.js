import { Geist, Geist_Mono, Saira_Condensed } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const saira = Saira_Condensed({
  variable: "--font-saira",
  subsets: ["latin"],
  weight: ["700", "800"],
});

export const metadata = {
  title: "HackIndy 2027 · Coming Soon",
  description:
    "Purdue CS Club's HackIndy returns for the 2027 season. The pit garage is under construction — take a lap around the car and check back soon.",
};

export const viewport = {
  themeColor: "#0b0a08",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${saira.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}<Analytics /></body>
    </html>
  );
}
