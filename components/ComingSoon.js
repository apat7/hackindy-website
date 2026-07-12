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
    <main className="relative flex h-dvh w-full flex-col overflow-hidden bg-coal text-chalk select-none">
      {/* MLH trust badge — official embed, must hang from the top edge.
          Hidden below 640px (owner-accepted deviation from MLH placement). */}
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

      {/* background paint layer — full-bleed particle canvas; the spacer row
          below reserves the region where the wordmark text lands */}
      {!covered && (
        <ParticleText
          text="HACK INDY"
          centerY={0.24}
          className="font-display pointer-events-none absolute inset-0 z-0 h-full w-full"
        />
      )}

      {/* car paint layer — full viewport like the wordmark, so orbit tilt has
          headroom in every direction; the flex-1 spacer below reserves its
          at-rest band in the flow */}
      {!covered && (
        <IndyCarCanvas
          className="anim-rise absolute inset-0 z-10"
          onEnterDrive={canDrive ? enterDrive : undefined}
        />
      )}

      {covered ? (
        <div className="flex-1" />
      ) : (
        <>
          {/* spacer matching the wordmark text region (paired with centerY) */}
          <div aria-hidden="true" className="h-[33dvh] flex-none sm:h-[31dvh]" />

          <div
            aria-hidden="true"
            className="anim-rise z-[1] flex flex-none justify-center"
            style={{ animationDelay: "0.5s" }}
          >
            <span
              className="font-display font-bold leading-none text-chalk"
              style={{
                fontSize: "clamp(2.75rem, 7vw, 5.5rem)",
                letterSpacing: "0.28em",
                textIndent: "0.28em",
              }}
            >
              2027
            </span>
          </div>

          {/* car band spacer — the footer flows below it, so text keeps clear
              of the car at rest on any screen height */}
          <div aria-hidden="true" className="min-h-0 flex-1" />
        </>
      )}

      {/* chrome — flows after the car band; pointer-events-none so orbit
          drags pass through to the car canvas underneath (buttons opt back
          in), matching the original layered behavior */}
      <div
        className="pointer-events-none z-20 flex flex-none flex-col items-center font-mono"
        style={{ paddingBottom: "max(3rem, env(safe-area-inset-bottom))" }}
      >
        <p
          className="anim-rise mb-6 text-center text-[0.6rem] tracking-[0.5em] text-steel"
          style={{ animationDelay: "1.4s", textIndent: "0.5em" }}
        >
          {finePointer
            ? `DRAG TO INSPECT${canDrive ? " · CLICK TO DRIVE" : ""}`
            : "TOUCH TO SPIN"}
        </p>

        <div className="anim-rise text-center" style={{ animationDelay: "0.7s" }}>
          <h1 className="font-display text-2xl font-bold tracking-[0.18em] text-chalk sm:text-3xl">
            COMING SOON
          </h1>
          <p className="mt-2 text-[0.65rem] tracking-[0.35em] text-steel">
            SPRING 2027 · INDIANAPOLIS, IN
          </p>
        </div>

        <nav
          className="anim-rise mt-6 grid w-full max-w-sm grid-cols-2 gap-3 px-6 sm:mt-7 sm:flex sm:w-auto sm:max-w-none sm:gap-4 sm:px-0"
          style={{ animationDelay: "0.85s" }}
          aria-label="Primary"
        >
          <div className="col-span-2 flex justify-center sm:order-2 sm:col-auto">
            <UpdateMe />
          </div>
          <a href="/2026" className="btn-plate pointer-events-auto sm:order-1">
            <span>2026 SEASON</span>
          </a>
          <CopyEmailButton />
        </nav>
      </div>

      {/* the drive world */}
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
