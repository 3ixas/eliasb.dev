// E. Prototype only. Shared by every page, so each block checks its element exists.
const root = document.documentElement;
root.classList.add("js");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (id) => document.getElementById(id);

// Theme: follows the system until the button is pressed.
const theme = $("theme"), dark = matchMedia("(prefers-color-scheme: dark)");
const isDark = () => (root.dataset.theme ? root.dataset.theme === "dark" : dark.matches);
const syncTheme = () => theme.setAttribute("aria-pressed", String(isDark()));
theme.addEventListener("click", () => { root.dataset.theme = isDark() ? "light" : "dark"; syncTheme(); });
dark.addEventListener("change", syncTheme); syncTheme();

// The header's greeting, by the visitor's own clock; beside it on hover, London's time.
const greet = $("greet"), now = new Date(), hr = now.getHours(), weekend = [0, 6].includes(now.getDay());
greet.firstElementChild.textContent = hr >= 5 && hr < 12 ? "Kettle’s on." : hr < 17 && hr >= 12 ? (weekend ? "Nowhere to be?" : "Nearly five?") : hr >= 17 && hr < 22 ? "Home yet?" : "Still up?";
$("london").textContent = `it’s ${new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit" }).format(now)} here in London`;
greet.classList.add("has-time");

// Phone menu.
const menu = $("menu"), bar = menu.closest(".top");
const setMenu = (open) => { bar.classList.toggle("is-open", open); menu.setAttribute("aria-expanded", String(open)); };
menu.addEventListener("click", () => setMenu(!bar.classList.contains("is-open")));
bar.querySelectorAll("nav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

// The BNP Paribas figure: illustrative simulated paths, the spread of where they end, and their average.
const svg = $("paths"), hist = $("hist"), sim = $("sim");
let seed = 9137;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const gauss = () => Math.sqrt(-2 * Math.log(rnd() || 1e-9)) * Math.cos(2 * Math.PI * rnd());
function simulate() {
  const N = 70, S = 100, W = 700, H = 380, BINS = 17, sc = 215, walk = () => { let x = 0; const p = [0]; for (let k = 0; k < S; k++) p.push((x += 0.34 * Math.sqrt(1 / S) * gauss())); return p; };
  const y = (v) => H / 2 - v * sc, d = (p) => p.map((v, k) => `${k ? "L" : "M"}${((k / S) * W).toFixed(1)} ${y(v).toFixed(1)}`).join("");
  const ps = Array.from({ length: N }, walk), ends = ps.map((p) => p[S]), mean = ends.reduce((a, b) => a + b, 0) / N;
  svg.innerHTML = ps.map((p) => `<path d="${d(p)}"/>`).join("");
  const counts = Array(BINS).fill(0); ends.forEach((e) => { const b = Math.floor((y(e) / H) * BINS); if (b >= 0 && b < BINS) counts[b]++; });
  const max = Math.max(...counts), at = Math.min(BINS - 1, Math.max(0, Math.floor((y(mean) / H) * BINS)));
  hist.innerHTML = counts.map((c, i) => `<i class="${i === at ? "at" : ""}" style="--w:${Math.max((c / max) * 100, c ? 6 : 0)}"></i>`).join("");
  sim.style.setProperty("--y", `${(y(mean) / H) * 100}%`);
  if (reduce) return;
  svg.querySelectorAll("path").forEach((p, i) => { const len = p.getTotalLength(); p.style.strokeDasharray = len; p.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 1100 + (i % 9) * 60, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" }); });
}

document.querySelectorAll(".ticks").forEach((el) => (el.innerHTML = "<i></i>".repeat(Number(el.dataset.n))));
function count(el) {
  if (reduce) return;
  const [a, b] = el.dataset.count.split(",").map(Number), pre = el.dataset.pre ?? "", suf = el.dataset.suf ?? "", s = performance.now();
  (function tick(t) { const k = Math.min((t - s) / 1200, 1), e = 1 - Math.pow(1 - k, 4); el.textContent = `${pre}${Math.abs(Math.round(a + (b - a) * e))}${suf}`; if (k < 1) requestAnimationFrame(tick); })(s);
}
const io = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; e.target.classList.add("in"); if (e.target === sim) simulate(); e.target.querySelectorAll("[data-count]").forEach(count); io.unobserve(e.target); }), { threshold: 0.15 });
document.querySelectorAll(".rise, .reveal, .sim").forEach((el) => io.observe(el));

// A pass catches the light where the pointer is, and its hologram turns with it.
if (!reduce && matchMedia("(hover: hover) and (pointer: fine)").matches) document.querySelectorAll(".card").forEach((c) => c.addEventListener("pointermove", (e) => { const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; c.style.setProperty("--sx", `${x * 100}%`); c.style.setProperty("--sy", `${y * 100}%`); c.style.setProperty("--ha", `${20 + x * 200}deg`); }, { passive: true }));

const gh = $("gh");
if (gh) gh.innerHTML = [..."00000000000000000000000000030113000240400000000021110303444420000004444434443302040400400044244024404000144400143401244042023404000000000000000100000000004042404210000000000000000004130000000400000000000000000000000000000100000000000100000000100000000000000044444003444404000400003404444424120044300000000004400020344444444444404444444442444444444444444444042044420012340102013201024321034201234"].map((l) => `<i data-l="${l}"></i>`).join("");
const copy = $("copy");
if (copy) copy.addEventListener("click", async () => { try { await navigator.clipboard.writeText("eliasthebennett@gmail.com"); } catch {} copy.textContent = "Copied"; setTimeout(() => (copy.textContent = "Copy"), 2000); });

// This week in history: three oddities, stepping in place.
const histNext = $("hist-next");
if (histNext) {
  const odd = [
    ["1783", "The first living creatures to ride in a balloon were a sheep, a duck and a rooster. All three survived the flight at Versailles.", "montgolfier-balloon", "An eighteenth-century illustration of a Montgolfier balloon, with its proportions and decoration"],
    ["1933", "Mexico’s Empresa Mexicana de Lucha Libre, now CMLL, was founded by Salvador Lutteroth.", "cmll-wrestling", "Atlantis in his blue and white mask at a CMLL event in Mexico City"],
    ["2003", "NASA sent Galileo into Jupiter’s atmosphere, ending its 14-year mission and protecting Europa from a future impact.", "galileo", "NASA illustration of the Galileo spacecraft passing Io, with Jupiter behind it"],
  ];
  let at = 0;
  histNext.addEventListener("click", () => { at = (at + 1) % odd.length; const [y, t, img, alt] = odd[at]; $("hist-year").textContent = y; $("hist-text").textContent = t; $("hist-img").src = `../../../public/signals/history/${img}.webp`; $("hist-img").alt = alt; $("hist-n").textContent = `${at + 1} of ${odd.length}`; });
}
document.querySelectorAll(".gh--demo").forEach((g) => (g.innerHTML = $("gh") ? $("gh").innerHTML : "<i data-l=\"0\"></i>".repeat(368)));

// A screenshot opens large in a dialog and gives focus back when it closes.
const large = $("large");
if (large) {
  let from = null;
  document.querySelectorAll(".zoom").forEach((b) => b.addEventListener("click", () => { const i = b.querySelector("img"); $("large-img").src = i.src; $("large-img").alt = i.alt; from = b; large.showModal(); }));
  const close = () => { large.close(); from?.focus(); };
  $("large-close").addEventListener("click", close); $("large-img").addEventListener("click", close);
}
