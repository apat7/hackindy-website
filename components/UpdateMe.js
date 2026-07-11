"use client";

import { useRef, useState } from "react";

export default function UpdateMe() {
  const [phase, setPhase] = useState("idle"); // idle | open | sending | done
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const open = () => {
    setPhase("open");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const submit = async (e) => {
    e.preventDefault();
    const email = inputRef.current?.value || "";
    setError("");
    setPhase("sending");
    try {
      const res = await fetch("/api/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Something went wrong — try again.");
      }
      setPhase("done");
    } catch (err) {
      setError(err.message);
      setPhase("open");
      inputRef.current?.focus();
    }
  };

  if (phase === "done") {
    return (
      <p className="plate-note text-gold" role="status">
        YOU&apos;RE ON THE GRID — SEE YOU IN 2027
      </p>
    );
  }

  if (phase === "idle") {
    return (
      <button
        type="button"
        onClick={open}
        className="btn-plate btn-plate--solid pointer-events-auto"
      >
        <span>UPDATE ME</span>
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="pointer-events-auto flex flex-col items-center gap-2"
    >
      <div className="btn-plate btn-plate--form">
        <span>
          <input
            ref={inputRef}
            type="email"
            name="email"
            required
            placeholder="you@purdue.edu"
            aria-label="Email address for HackIndy updates"
            disabled={phase === "sending"}
          />
          <button
            type="submit"
            disabled={phase === "sending"}
            aria-label="Subscribe for updates"
          >
            {phase === "sending" ? "···" : "→"}
          </button>
        </span>
      </div>
      {error && (
        <p className="plate-note text-red-300/80" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
