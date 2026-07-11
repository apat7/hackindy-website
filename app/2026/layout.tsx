import '@/styles/2026.css';

export const metadata = {
  title: "Hack Indy 2026 | Purdue Indianapolis Hackathon",
  description:
    "Indianapolis' premier student-run hackathon at Purdue University Indianapolis. Join 200+ hackers for a weekend of innovation, learning, and $5K+ in prizes. March 27-29, 2026.",
};

export default function Layout2026({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* 2026 site uses Press Start 2P, VT323, Indie Flower, Inter via Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Indie+Flower&family=Press+Start+2P&family=VT323&family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
