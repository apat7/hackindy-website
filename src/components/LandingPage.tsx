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
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [lightsComplete, setLightsComplete] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scheduleRef = useRef<HTMLDivElement>(null);

  // Racing lights animation on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setLightsComplete(true);
    }, 2000);
    return () => clearTimeout(timer);
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

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  // Scroll schedule left/right
  const scrollSchedule = (direction: 'left' | 'right') => {
    if (scheduleRef.current) {
      const scrollAmount = 400;
      scheduleRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const faqs = [
    {
      question: "What is a Hackathon?",
      answer: "Hack Indy is a three-day overnight event where you can learn, build, and showcase an exciting technology-based project! Beyond working on your project, you'll enjoy free food, swag, and the chance to win awesome prizes. We also host industry-driven workshops, engineering panels, and fun activities like video game tournaments to keep the energy high. Most importantly, Hack Indy is a welcoming space to network with top executives in the Indianapolis tech scene and connect with like-minded students from all majors and experience levels."
    },
    {
      question: "Who can attend and how much experience do I need to participate?",
      answer: "Any undergraduate university student age 18 or older from any school or major can attend Hack Indy! No experience or technical background is required to participate, and we have mentors on site to assist with any technical needs. We also have unique and enriching experiences available to more skilled hackers, with special technologies and tech talks offered."
    },
    {
      question: "Do I have to apply to participate in Hack Indy?",
      answer: "You do not need to apply to participate in Hack Indy, we are open to all students of all majors. Just fill out our Interest form, so we can keep track of participants."
    },
    {
      question: "What projects can I make at Hack Indy?",
      answer: "You can build any project you want at Hack Indy! We have no strict project requirements, other than that it was built at the hackathon itself. Every year, we see a wide variety of technologies used and various applications for projects, and even see hardware-based projects — the possibilities are endless!"
    },
    {
      question: "Does Hack Indy offer travel reimbursements?",
      answer: "Hack Indy will not offer travel reimbursements at this time to those attending from other universities. We do provide all meals while you are at the hackathon. The Hack Indy hackathon venue will be open during the entire duration of the hackathon, and there are many nearby locations which can offer housing over the course of the two nights."
    }
  ];

  const sponsors = [
    { logo: 'purdue cs logo transparent.png', name: 'Purdue CS' },
    { logo: 'rcac logo transparent.png', name: 'RCAC' },
    { logo: 'datamine logo transparent.png', name: 'The Data Mine' },
    { logo: 'indyhackers logo transparent.png', name: 'Indy Hackers' },
    { logo: 'jane street logo transparent.png', name: 'Jane Street' },
    { logo: 'g-research ogo transparent.png', name: 'G-Research' },
    { logo: 'NM-logo.jpeg', name: 'North Mass Strategies' },
    { logo: 'sig logo.png', name: 'SIG' },
    { logo: 'kusari logo transparent.png', name: 'Kusari' },
    { logo: 'anu logo.jpeg', name: 'Anu' },
    { logo: 'Amway Logo Color.png', name: 'Amway' },
    { logo: 'realync logo transparent.png', name: 'Realync' },
    { logo: 'farm bureau insurance logo transparent.png', name: 'Farm Bureau' },
    { logo: 'crowe logo.jpg', name: 'Crowe' },
    { logo: 'axiomatic consulting logo transparent.png', name: 'Axiomatic' },
    { logo: 'trava security logo.jpeg', name: 'Trava Security' },
    { logo: 'momentum3 logo transparent.png', name: 'Momentum3' },
    { logo: 'brooksource logo transparent.png', name: 'Brooksource' },
  ];

  const fridaySchedule = [
    { time: '5:00 - 6:00 PM', event: 'Check In & Registration', location: 'Student Center' },
    { time: '6:00 - 6:30 PM', event: 'Swag Distribution', location: 'Student Center' },
    { time: '6:30 - 7:00 PM', event: 'CS Dept Head Petros Keynote', location: 'Student Center' },
    { time: '7:00 - 7:30 PM', event: 'Dinner', location: 'Student Center' },
    { time: '7:30 - 8:30 PM', event: 'Opening Ceremony', location: 'Student Center' },
    { time: '8:30 - 9:00 PM', event: 'Team Building & Hacking Starts', location: 'Student Center' },
    { time: '10:00 PM', event: 'Overnight Hacking Begins', location: 'Student Center' },
    { time: '10:30 PM', event: 'Officer Led Workshop', location: 'Student Center' },
  ];

  const saturdaySchedule = [
    { time: '12:00 - 1:00 AM', event: 'Midnight Snacks', location: 'Student Center' },
    { time: '7:00 - 8:00 AM', event: 'Breakfast', location: 'Student Center' },
    { time: '8:00 - 10:00 AM', event: 'Indy Hackers Workshop', location: 'Student Center' },
    { time: '10:00 - 11:00 AM', event: 'Amway Workshop', location: 'Student Center' },
    { time: '11:00 - 12:00 PM', event: 'Unity VR Workshop', location: 'Student Center' },
    { time: '12:00 - 1:00 PM', event: 'Lunch', location: 'Student Center' },
    { time: '1:00 - 5:00 PM', event: 'Employer Networking Fair', location: 'Student Center' },
    { time: '5:00 - 6:00 PM', event: 'Tech Engineering Panel', location: 'Student Center' },
    { time: '6:00 - 7:00 PM', event: 'Dinner', location: 'Student Center' },
    { time: '7:00 - 9:00 PM', event: 'Video Game Tournament', location: 'Student Center' },
    { time: '10:00 PM', event: 'Overnight Hacking Continues', location: 'Student Center' },
  ];

  const sundaySchedule = [
    { time: '12:00 - 1:00 AM', event: 'Midnight Snacks', location: 'Student Center' },
    { time: '7:00 - 8:00 AM', event: 'Breakfast', location: 'Student Center' },
    { time: '8:00 - 12:00 PM', event: 'Hacking Continues', location: 'Student Center' },
    { time: '12:00 - 1:00 PM', event: 'Lunch', location: 'Student Center' },
    { time: '1:00 - 4:00 PM', event: 'Hacking Continues', location: 'Student Center' },
    { time: '4:00 PM', event: 'Project Submissions', location: 'Devpost Website' },
    { time: '4:00 - 6:00 PM', event: 'Judging Symposium', location: 'Student Center' },
    { time: '6:00 - 8:00 PM', event: 'Dinner', location: 'Student Center' },
    { time: '8:00 - 10:00 PM', event: 'Closing Ceremony', location: 'Student Center' },
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
                { href: '#schedule', label: 'Schedule', Icon: Icons.Clock },
                { href: '#prizes', label: 'Prizes', Icon: Icons.Trophy },
                { href: '#faq', label: 'FAQ', Icon: Icons.Question },
                { href: '#sponsors', label: 'Sponsors', Icon: Icons.Wrench },
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
              {/* CTA Button - hidden when hamburger is shown */}
              <a
                href="https://forms.gle/your-interest-form-link"
                target="_blank"
                rel="noopener noreferrer"
                className="racing-btn text-sm py-1.5 px-3 hidden md:block nav-cta-btn"
              >
                Apply Now
              </a>

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
              { href: '#schedule', label: 'Schedule', Icon: Icons.Clock },
              { href: '#prizes', label: 'Prizes', Icon: Icons.Trophy },
              { href: '#faq', label: 'FAQ', Icon: Icons.Question },
              { href: '#sponsors', label: 'Sponsors', Icon: Icons.Wrench },
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
            <a
              href="https://forms.gle/your-interest-form-link"
              target="_blank"
              rel="noopener noreferrer"
              className="racing-btn text-base py-3 px-6 mt-4 w-full text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Apply Now
            </a>
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

          {/* Registration Badge */}
          <div className="flex justify-center mb-8 animate-fade-in-up delay-100">
            <span className="racing-badge registration-badge">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Registration Open
            </span>
          </div>

          {/* Main Title */}
          <h1 className="font-racing text-4xl sm:text-6xl md:text-8xl lg:text-9xl mb-4 animate-fade-in-up delay-200">
            <span className="racing-title">HACK</span>
            <span className="hero-indy-text">INDY</span>
          </h1>

          <h2 className="font-racing text-3xl sm:text-5xl md:text-7xl lg:text-8xl mb-6 sm:mb-8 animate-fade-in-up delay-300" style={{ color: 'var(--racing-gold)' }}>
            2026
          </h2>

          {/* Location & Date Badges */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-10 animate-fade-in-up delay-400">
            <span className="racing-badge text-xs sm:text-sm">
              <Icons.MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              Purdue Indy
            </span>
            <span className="racing-badge text-xs sm:text-sm">
              <Icons.Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              Fri 3/27 - Sun 3/29
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 sm:gap-4 justify-center items-center animate-fade-in-up delay-500 px-4">
            <a
              href="https://forms.gle/your-interest-form-link"
              target="_blank"
              rel="noopener noreferrer"
              className="racing-btn text-sm sm:text-lg px-6 sm:px-10 py-3 sm:py-4 flex items-center justify-center gap-2 sm:gap-3 w-full max-w-xs sm:w-72"
            >
              <Icons.Flag className="w-4 h-4 sm:w-5 sm:h-5" />
              Start Your Engines
            </a>
            <a
              href="https://devpost.com/hackindy2026"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full max-w-xs sm:w-72 text-center px-6 sm:px-10 py-3 sm:py-4 text-sm sm:text-lg font-semibold border-2 rounded flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 hover:bg-[rgba(212,168,83,0.15)] hover:scale-105"
              style={{
                borderColor: 'var(--racing-gold)',
                color: 'var(--racing-gold)',
                background: 'rgba(212,168,83,0.05)'
              }}
            >
              View Devpost →
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-float">
          <div className="w-6 h-10 rounded-full border-2 flex justify-center pt-2" style={{ borderColor: 'var(--border-gold)' }}>
            <div className="w-1 h-2 rounded-full animate-pulse" style={{ background: 'var(--racing-gold)' }}></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Energy */}
            <div className="stats-card scroll-animate animate-pulse-glow">
              <div className="stats-icon" style={{ color: 'var(--racing-gold)' }}>
                <Icons.Bolt className="w-5 h-5" />
              </div>
              <div className="stats-label">Energy</div>
              <div className="stats-value" style={{ color: 'var(--racing-gold)' }}>MAXIMUM</div>
            </div>

            {/* Hackers */}
            <div className="stats-card scroll-animate" style={{ animationDelay: '0.1s' }}>
              <div className="stats-icon" style={{ color: 'var(--racing-gold)' }}>
                <Icons.Users className="w-5 h-5" />
              </div>
              <div className="stats-label">Hackers</div>
              <div className="stats-value">200+</div>
            </div>

            {/* Prizes */}
            <div className="stats-card scroll-animate" style={{ animationDelay: '0.2s' }}>
              <div className="stats-icon" style={{ color: 'var(--racing-gold)' }}>
                <Icons.Dollar className="w-5 h-5" />
              </div>
              <div className="stats-label">Prizes</div>
              <div className="stats-value" style={{ color: 'var(--racing-gold)' }}>$5K+</div>
            </div>
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
              Hack Indy is Purdue University in Indianapolis' largest student-run hackathon, bringing together over 200 students across countless majors to compete in a three-day overnight hackathon for exciting prizes. Open to everyone—no matter your experience level—Hack Indy is designed to provide an inclusive and impactful experience for all participants.
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

      {/* Schedule Section - Horizontal Timeline */}
      <section id="schedule" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 scroll-animate">
            <h2 className="section-header">
              Race Weekend
            </h2>
            <p className="mt-6 text-lg" style={{ color: 'var(--text-secondary)' }}>
              3 days • 48+ hours of hacking • Endless possibilities
            </p>
          </div>

          {/* Scroll Controls */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Scroll or drag →
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => scrollSchedule('left')}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-[rgba(212,168,83,0.2)] hover:scale-110"
                style={{ border: '2px solid var(--border-gold)', color: 'var(--racing-gold)' }}
              >
                <Icons.ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollSchedule('right')}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-[rgba(212,168,83,0.2)] hover:scale-110"
                style={{ border: '2px solid var(--border-gold)', color: 'var(--racing-gold)' }}
              >
                <Icons.ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Full-width Horizontal Scroll Container */}
        <div
          ref={scheduleRef}
          className="schedule-timeline"
        >
          {/* Race Track Line */}
          <div className="race-track-line" />

          {/* Starting Flag */}
          <div className="timeline-marker timeline-start">
            <div className="marker-flag">
              <Icons.Flag className="w-6 h-6" />
            </div>
            <span className="marker-label">START</span>
          </div>

          {/* Friday Day Marker */}
          <div className="day-marker">
            <div className="day-marker-badge">
              <Icons.Flag className="w-5 h-5" />
              <span>FRI 3/27</span>
            </div>
            <div className="day-marker-subtitle">Race Day 1</div>
          </div>

          {/* Friday Events */}
          {fridaySchedule.map((item, idx) => (
            <div key={`fri-${idx}`} className="event-card-wrapper" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="event-card">
                <div className="event-time">
                  <Icons.Clock className="w-3 h-3" />
                  <span>{item.time}</span>
                </div>
                <h4 className="event-title">{item.event}</h4>
                <p className="event-location">
                  <Icons.MapPin className="w-3 h-3" />
                  {item.location}
                </p>
              </div>
              <div className="event-pip" />
            </div>
          ))}

          {/* Saturday Day Marker */}
          <div className="day-marker">
            <div className="day-marker-badge day-marker-saturday">
              <Icons.Wrench className="w-5 h-5" />
              <span>SAT 3/28</span>
            </div>
            <div className="day-marker-subtitle">Race Day 2</div>
          </div>

          {/* Saturday Events */}
          {saturdaySchedule.map((item, idx) => (
            <div key={`sat-${idx}`} className="event-card-wrapper" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="event-card">
                <div className="event-time">
                  <Icons.Clock className="w-3 h-3" />
                  <span>{item.time}</span>
                </div>
                <h4 className="event-title">{item.event}</h4>
                <p className="event-location">
                  <Icons.MapPin className="w-3 h-3" />
                  {item.location}
                </p>
              </div>
              <div className="event-pip" />
            </div>
          ))}

          {/* Sunday Day Marker */}
          <div className="day-marker">
            <div className="day-marker-badge day-marker-sunday">
              <Icons.Trophy className="w-5 h-5" />
              <span>SUN 3/29</span>
            </div>
            <div className="day-marker-subtitle">Victory Lap</div>
          </div>

          {/* Sunday Events */}
          {sundaySchedule.map((item, idx) => (
            <div key={`sun-${idx}`} className="event-card-wrapper" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="event-card">
                <div className="event-time">
                  <Icons.Clock className="w-3 h-3" />
                  <span>{item.time}</span>
                </div>
                <h4 className="event-title">{item.event}</h4>
                <p className="event-location">
                  <Icons.MapPin className="w-3 h-3" />
                  {item.location}
                </p>
              </div>
              <div className="event-pip" />
            </div>
          ))}

          {/* Finish Flag */}
          <div className="timeline-marker timeline-finish">
            <div className="marker-flag checkered">
              <Icons.Trophy className="w-6 h-6" />
            </div>
            <span className="marker-label">FINISH</span>
          </div>

          {/* Extra padding at end for scroll */}
          <div className="w-16 flex-shrink-0" />
        </div>

        {/* Gradient Overlays for smooth edges */}
        <div className="schedule-fade-left" />
        <div className="schedule-fade-right" />
      </section>

      {/* Prizes Section */}
      <section id="prizes" className="py-24 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 scroll-animate">
            <h2 className="section-header">
              Victory Lane
            </h2>
            <p className="mt-4 text-lg" style={{ color: 'var(--text-secondary)' }}>
              Over $5,000+ in prizes await the winners
            </p>
          </div>

          {/* Podium Layout */}
          <div className="podium-container scroll-animate">
            {/* 2nd Place - Left */}
            <div className="podium-place podium-second">
              <div className="podium-card">
                <div className="podium-position">2</div>
                <div className="podium-icon">
                  <Icons.Medal className="w-10 h-10" />
                </div>
                <h3 className="podium-title">2nd Place</h3>
                <p className="podium-subtitle">Runner Up</p>
                <div className="podium-prize">TBA</div>
              </div>
              <div className="podium-stand podium-stand-2">
                <span>II</span>
              </div>
            </div>

            {/* 1st Place - Center (Elevated) */}
            <div className="podium-place podium-first">
              <div className="podium-card podium-card-champion">
                <div className="champion-glow"></div>
                <div className="podium-position podium-position-gold">1</div>
                <div className="podium-icon podium-icon-champion">
                  <Icons.Trophy className="w-14 h-14" />
                </div>
                <h3 className="podium-title podium-title-champion">Grand Prize</h3>
                <p className="podium-subtitle">1st Place Overall Winner</p>
                <div className="podium-prize podium-prize-champion">TBA</div>
              </div>
              <div className="podium-stand podium-stand-1">
                <span>I</span>
              </div>
            </div>

            {/* 3rd Place - Right */}
            <div className="podium-place podium-third">
              <div className="podium-card">
                <div className="podium-position">3</div>
                <div className="podium-icon">
                  <Icons.Medal className="w-10 h-10" />
                </div>
                <h3 className="podium-title">3rd Place</h3>
                <p className="podium-subtitle">Second Runner Up</p>
                <div className="podium-prize">TBA</div>
              </div>
              <div className="podium-stand podium-stand-3">
                <span>III</span>
              </div>
            </div>
          </div>

          <p className="text-center mt-12 text-sm" style={{ color: 'var(--text-muted)' }}>
            + Sponsor prizes and special categories announced at the event!
          </p>
        </div>
      </section>

      {/* Pit Stop Intel - FAQ Section */}
      <section id="faq" className="py-24 px-4 relative">
        <div className="max-w-5xl mx-auto">
          {/* Header with Radio Wave Animation */}
          <div className="pit-stop-header mb-16 scroll-animate">
            <div className="radio-wave">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <h2>Pit Stop Intel</h2>
            <div className="radio-wave">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          {/* Transmission Cards Grid */}
          <div className="faq-grid scroll-animate">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`transmission-card faq-card-animate ${openFAQ === index ? 'active' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className="transmission-header"
                  onClick={() => toggleFAQ(index)}
                >
                  {/* Channel Badge */}
                  <div className="channel-badge">
                    <span className="channel-label">CH</span>
                    <span className="channel-number">{String(index + 1).padStart(2, '0')}</span>
                  </div>

                  {/* Transmission Indicator Light */}
                  <div className="transmission-indicator"></div>

                  {/* Question */}
                  <span className="transmission-question">{faq.question}</span>

                  {/* Toggle Icon */}
                  <div className="transmission-toggle">
                    <Icons.ChevronDown className="w-4 h-4" />
                  </div>
                </div>

                {/* Answer Body */}
                <div className="transmission-body">
                  <div className="transmission-content">
                    <p className="transmission-answer">
                      {faq.answer}
                      {index === 2 && (
                        <span>
                          {' '}
                          <a
                            href="https://forms.gle/your-interest-form-link"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Interest form
                          </a>
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Signal Strength Bars */}
                  <div className="signal-strength">
                    <div className="signal-bar"></div>
                    <div className="signal-bar"></div>
                    <div className="signal-bar"></div>
                    <div className="signal-bar"></div>
                    <div className="signal-bar"></div>
                  </div>
                </div>
              </div>
            ))}
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
                  <img
                    src={`/sponsors/${sponsor.logo}`}
                    alt={sponsor.name}
                    className="max-w-full max-h-full object-contain"
                  />
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
                href="https://devpost.com/hackindy2026"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm transition-colors hover:text-[var(--racing-gold)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                Devpost
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}