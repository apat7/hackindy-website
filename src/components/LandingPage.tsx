'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Icons } from '@/app/Icons';
import StickerPeel from '@/app/StickerPeel';

const FaultyTerminal = dynamic(() => import('@/components/FaultyTerminal'), {
  ssr: false,
});

export default function Home() {
  const [lightsComplete, setLightsComplete] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prizesRevealed, setPrizesRevealed] = useState(false);
  const [prizeCountdown, setPrizeCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // Racing lights animation on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setLightsComplete(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Prize reveal timer — reveals at 6 PM EDT on March 27, 2026
  useEffect(() => {
    const revealTime = new Date('2026-03-27T18:00:00-04:00').getTime();
    let interval: NodeJS.Timeout | undefined;
    const tick = () => {
      const now = Date.now();
      const diff = revealTime - now;
      if (diff <= 0) {
        setPrizesRevealed(true);
        setPrizeCountdown({ hours: 0, minutes: 0, seconds: 0 });
        if (interval) clearInterval(interval);
      } else {
        setPrizesRevealed(false);
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setPrizeCountdown({ hours: h, minutes: m, seconds: s });
      }
    };
    tick();
    if (revealTime - Date.now() > 0) {
      interval = setInterval(tick, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, []);



  // Scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.scroll-animate').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);



  const sponsors = [
    { logo: 'purdue cs logo transparent.png', name: 'Purdue CS', link: 'https://cs.purdue.edu' },
    { logo: 'rcac logo transparent.png', name: 'RCAC', link: 'https://www.rcac.purdue.edu' },
    { logo: 'datamine logo transparent.png', name: 'The Data Mine', link: 'https://datamine.purdue.edu' },
    { logo: 'indyhackers logo transparent.png', name: 'Indy Hackers', link: 'https://indyhackers.org' },
    { logo: 'jane street logo transparent.png', name: 'Jane Street', link: 'https://janestreet.com' },
    { logo: 'g-research ogo transparent.png', name: 'G-Research', link: 'https://www.gresearch.com' },
    { logo: 'NM-logo.jpeg', name: 'North Mass Strategies', link: 'https://www.northmarkstrategies.com' },
    { logo: 'sig logo.png', name: 'SIG', link: 'https://sig.com' },
    { logo: 'kusari logo transparent.png', name: 'Kusari', link: 'https://kusari.dev' },
    { logo: 'anu logo.jpeg', name: 'Anu', link: 'https://www.growanu.com' },
    { logo: 'Amway Logo Color.png', name: 'Amway', link: 'https://www.amwayglobal.com' },
    { logo: 'realync logo transparent.png', name: 'Realync', link: 'https://realync.com' },
    { logo: 'farm bureau insurance logo transparent.png', name: 'Farm Bureau', link: 'https://www.infarmbureau.com' },
    { logo: 'crowe logo.jpg', name: 'Crowe', link: 'https://www.crowe.com' },
    { logo: 'trava security logo.jpeg', name: 'Trava Security', link: 'https://travasecurity.com' },
    { logo: 'momentum3 logo transparent.png', name: 'Momentum3', link: 'https://momentum3.biz' },
    { logo: 'Github Logo.png', name: 'Github', link: 'https://github.com' },
    { logo: 'Pure Buttons Blue Gradient Logo.png', name: 'Pure Buttons', link: 'https://mlh.link/purebuttons' },
    { logo: 'CSWN.png', name: 'CSWN', link: 'https://www.cs.purdue.edu/cswn' },
    { logo: 'craneclub.png', name: 'Crane Club' },
    { logo: 'Featherless Hackathon Assets.png', name: 'Featherless AI', link: 'https://featherless.ai' },
  ];



  return (
    <div className="min-h-screen relative" style={{ background: 'var(--bg-primary)' }}>
      {/* MLH Trust Badge */}
      <a
        id="mlh-trust-badge"
        className="mlh-badge"
        href="https://mlh.io/na?utm_source=na-hackathon&utm_medium=TrustBadge&utm_campaign=2026-season&utm_content=white"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="https://s3.amazonaws.com/logged-assets/trust-badge/2026/mlh-trust-badge-2026-white.svg"
          alt="Major League Hacking 2026 Hackathon Season"
          style={{ width: '100%' }}
        />
      </a>

      {/* Racing Grid Background */}
      <div className="racing-grid-bg"></div>
      <div className="scanline-overlay"></div>

      {/* Interactive Purdue Logo Sticker - hidden on mobile */}
      <div className="sticker-bounds-container hide-on-mobile">
        <StickerPeel
          imageSrc="/Purdue Boilermakers Logo.png"
          width={180}
          rotate={15}
          peelBackHoverPct={25}
          peelBackActivePct={45}
          shadowIntensity={0.5}
          lightingIntensity={0.15}
          initialPosition={{ x: 60, y: 150 }}
        />
        {/* Hand-drawn style label */}
        <div className="sticker-label">
          <span className="sticker-label-text">drag me around!</span>
          <svg className="sticker-arrow" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Main swoopy curve */}
            <path
              d="M75 8 C60 12, 45 18, 30 32 Q20 44, 12 52"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Arrowhead */}
            <path
              d="M4 42 L12 52 L22 45"
              transform="rotate(35, 12, 52)"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
      </div>

      {/* Boilermaker Pete Easter Egg - Hidden Silhouette */}
      <div className="pete-easter-egg" title="Boiler Up!">
        <svg viewBox="0 0 100 100" fill="currentColor" style={{ color: 'var(--purdue-gold)' }}>
          <circle cx="50" cy="25" r="20" />
          <rect x="35" y="45" width="30" height="40" rx="5" />
          <rect x="25" y="50" width="15" height="25" rx="3" />
          <rect x="60" y="50" width="15" height="25" rx="3" />
        </svg>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full glass z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <span className="font-racing text-base sm:text-lg boiler-up-trigger relative" style={{ color: 'var(--racing-gold)' }}>
                HACK<span style={{ color: 'var(--text-primary)', marginLeft: '0.5rem' }}>INDY</span>
              </span>
            </div>

            {/* Nav Links - Desktop */}
            <div className="hidden md:flex items-center gap-8">
              {[
                { href: '#about', label: 'About', Icon: Icons.Flag },
                { href: '#sponsors', label: 'Sponsors', Icon: Icons.Wrench },
                { href: '/2026', label: '2026 Archive', Icon: Icons.Clock },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 text-sm font-medium transition-colors duration-300 hover:text-[var(--racing-gold)]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <link.Icon className="w-3 h-3" />
                  {link.label}
                </a>
              ))}
              <Link
                href="/team"
                className="text-sm font-medium transition-colors duration-300 hover:text-[var(--racing-gold)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                Team
              </Link>
            </div>

            {/* Right side: CTA + Hamburger */}
            <div className="flex items-center gap-2">
              {/* Hamburger Menu Button - shown below md breakpoint */}
              <button
                className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded border transition-colors"
                style={{ borderColor: 'var(--border-gold)', color: 'var(--racing-gold)' }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
                <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
                <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-content">
            {[
              { href: '#about', label: 'About', Icon: Icons.Flag },
              { href: '#sponsors', label: 'Sponsors', Icon: Icons.Wrench },
              { href: '/2026', label: '2026 Archive', Icon: Icons.Clock },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="mobile-menu-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <link.Icon className="w-5 h-5" />
                {link.label}
              </a>
            ))}
            <Link
              href="/team"
              className="mobile-menu-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Icons.Users className="w-5 h-5" />
              Team
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-4">
        {/* FaultyTerminal Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <FaultyTerminal
            scale={0.8}
            gridMul={[1.5, 1]}
            digitSize={1.5}
            timeScale={0.4}
            pause={false}
            scanlineIntensity={0.5}
            glitchAmount={0}
            flickerAmount={0}
            noiseAmp={0.4}
            chromaticAberration={0}
            dither={0}
            curvature={0}
            tint="#d4a853"
            mouseReact={true}
            mouseStrength={0.4}
            pageLoadAnimation={false}
            brightness={0.12}
            dpr={0.75}
          />
          {/* Gradient overlay to fade into the rest of the page */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, transparent 60%, var(--bg-primary) 100%)'
            }}
          />
        </div>
        <div className="racing-stripes"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Racing Lights */}
          <div className="flex justify-center gap-4 mb-8 animate-fade-in">
            <div className={`racing-light ${lightsComplete ? 'racing-light-1' : ''}`}></div>
            <div className={`racing-light ${lightsComplete ? 'racing-light-2' : ''}`}></div>
            <div className={`racing-light ${lightsComplete ? 'racing-light-3' : ''}`}></div>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center mb-8 animate-fade-in-up delay-100">
            <span className="racing-badge registration-badge" style={{ borderColor: 'var(--racing-gold)', color: 'var(--racing-gold)' }}>
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--racing-gold)' }}></span>
              Event Concluded
            </span>
          </div>

          {/* Main Title */}
          <h1 className="font-racing text-4xl sm:text-6xl md:text-8xl lg:text-9xl mb-4 animate-fade-in-up delay-200">
            <span className="racing-title">HACK</span>
            <span className="hero-indy-text">INDY</span>
          </h1>

          <h2 className="font-racing text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-8 sm:mb-10 animate-fade-in-up delay-300" style={{ color: 'var(--racing-gold)' }}>
            SEE YOU NEXT YEAR!
          </h2>

          {/* Location & Date Badges */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-10 animate-fade-in-up delay-500">
            <span className="racing-badge text-xs sm:text-sm">
              <Icons.MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              Purdue Indy
            </span> 
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 sm:gap-4 justify-center items-center animate-fade-in-up delay-500 px-4">
            <Link
              href="/2026"
              className="w-full max-w-xs sm:w-72 text-center px-6 sm:px-10 py-3 sm:py-4 text-sm sm:text-lg font-semibold border-2 rounded flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 hover:bg-[rgba(212,168,83,0.15)] hover:scale-105"
              style={{
                borderColor: 'var(--racing-gold)',
                color: 'var(--racing-gold)',
                background: 'rgba(212,168,83,0.05)'
              }}
            >
              View 2026 Archive →
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-float">
          <div className="w-6 h-10 rounded-full border-2 flex justify-center pt-2" style={{ borderColor: 'var(--border-gold)' }}>
            <div className="w-1 h-2 rounded-full animate-pulse" style={{ background: 'var(--racing-gold)' }}></div>
          </div>
        </div>
      </section>


      {/* About Section */}
      <section id="about" className="py-24 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 scroll-animate">
            <h2 className="section-header">
              About
            </h2>
          </div>

          <div className="racing-card corner-accent p-8 md:p-12 scroll-animate">
            <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Hack Indy is Purdue University in Indianapolis' largest student-run hackathon, bringing together over 200 students, with a strong concentration in computer science, data science, artificial intelligence, and engineering, to compete in a three-day overnight hackathon. Open to everyone—no matter your experience level—Hack Indy is designed to provide an inclusive and impactful experience for all participants.
            </p>
            <p className="text-lg leading-relaxed mt-6" style={{ color: 'var(--text-secondary)' }}>
              You'll have the chance to attend industry-driven workshops, network with top executives in the Indianapolis tech scene, and learn from engineering panels. Beyond hacking, you can join video game tournaments, play fun games, win cool prizes, and enjoy free swag and food—all while building valuable skills and making unforgettable memories.
            </p>
            {/* Hidden Neil Armstrong Easter Egg */}
            <p className="text-xs mt-8 opacity-20 text-center font-mono" title="One small step for a hacker, one giant leap for hackerkind - Inspired by Neil Armstrong, Purdue '55">
              "That's one small step for a hacker..."
            </p>
          </div>
        </div>
      </section>







      {/* Sponsors Garage Section */}
      <section id="sponsors" className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          {/* Garage Container */}
          <div className="garage-container scroll-animate">
            {/* Header Badge */}
            <div className="garage-header">
              Sponsors Garage
            </div>

            <p className="text-center mb-8 -mt-4" style={{ color: 'var(--text-secondary)' }}>
              Fueling the engines of innovation
            </p>

            {/* Sponsor Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {sponsors.map((sponsor, index) => (
                <div
                  key={index}
                  className="sponsor-logo aspect-square flex items-center justify-center"
                  title={sponsor.name}
                >
                  {sponsor.link ? (
                    <a
                      href={sponsor.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-full flex items-center justify-center transition-opacity hover:opacity-80"
                    >
                      <img
                        src={`/sponsors/${sponsor.logo}`}
                        alt={sponsor.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </a>
                  ) : (
                    <img
                      src={`/sponsors/${sponsor.logo}`}
                      alt={sponsor.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Decorative Elements - Garage Tools */}
            <div className="hidden lg:flex flex-col gap-6 absolute -left-16 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--racing-gold)', opacity: 0.15 }}>
              <Icons.GasCan className="w-12 h-16" />
              <Icons.Wrench className="w-10 h-10" />
              <Icons.Tire className="w-12 h-12" />
            </div>
            <div className="hidden lg:flex flex-col gap-6 absolute -right-16 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--racing-gold)', opacity: 0.15 }}>
              <Icons.OilCan className="w-14 h-10" />
              <Icons.SteeringWheel className="w-10 h-10" />
              <Icons.GasCan className="w-12 h-16" />
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="footer py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Logo & Copyright */}
            <div className="text-center md:text-left">
              <div className="font-racing text-xl mb-2" style={{ color: 'var(--racing-gold)' }}>
                HACK<span style={{ color: 'var(--text-primary)', marginLeft: '0.5rem' }}>INDY</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                © 2026 Hack Indy • Purdue University Indianapolis
              </p>
              <p className="text-xs mt-1 flex items-center justify-center md:justify-start gap-2" style={{ color: 'var(--text-muted)' }}>
                Start Your Engines <Icons.Flag className="w-3 h-3" />
              </p>
            </div>

            {/* Links */}
            <div className="flex gap-6">
              <a
                href="https://forms.gle/your-interest-form-link"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm transition-colors hover:text-[var(--racing-gold)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                Interest Form
              </a>
              <a
                href="https://hack-indy-2026.devpost.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm transition-colors hover:text-[var(--racing-gold)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                Devpost
              </a>
              <a
                href="https://github.com/MLH/mlh-policies/blob/main/code-of-conduct.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm transition-colors hover:text-[var(--racing-gold)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                Code of Conduct
              </a>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded flex items-center justify-center transition-colors hover:bg-[rgba(212,168,83,0.2)]"
                style={{ border: '1px solid var(--border-gold)', color: 'var(--racing-gold)' }}
                title="Instagram"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded flex items-center justify-center transition-colors hover:bg-[rgba(212,168,83,0.2)]"
                style={{ border: '1px solid var(--border-gold)', color: 'var(--racing-gold)' }}
                title="Discord"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                </svg>
              </a>
              <a
                href="https://github.com/apat7/hackindy-website"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded flex items-center justify-center transition-colors hover:bg-[rgba(212,168,83,0.2)]"
                style={{ border: '1px solid var(--border-gold)', color: 'var(--racing-gold)' }}
                title="GitHub"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}