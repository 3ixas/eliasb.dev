/*
 * The lanyard's strap (#448, #486): two plies of woven polyester twill webbing in the employer's colour (DESIGN.md
 * "The staff pass"). Each ply is a thin flat tube of real thickness through its particles, so an edge-on ply still shows
 * its edge. Its twist is held at both ends: where it leaves the view it faces the viewer (it goes on round a neck), and
 * at the crimp it turns with the clip; the difference is spread along the ply and followed from frame to frame, so turns
 * of the card wind the strap up and unwind it again rather than snapping back.
 */
import { BufferAttribute, BufferGeometry, CanvasTexture, CatmullRomCurve3, ClampToEdgeWrapping, Color, DoubleSide, Mesh, MeshPhysicalMaterial, RepeatWrapping, SRGBColorSpace, Vector2, Vector3 } from "three";
import { cross, dot, normalise, scale, sub, type Vec3 } from "./physics";

/** The strap is 1 em wide (DESIGN.md), on a card 14.5 em wide; webbing is about a sixteenth as thick as it is wide. */
const WIDTH = 1 / 14.5;
const THICKNESS = WIDTH / 16;
const SAMPLES = 48;
/** Each ply's four faces (front, back and the two edges), two vertices across each, at every sample. */
const FACES = 4;
/** Where a ply leaves the view, its width runs along the world's x, so its face is to the viewer. */
const LEVEL: Vec3 = { x: 1, y: 0, z: 0 };
/** Seamless greyscale polyester twill tile, loaded only when the 3D scene mounts (#486). */
export const WEBBING_URL = "/lanyard/webbing.webp";
/** How long the scene waits for the webbing tile before failing back to the printed pass (ms). */
const WEBBING_WAIT = 4000;
/** Relief strength of the Scharr normal map derived from the webbing's luminance. */
const RELIEF = 3.2;

/** The decoded greyscale webbing tile and the single normal map derived from it, shared by every employer's strap. */
export type Webbing = {
  size: number;
  luma: Float32Array;
  mean: number;
  normalMap: CanvasTexture;
};

/** Loads the seamless webbing tile and derives its tangent-space normal map once for the scene. */
export async function loadWebbing(anisotropy: number): Promise<Webbing> {
  const image = await loadImage(WEBBING_URL, WEBBING_WAIT);
  const size = image.naturalWidth;
  if (!size || size !== image.naturalHeight) throw new Error(`Webbing tile must be square (${image.naturalWidth}×${image.naturalHeight})`);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No 2D canvas");
  context.drawImage(image, 0, 0);
  const data = context.getImageData(0, 0, size, size).data;
  const luma = new Float32Array(size * size);
  let sum = 0;
  for (let i = 0; i < luma.length; i++) {
    const p = i * 4;
    const value = (0.2126 * data[p] + 0.7152 * data[p + 1] + 0.0722 * data[p + 2]) / 255;
    luma[i] = value;
    sum += value;
  }
  const mean = sum / luma.length;
  const normalMap = weaveRelief(luma, size, anisotropy);
  return { size, luma, mean, normalMap };
}

export function strapMaterial(colour: string, webbing: Webbing, anisotropy: number) {
  const map = weave(colour, webbing, anisotropy);
  // Fabric: matte dyed polyester, with the soft sheen of woven yarn at a grazing angle, a touch lighter than the dye.
  return new MeshPhysicalMaterial({
    map,
    normalMap: webbing.normalMap,
    normalScale: new Vector2(0.95, 0.95),
    roughness: 0.78,
    sheen: 0.7,
    sheenRoughness: 0.45,
    sheenColor: new Color(colour).lerp(new Color(0xffffff), 0.35),
    side: DoubleSide,
  });
}

export class Strap {
  readonly mesh: Mesh;
  private readonly positions = new Float32Array(SAMPLES * FACES * 2 * 3);
  private readonly normals = new Float32Array(SAMPLES * FACES * 2 * 3);
  private readonly uvs = new Float32Array(SAMPLES * FACES * 2 * 2);
  private readonly geometry = new BufferGeometry();
  private readonly curve = new CatmullRomCurve3([], false, "centripetal");
  /** The twist between the crimp and the top, in radians, kept from the last frame so whole turns are not lost. */
  private twist = 0;
  /** The pass's width against the scene's unit: a smaller pass has a narrower strap. */
  scale = 1;

