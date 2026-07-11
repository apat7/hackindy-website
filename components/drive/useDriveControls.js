"use client";

import { useEffect, useRef } from "react";

const KEYMAP = {
  KeyW: "up",
  ArrowUp: "up",
  KeyS: "down",
  ArrowDown: "down",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  Space: "handbrake",
};

export default function useDriveControls() {
  const keys = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
    handbrake: false,
  });

  useEffect(() => {
    const down = (e) => {
      const k = KEYMAP[e.code];
      if (!k) return;
      e.preventDefault(); // keep space/arrows from scrolling
      keys.current[k] = true;
    };
    const up = (e) => {
      const k = KEYMAP[e.code];
      if (k) keys.current[k] = false;
    };
    const clear = () => {
      for (const k of Object.keys(keys.current)) keys.current[k] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, []);

  return keys;
}
