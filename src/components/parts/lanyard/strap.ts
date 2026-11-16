/*
 * The lanyard's strap (#448, round two): two plies of woven webbing in the employer's colour (DESIGN.md "The staff pass").
 * Each ply is a thin flat tube of real thickness through its particles, so an edge-on ply still shows its edge. Its twist is
 * held at both ends: where it leaves the view it faces the viewer (it goes on round a neck), and at the crimp it turns with
 * the clip; the difference is spread along the ply and followed from frame to frame, so turns of the card wind the strap up
 * and unwind it again rather than snapping back.
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

export function strapMaterial(colour: string, anisotropy: number) {
  const map = weave(colour);
  const normalMap = weaveRelief();
  for (const texture of [map, normalMap]) {
    texture.wrapS = ClampToEdgeWrapping;
    texture.wrapT = RepeatWrapping;
    texture.anisotropy = anisotropy;
  }
  // Fabric: matte, with the soft sheen of woven polyester at a grazing angle, a touch lighter than the dye.
  return new MeshPhysicalMaterial({
    map,
    normalMap,
    normalScale: new Vector2(0.8, 0.8),
    roughness: 0.8,
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

/** The tile: one strap width square, repeated along the strap. */
const TILE = 64;
/** A twill's diagonal ridges per tile, and the woven edge's width in texels. */
const RIDGES = 9;
const SELVEDGE = 5;

/** The webbing's height at a texel: diagonal twill ridges over fine lengthwise yarns, with a raised woven edge each side. */
function height(x: number, y: number) {
  const twill = 0.5 + 0.5 * Math.sin((2 * Math.PI * (x + y) * RIDGES) / TILE);
  const yarn = 0.5 + 0.5 * Math.cos((2 * Math.PI * x * 16) / TILE);
  const edge = x < SELVEDGE || x >= TILE - SELVEDGE ? 0.6 + 0.4 * Math.sin((2 * Math.PI * y * 16) / TILE) : 0;
  return edge || 0.75 * twill + 0.25 * yarn;
}

/** A normal map from the webbing's height. */
function weaveRelief() {
  const canvas = document.createElement("canvas");
  canvas.width = TILE;
  canvas.height = TILE;
  const context = canvas.getContext("2d")!;
  const image = context.createImageData(TILE, TILE);
  const at = (x: number, y: number) => height(Math.min(TILE - 1, Math.max(0, x)), (y + TILE) % TILE);
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * 1.6;
      const dy = (at(x, y + 1) - at(x, y - 1)) * 1.6;
      const length = Math.hypot(dx, dy, 1);
      const i = (y * TILE + x) * 4;
      image.data[i] = ((-dx / length) * 0.5 + 0.5) * 255;
      image.data[i + 1] = ((dy / length) * 0.5 + 0.5) * 255;
      image.data[i + 2] = ((1 / length) * 0.5 + 0.5) * 255;
      image.data[i + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  return new CanvasTexture(canvas);
}

/** The dye, a shade lighter on the ridges and darker in the hollows, and darker still where the edges roll away. */
function weave(colour: string) {
  const canvas = document.createElement("canvas");
  canvas.width = TILE;
  canvas.height = TILE;
  const context = canvas.getContext("2d")!;
  context.fillStyle = colour;
  context.fillRect(0, 0, TILE, TILE);
  const image = context.getImageData(0, 0, TILE, TILE);
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const shade = 0.88 + 0.2 * height(x, y);
      const i = (y * TILE + x) * 4;
      for (let k = 0; k < 3; k++) image.data[i + k] = Math.min(255, image.data[i + k] * shade);
    }
  }
  context.putImageData(image, 0, 0);
  const edges = context.createLinearGradient(0, 0, TILE, 0);
  edges.addColorStop(0, "rgb(0 0 0 / 0.18)");
  edges.addColorStop(0.14, "rgb(0 0 0 / 0)");
  edges.addColorStop(0.86, "rgb(0 0 0 / 0)");
  edges.addColorStop(1, "rgb(0 0 0 / 0.18)");
  context.fillStyle = edges;
  context.fillRect(0, 0, TILE, TILE);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
