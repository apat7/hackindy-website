# Hack Indy 2026 Website

The official website for **Hack Indy 2026** — Purdue University Indianapolis' largest student-run hackathon.

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss)

## 🏁 About

Hack Indy brings together 200+ students from all majors for a three-day overnight hackathon featuring:

- **Industry Workshops** — Learn from top tech companies
- **Engineering Panels** — Network with Indianapolis tech executives  
- **$5,000+ in Prizes** — Compete for exciting rewards
- **Video Game Tournaments** — Have fun between hacking sessions
- **Free Food & Swag** — All meals included

**Event Date:** March 27-29, 2026  
**Location:** Purdue University Indianapolis Student Center

## 🏎️ Design

The website features a **retro racing theme** inspired by the Indianapolis 500, including:

- Racing-inspired typography with pixelated fonts
- Animated start lights and checkered flags
- Horizontal timeline schedule styled as a race track
- "Pit Stop Intel" FAQ section with radio transmission aesthetics
- "Sponsors Garage" with decorative racing elements
- Interactive Purdue logo sticker with peel effect
- Scanline overlays and racing grid backgrounds

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx        # Main page entry
│   ├── layout.tsx      # Root layout with metadata
│   ├── globals.css     # Global styles & racing theme
│   ├── Icons.tsx       # Custom SVG icon components
│   └── team/           # Team page
├── components/
│   ├── LandingPage.tsx # Main landing page component
│   └── FaultyTerminal.tsx # Animated background effect
└── lib/
    └── utils.ts        # Utility functions
```

## 🛠️ Tech Stack

- **Framework:** Next.js 15.5 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS 4 + Custom CSS
- **Animations:** GSAP, CSS Keyframes
- **Components:** Custom SVG icons, Interactive sticker peel

## 📸 Features

- **Responsive Design** — Works on all devices
- **SEO Optimized** — Server-side rendering with metadata
- **Accessible** — Semantic HTML and keyboard navigation
- **Performance** — Optimized images and lazy loading
- **Easter Eggs** — Hidden Purdue-themed surprises

## 🤝 Contributing

This project is maintained by the Hack Indy organizing team. For questions or to get involved, reach out through our official channels.

## 📄 License

© 2026 Hack Indy • Purdue University Indianapolis

---

**Start Your Engines 🏁**
