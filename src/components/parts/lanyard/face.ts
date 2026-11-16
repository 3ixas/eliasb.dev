/*
 * Paints the card's print onto a canvas from the CSS pass itself (#448): a copy of the pass is laid out off screen, unturned,
 * and every word, rule, photo and mark is drawn where the browser put it. The scene and its fallback print the same values
 * from the same markup (PassCard), so they cannot disagree. The back is plain stock, so it needs no print.
 */

/** The face's width in texture pixels; its height follows the card. */
const FACE_WIDTH = 1024;
/** How long the print waits for a photo, in milliseconds. */
const PHOTO_WAIT = 4000;

/**
 * `canvas` is the colour; `surface` and `foil` are data maps over the same layout, at a quarter of the size. `surface`: green
 * is roughness and blue metalness (three.js reads them from those channels). `foil`: red is where the hologram's film is, and
 * green the film's thickness, which sets the colour it shows at each angle.
 */
export type Print = { canvas: HTMLCanvasElement; surface: HTMLCanvasElement; foil: HTMLCanvasElement; aspect: number };

export async function paintPrint(pass: HTMLElement): Promise<Print> {
  const holder = document.createElement("div");
  holder.setAttribute("aria-hidden", "true");
  holder.inert = true;
  holder.style.cssText = "position:fixed;left:-10000px;top:0;pointer-events:none;contain:layout paint";
  const copy = pass.cloneNode(true) as HTMLElement;
  copy.style.transform = "none";
  copy.style.animation = "none";
  copy.style.transition = "none";
  copy.style.opacity = "1";
  copy.removeAttribute("id");
  holder.append(copy);
  document.body.append(holder);
  try {
    const card = copy.querySelector<HTMLElement>(".pass__card");
    if (!card) throw new Error("The pass has no card to paint");
    await document.fonts.ready;
    // The copy is off screen, where a lazy image may never load (iOS Safari leaves it waiting): it loads at once, and the
    // print waits for it a few seconds at most, then prints without the photo rather than not at all.
    await Promise.all(
      [...card.querySelectorAll("img")].map((image) => {
        image.loading = "eager";
        return Promise.race([image.decode().catch(() => undefined), new Promise((done) => setTimeout(done, PHOTO_WAIT))]);
      }),
    );
    return paint(card, copy.dataset.state === "returned");
  } finally {
    holder.remove();
  }
}

