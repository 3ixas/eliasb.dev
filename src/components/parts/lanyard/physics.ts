/*
 * The lanyard's physics (#448): position-based Verlet at a fixed 1/120 s step, so the swing is the same at any frame rate.
 * Two plies of strap run from two fixed anchors above the view down to one crimp; the clip is a rigid rod from the crimp
 * to the card's slot; the card is a rigid body of five particles (its slot, its two lower corners, and a point either side
 * of its centre, so its centre of mass is the card's). No three.js here: plain numbers, so it can be checked on its own.
 *
 * Ideas from Hanging Pass (MIT, xu-yaoting/hanging-pass): the fixed step, gravity from a target pendulum period, a bend
 * constraint against the strap folding into an S, the dragged point held within the cord's reach. From the Vercel Ship
 * 2024 badge write-up: the card is turned back towards the viewer about its vertical axis, so the pass stays readable.
 */

export type Vec3 = { x: number; y: number; z: number };

/** Where the pass rests, in world units (the card's width is 1). */
export type Rest = {
  /** Where each ply leaves the view's top, and beyond: fixed. */
  anchors: readonly [Vec3, Vec3];
  /** The crimp at the foot of the strap, where the clip begins. */
  crimp: Vec3;
  /** The card's centre at rest. */
  centre: Vec3;
};

export type CardShape = {
  width: number;
  height: number;
  /** The slot's upper edge, where the clip's loop carries the card, as a height above the card's centre. */
  hangY: number;
};

export const STEP = 1 / 120;
/** The swing's period as a pendulum, which sets gravity for any size of view. */
const PERIOD = 1.86;
const SEGMENTS = 14;
const ITERATIONS = 10;
/** The strap's own mass and the card's, per particle. The card is far heavier, so the strap follows it. */
const STRAP_MASS = 0.02;
const CRIMP_MASS = 0.08;
/** Velocity lost per second: air on the card, more on the strap. */
const CARD_DAMPING = 0.55;
const STRAP_DAMPING = 1.6;
/** How hard the card is turned back towards the viewer about its vertical axis (rad/s² per radian). */
const FACING = 26;

type Link = { a: number; b: number; length: number; mode: "rigid" | "rope" | "apart" };

export class Lanyard {
  readonly pos: Float64Array;
  readonly prev: Float64Array;
  readonly inverseMass: Float64Array;
  readonly links: Link[] = [];
  /** Indices: 0 the crimp, 1 and 2 the anchors, then each ply's inner particles, then the card's five. */
  readonly crimp = 0;
  readonly plies: readonly [number[], number[]];
  readonly card: readonly [number, number, number, number, number];
  /** The card's five particles in the card's own frame (origin at its centre, y up, z out of the face). */
  readonly local: readonly Vec3[];
  readonly strapLength: number;
  readonly clipLength: number;
  readonly gravity: number;
  private grab: { weights: number[]; target: Vec3; reach: number } | null = null;
  private still = 0;

