"use client";

import { useState } from "react";
import { TUNING as T } from "./tuning";

// Live feel knobs. Sliders mutate TUNING directly — the physics reads it
// every frame, so changes apply instantly. RESET restores the defaults
// captured at load time.
const DEFAULTS = JSON.parse(JSON.stringify(T));
const FIELDS = [
  ["maxSpeed", 10, 50, 1],
  ["engineAccel", 8, 50, 1],
  ["steerRate", 1, 6, 0.1],
  ["steerFalloff", 0, 0.05, 0.002],
  ["grip", 2, 12, 0.25],
  ["driftGrip", 0.5, 6, 0.1],
  ["slipScrub", 0, 2, 0.05],
  ["handbrakeDecel", 0, 12, 0.5],
  ["camLerp", 1, 12, 0.5],
  ["fovBase", 40, 70, 1],
  ["fovSpan", 0, 30, 1],
];

function Slider({ label, value, min, max, step, onChange }) {
  return (
    <label className="mb-2 block">
      <span className="flex justify-between">
        <span>{label}</span>
        <span className="text-gold">{Number(value.toFixed(3))}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        className="w-full"
        style={{ accentColor: "#CFB991" }}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </label>
  );
}

export default function TuningPanel() {
  const [open, setOpen] = useState(false);
  const [, bump] = useState(0);
  const refresh = () => bump((n) => n + 1);

  return (
    <div className="pointer-events-auto absolute top-20 right-6 text-[0.58rem] tracking-[0.15em] text-steel">
      <button
        type="button"
        className="btn-plate btn-plate--compact float-right"
        onClick={(e) => {
          setOpen(!open);
          e.currentTarget.blur();
        }}
      >
        <span>{open ? "CLOSE ✕" : "TUNING"}</span>
      </button>

      {open && (
        <div className="clear-both mt-10 max-h-[70vh] w-60 overflow-y-auto border border-gold-dim/60 bg-coal/90 p-3 backdrop-blur">
          {FIELDS.map(([key, min, max, step]) => (
            <Slider
              key={key}
              label={key.toUpperCase()}
              value={T[key]}
              min={min}
              max={max}
              step={step}
              onChange={(v) => {
                T[key] = v;
                refresh();
              }}
            />
          ))}
          <Slider
            label="CAM HEIGHT"
            value={T.camOffset[1]}
            min={4}
            max={20}
            step={0.5}
            onChange={(v) => {
              T.camOffset[1] = v;
              refresh();
            }}
          />
          <Slider
            label="CAM DISTANCE"
            value={T.camOffset[2]}
            min={5}
            max={26}
            step={0.5}
            onChange={(v) => {
              T.camOffset[2] = v;
              refresh();
            }}
          />
          <button
            type="button"
            className="mt-1 w-full border border-gold-dim/60 py-1.5 text-gold hover:bg-gold hover:text-coal"
            onClick={(e) => {
              for (const [k, v] of Object.entries(DEFAULTS)) {
                T[k] = Array.isArray(v) ? [...v] : v;
              }
              refresh();
              e.currentTarget.blur();
            }}
          >
            RESET DEFAULTS
          </button>
        </div>
      )}
    </div>
  );
}
