/*
 * The 3D staff pass (#448): plain three.js over the CSS pass, which stays as the page's print and its fallback. Loaded
 * only when the pass is in view (lanyard.tsx). The card is laid where the CSS card is, at the same size, so nothing moves
 * when the scene takes over; then it hangs from two plies of strap, swings once and settles. It can be dragged and thrown.
 */
import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  ClampToEdgeWrapping,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NeutralToneMapping,
  PCFShadowMap,
  PMREMGenerator,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  Raycaster,
  RepeatWrapping,
  Scene,
  ShadowMaterial,
  Shape,
  SRGBColorSpace,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
  Curve,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { paintPrint } from "./face";
import { Lanyard, STEP, add, cross, normalise, scale, sub, dot, type Vec3 } from "./physics";

/** The card's thickness against its width: a CR80 card is 0.76 mm on 54 mm. */
const THICKNESS = 0.76 / 54;
/** The camera's vertical field of view: long, so the card is not distorted near the edges of the view. */
const FOV = 20;
/** How far the plies open from vertical, each way (DESIGN.md "The staff pass"). */
const SPREAD = (4.5 * Math.PI) / 180;
/** Samples along each ply's ribbon. */
const RIBBON_SAMPLES = 48;

export type Mount = { stage: HTMLElement; pass: HTMLElement; onReady: () => void };

/** Sizes in em of the card's width ÷ 14.5, as pass.css draws them; the card is 1 wide, so an em is 1/14.5. */
const em = 1 / 14.5;

