"use client";

import { useEffect, useRef } from "react";

// WASD only — arrow keys suffer key-ghosting on many boards and felt worse
const KEYMAP = {
  KeyW: "up",
  KeyS: "down",
  KeyA: "left",
  KeyD: "right",
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
      if (!k) return;
      // space keyup "clicks" whichever HUD button still holds focus —
      // swallowing it keeps the handbrake a handbrake
      e.preventDefault();
      keys.current[k] = false;
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
