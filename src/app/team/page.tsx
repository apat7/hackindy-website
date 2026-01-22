'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Icons } from '../Icons';

export default function TeamPage() {
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

  const officers = [
    {
      name: "Om Janamanchi",
      title: "Co-President",
      major: "Computer Science",
      interests: "Swimming, Chess, Netflix",
      email: "ojanaman@purdue.edu",
      linkedin: "https://www.linkedin.com/in/omjanamanchi/",
      image: "/team/om-janamanchi.jpg"
    },
    {
      name: "Abha Gupta",
      title: "Co-President",
      major: "Computer Science",
      interests: "Leadership, Technology, Innovation",
      email: "gupt1107@purdue.edu",
      linkedin: "https://www.linkedin.com/in/abha-gupta/",
      image: "/team/abha-gupta.jpg"
    },
    {
      name: "Emily Zheng",
      title: "Treasurer",
      major: "Computer Science",
      interests: "Video Games (Stardew, Hollow Knight) & arts, music",
      email: "zheng849@purdue.edu",
      linkedin: "https://www.linkedin.com/in/emily-zheng-054890338/",
      image: "/team/emily-zheng.jpg"
    },
    {
      name: "Ashwati Palanivel",
      title: "Secretary",
      major: "Computer Science",
      interests: "Crocheting and Movies!",
      email: "palaniv1@purdue.edu",
      linkedin: "https://www.linkedin.com/in/ashwatipalanivel/",
      image: "/team/ashwati-palanivel.jpg"
    },
    {
      name: "Ruthu Shankar",
      title: "Outreach Coordinator",
      major: "Computer Science",
      interests: "Cooking, Cycling, Dancing",
      email: "shanka61@purdue.edu",
      linkedin: "https://www.linkedin.com/in/shankarruthu/",
      image: "/team/ruthu-shankar.jpg"
    },
    {
      name: "Shely Dash",
      title: "Outreach Coordinator",
      major: "Computer Science",
      interests: "Community Building, Technology",
      email: "sdash@purdue.edu",
      linkedin: "https://www.linkedin.com/in/shely-dash/",
      image: "/team/shely-dash.jpg"
    },
    {
      name: "Hana Zoaib",
      title: "Social Media Coordinator",
      major: "Data Science",
      interests: "Gym and reading",
      email: "hzoaib@purdue.edu",
      linkedin: "https://www.linkedin.com/in/hana-zoaib-7233b4345/",
      image: "/team/hana-zoaib.jpg"
    },
    {
      name: "Oluwatomi Oladunni",
      title: "Social Media Coordinator",
      major: "Computer Science BS",
      interests: "Reading, Playing FIFA, Cooking, and Entrepreneurship",
      email: "ooladunn@purdue.edu",
      linkedin: "https://www.linkedin.com/in/oluwatomi-oladunni-685708214/",
      image: "/team/oluwatomi-oladunni.jpg"
    },
    {
      name: "Richin Mrudul",
      title: "Webmaster",
      major: "Computer Science",
      interests: "Sacramento Kings, Gym, Cooking, Music",
      email: "rmrudul@purdue.edu",
      linkedin: "https://www.linkedin.com/in/richinmrudul/",
      image: "/team/richin-mrudul.jpg"
    },
    {
      name: "Aditya Raj Pundir",
      title: "Executive Member",
      major: "Computer Science",
      interests: "Technology, Leadership",
      email: "apundir@purdue.edu",
      linkedin: "https://www.linkedin.com/in/aditya-raj-pundir/",
      image: "/team/aditya-raj-pundir.jpg"
    },
    {
      name: "Aryaman Patel",
      title: "Underclassmen Rep",
      major: "Computer Science",
      interests: "Rock climbing and watching sports",
      email: "pate2794@purdue.edu",
      linkedin: "https://www.linkedin.com/in/aryamanp7/",
      image: "/team/aryaman-patel.jpg"
    }
  ];

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--bg-primary)' }}>
      {/* Racing Grid Background */}
      <div className="racing-grid-bg"></div>
      <div className="scanline-overlay"></div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full glass z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 cursor-pointer group"
            >
              <span className="font-racing text-lg relative" style={{ color: 'var(--racing-gold)' }}>
                HACK<span style={{ color: 'var(--text-primary)', marginLeft: '0.5rem' }}>INDY</span>
              </span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              {[
                { href: '/#about', label: 'About', Icon: Icons.Flag },
                { href: '/#schedule', label: 'Schedule', Icon: Icons.Clock },
                { href: '/#prizes', label: 'Prizes', Icon: Icons.Trophy },
                { href: '/#faq', label: 'FAQ', Icon: Icons.Question },
                { href: '/#sponsors', label: 'Sponsors', Icon: Icons.Wrench },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 text-sm font-medium transition-colors duration-300 hover:text-[var(--racing-gold)]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <link.Icon className="w-3 h-3" />
                  {link.label}
                </Link>
              ))}
              <span
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: 'var(--racing-gold)' }}
              >
                <Icons.Users className="w-3 h-3" />
                Team
              </span>
            </div>

            {/* CTA Button */}
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSctlCayXv6TgBrIyFqtxw2hcVRwAI3RqJP9dsAMW-_AKgbDBg/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="racing-btn text-sm py-1.5 px-3"
            >
              Apply Now
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 relative">
        <div className="max-w-5xl mx-auto text-center">
          {/* Pit Crew Badge */}
          <div className="flex justify-center mb-8 animate-fade-in-up">
            <span className="racing-badge">
              <Icons.Wrench className="w-4 h-4" />
              The Pit Crew
            </span>
          </div>

          {/* Main Title */}
          <h1 className="font-racing text-5xl md:text-7xl lg:text-8xl mb-6 animate-fade-in-up delay-100">
            <span className="racing-title">MEET THE</span>
            <span style={{ color: 'var(--text-primary)', marginLeft: '1rem' }}>TEAM</span>
          </h1>

          <p className="text-lg md:text-xl mb-8 animate-fade-in-up delay-200" style={{ color: 'var(--text-secondary)' }}>
            The engineers behind Hack Indy 2026
          </p>

          {/* Back to Home Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm transition-colors duration-300 hover:text-[var(--racing-gold)] animate-fade-in-up delay-300"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Icons.ArrowLeft className="w-4 h-4" />
            Back to Race HQ
          </Link>
        </div>
      </section>

      {/* Officers Grid */}
      <section className="py-16 px-4 relative">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 scroll-animate">
            <h2 className="section-header">
              <Icons.Flag className="w-6 h-6" />
              Officers
              <Icons.Flag className="w-6 h-6" />
            </h2>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {officers.map((officer, index) => (
              <div
                key={index}
                className="racing-card corner-accent p-6 scroll-animate group"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Profile Image */}
                <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 transition-all duration-300 group-hover:border-[var(--border-gold-strong)] group-hover:shadow-[0_0_20px_rgba(212,168,83,0.3)]" style={{ borderColor: 'var(--border-gold)' }}>
                  <img
                    src={officer.image}
                    alt={officer.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                  />
                  <div
                    className="absolute inset-0 items-center justify-center font-racing text-lg hidden"
                    style={{
                      background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
                      color: 'var(--racing-gold)'
                    }}
                  >
                    {officer.name.split(' ').map(word => word[0]).join('')}
                  </div>
                </div>

                {/* Name & Title */}
                <h3 className="font-racing text-sm text-center mb-1" style={{ color: 'var(--text-primary)' }}>
                  {officer.name}
                </h3>
                <p className="text-center text-sm font-medium mb-2" style={{ color: 'var(--racing-gold)' }}>
                  {officer.title}
                </p>

                {/* Major */}
                <p className="text-center text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                  {officer.major}
                </p>

                {/* Interests */}
                <p className="text-center text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {officer.interests}
                </p>

                {/* Links */}
                <div className="flex flex-col gap-2">
                  <a
                    href={`mailto:${officer.email}`}
                    className="flex items-center justify-center gap-2 text-xs transition-colors duration-300 hover:text-[var(--racing-gold)]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Icons.Flag className="w-3 h-3" />
                    {officer.email}
                  </a>
                  <a
                    href={officer.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-xs transition-colors duration-300 hover:text-[var(--racing-gold)]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Icons.ArrowRight className="w-3 h-3" />
                    LinkedIn
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join the Team CTA */}
      <section className="py-24 px-4 relative">
        <div className="max-w-3xl mx-auto">
          <div className="racing-card corner-accent p-8 md:p-12 text-center scroll-animate">
            <h3 className="font-racing text-2xl md:text-3xl mb-4" style={{ color: 'var(--racing-gold)' }}>
              JOIN THE PIT CREW
            </h3>
            <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
              Interested in helping organize Hack Indy? We're always looking for passionate students to join our team.
            </p>
            <a
              href="mailto:hackindy@purdue.edu"
              className="racing-btn text-lg px-10 py-4 inline-flex items-center gap-3"
            >
              <Icons.Wrench className="w-5 h-5" />
              Get In Touch
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer py-12 px-4" style={{ borderTop: '1px solid var(--border-gold)' }}>
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
              <Link
                href="/"
                className="text-sm transition-colors hover:text-[var(--racing-gold)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                Home
              </Link>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSctlCayXv6TgBrIyFqtxw2hcVRwAI3RqJP9dsAMW-_AKgbDBg/viewform"
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
                <Icons.Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded flex items-center justify-center transition-colors hover:bg-[rgba(212,168,83,0.2)]"
                style={{ border: '1px solid var(--border-gold)', color: 'var(--racing-gold)' }}
                title="Discord"
              >
                <Icons.Discord className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