export async function mountLanyard({ stage, pass, onReady }: Mount): Promise<() => void> {
  const print = await paintPrint(pass);
  const card = pass.querySelector<HTMLElement>(".pass__card");
  if (!card) throw new Error("The pass has no card");

  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  const canvas = renderer.domElement;
  canvas.className = "lanyard__scene";
  canvas.setAttribute("aria-hidden", "true");

  const scene = new Scene();
  const environment = new PMREMGenerator(renderer);
  scene.environment = environment.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.4;
  environment.dispose();

  const camera = new PerspectiveCamera(FOV, 1, 0.1, 100);
  const key = new DirectionalLight(0xffffff, 0.95);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0004;
  key.shadow.radius = 4;
  scene.add(key, key.target, new AmbientLight(0xffffff, 0.12));

  const shadowCatcher = new Mesh(new PlaneGeometry(1, 1), new ShadowMaterial({ opacity: 0.16 }));
  shadowCatcher.receiveShadow = true;
  scene.add(shadowCatcher);

  // The card: CR80 with 0.8 em corners and the punched slot, extruded to its thickness.
  const width = 1;
  const height = print.aspect;
  const cardGeometry = cardShape(width, height);
  const faceTexture = new CanvasTexture(print.canvas);
  faceTexture.colorSpace = SRGBColorSpace;
  faceTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const faceMaterial = new MeshPhysicalMaterial({ map: faceTexture, roughness: 0.58, clearcoat: 0.55, clearcoatRoughness: 0.3 });
  const edgeMaterial = new MeshStandardMaterial({ color: 0xe4e2db, roughness: 0.75 });
  const cardMesh = new Mesh(cardGeometry, [faceMaterial, edgeMaterial]);
  cardMesh.castShadow = true;
  cardMesh.matrixAutoUpdate = false;
  scene.add(cardMesh);

  const metal = new MeshStandardMaterial({ color: 0xdcdde1, metalness: 1, roughness: 0.28 });
  const clip = clipModel(metal);
  clip.matrixAutoUpdate = false;
  scene.add(clip);

  const strapColour = getComputedStyle(pass).getPropertyValue("--lanyard").trim() || "#0b6b47";
  const weave = weaveTexture(strapColour);
  const strapMaterial = new MeshStandardMaterial({ map: weave, roughness: 0.92, side: DoubleSide });
  const ribbons = [new Ribbon(strapMaterial), new Ribbon(strapMaterial)];
  ribbons.forEach((ribbon) => scene.add(ribbon.mesh));

  // Laying out: the stage's pixels map to world units at the card's plane, where the card's width is 1.
  let view = { width: 1, height: 1, unit: 1 };
  let lanyard: Lanyard;
  const toWorld = (x: number, y: number): Vec3 => ({ x: (x - view.width / 2) / view.unit, y: (view.height / 2 - y) / view.unit, z: 0 });

  function layout(arrive: boolean) {
    view = { width: stage.clientWidth, height: stage.clientHeight, unit: card!.offsetWidth };
    renderer.setSize(view.width, view.height, false);
    const tall = view.height / view.unit;
    camera.aspect = view.width / view.height;
    camera.position.set(0, 0, tall / 2 / Math.tan((FOV * Math.PI) / 360));
    camera.far = camera.position.z + 20;
    camera.updateProjectionMatrix();

    const wide = view.width / view.unit;
    shadowCatcher.scale.set(wide * 1.5, tall * 1.5, 1);
    shadowCatcher.position.set(0, 0, -0.35);
    key.position.set(-tall * 0.5, tall * 0.9, tall * 1.4);
    const reach = Math.max(wide, tall);
    Object.assign(key.shadow.camera, { left: -reach, right: reach, top: reach, bottom: -reach, near: 0.1, far: tall * 4 });
    key.shadow.camera.updateProjectionMatrix();

    const { left, top } = offsetWithin(card!, stage);
    const centre = toWorld(left + card!.offsetWidth / 2, top + card!.offsetHeight / 2);
    const hangY = height / 2 - 0.9 * em;
    const crimp = add(centre, { x: 0, y: hangY + 2.65 * em, z: 0 });
    const above = tall / 2 + 0.3;
    const rise = above - crimp.y;
    const anchors = [-1, 1].map((side) => ({ x: crimp.x + side * Math.tan(SPREAD) * rise, y: above, z: 0 })) as [Vec3, Vec3];
    lanyard = new Lanyard({ anchors, crimp, centre }, { width, height, hangY });
    if (arrive) lanyard.push({ x: 1.3, y: 0, z: 0.35 }, 1.6);
    draw();
  }

  const basis = new Matrix4();
  function draw() {
    const { centre, x, y, z } = lanyard.frame();
    cardMesh.matrix.copy(basis.makeBasis(v(x), v(y), v(z)).setPosition(centre.x, centre.y, centre.z));
    cardMesh.matrixWorldNeedsUpdate = true;

    const crimp = lanyard.get(lanyard.crimp);
    const slot = lanyard.get(lanyard.card[0]);
    const up = normalise(sub(crimp, slot));
    const across = normalise(sub(x, scale(up, dot(x, up))));
    clip.matrix.copy(basis.makeBasis(v(across), v(up), v(cross(across, up))).setPosition(crimp.x, crimp.y, crimp.z));
    clip.matrixWorldNeedsUpdate = true;

    lanyard.plies.forEach((ply, i) => ribbons[i].update(ply.map((index) => lanyard.get(index)), across));
    renderer.render(scene, camera);
  }

  // The loop: fixed steps, drawn each frame while the pass is in view and moving.
  let frame = 0;
  let last = 0;
  let owed = 0;
  let visible = true;
  const run = () => {
    if (frame || !visible) return;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  };
  function tick(now: number) {
    frame = 0;
    owed = Math.min(owed + (now - last) / 1000, 8 * STEP);
    last = now;
    while (owed >= STEP) {
      lanyard.step();
      owed -= STEP;
    }
    draw();
    if (!lanyard.asleep) frame = requestAnimationFrame(tick);
  }

  // Holding the card: a press on it takes hold where it lands, then the point follows the pointer in its plane.
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  const plane = new Plane(new Vector3(0, 0, 1), 0);
  const hit = new Vector3();
  const cast = (event: PointerEvent) => {
    const box = canvas.getBoundingClientRect();
    pointer.set(((event.clientX - box.left) / box.width) * 2 - 1, -((event.clientY - box.top) / box.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    cardMesh.updateMatrixWorld();
    return raycaster.intersectObject(cardMesh, false)[0];
  };
  const down = (event: PointerEvent) => {
    if (event.button !== 0) return;
    const found = cast(event);
    if (!found) return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    const local = cardMesh.worldToLocal(found.point.clone());
    plane.constant = -found.point.z;
    lanyard.hold({ x: local.x, y: local.y, z: local.z }, v3(found.point));
    canvas.dataset.holding = "";
    run();
  };
  const move = (event: PointerEvent) => {
    if (lanyard.held) {
      raycaster.setFromCamera(pointerAt(event), camera);
      if (raycaster.ray.intersectPlane(plane, hit)) lanyard.move(v3(hit));
      return;
    }
    if (event.pointerType === "mouse") canvas.style.cursor = cast(event) ? "grab" : "";
  };
  const pointerAt = (event: PointerEvent) => {
    const box = canvas.getBoundingClientRect();
    return pointer.set(((event.clientX - box.left) / box.width) * 2 - 1, -((event.clientY - box.top) / box.height) * 2 + 1);
  };
  const up = (event: PointerEvent) => {
    if (!lanyard.held) return;
    lanyard.release();
    delete canvas.dataset.holding;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    run();
  };
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);

  // Off screen the loop stops; a resize lays the pass out again at rest; a theme change reprints the card stock.
  const seen = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) run();
  });
  seen.observe(stage);
  let resizing = 0;
  const resized = new ResizeObserver(() => {
    cancelAnimationFrame(resizing);
    resizing = requestAnimationFrame(() => layout(false));
  });
  const reprint = async () => {
    const { canvas: next } = await paintPrint(pass);
    faceTexture.image = next;
    faceTexture.needsUpdate = true;
    shade();
    draw();
  };
  const shade = () => {
    const dark = getComputedStyle(document.documentElement).getPropertyValue("--dark").trim() === "1";
    (shadowCatcher.material as ShadowMaterial).opacity = dark ? 0.42 : 0.16;
  };
  const themed = new MutationObserver(() => void reprint());
  themed.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const scheme = window.matchMedia("(prefers-color-scheme: dark)");
  const schemeChanged = () => void reprint();
  scheme.addEventListener("change", schemeChanged);

  shade();
  stage.append(canvas);
  layout(true);
  resized.observe(stage);
  onReady();
  run();

  return () => {
    cancelAnimationFrame(frame);
    cancelAnimationFrame(resizing);
    seen.disconnect();
    resized.disconnect();
    themed.disconnect();
    scheme.removeEventListener("change", schemeChanged);
    canvas.remove();
    scene.traverse((object) => {
      if (object instanceof Mesh) object.geometry.dispose();
    });
    [faceMaterial, edgeMaterial, metal, strapMaterial, shadowCatcher.material as ShadowMaterial].forEach((material) => material.dispose());
    [faceTexture, weave, scene.environment].forEach((texture) => texture?.dispose());
    renderer.dispose();
  };
}