  /** `layer` sets the two plies a hair apart in depth where they meet at the crimp, so they never show through each other. */
  constructor(material: MeshPhysicalMaterial, private readonly layer: number) {
    const index: number[] = [];
    for (let i = 0; i < SAMPLES - 1; i++) {
      for (let face = 0; face < FACES; face++) {
        const a = vertex(i, face, 0);
        const b = vertex(i, face, 1);
        const c = vertex(i + 1, face, 0);
        const d = vertex(i + 1, face, 1);
        index.push(a, b, c, b, d, c);
      }
    }
    this.geometry.setIndex(index);
    this.geometry.setAttribute("position", new BufferAttribute(this.positions, 3));
    this.geometry.setAttribute("normal", new BufferAttribute(this.normals, 3));
    this.geometry.setAttribute("uv", new BufferAttribute(this.uvs, 2));
    this.mesh = new Mesh(this.geometry, material);
    this.mesh.castShadow = true;
    this.mesh.frustumCulled = false;
  }

  /** Lays the ply through `points`, from the crimp up to its anchor; `across` is the clip's sideways direction. */
  update(points: Vec3[], across: Vec3) {
    this.curve.points = points.map(({ x, y, z }) => new Vector3(x, y, z));
    const samples = this.curve.getSpacedPoints(SAMPLES - 1).map(({ x, y, z }) => ({ x, y, z }));
    const tangents = samples.map((_, i) => normalise(sub(samples[Math.min(i + 1, SAMPLES - 1)], samples[Math.max(i - 1, 0)])));

    // Carry the crimp's sideways direction up the ply without turning it about the ply (parallel transport)...
    const carried: Vec3[] = [];
    let side = across;
    for (const tangent of tangents) {
      side = normalise(sub(side, scale(tangent, dot(side, tangent))));
      carried.push(side);
    }
    // ...then find how far the top is from facing the viewer, take the turn nearest last frame's, and spread it evenly.
    const top = tangents[SAMPLES - 1];
    const level = normalise(sub(LEVEL, scale(top, dot(LEVEL, top))));
    const end = carried[SAMPLES - 1];
    const off = Math.atan2(dot(top, cross(end, level)), dot(end, level));
    this.twist = off + 2 * Math.PI * Math.round((this.twist - off) / (2 * Math.PI));

    let along = 0;
    for (let i = 0; i < SAMPLES; i++) {
      const tangent = tangents[i];
      const turn = (this.twist * i) / (SAMPLES - 1);
      // Rodrigues' rotation of a vector already at right angles to the axis.
      const s = normalise({
        x: carried[i].x * Math.cos(turn) + cross(tangent, carried[i]).x * Math.sin(turn),
        y: carried[i].y * Math.cos(turn) + cross(tangent, carried[i]).y * Math.sin(turn),
        z: carried[i].z * Math.cos(turn) + cross(tangent, carried[i]).z * Math.sin(turn),
      });
      const n = cross(s, tangent);
      const thick = THICKNESS * this.scale;
      const wide = WIDTH * this.scale;
      const centre = { x: samples[i].x + n.x * this.layer * thick, y: samples[i].y + n.y * this.layer * thick, z: samples[i].z + n.z * this.layer * thick };
      if (i > 0) along += Math.hypot(samples[i].x - samples[i - 1].x, samples[i].y - samples[i - 1].y, samples[i].z - samples[i - 1].z);
      const v = along / wide;
      const w = wide / 2;
      const t = thick / 2;
      // Front and back: across the width, a face's thickness out. Edges: across the thickness, at either side.
      this.put(i, 0, centre, n, t, s, w, n, v, [0, 1]);
      this.put(i, 1, centre, n, -t, s, w, scale(n, -1), v, [0, 1]);
      this.put(i, 2, centre, s, -w, n, t, scale(s, -1), v, [0, 0]);
      this.put(i, 3, centre, s, w, n, t, s, v, [1, 1]);
    }
    for (const name of ["position", "normal", "uv"]) this.geometry.getAttribute(name).needsUpdate = true;
  }

