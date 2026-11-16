/*
 * One pass in the scene (#448): its card, painted from its own print, its clip and its two plies, and the lanyard that
 * moves them. The scene lays it where its printed card is and draws it each frame; materials shared between passes (the
 * stock, the metal) are the scene's.
 */
import { CanvasTexture, Matrix4, Mesh, MeshPhysicalMaterial, SRGBColorSpace, Vector3, type Group, type Material, type Texture } from "three";
import { paintPrint, type Print } from "./face";
import { BACK, CLIP, EDGE, FACE, SLOT, cardGeometry, clipModel } from "./models";
import { Lanyard, add, cross, dot, normalise, scale, sub, type Vec3 } from "./physics";
import { Strap } from "./strap";

/** How far the plies open from vertical, each way (DESIGN.md "The staff pass"). */
const SPREAD = (4.5 * Math.PI) / 180;

export type Shared = {
  back: Material;
  edge: Material;
  metal: Material;
  rivet: Material;
  environment: Texture;
  anisotropy: number;
  /** The strap's fabric in a colour, shared by every pass on that colour. */
  fabric: (colour: string) => MeshPhysicalMaterial;
};

export class HangingPass {
  readonly card: Mesh;
  readonly clip: Group;
  readonly plies: readonly [Strap, Strap];
  /** The homepage's pass is a link to its employer in Work; a Role story's is not. */
  readonly link: HTMLAnchorElement | null;
  /** The printed card it takes the place of. */
  readonly printed: HTMLElement;
  lanyard!: Lanyard;
  private size = 1;
  private readonly aspect: number;
  private readonly face: MeshPhysicalMaterial;
  private readonly textures: [CanvasTexture, CanvasTexture, CanvasTexture];

  static async paint(pass: HTMLElement, shared: Shared) {
    return new HangingPass(pass, await paintPrint(pass), shared);
  }

  private constructor(private readonly pass: HTMLElement, print: Print, shared: Shared) {
    const printed = pass.querySelector<HTMLElement>(".pass__card");
    if (!printed) throw new Error("The pass has no card");
    this.printed = printed;
    this.link = pass instanceof HTMLAnchorElement ? pass : null;
    this.aspect = print.aspect;

    const colour = new CanvasTexture(print.canvas);
    colour.colorSpace = SRGBColorSpace;
    colour.anisotropy = shared.anisotropy;
    const surface = new CanvasTexture(print.surface);
    const foil = new CanvasTexture(print.foil);
    this.textures = [colour, surface, foil];
    // A laminated card: satin print under a glossy film. Where the hologram is, the print is metal foil under a thin film whose
    // thickness varies across the disc, so it changes colour as the card turns (the maps are painted in face.ts).
    this.face = new MeshPhysicalMaterial({
      map: colour,
      roughness: 1,
      roughnessMap: surface,
      metalness: 1,
      metalnessMap: surface,
      clearcoat: 0.6,
      clearcoatRoughness: 0.18,
      iridescence: 1,
      iridescenceMap: foil,
      iridescenceThicknessMap: foil,
      iridescenceThicknessMinimum: 250,
      iridescenceThicknessMaximum: 750,
      iridescenceIOR: 1.6,
      envMap: shared.environment,
      envMapIntensity: 0.6,
    });
    const materials: Material[] = [];
    materials[FACE] = this.face;
    materials[BACK] = shared.back;
    materials[EDGE] = shared.edge;
    this.card = new Mesh(cardGeometry(this.aspect), materials);
    this.card.castShadow = true;
    this.card.matrixAutoUpdate = false;
    this.clip = clipModel(shared.metal, shared.rivet);
    this.clip.matrixAutoUpdate = false;
    const fabric = shared.fabric(getComputedStyle(pass).getPropertyValue("--lanyard").trim() || "#0b6b47");
    this.plies = [new Strap(fabric, -0.6), new Strap(fabric, 0.6)];
  }

  get meshes() {
    return [this.card, this.clip, ...this.plies.map((ply) => ply.mesh)];
  }

  /** Hangs the pass at rest with its card's centre at `centre`, `size` units wide, its plies leaving the view at `top`. */
  layout(centre: Vec3, size: number, top: number) {
    this.size = size;
    const height = size * this.aspect;
    const hangY = height / 2 - SLOT * size;
    const crimp = add(centre, { x: 0, y: hangY + CLIP * size, z: 0 });
    const rise = top - crimp.y;
    const anchors = [-1, 1].map((side) => ({ x: crimp.x + side * Math.tan(SPREAD) * rise, y: top, z: 0 })) as [Vec3, Vec3];
    this.lanyard = new Lanyard({ anchors, crimp, centre }, { width: size, height, hangY });
    this.plies.forEach((ply) => (ply.scale = size));
  }

  /** Takes hold of the card at a point on it, in world space. */
  hold(point: Vector3) {
    const local = this.card.worldToLocal(point.clone()).multiplyScalar(this.size);
    this.lanyard.hold({ x: local.x, y: local.y, z: local.z }, { x: point.x, y: point.y, z: point.z });
  }

  draw() {
    const { lanyard, size } = this;
    const { centre, x, y, z } = lanyard.frame();
    place(this.card, x, y, z, centre, size);
    const crimp = lanyard.get(lanyard.crimp);
    const slot = lanyard.get(lanyard.card[0]);
    const up = normalise(sub(crimp, slot));
    const across = normalise(sub(x, scale(up, dot(x, up))));
    place(this.clip, across, up, cross(across, up), crimp, size);
    lanyard.plies.forEach((ply, i) => this.plies[i].update(ply.map((index) => lanyard.get(index)), across));
  }

  /** Paints the card again, for a change of theme (its stock is a step darker in dark). */
  async reprint() {
    const print = await paintPrint(this.pass);
    [print.canvas, print.surface, print.foil].forEach((image, i) => {
      this.textures[i].image = image;
      this.textures[i].needsUpdate = true;
    });
  }

  dispose() {
    for (const mesh of this.meshes) mesh.traverse((part) => part instanceof Mesh && part.geometry.dispose());
    this.face.dispose();
    this.textures.forEach((texture) => texture.dispose());
  }
}

const basis = new Matrix4();
const v = ({ x, y, z }: Vec3) => new Vector3(x, y, z);

/** Sets an object's matrix from its axes, its origin and its size. */
function place(object: Mesh | Group, x: Vec3, y: Vec3, z: Vec3, at: Vec3, size: number) {
  object.matrix.copy(basis.makeBasis(v(x), v(y), v(z)).scale(new Vector3(size, size, size)).setPosition(at.x, at.y, at.z));
  object.matrixWorldNeedsUpdate = true;
}