  constructor(rest: Rest, shape: CardShape) {
    const { width, height, hangY } = shape;
    const depth = width / 2;
    this.local = [
      { x: 0, y: hangY, z: 0 },
      { x: -width / 2, y: -height / 2, z: 0 },
      { x: width / 2, y: -height / 2, z: 0 },
      { x: 0, y: 0, z: depth },
      { x: 0, y: 0, z: -depth },
    ];
    const count = 3 + 2 * (SEGMENTS - 1) + 5;
    this.pos = new Float64Array(count * 3);
    this.prev = new Float64Array(count * 3);
    this.inverseMass = new Float64Array(count);

    const plyInner = (side: 0 | 1) => Array.from({ length: SEGMENTS - 1 }, (_, i) => 3 + side * (SEGMENTS - 1) + i);
    const left = plyInner(0);
    const right = plyInner(1);
    // Each ply from the crimp up to its anchor.
    this.plies = [[0, ...left, 1], [0, ...right, 2]];
    const firstCard = 3 + 2 * (SEGMENTS - 1);
    this.card = [firstCard, firstCard + 1, firstCard + 2, firstCard + 3, firstCard + 4];

    this.set(0, rest.crimp);
    this.set(1, rest.anchors[0]);
    this.set(2, rest.anchors[1]);
    this.plies.forEach((ply) => {
      const top = this.get(ply[ply.length - 1]);
      ply.forEach((index, i) => {
        if (i === 0 || i === ply.length - 1) return;
        const t = i / SEGMENTS;
        this.set(index, { x: rest.crimp.x + (top.x - rest.crimp.x) * t, y: rest.crimp.y + (top.y - rest.crimp.y) * t, z: rest.crimp.z + (top.z - rest.crimp.z) * t });
      });
    });
    this.card.forEach((index, i) => this.set(index, add(rest.centre, this.local[i])));
    this.prev.set(this.pos);

    // A card particle weighs enough that the card's centre of mass is its centre: the slot is above it, the corners below.
    const cornerMass = 1;
    const slotMass = (2 * cornerMass * (height / 2)) / hangY;
    this.inverseMass[0] = 1 / CRIMP_MASS;
    this.inverseMass[1] = 0;
    this.inverseMass[2] = 0;
    [...left, ...right].forEach((index) => (this.inverseMass[index] = 1 / STRAP_MASS));
    [slotMass, cornerMass, cornerMass, cornerMass, cornerMass].forEach((mass, i) => (this.inverseMass[this.card[i]] = 1 / mass));

    this.strapLength = distance(rest.anchors[0], rest.crimp);
    const segment = this.strapLength / SEGMENTS;
    for (const ply of this.plies) {
      for (let i = 0; i < ply.length - 1; i++) this.links.push({ a: ply[i], b: ply[i + 1], length: segment, mode: "rope" });
      // Webbing resists folding back on itself.
      for (let i = 0; i < ply.length - 2; i++) this.links.push({ a: ply[i], b: ply[i + 2], length: segment * 1.6, mode: "apart" });
      // Tethers: no particle is further from its anchor than the strap between them, so the light strap cannot stretch
      // under the heavy card however few iterations the step has (long-range attachments).
      const anchor = ply[ply.length - 1];
      for (let i = 0; i < ply.length - 2; i++) this.links.push({ a: anchor, b: ply[i], length: segment * (ply.length - 1 - i), mode: "rope" });
    }
    this.clipLength = distance(rest.crimp, this.get(this.card[0]));
    this.links.push({ a: 0, b: this.card[0], length: this.clipLength, mode: "rigid" });
    // The slot too is tethered to each anchor, so the heavy card cannot drag the light crimp down the clip.
    for (const ply of this.plies) this.links.push({ a: ply[ply.length - 1], b: this.card[0], length: this.strapLength + this.clipLength, mode: "rope" });
    for (let i = 0; i < 5; i++) {
      for (let j = i + 1; j < 5; j++) this.links.push({ a: this.card[i], b: this.card[j], length: distance(this.local[i], this.local[j]), mode: "rigid" });
    }

    // A pendulum of the card's hanging length swings with PERIOD.
    const pivot = midpoint(rest.anchors[0], rest.anchors[1]);
    this.gravity = (4 * Math.PI ** 2 * distance(pivot, rest.centre)) / PERIOD ** 2;
  }

  get(index: number): Vec3 {
    const i = index * 3;
    return { x: this.pos[i], y: this.pos[i + 1], z: this.pos[i + 2] };
  }

  private set(index: number, { x, y, z }: Vec3) {
    const i = index * 3;
    this.pos[i] = x;
    this.pos[i + 1] = y;
    this.pos[i + 2] = z;
  }

  /** Sets the card moving, as if it had just been let go: the arrival's one swing. */
  push(velocity: Vec3, spin = 0) {
    const centre = this.cardCentre();
    this.card.forEach((index) => {
      const i = index * 3;
      const p = this.get(index);
      // Spin about the vertical axis through the centre, plus the push.
      const vx = velocity.x + spin * (p.z - centre.z);
      const vz = velocity.z - spin * (p.x - centre.x);
      this.prev[i] = p.x - vx * STEP;
      this.prev[i + 1] = p.y - velocity.y * STEP;
      this.prev[i + 2] = p.z - vz * STEP;
    });
    this.still = 0;
  }

  /** The card's frame: its centre, and its x (right), y (up) and z (out of the face) axes in world space. */
  frame() {
    const [s, l, r] = this.card.map((index) => this.get(index));
    const x = normalise(sub(r, l));
    const foot = midpoint(l, r);
    const up = sub(s, foot);
    const y = normalise(sub(up, scale(x, dot(up, x))));
    const z = cross(x, y);
    // The slot sits hangY above the centre along y.
    const centre = sub(s, scale(y, this.local[0].y));
    return { centre, x, y, z };
  }

  cardCentre(): Vec3 {
    return this.frame().centre;
  }

  /** Takes hold of the card at a point in its own frame; the point then follows `target` until let go. */
  hold(point: Vec3, target: Vec3) {
    // The point as an affine mix of the slot, the two corners and the front point: those weights move it with the card.
    const [o, a, b, c] = this.local;
    const weights = solveAffine(sub(a, o), sub(b, o), sub(c, o), sub(point, o));
    const reach = this.strapLength + this.clipLength + distance(point, o);
    this.grab = { weights: [1 - weights.x - weights.y - weights.z, weights.x, weights.y, weights.z], target, reach };
    this.still = 0;
  }

  move(target: Vec3) {
    if (this.grab) this.grab.target = this.withinReach(target, this.grab.reach);
  }

  release() {
    this.grab = null;
  }