  /** One face's two vertices at a sample: `out` units along `offset` from the centre, then ±`half` along `span`. */
  private put(i: number, face: number, centre: Vec3, offset: Vec3, out: number, span: Vec3, half: number, normal: Vec3, v: number, u: [number, number]) {
    for (const k of [0, 1] as const) {
      const sign = k === 0 ? -1 : 1;
      const at = vertex(i, face, k);
      this.positions[at * 3] = centre.x + offset.x * out + span.x * half * sign;
      this.positions[at * 3 + 1] = centre.y + offset.y * out + span.y * half * sign;
      this.positions[at * 3 + 2] = centre.z + offset.z * out + span.z * half * sign;
      this.normals[at * 3] = normal.x;
      this.normals[at * 3 + 1] = normal.y;
      this.normals[at * 3 + 2] = normal.z;
      this.uvs[at * 2] = u[k];
      this.uvs[at * 2 + 1] = v;
    }
  }
}

const vertex = (sample: number, face: number, side: 0 | 1) => (sample * FACES + face) * 2 + side;

/** Loads an image texture with a hard timeout so a broken or hung asset falls back cleanly to the printed pass. */
function loadImage(url: string, timeoutMs: number): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    const timer = window.setTimeout(() => reject(new Error(`Timed out loading ${url}`)), timeoutMs);
    const done = (callback: () => void) => {
      clearTimeout(timer);
      image.onload = null;
      image.onerror = null;
      callback();
    };
    image.onload = () =>
      done(() => {
        if (typeof image.decode === "function") image.decode().then(() => resolve(image), () => resolve(image));
        else resolve(image);
      });
    image.onerror = () => done(() => reject(new Error(`Could not load ${url}`)));
    image.src = url;
  });
}

/** A tangent-space normal map derived from the webbing tile's luminance via a periodic 3×3 Scharr filter. */
function weaveRelief(luma: Float32Array, size: number, anisotropy: number) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d")!;
  const image = context.createImageData(size, size);
  const at = (x: number, y: number) => luma[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const gx =
        3 * (at(x + 1, y - 1) - at(x - 1, y - 1)) +
        10 * (at(x + 1, y) - at(x - 1, y)) +
        3 * (at(x + 1, y + 1) - at(x - 1, y + 1));
      const gy =
        3 * (at(x - 1, y + 1) - at(x - 1, y - 1)) +
        10 * (at(x, y + 1) - at(x, y - 1)) +
        3 * (at(x + 1, y + 1) - at(x + 1, y - 1));
      const dx = (gx / 32) * RELIEF;
      const dy = (gy / 32) * RELIEF;
      const length = Math.hypot(dx, dy, 1);
      const i = (y * size + x) * 4;
      image.data[i] = ((-dx / length) * 0.5 + 0.5) * 255;
      image.data[i + 1] = ((dy / length) * 0.5 + 0.5) * 255;
      image.data[i + 2] = ((1 / length) * 0.5 + 0.5) * 255;
      image.data[i + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  const texture = new CanvasTexture(canvas);
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = RepeatWrapping;
  texture.anisotropy = anisotropy;
  return texture;
}

/** Tints the neutral grey webbing tile into an employer's dye, keeping yarn-crown sheen and softly rolled selvedge edges. */
function weave(colour: string, { size, luma, mean }: Webbing, anisotropy: number) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d")!;
  context.fillStyle = colour;
  context.fillRect(0, 0, size, size);
  const image = context.getImageData(0, 0, size, size);
  const data = image.data;
  const br = data[0];
  const bg = data[1];
  const bb = data[2];
  for (let i = 0; i < luma.length; i++) {
    const delta = luma[i] - mean;
    const shade = 1 + delta * 1.45;
    // A faint satin lift on yarn crowns keeps dark dyes (Joveen's charcoal) legible as woven polyester.
    const sheen = Math.max(0, delta - 0.04) * 58;
    const p = i * 4;
    data[p] = Math.max(0, Math.min(255, br * shade + sheen));
    data[p + 1] = Math.max(0, Math.min(255, bg * shade + sheen));
    data[p + 2] = Math.max(0, Math.min(255, bb * shade + sheen));
  }
  context.putImageData(image, 0, 0);
  const edges = context.createLinearGradient(0, 0, size, 0);
  edges.addColorStop(0, "rgb(0 0 0 / 0.16)");
  edges.addColorStop(0.12, "rgb(0 0 0 / 0)");
  edges.addColorStop(0.88, "rgb(0 0 0 / 0)");
  edges.addColorStop(1, "rgb(0 0 0 / 0.16)");
  context.fillStyle = edges;
  context.fillRect(0, 0, size, size);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = RepeatWrapping;
  texture.anisotropy = anisotropy;
  return texture;
}