function paint(card: HTMLElement, returned: boolean): Print {
  const box = card.getBoundingClientRect();
  const s = FACE_WIDTH / box.width;
  const height = Math.round(box.height * s);
  const canvas = document.createElement("canvas");
  canvas.width = FACE_WIDTH;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No 2D canvas");
  const at = (rect: DOMRect) => ({ x: (rect.left - box.left) * s, y: (rect.top - box.top) * s, w: rect.width * s, h: rect.height * s });

  const style = getComputedStyle(card);
  const stock = context.createLinearGradient(0, 0, 0, height);
  stock.addColorStop(0, style.getPropertyValue("--stock").trim() || "#fff");
  stock.addColorStop(1, style.getPropertyValue("--stock-end").trim() || "#f5f4f0");
  context.fillStyle = stock;
  context.fillRect(0, 0, FACE_WIDTH, height);

  const band = card.querySelector<HTMLElement>(".pass__band");
  if (band) {
    const { x, y, w, h } = at(band.getBoundingClientRect());
    context.fillStyle = getComputedStyle(band).backgroundColor;
    context.fillRect(x, y, w, h);
    const light = context.createLinearGradient(0, y, 0, y + h * 0.6);
    light.addColorStop(0, "rgb(255 255 255 / 0.1)");
    light.addColorStop(1, "rgb(255 255 255 / 0)");
    context.fillStyle = light;
    context.fillRect(x, y, w, h);
  }

  const photo = card.querySelector<HTMLImageElement>(".pass__photo");
  if (photo?.complete && photo.naturalWidth) {
    const rect = at(photo.getBoundingClientRect());
    const radius = parseFloat(getComputedStyle(photo).borderTopLeftRadius) * s;
    context.save();
    roundRect(context, rect.x, rect.y, rect.w, rect.h, radius);
    context.clip();
    context.fillStyle = getComputedStyle(photo).backgroundColor;
    context.fillRect(rect.x, rect.y, rect.w, rect.h);
    drawCover(context, returned ? greyscale(photo) : photo, rect);
    context.restore();
    context.strokeStyle = "rgb(0 0 0 / 0.25)";
    context.lineWidth = 0.5 * s;
    roundRect(context, rect.x, rect.y, rect.w, rect.h, radius);
    context.stroke();
  }

  // The rules between the points: each element's top and bottom borders.
  for (const element of card.querySelectorAll<HTMLElement>(".pass__points, .pass__points > span")) {
    const rect = at(element.getBoundingClientRect());
    const computed = getComputedStyle(element);
    for (const [side, y] of [["Top", rect.y], ["Bottom", rect.y + rect.h]] as const) {
      const width = parseFloat(computed[`border${side}Width`]);
      if (!width) continue;
      context.fillStyle = computed[`border${side}Color`];
      context.fillRect(rect.x, side === "Top" ? y : y - width * s, rect.w, width * s);
    }
  }

  const holo = card.querySelector<HTMLElement>(".pass__holo");
  if (holo) {
    const { x, y, w } = at(holo.getBoundingClientRect());
    const r = w / 2;
    const turn = context.createConicGradient((20 * Math.PI) / 180, x + r, y + r);
    ["#9fe8ff", "#dcb8ff", "#ffe39a", "#a9f5c4", "#9fe8ff"].forEach((colour, i) => turn.addColorStop(i / 4, colour));
    context.fillStyle = turn;
    context.beginPath();
    context.arc(x + r, y + r, r, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "rgb(255 255 255 / 0.75)";
    context.lineWidth = s;
    context.beginPath();
    context.arc(x + r, y + r, r - s / 2, 0, Math.PI * 2);
    context.stroke();
  }

  const code = card.querySelector<HTMLElement>(".pass__code");
  if (code) {
    // pass.css's barcode: bars of 1, 2, 1 and 2 px in each 13 px.
    const { x, y, w, h } = at(code.getBoundingClientRect());
    context.save();
    context.globalAlpha = Number(getComputedStyle(code).opacity);
    context.fillStyle = "#141416";
    for (let left = 0; left < w / s; left += 13) {
      for (const [from, to] of [[0, 1], [3, 5], [6, 7], [10, 12]]) {
        const start = left + from;
        if (start >= w / s) break;
        context.fillRect(x + start * s, y, (Math.min(left + to, w / s) - start) * s, h);
      }
    }
    context.restore();
  }

  paintWords(context, card, box, s);
  const finish = paintFinish(card, box, height);
  return { canvas, ...finish, aspect: box.height / box.width };
}

/** The laminate's satin, and the hologram's metal foil and film. */
function paintFinish(card: HTMLElement, box: DOMRect, faceHeight: number) {
  const k = 1 / 4;
  const width = FACE_WIDTH * k;
  const height = Math.round(faceHeight * k);
  const surface = document.createElement("canvas");
  const foil = document.createElement("canvas");
  for (const canvas of [surface, foil]) {
    canvas.width = width;
    canvas.height = height;
  }
  const paint = surface.getContext("2d");
  const film = foil.getContext("2d");
  if (!paint || !film) throw new Error("No 2D canvas");
  paint.fillStyle = "rgb(0 128 0)";
  paint.fillRect(0, 0, width, height);
  film.fillStyle = "#000";
  film.fillRect(0, 0, width, height);

  const holo = card.querySelector<HTMLElement>(".pass__holo");
  if (holo) {
    const rect = holo.getBoundingClientRect();
    const s = width / box.width;
    const r = (rect.width / 2) * s;
    const cx = (rect.left - box.left) * s + r;
    const cy = (rect.top - box.top) * s + r;
    // Half metal: bright enough to keep its pastel print, metal enough to catch the room.
    paint.fillStyle = "rgb(0 70 140)";
    paint.beginPath();
    paint.arc(cx, cy, r, 0, Math.PI * 2);
    paint.fill();
    // The film: rings and spokes of changing thickness, so each part of the disc turns a different colour as the card moves.
    const x0 = Math.floor(cx - r);
    const y0 = Math.floor(cy - r);
    const size = Math.ceil(r * 2) + 1;
    const image = film.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x0 + x + 0.5 - cx;
        const dy = y0 + y + 0.5 - cy;
        const out = Math.hypot(dx, dy) / r;
        if (out > 1) continue;
        const phase = (3 * Math.atan2(dy, dx)) / (2 * Math.PI) + 1.4 * out;
        const i = (y * size + x) * 4;
        image.data[i] = 255;
        image.data[i + 1] = 255 * (0.5 - 0.5 * Math.cos(2 * Math.PI * phase));
        image.data[i + 3] = 255;
      }
    }
    film.putImageData(image, x0, y0);
  }
  return { surface, foil };
}