  get held() {
    return this.grab !== null;
  }

  /** True once nothing has moved for a second and the card is not held: the loop can sleep. */
  get asleep() {
    return !this.grab && this.still > 1 / STEP;
  }

  wake() {
    this.still = 0;
  }

  private withinReach(target: Vec3, reach: number): Vec3 {
    const pivot = midpoint(this.get(1), this.get(2));
    const away = sub(target, pivot);
    const length = Math.hypot(away.x, away.y, away.z);
    return length > reach ? add(pivot, scale(away, reach / length)) : target;
  }

  step() {
    const { pos, prev, inverseMass } = this;
    const card = new Set(this.card);
    let fastest = 0;
    for (let index = 0; index < inverseMass.length; index++) {
      if (inverseMass[index] === 0) continue;
      const keep = 1 - (card.has(index) ? CARD_DAMPING : STRAP_DAMPING) * STEP;
      const i = index * 3;
      for (let k = 0; k < 3; k++) {
        const velocity = (pos[i + k] - prev[i + k]) * keep;
        prev[i + k] = pos[i + k];
        pos[i + k] += velocity + (k === 1 ? -this.gravity * STEP * STEP : 0);
        fastest = Math.max(fastest, Math.abs(velocity));
      }
    }
    this.face();
    for (let iteration = 0; iteration < ITERATIONS; iteration++) {
      for (const link of this.links) this.solve(link);
      if (this.grab) this.pull(this.grab);
    }
    this.still = fastest < 2e-5 ? this.still + 1 : 0;
  }

  /** Turns the card back towards the viewer about the vertical axis through its centre, as an angular acceleration. */
  private face() {
    if (this.grab) return;
    const { centre, x } = this.frame();
    const yaw = Math.atan2(x.z, x.x);
    const angle = FACING * yaw * STEP * STEP;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    for (const index of this.card) {
      const i = index * 3;
      const dx = this.pos[i] - centre.x;
      const dz = this.pos[i + 2] - centre.z;
      this.pos[i] = centre.x + dx * cos + dz * sin;
      this.pos[i + 2] = centre.z - dx * sin + dz * cos;
    }
  }

  private solve({ a, b, length, mode }: Link) {
    const { pos, inverseMass } = this;
    const wa = inverseMass[a];
    const wb = inverseMass[b];
    if (wa + wb === 0) return;
    const ia = a * 3;
    const ib = b * 3;
    const dx = pos[ib] - pos[ia];
    const dy = pos[ib + 1] - pos[ia + 1];
    const dz = pos[ib + 2] - pos[ia + 2];
    const d = Math.hypot(dx, dy, dz) || 1e-9;
    if (mode === "rope" && d <= length) return;
    if (mode === "apart" && d >= length) return;
    const k = (d - length) / (d * (wa + wb));
    pos[ia] += dx * k * wa;
    pos[ia + 1] += dy * k * wa;
    pos[ia + 2] += dz * k * wa;
    pos[ib] -= dx * k * wb;
    pos[ib + 1] -= dy * k * wb;
    pos[ib + 2] -= dz * k * wb;
  }

  /** Moves the held point to its target, sharing the move among the four particles that carry it by their weights. */
  private pull({ weights, target }: { weights: number[]; target: Vec3 }) {
    const carriers = this.card.slice(0, 4);
    const now = carriers.reduce((sum, index, i) => add(sum, scale(this.get(index), weights[i])), { x: 0, y: 0, z: 0 });
    const gap = sub(target, now);
    const share = carriers.reduce((sum, index, i) => sum + this.inverseMass[index] * weights[i] ** 2, 0);
    carriers.forEach((index, i) => {
      const k = (this.inverseMass[index] * weights[i]) / share;
      const at = index * 3;
      this.pos[at] += gap.x * k;
      this.pos[at + 1] += gap.y * k;
      this.pos[at + 2] += gap.z * k;
    });
  }
}

export const add = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
export const sub = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
export const scale = (a: Vec3, k: number): Vec3 => ({ x: a.x * k, y: a.y * k, z: a.z * k });
export const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;
export const cross = (a: Vec3, b: Vec3): Vec3 => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x });
export const distance = (a: Vec3, b: Vec3) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
export const midpoint = (a: Vec3, b: Vec3): Vec3 => scale(add(a, b), 0.5);
export const normalise = (a: Vec3): Vec3 => scale(a, 1 / (Math.hypot(a.x, a.y, a.z) || 1));

/** Solves a·u + b·v + c·w = p for (u, v, w), by Cramer's rule. */
function solveAffine(a: Vec3, b: Vec3, c: Vec3, p: Vec3): Vec3 {
  const det = dot(a, cross(b, c));
  return { x: dot(p, cross(b, c)) / det, y: dot(a, cross(p, c)) / det, z: dot(a, cross(b, p)) / det };
}
