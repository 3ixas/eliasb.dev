/*
 * The pass's solid parts (#448), each one card wide (the card is 1 wide; an em is 1/14.5, as in pass.css): the card with
 * its slot, and the clip that carries it. A pass of another size scales them.
 */
import { CylinderGeometry, Curve, ExtrudeGeometry, Group, Mesh, Shape, TubeGeometry, Vector3, type Material } from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export const em = 1 / 14.5;
/** The card's thickness against its width: a CR80 card is 0.76 mm on 54 mm. */
const THICKNESS = 0.76 / 54;
/** The card's material slots: its printed face, its plain back and its edge. */
export const FACE = 0;
export const BACK = 1;
export const EDGE = 2;
/** How far the slot's upper edge, where the clip carries the card, is below the card's top edge. */
export const SLOT = 0.9 * em;
/** How far the crimp is above the slot's upper edge. */
export const CLIP = 2.65 * em;

/** The card, centred on its origin: CR80 with 0.8 em corners and the punched slot, extruded to its thickness. */
export function cardGeometry(height: number) {
  const width = 1;
  const outline = roundedRect(new Shape(), -width / 2, -height / 2, width, height, 0.8 * em);
  const slotTop = height / 2 - SLOT;
  outline.holes.push(roundedRect(new Shape(), -1.45 * em, slotTop - 0.8 * em, 2.9 * em, 0.8 * em, 0.4 * em));
  const bevel = THICKNESS * 0.18;
  const geometry = new ExtrudeGeometry(outline, { depth: THICKNESS - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 12 });
  geometry.translate(0, 0, -(THICKNESS - 2 * bevel) / 2);
  // ExtrudeGeometry lays both lids in its first group, the back's half first, and the sides in its second.
  const [lids, sides] = geometry.groups;
  const half = lids.count / 2;
  geometry.clearGroups();
  geometry.addGroup(lids.start, half, BACK);
  geometry.addGroup(lids.start + half, half, FACE);
  geometry.addGroup(sides.start, sides.count, EDGE);
  // The face's print covers the whole card.
  const position = geometry.getAttribute("position");
  const uv = geometry.getAttribute("uv");
  for (let i = lids.start + half; i < lids.start + lids.count; i++) uv.setXY(i, position.getX(i) + width / 2, (position.getY(i) + height / 2) / height);
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

/** The clip, from the crimp at its origin downwards: a crimp with its rivet, a swivel and a loop through the slot (DESIGN.md "The staff pass"). */
export function clipModel(metal: Material, rivetMetal: Material) {
  const group = new Group();
  const crimp = new Mesh(new RoundedBoxGeometry(1.4 * em, 0.95 * em, 0.42 * em, 3, 0.14 * em), metal);
  crimp.position.y = -0.475 * em;
  // The rivet through the crimp and the strap, its head proud of both faces.
  const rivet = new Mesh(new CylinderGeometry(0.17 * em, 0.17 * em, 0.5 * em, 20), rivetMetal);
  rivet.rotation.x = Math.PI / 2;
  rivet.position.y = -0.4 * em;
  const swivel = new Mesh(new CylinderGeometry(0.17 * em, 0.17 * em, 0.55 * em, 16), metal);
  swivel.position.y = -1.2 * em;
  const tube = 0.12 * em;
  // The loop's inside rests on the slot's upper edge, CLIP below the crimp.
  const loop = new Mesh(new TubeGeometry(new Stadium(0.32 * em, -1.4 * em, -CLIP - 2 * tube), 64, tube, 10, true), metal);
  for (const part of [crimp, rivet, swivel, loop]) {
    part.castShadow = true;
    group.add(part);
  }
  return group;
}