const v = ({ x, y, z }: Vec3) => new Vector3(x, y, z);
const v3 = ({ x, y, z }: Vector3): Vec3 => ({ x, y, z });

/** The element's layout position within the stage, ignoring transforms (the CSS pass is turned by its tilt). */
function offsetWithin(element: HTMLElement, stage: HTMLElement) {
  let left = 0;
  let top = 0;
  for (let at: HTMLElement | null = element; at && at !== stage; at = at.offsetParent as HTMLElement | null) {
    left += at.offsetLeft;
    top += at.offsetTop;
  }
  return { left, top };
}

/** The card, centred on its origin, with the face's UVs on the left half of the print and the back's on the right. */
function cardShape(width: number, height: number) {
  const outline = roundedRect(new Shape(), -width / 2, -height / 2, width, height, 0.8 * em);
  const slotTop = height / 2 - 0.9 * em;
  outline.holes.push(roundedRect(new Shape(), -1.45 * em, slotTop - 0.8 * em, 2.9 * em, 0.8 * em, 0.4 * em));
  const bevel = THICKNESS * 0.18;
  const geometry = new ExtrudeGeometry(outline, { depth: THICKNESS - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 12 });
  geometry.translate(0, 0, -(THICKNESS - 2 * bevel) / 2);
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  const uv = geometry.getAttribute("uv");
  const lids = geometry.groups[0];
  for (let i = lids.start; i < lids.start + lids.count; i++) {
    const across = (position.getX(i) + width / 2) / width;
    const along = (position.getY(i) + height / 2) / height;
    uv.setXY(i, normal.getZ(i) > 0 ? across * 0.5 : 0.5 + (1 - across) * 0.5, along);
  }
  uv.needsUpdate = true;
  return geometry;
}

