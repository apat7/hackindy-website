'use client';

// Racing/Garage themed SVG Icons for retro racing website

export const Icons = {
    // Racing flag for start/checkered
    Flag: ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 2v20h2v-8h14l-2-4 2-4H6V2H4zm2 4h11.17l-1.5 3 1.5 3H6V6z" />
        </svg>
    ),

    // Location pin
    MapPin: ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    ),

    // Calendar
    Calendar: ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    ),

    // Lightning bolt for energy
    Bolt: ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
    ),

    // Users/People
    Users: ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
    ),

    // Trophy for prizes
    Trophy: ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 8a2 2 0 100-4 2 2 0 000 4z" />
            <path d="M19 4h-2a7 7 0 01-14 0H1v3a3 3 0 003 3h1.1a7.01 7.01 0 005.9 5.9V18H9a1 1 0 100 2h6a1 1 0 100-2h-2v-2.1A7.01 7.01 0 0018.9 10H20a3 3 0 003-3V4h-4zM4 8V6h1a7.05 7.05 0 001.02 2H4zm16 0h-2.02A7.05 7.05 0 0019 6h1v2z" />
        </svg>
    ),

    // Dollar sign for money
    Dollar: ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
    ),

    // Clock/Timer
    Clock: ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
        </svg>
    ),

    // Wrench for garage/tools
    Wrench: ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
        </svg>
    ),

    // Question mark for FAQ
    Question: ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),

    // Speedometer/gauge
    Gauge: ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
            <path d="M12 6v6l4 2" />
        </svg>
    ),

    // Star for best/awards
    Star: ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
    ),

    // Medal for 2nd/3rd place
    Medal: ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="15" r="6" />
            <path d="M8.21 13.89L7 4h10l-1.21 9.89" />
            <path d="M12 9v6" />
            <path d="M9 15h6" />
        </svg>
    ),

    // Gas can for garage
    GasCan: ({ className = "w-8 h-10" }: { className?: string }) => (
        <svg className={className} viewBox="0 0 60 80" fill="currentColor">
            <rect x="10" y="20" width="40" height="50" rx="5" />
            <rect x="20" y="8" width="20" height="15" rx="3" />
            <rect x="0" y="40" width="15" height="20" rx="3" />
            <rect x="18" y="35" width="24" height="4" rx="1" />
            <rect x="18" y="45" width="24" height="4" rx="1" />
            <rect x="18" y="55" width="24" height="4" rx="1" />
        </svg>
    ),

    // Oil can for garage
    OilCan: ({ className = "w-10 h-8" }: { className?: string }) => (
        <svg className={className} viewBox="0 0 80 60" fill="currentColor">
            <ellipse cx="35" cy="35" rx="25" ry="20" />
            <path d="M55 25 L75 15 L75 25 L60 32 Z" />
            <rect x="15" y="10" width="15" height="12" rx="2" />
            <circle cx="35" cy="35" r="8" fill="none" stroke="currentColor" strokeWidth="3" />
        </svg>
    ),

    // Tire for garage
    Tire: ({ className = "w-8 h-8" }: { className?: string }) => (
        <svg className={className} viewBox="0 0 60 60" fill="currentColor">
            <circle cx="30" cy="30" r="28" fill="none" stroke="currentColor" strokeWidth="4" />
            <circle cx="30" cy="30" r="18" fill="none" stroke="currentColor" strokeWidth="4" />
            <circle cx="30" cy="30" r="8" />
            <line x1="30" y1="12" x2="30" y2="22" stroke="currentColor" strokeWidth="3" />
            <line x1="30" y1="38" x2="30" y2="48" stroke="currentColor" strokeWidth="3" />
            <line x1="12" y1="30" x2="22" y2="30" stroke="currentColor" strokeWidth="3" />
            <line x1="38" y1="30" x2="48" y2="30" stroke="currentColor" strokeWidth="3" />
        </svg>
    ),

    // Steering wheel
    SteeringWheel: ({ className = "w-6 h-6" }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="3" />
            <path d="M12 3v6" />
            <path d="M5.5 17.5l4.5-3" />
            <path d="M18.5 17.5l-4.5-3" />
        </svg>
    ),

    // Arrow left
    ArrowLeft: ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12,19 5,12 12,5" />
        </svg>
    ),

    // Arrow right
    ArrowRight: ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12,5 19,12 12,19" />
        </svg>
    ),

    // Instagram
    Instagram: ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
    ),

    // Discord
    Discord: ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
        </svg>
    ),

    // Chevron Left
    ChevronLeft: ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15,18 9,12 15,6" />
        </svg>
    ),

    // Chevron Right
    ChevronRight: ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9,6 15,12 9,18" />
        </svg>
    ),

    // Chevron Down
    ChevronDown: ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6,9 12,15 18,9" />
        </svg>
    ),
};

export default Icons;
