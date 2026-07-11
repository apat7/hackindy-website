// Shared IndyCar livery — used by the teaser canvas and drive mode.
// Everything here keys off MESH names, never material names: drei caches the
// loaded scene per URL and React strict mode re-runs traversals, so material
// identity can't be trusted across passes.
import * as THREE from "three";

export const GOLD = "#CFB991";

// Shared livery materials — shiny gold accents over gloss carbon black.
export function makeLivery() {
  return {
    gold: new THREE.MeshPhysicalMaterial({
      color: "#D6C193",
      metalness: 0.8,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      envMapIntensity: 2.2,
      emissive: "#7a6233",
      emissiveIntensity: 0.45,
    }),
    bodyBlack: new THREE.MeshPhysicalMaterial({
      color: "#0d0d0d",
      metalness: 0.5,
      roughness: 0.28,
      clearcoat: 1,
      clearcoatRoughness: 0.2,
      envMapIntensity: 1.1,
    }),
    carbon: new THREE.MeshStandardMaterial({
      color: "#161616",
      metalness: 0.35,
      roughness: 0.55,
    }),
    darkMetal: new THREE.MeshStandardMaterial({
      color: "#2b2d30",
      metalness: 0.9,
      roughness: 0.35,
    }),
    tire: new THREE.MeshStandardMaterial({
      color: "#0b0b0b",
      metalness: 0,
      roughness: 0.95,
    }),
    tireWall: new THREE.MeshStandardMaterial({
      color: "#161616",
      metalness: 0,
      roughness: 0.9,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: "#1c2126",
      metalness: 0.6,
      roughness: 0.05,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    dark: new THREE.MeshStandardMaterial({
      color: "#101010",
      metalness: 0.2,
      roughness: 0.7,
    }),
    rimBlur: new THREE.MeshBasicMaterial({
      color: GOLD,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    }),
  };
}

// Meshes that carry the WCCARBODY paint but should be gold accents
// (nose + wings); the rest of the paint stays gloss black.
const GOLD_BODY_RE = /nosecone|fwing|rwing|winglet/i;

// The louver vents are fused into larger meshes, so they can't be recolored
// by name. Each fin is an isolated island of geometry though: find connected
// components that sit entirely inside a vent zone (mesh-local coords, from
// raycast probing) and route their triangles to the gold material.
const VENT_ZONES = [
  {
    mesh: "indy19_body_max_SUB0_WCCARBODY_0",
    // engine-cover flank grilles, one per side
    boxes: [
      { x: [0.12, 0.55], y: [0.32, 0.6], z: [-0.85, -0.4] },
      { x: [-0.55, -0.12], y: [0.32, 0.6], z: [-0.85, -0.4] },
    ],
  },
  {
    mesh: "indy20_glass_high_SUB1_WCWINDOWSOUT_0",
    // louvers on the rear cockpit-fairing deck
    boxes: [{ x: [-0.5, 0.5], y: [0.55, 0.95], z: [0.3, 1.0] }],
  },
];

function gildVents(mesh, boxes, goldMaterial) {
  if (!mesh || mesh.userData.vformed) return;
  mesh.userData.vformed = true;

  const geom = mesh.geometry;
  const pos = geom.attributes.position;
  const vCount = pos.count;
  const triCount = (geom.index ? geom.index.count : vCount) / 3;
  const vi = (t, k) => (geom.index ? geom.index.getX(t * 3 + k) : t * 3 + k);

  // union-find over vertices, merging duplicates by rounded position
  const parent = new Int32Array(vCount);
  for (let i = 0; i < vCount; i++) parent[i] = i;
  const find = (i) => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  };
  const union = (a, b) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  };
  const byPos = new Map();
  for (let i = 0; i < vCount; i++) {
    const key = `${pos.getX(i).toFixed(4)},${pos.getY(i).toFixed(4)},${pos.getZ(i).toFixed(4)}`;
    const seen = byPos.get(key);
    if (seen === undefined) byPos.set(key, i);
    else union(i, seen);
  }
  for (let t = 0; t < triCount; t++) {
    union(vi(t, 0), vi(t, 1));
    union(vi(t, 0), vi(t, 2));
  }

  // bounding box per component
  const compBox = new Map();
  for (let i = 0; i < vCount; i++) {
    const root = find(i);
    let b = compBox.get(root);
    if (!b) {
      b = [Infinity, -Infinity, Infinity, -Infinity, Infinity, -Infinity];
      compBox.set(root, b);
    }
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    if (x < b[0]) b[0] = x;
    if (x > b[1]) b[1] = x;
    if (y < b[2]) b[2] = y;
    if (y > b[3]) b[3] = y;
    if (z < b[4]) b[4] = z;
    if (z > b[5]) b[5] = z;
  }
  const inZone = (b) =>
    boxes.some(
      (zone) =>
        b[0] >= zone.x[0] &&
        b[1] <= zone.x[1] &&
        b[2] >= zone.y[0] &&
        b[3] <= zone.y[1] &&
        b[4] >= zone.z[0] &&
        b[5] <= zone.z[1]
    );
  const goldComp = new Set();
  for (const [root, b] of compBox) if (inZone(b)) goldComp.add(root);
  if (goldComp.size === 0) return;

  // reorder the index so gold triangles form a second material group
  const black = [];
  const gold = [];
  for (let t = 0; t < triCount; t++) {
    const target = goldComp.has(find(vi(t, 0))) ? gold : black;
    target.push(vi(t, 0), vi(t, 1), vi(t, 2));
  }
  geom.setIndex([...black, ...gold]);
  geom.clearGroups();
  geom.addGroup(0, black.length, 0);
  geom.addGroup(black.length, gold.length, 1);
  mesh.material = [mesh.material, goldMaterial];
}

// Classify every mesh by name and assign livery materials, then split the
// fused vent geometry into gold groups. Idempotent across strict-mode re-runs.
export function applyLivery(scene, livery) {
  scene.traverse((child) => {
    if (!child.isMesh) return;
    const name = child.name || "";

    if (/Rim_Alpha/i.test(name)) {
      // spinning-spoke blur discs — hidden while parked, shown as a
      // gold shimmer at speed
      child.visible = false;
      child.material = livery.rimBlur;
      return;
    }

    // vent-split meshes carry [base, gold] material arrays; only swap
    // the base slot so re-runs don't wipe the gold group
    const assign = (material) => {
      if (Array.isArray(child.material)) child.material[0] = material;
      else child.material = material;
    };

    if (/WCWINDOW/i.test(name)) {
      assign(livery.glass);
    } else if (/SWHEEL_GLASS|mirror/i.test(name)) {
      assign(livery.darkMetal);
    } else if (/WCRIMS/i.test(name)) {
      assign(livery.gold);
    } else if (/INDY19_TYRES/i.test(name)) {
      assign(livery.tire);
    } else if (/TWALL/i.test(name)) {
      assign(livery.tireWall);
    } else if (/WCCARBODY/i.test(name)) {
      assign(GOLD_BODY_RE.test(name) ? livery.gold : livery.bodyBlack);
    } else if (/CARBON|WCEXTRA9/i.test(name)) {
      assign(livery.carbon);
    } else if (/METAL|BDISC|WCEXTRA3/i.test(name)) {
      assign(livery.darkMetal);
    } else {
      assign(livery.dark);
    }
  });

  for (const zone of VENT_ZONES) {
    gildVents(scene.getObjectByName(zone.mesh), zone.boxes, livery.gold);
  }
}

export function setRimBlur(scene, visible) {
  scene.traverse((child) => {
    if (child.isMesh && /Rim_Alpha/i.test(child.name)) child.visible = visible;
  });
}
