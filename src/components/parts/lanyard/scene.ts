/*
 * The 3D staff passes (#448): plain three.js over the CSS passes, which stay as the page's print and its fallback. Loaded
 * only when the passes come into view (lanyard.ts). One canvas covers the stage (the homepage's rail, a Role story's, the
 * prototype's), scrolling with it where the rail scrolls; each card is laid where its CSS card is, at the same size, so
 * nothing moves when the scene takes over. Then each hangs from its two plies, swings once and settles.
 *
 * A mouse or pen takes hold of a card at once. A touch takes hold only after a short press, so a swipe across the passes
 * scrolls the page or the rail as before. A press that does not drag follows the pass's link, if it has one.
 */
import {
  AmbientLight,
  Color,
  DirectionalLight,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NeutralToneMapping,
  PMREMGenerator,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  Raycaster,
  Scene,
  ShadowMaterial,
  SRGBColorSpace,
  VSMShadowMap,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { HangingPass } from "./hanging";
import { STEP, type Vec3 } from "./physics";
import { strapMaterial } from "./strap";

/** The camera's vertical field of view: long, so the cards are not distorted near the edges of the view. */
const FOV = 20;
/** How long a touch rests on a card before it takes hold, and how far a press may wander and still be a tap. */
const HOLD_MS = 250;
const SLOP = 8;
/** The card's lower edge in pass.css. */
const EDGE = new Color(0xc9c8c1);
/**
 * The arrival: each pass is set swinging, the next a little the other way, as if each had just been hung. The swing is
 * mostly a turn and a sway towards the viewer: sideways it stays within the gap between passes (about 20 px), so a pass
 * never swings into its neighbour.
 */
const ARRIVALS = [
  { velocity: { x: 0.22, y: 0, z: 0.55 }, spin: 1.8 },
  { velocity: { x: -0.18, y: 0, z: 0.45 }, spin: -1.5 },
  { velocity: { x: 0.16, y: 0, z: -0.45 }, spin: 1.3 },
];

export type Mount = { stage: HTMLElement; passes: HTMLElement[]; onReady: () => void };

export async function mountLanyard({ stage, passes, onReady }: Mount): Promise<() => void> {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, failIfMajorPerformanceCaveat: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  // Variance shadows blur into a wide penumbra, like the CSS pass's soft shadows; only the backdrop receives them.
  renderer.shadowMap.type = VSMShadowMap;
  const canvas = renderer.domElement;
  canvas.className = "lanyard__scene";
  canvas.setAttribute("aria-hidden", "true");

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  scene.environment = environment;
  scene.environmentIntensity = 0.4;

  const camera = new PerspectiveCamera(FOV, 1, 0.1, 100);
  const key = new DirectionalLight(0xffffff, 0.95);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.radius = 14;
  key.shadow.blurSamples = 16;
  scene.add(key, key.target, new AmbientLight(0xffffff, 0.12));

  const shadow = new ShadowMaterial();
  const backdrop = new Mesh(new PlaneGeometry(1, 1), shadow);
  backdrop.receiveShadow = true;
  backdrop.position.z = -0.35;
  scene.add(backdrop);

  // Shared by every pass: the card's plain back and its edge (the white core, a step greyer than its face), the clip's
  // nickel-plated steel, brushed along it, and the darker steel of its rivet, lit more by the room than the card is.
  const back = new MeshStandardMaterial({ roughness: 0.72 });
  const edge = new MeshStandardMaterial({ roughness: 0.7 });
  const metal = new MeshPhysicalMaterial({ color: 0xb9bcc3, metalness: 1, roughness: 0.24, anisotropy: 0.6, envMap: environment, envMapIntensity: 1.3 });
  const rivet = new MeshPhysicalMaterial({ color: 0x55565c, metalness: 1, roughness: 0.4, envMap: environment, envMapIntensity: 1 });
  const fabrics = new Map<string, MeshPhysicalMaterial>();
  const anisotropy = renderer.capabilities.getMaxAnisotropy();
  const fabric = (colour: string) => {
    if (!fabrics.has(colour)) fabrics.set(colour, strapMaterial(colour, anisotropy));
    return fabrics.get(colour)!;
  };
  const hanging = await Promise.all(passes.map((pass) => HangingPass.paint(pass, { back, edge, metal, rivet, environment, anisotropy, fabric })));
  hanging.forEach((pass) => scene.add(...pass.meshes));

  // Laying out: the stage's pixels map to world units at the cards' plane, where the widest card's width is 1. Where the
  // stage scrolls sideways (the homepage's rail on a phone), the canvas spans all it scrolls through.
  let view = { width: 0, height: 0, unit: 0 };
  const measure = () => ({ width: contentWidth(), height: stage.clientHeight, unit: Math.max(...hanging.map((pass) => pass.printed.offsetWidth)) });
  // The canvas itself overflows the stage at its last size, so it is taken out of the measure: a narrower stage shrinks it.
  const contentWidth = () => {
    const was = canvas.style.width;
    canvas.style.width = "0";
    const width = stage.scrollWidth;
    canvas.style.width = was;
    return width;
  };
  const toWorld = (x: number, y: number): Vec3 => ({ x: (x - view.width / 2) / view.unit, y: (view.height / 2 - y) / view.unit, z: 0 });

  function layout(arrive: boolean) {
    view = measure();
    renderer.setSize(view.width, view.height);
    const tall = view.height / view.unit;
    const wide = view.width / view.unit;
    camera.aspect = view.width / view.height;
    camera.position.set(0, 0, tall / 2 / Math.tan((FOV * Math.PI) / 360));
    camera.far = camera.position.z + 20;
    camera.updateProjectionMatrix();

    backdrop.scale.set(wide * 1.5, tall * 1.5, 1);
    key.position.set(-tall * 0.5, tall * 0.9, tall * 1.4);
    const reach = Math.max(wide, tall);
    Object.assign(key.shadow.camera, { left: -reach, right: reach, top: reach, bottom: -reach, near: 0.1, far: tall * 4 });
    key.shadow.camera.updateProjectionMatrix();

    hanging.forEach((pass, i) => {
      const card = pass.printed;
      const { left, top } = offsetWithin(card, stage);
      pass.layout(toWorld(left + card.offsetWidth / 2, top + card.offsetHeight / 2), card.offsetWidth / view.unit, tall / 2 + 0.3);
      const { velocity, spin } = ARRIVALS[i % ARRIVALS.length];
      if (arrive) pass.lanyard.push(velocity, spin);
    });
    draw();
  }

  function draw() {
    hanging.forEach((pass) => pass.draw());
    renderer.render(scene, camera);
  }

  // The loop: fixed steps, drawn each frame while the stage is in view and something is moving.
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
      hanging.forEach((pass) => pass.lanyard.step());
      owed -= STEP;
    }
    draw();
    // Off screen the loop ends here; the observer starts it again when the stage returns.
    if (visible && hanging.some((pass) => !pass.lanyard.asleep)) frame = requestAnimationFrame(tick);
  }

  // Holding a card: the point pressed follows the pointer in the card's plane until let go.
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  const plane = new Plane(new Vector3(0, 0, 1), 0);
  const hit = new Vector3();
  const aim = (event: PointerEvent) => {
    const box = canvas.getBoundingClientRect();
    raycaster.setFromCamera(pointer.set(((event.clientX - box.left) / box.width) * 2 - 1, -((event.clientY - box.top) / box.height) * 2 + 1), camera);
  };
  const cast = (event: PointerEvent) => {
    aim(event);
    hanging.forEach((pass) => pass.card.updateMatrixWorld());
    const found = raycaster.intersectObjects(hanging.map((pass) => pass.card), false)[0];
    return found && { pass: hanging.find((pass) => pass.card === found.object)!, point: found.point };
  };

  type Press = { pass: HangingPass; point: Vector3; id: number; touch: boolean; x: number; y: number; held: boolean; moved: boolean; timer: number; middle: boolean };
  let press: Press | null = null;
  const grab = () => {
    if (!press) return;
    const { pass, point, id } = press;
    // A pointer that has already gone (a touch ended as its hold began) is not held.
    try {
      canvas.setPointerCapture(id);
    } catch {
      press = null;
      return;
    }
    plane.constant = -point.z;
    pass.hold(point);
    press.held = true;
    canvas.dataset.holding = "";
    run();
  };
  const down = (event: PointerEvent) => {
    if (event.button > 1 || press) return;
    const found = cast(event);
    if (!found) return;
    const touch = event.pointerType === "touch";
    const middle = event.button === 1;
    press = { ...found, id: event.pointerId, touch, x: event.clientX, y: event.clientY, held: false, moved: false, timer: 0, middle };
    // A middle press only opens the link, as it would on the printed pass; it never takes hold. It is captured, so its
    // release reaches the canvas wherever it happens and the press is always cleared.
    if (middle) {
      if (found.pass.link) event.preventDefault();
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch {
        press = null;
      }
      return;
    }
    if (touch) {
      press.timer = window.setTimeout(grab, HOLD_MS);
      return;
    }
    event.preventDefault();
    grab();
  };
  const move = (event: PointerEvent) => {
    if (press?.id === event.pointerId) {
      if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > SLOP) {
        press.moved = true;
        // A touch that moves before it takes hold is a swipe: the page or the rail scrolls.
        clearTimeout(press.timer);
      }
      if (press.held) {
        aim(event);
        if (raycaster.ray.intersectPlane(plane, hit)) press.pass.lanyard.move({ x: hit.x, y: hit.y, z: hit.z });
      }
      return;
    }
    if (event.pointerType === "mouse") canvas.style.cursor = cast(event) ? "grab" : "";
  };
  const end = (event: PointerEvent) => {
    if (press?.id !== event.pointerId) return;
    const { pass, held, moved, touch, timer, middle } = press;
    clearTimeout(timer);
    press = null;
    if (held) {
      pass.lanyard.release();
      delete canvas.dataset.holding;
      run();
    }
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    // A press that did not drag is a click on the pass; a touch held to take hold of the card is not. A middle click, or
    // one with Ctrl, Cmd or Shift, opens the link in a new tab as the printed link would.
    if (event.type !== "pointerup" || moved || (touch && held) || !pass.link) return;
    if (middle || event.ctrlKey || event.metaKey || event.shiftKey) window.open(pass.link.href, "_blank", "noopener");
    else pass.link.click();
  };
  // Once a touch has taken hold, its moves drag the card rather than scroll, and a long press opens no menu.
  const holdTouch = (event: TouchEvent) => {
    if (press?.held && event.cancelable) event.preventDefault();
  };
  const noMenu = (event: Event) => {
    if (press?.touch) event.preventDefault();
  };
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
  canvas.addEventListener("touchmove", holdTouch, { passive: false });
  canvas.addEventListener("contextmenu", noMenu);

  // Off screen the loop stops; a resize lays the passes out again at rest; a theme change reprints the card stock.
  const seen = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) run();
  });
  seen.observe(stage);
  let resizing = 0;
  const resized = new ResizeObserver(() => {
    cancelAnimationFrame(resizing);
    resizing = requestAnimationFrame(() => {
      // Observing reports the stage's size once at the start; only a real change of size lays the passes out again.
      const next = measure();
      if (next.width === view.width && next.height === view.height && next.unit === view.unit) return;
      layout(false);
    });
  });
  const shade = () => {
    const dark = getComputedStyle(document.documentElement).getPropertyValue("--dark").trim() === "1";
    shadow.opacity = dark ? 0.5 : 0.22;
    shadow.color.set(dark ? 0x000000 : 0x1e1c16);
    const stock = getComputedStyle(hanging[0].printed).getPropertyValue("--stock-end").trim() || "#f5f4f0";
    back.color.set(stock);
    edge.color.set(stock).lerp(EDGE, 0.6);
  };
  const reprint = async () => {
    await Promise.all(hanging.map((pass) => pass.reprint()));
    shade();
    draw();
  };
  // With motion on, the palette crossfades while the root carries data-theme-changing (theme.ts), so the stock is read
  // again when that mark goes, once the colours have settled.
  const themed = new MutationObserver(() => void reprint());
  themed.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-theme-changing"] });
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
    if (press) clearTimeout(press.timer);
    seen.disconnect();
    resized.disconnect();
    themed.disconnect();
    scheme.removeEventListener("change", schemeChanged);
    canvas.remove();
    hanging.forEach((pass) => pass.dispose());
    backdrop.geometry.dispose();
    [back, edge, metal, rivet, shadow, ...fabrics.values()].forEach((material) => material.dispose());
    [...fabrics.values()].forEach((material) => [material.map, material.normalMap].forEach((texture) => texture?.dispose()));
    environment.dispose();
    renderer.dispose();
  };
}

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