function roundedRect(shape: Shape, x: number, y: number, w: number, h: number, r: number) {
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

/** A loop shaped like a running track, in the plane across the card (y up, z through it), so it threads the slot. */
class Stadium extends Curve<Vector3> {
  constructor(private readonly half: number, private readonly top: number, private readonly bottom: number) {
    super();
  }

  getPoint(t: number, target = new Vector3()) {
    const r = this.half;
    const straight = this.top - this.bottom - 2 * r;
    const total = 2 * straight + 2 * Math.PI * r;
    let d = t * total;
    if (d < straight) return target.set(0, this.top - r - d, r);
    d -= straight;
    if (d < Math.PI * r) {
      const a = d / r;
      return target.set(0, this.bottom + r - Math.sin(a) * r, Math.cos(a) * r);
    }
    d -= Math.PI * r;
    if (d < straight) return target.set(0, this.bottom + r + d, -r);
    d -= straight;
    const a = d / r;
    return target.set(0, this.top - r + Math.sin(a) * r, -Math.cos(a) * r);
  }
}

/** The clip, from the crimp at its origin downwards: a crimp, a swivel and a loop through the slot (DESIGN.md "The staff pass"). */
function clipModel(metal: MeshStandardMaterial) {
  const group = new Group();
  const crimp = new Mesh(new RoundedBoxGeometry(1.4 * em, 0.95 * em, 0.42 * em, 2, 0.12 * em), metal);
  crimp.position.y = -0.475 * em;
  const swivel = new Mesh(new CylinderGeometry(0.17 * em, 0.17 * em, 0.55 * em, 16), metal);
  swivel.position.y = -1.2 * em;
  const tube = 0.12 * em;
  // The loop's inside rests on the slot's upper edge, 2.65 em below the crimp.
  const loop = new Mesh(new TubeGeometry(new Stadium(0.32 * em, -1.4 * em, -2.65 * em - 2 * tube), 64, tube, 10, true), metal);
  for (const part of [crimp, swivel, loop]) {
    part.castShadow = true;
    group.add(part);
  }
  return group;
}

/**
 * A ply of woven strap: a ribbon through the ply's particles that keeps its width as it twists. Its sideways direction
 * starts as the card's and is carried up the ribbon without turning about it (parallel transport), so the strap twists
 * with the card and never folds flat to the viewer.
 */
class Ribbon {
  readonly mesh: Mesh;
  private readonly positions = new Float32Array(RIBBON_SAMPLES * 2 * 3);
  private readonly normals = new Float32Array(RIBBON_SAMPLES * 2 * 3);
  private readonly uvs = new Float32Array(RIBBON_SAMPLES * 2 * 2);
  private readonly geometry = new BufferGeometry();
  private readonly curve = new CatmullRomCurve3([], false, "centripetal");

  constructor(material: MeshStandardMaterial) {
    const index: number[] = [];
    for (let i = 0; i < RIBBON_SAMPLES - 1; i++) {
      const a = i * 2;
      index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    this.geometry.setIndex(index);
    this.geometry.setAttribute("position", new BufferAttribute(this.positions, 3));
    this.geometry.setAttribute("normal", new BufferAttribute(this.normals, 3));
    this.geometry.setAttribute("uv", new BufferAttribute(this.uvs, 2));
    this.mesh = new Mesh(this.geometry, material);
    this.mesh.castShadow = true;
    this.mesh.frustumCulled = false;
  }

  update(points: Vec3[], across: Vec3) {
    this.curve.points = points.map(v);
    const samples = this.curve.getSpacedPoints(RIBBON_SAMPLES - 1);
    const half = (1 * em) / 2;
    let side = across;
    let along = 0;
    for (let i = 0; i < RIBBON_SAMPLES; i++) {
      const here = v3(samples[i]);
      const next = v3(samples[Math.min(i + 1, RIBBON_SAMPLES - 1)]);
      const before = v3(samples[Math.max(i - 1, 0)]);
      const tangent = normalise(sub(next, before));
      side = normalise(sub(side, scale(tangent, dot(side, tangent))));
      const facing = cross(side, tangent);
      if (i > 0) along += Math.hypot(here.x - samples[i - 1].x, here.y - samples[i - 1].y, here.z - samples[i - 1].z);
      for (const [k, sign] of [[0, -1], [1, 1]] as const) {
        const at = (i * 2 + k) * 3;
        this.positions[at] = here.x + side.x * half * sign;
        this.positions[at + 1] = here.y + side.y * half * sign;
        this.positions[at + 2] = here.z + side.z * half * sign;
        this.normals[at] = facing.x;
        this.normals[at + 1] = facing.y;
        this.normals[at + 2] = facing.z;
        this.uvs[(i * 2 + k) * 2] = k;
        this.uvs[(i * 2 + k) * 2 + 1] = along / (1 * em);
      }
    }
    for (const name of ["position", "normal", "uv"]) this.geometry.getAttribute(name).needsUpdate = true;
  }
}

/** The strap's weave: a fine twill in the employer's colour, darker at the edges where the webbing rolls. */
function weaveTexture(colour: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext("2d")!;
  context.fillStyle = colour;
  context.fillRect(0, 0, 64, 64);
  for (let i = -64; i < 128; i += 4) {
    context.strokeStyle = "rgb(255 255 255 / 0.09)";
    context.beginPath();
    context.moveTo(i, 0);
    context.lineTo(i + 64, 64);
    context.stroke();
    context.strokeStyle = "rgb(0 0 0 / 0.12)";
    context.beginPath();
    context.moveTo(i + 2, 64);
    context.lineTo(i + 66, 0);
    context.stroke();
  }
  const edges = context.createLinearGradient(0, 0, 64, 0);
  edges.addColorStop(0, "rgb(0 0 0 / 0.3)");
  edges.addColorStop(0.18, "rgb(0 0 0 / 0)");
  edges.addColorStop(0.82, "rgb(0 0 0 / 0)");
  edges.addColorStop(1, "rgb(0 0 0 / 0.3)");
  context.fillStyle = edges;
  context.fillRect(0, 0, 64, 64);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = RepeatWrapping;
  return texture;
}
