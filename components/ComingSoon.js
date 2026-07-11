"use client";

import { Component, useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import ParticleText from "./ParticleText";
import IndyCarCanvas from "./IndyCarCanvas";
import UpdateMe from "./UpdateMe";
import useMediaQuery from "./useMediaQuery";

// The whole drive world (rapier WASM included) rides in this chunk — visitors
// who never click the car download none of it.
const DriveMode = dynamic(() => import("./drive/DriveMode"), { ssr: false });

const CONTACT_EMAIL = "csclubindy@purdue.edu";

// If the drive chunk or WASM fails, show a themed apology and bail out.
function PitLaneClosed({ onExit }) {
  useEffect(() => {
    const t = setTimeout(onExit, 1900);
    return () => clearTimeout(t);
  }, [onExit]);
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-coal font-mono">
      <p className="plate-note text-gold">PIT LANE CLOSED — TRY AGAIN LATER</p>
    </div>
  );
}

class DriveBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) return <PitLaneClosed onExit={this.props.onExit} />;
    return this.props.children;
  }
}

function CopyEmailButton() {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
    } catch {
      // clipboard unavailable — fall back to the mail client
      window.location.href = `mailto:${CONTACT_EMAIL}`;
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2200);
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={CONTACT_EMAIL}
      className="btn-plate pointer-events-auto sm:order-3"
    >
      <span aria-live="polite">{copied ? "EMAIL COPIED ✓" : "CONTACT US"}</span>
    </button>
  );
}

export default function ComingSoon() {
  const [driving, setDriving] = useState(false);
  const [covered, setCovered] = useState(false);
  const finePointer = useMediaQuery("(pointer: fine)");
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const canDrive = finePointer;

  const enterDrive = useCallback(() => setDriving(true), []);
  const exitDrive = useCallback(() => {
    setDriving(false);
    setCovered(false);
  }, []);

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-coal text-chalk select-none">
      {/* MLH trust badge — official embed, must hang from the top edge */}
      <a
        id="mlh-trust-badge"
        className="mlh-badge"
        href="https://mlh.io/na?utm_source=na-hackathon&utm_medium=TrustBadge&utm_campaign=2027-season&utm_content=white"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="https://s3.amazonaws.com/logged-assets/trust-badge/2027/mlh-trust-badge-2027-white.svg"
          alt="Major League Hacking 2027 Hackathon Season"
          style={{ width: "100%" }}
        />
      </a>

      {/* layer 0 — particle wordmark (unmounted while the drive world covers it) */}
      {!covered && (
        <ParticleText
          text="HACK INDY"
          centerY={0.24}
          className="font-display absolute inset-0 z-0 h-full w-full"
        />
      )}

      {/* layer 1 — year, sitting right under the wordmark, behind the car */}
      {!covered && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[33%] z-[1] flex justify-center sm:top-[31%]"
        >
          <span
            className="anim-rise font-display font-bold leading-none text-chalk"
            style={{
              fontSize: "clamp(2.75rem, 7vw, 5.5rem)",
              letterSpacing: "0.28em",
              textIndent: "0.28em",
              animationDelay: "0.5s",
            }}
          >
            2027
          </span>
        </div>
      )}

      {/* layer 2 — the car */}
      {!covered && (
        <IndyCarCanvas
          className="anim-rise absolute inset-0 z-10"
          onEnterDrive={canDrive ? enterDrive : undefined}
        />
      )}

      {/* layer 3 — chrome */}
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col font-mono">
        {/* pit-board tag by the car — the rotation lives on the button because
            anim-rise ends at transform:none and would wipe it off the wrapper */}
        {canDrive && !driving && (
          <div
            className="anim-rise pointer-events-none absolute left-[12%] top-[67%]"
            style={{ animationDelay: "4s" }}
          >
            <button
              type="button"
              onClick={enterDrive}
              className="btn-plate btn-plate--compact pointer-events-auto"
              style={{ transform: "rotate(-5deg)" }}
            >
              <span>TAKE IT FOR A SPIN</span>
            </button>
          </div>
        )}
        <div className="flex-1" />

        {/* drag hint, sitting just under the car */}
        <p
          className="anim-rise mb-8 text-center text-[0.6rem] tracking-[0.5em] text-steel"
          style={{ animationDelay: "1.4s", textIndent: "0.5em" }}
        >
          DRAG TO INSPECT{canDrive ? " · CLICK TO DRIVE" : ""}
        </p>

        {/* headline + CTAs */}
        <div className="flex flex-col items-center gap-6 pb-12 sm:gap-7">
          <div
            className="anim-rise text-center"
            style={{ animationDelay: "0.7s" }}
          >
            <h1 className="font-display text-2xl font-bold tracking-[0.18em] text-chalk sm:text-3xl">
              COMING SOON
            </h1>
            <p className="mt-2 text-[0.65rem] tracking-[0.35em] text-steel">
              SPRING 2027 · INDIANAPOLIS, IN
            </p>
          </div>

          <nav
            className="anim-rise flex flex-col items-center gap-3 sm:flex-row sm:gap-4"
            style={{ animationDelay: "0.85s" }}
            aria-label="Primary"
          >
            <div className="flex justify-center sm:order-2">
              <UpdateMe />
            </div>
            <a
              href="/2026"
              className="btn-plate pointer-events-auto sm:order-1"
            >
              <span>2026 SEASON</span>
            </a>
            <CopyEmailButton />
          </nav>
        </div>
      </div>

      {/* layer 4 — the drive world */}
      {driving && (
        <DriveBoundary onExit={exitDrive}>
          <DriveMode
            onExit={exitDrive}
            onCovered={() => setCovered(true)}
            reduceMotion={reduceMotion}
          />
        </DriveBoundary>
      )}
    </main>
  );
}