/**
 * Every word of the card's text, in its own face, size and colour, where the browser laid it out. Drawn at the page's own
 * size under a scale, so a variable face picks the same optical size as on the page, and each word is fitted to the width
 * the browser gave it, so a word can never run into the next.
 */
function paintWords(context: CanvasRenderingContext2D, card: HTMLElement, box: DOMRect, s: number) {
  const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  context.save();
  context.scale(s, s);
  context.textBaseline = "alphabetic";
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const element = node.parentElement;
    if (!element) continue;
    const computed = getComputedStyle(element);
    const clip = clippingBox(element, card);
    context.font = `${computed.fontStyle} ${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;
    context.fillStyle = computed.color;
    if ("letterSpacing" in context) context.letterSpacing = computed.letterSpacing === "normal" ? "0px" : computed.letterSpacing;
    const text = node.textContent ?? "";
    for (const match of text.matchAll(/\S+/g)) {
      range.setStart(node, match.index);
      range.setEnd(node, match.index + match[0].length);
      const rect = range.getClientRects()[0];
      if (!rect || !rect.width) continue;
      const middle = rect.top + rect.height / 2;
      if (clip && (middle < clip.top || middle > clip.bottom)) continue;
      const metrics = context.measureText(match[0]);
      context.fillText(match[0], rect.left - box.left, rect.bottom - box.top - metrics.fontBoundingBoxDescent, rect.width);
    }
  }
  context.restore();
}

/** The nearest box between the text and the card that hides what overflows it (the band's two-line clamp). */
function clippingBox(element: HTMLElement, card: HTMLElement): DOMRect | null {
  for (let at: HTMLElement | null = element; at && at !== card; at = at.parentElement) {
    if (getComputedStyle(at).overflow !== "visible") return at.getBoundingClientRect();
  }
  return null;
}

function drawCover(context: CanvasRenderingContext2D, image: CanvasImageSource & { width: number; height: number }, rect: { x: number; y: number; w: number; h: number }) {
  const { width, height } = image instanceof HTMLImageElement ? { width: image.naturalWidth, height: image.naturalHeight } : image;
  const k = Math.max(rect.w / width, rect.h / height);
  const w = width * k;
  const h = height * k;
  context.drawImage(image, rect.x + (rect.w - w) / 2, rect.y + (rect.h - h) / 2, w, h);
}

/** A returned pass's photo: greyscale with a touch of contrast, as pass.css draws it. */
function greyscale(image: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) return canvas;
  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = pixels.data;
  for (let i = 0; i < data.length; i += 4) {
    const luma = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    const value = Math.max(0, Math.min(255, (luma - 128) * 1.05 + 128));
    data[i] = data[i + 1] = data[i + 2] = value;
  }
  context.putImageData(pixels, 0, 0);
  return canvas;
}

function roundRect(context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  context.beginPath();
  context.roundRect(x, y, w, h, r);
}
