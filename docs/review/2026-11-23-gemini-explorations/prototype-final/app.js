(() => {
  const root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  // 1. Theme toggle
  const params = new URLSearchParams(location.search);
  const urlTheme = params.get("theme");
  const saved = localStorage.getItem("eb-final-theme");
  const prefersDark = matchMedia("(prefers-color-scheme: dark)").matches;
  const initial = urlTheme === "dark" || urlTheme === "light"
    ? urlTheme
    : (saved || (prefersDark ? "dark" : "light"));

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.setAttribute("aria-pressed", String(theme === "dark"));
    }
  }
  applyTheme(initial);
  const toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      localStorage.setItem("eb-final-theme", next);
      applyTheme(next);
      const svg = toggle.querySelector("svg");
      if (svg && !matchMedia("(prefers-reduced-motion: reduce)").matches && typeof svg.animate === "function") {
        svg.animate(
          [{ transform: "rotate(-120deg) scale(0.6)" }, { transform: "none" }],
          { duration: 600, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" }
        );
      }
    });
  }

  // 2. London greeting + authentic live GreetingScene SVG glyph
  const greetEl = document.getElementById("greeting");
  const sceneEl = document.getElementById("greeting-scene");
  if (greetEl) {
    const now = new Date();
    const h = now.getHours();
    const weekend = now.getDay() === 0 || now.getDay() === 6;
    let period = "hello";
    let phrase = "Hello";
    if (h >= 5 && h < 12) { period = "morning"; phrase = "Kettle\u2019s on."; }
    else if (h >= 12 && h < 17) { period = "afternoon"; phrase = weekend ? "Nowhere to be?" : "Nearly five?"; }
    else if (h >= 17 && h < 22) { period = "evening"; phrase = "Home yet?"; }
    else { period = "late"; phrase = "Still up?"; }
    greetEl.textContent = phrase;

    const scenes = {
      hello: `<path class="scene__ink" d="M7 6.5 12 11l-5 4.5" /><path class="scene__cursor" d="M15 16h8" />`,
      morning: `<path class="scene__ink" d="M7.5 19.5h15l-2-7.4a3 3 0 0 0-2.9-2.2h-5.2a3 3 0 0 0-2.9 2.2z" /><path class="scene__ink" d="M8.6 15.4 4.2 10" /><path class="scene__ink" d="M11 9.9q4-6.4 8 0" /><path class="scene__steam" d="M3.4 7.4c-1-1 1-2 0-3.6" />`,
      afternoon: `<circle class="scene__ink" cx="15" cy="11" r="8.5" /><path class="scene__ink" d="M15 11l2.9 2.4" /><path class="scene__ink" d="M15 11 12.7 5.9" /><circle class="scene__lit" cx="15" cy="11" r="1.3" />`,
      evening: `<path class="scene__pool" d="M8.4 11.2h13.2L24.5 20h-19z" /><path class="scene__ink" d="M11.2 3.5h7.6l2.8 7.7H8.4z" /><path class="scene__ink" d="M15 11.2v7.3M11.5 19h7" /><circle class="scene__lit" cx="15" cy="12.4" r="1.5" />`,
      late: `<path class="scene__ink" d="M16.5 3.2a8 8 0 1 0 7.6 11.6 6.6 6.6 0 0 1-7.6-11.6Z" /><path class="scene__star" d="M5 3.4v4M3 5.4h4" /><path class="scene__star" d="M26 2.5v3M24.5 4h3" />`
    };
    if (sceneEl && scenes[period]) sceneEl.innerHTML = scenes[period];
    try {
      const london = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/London", hour: "2-digit", minute: "2-digit", hour12: false
      }).format(now);
      greetEl.setAttribute("data-london", `it\u2019s ${london} here in London`);
    } catch {}
  }

  // Render 57 drawn ticks in Where I'm headed (Threshold strand)
  const ticksEl = document.getElementById("headed-57-ticks");
  if (ticksEl) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 35; i++) frag.appendChild(document.createElement("i"));
    ticksEl.appendChild(frag);
  }

  // 3. Subtle interactive 3D pointer tilt on the single BNP Paribas Staff Pass (disabled under reduced motion)
  const pass3d = document.getElementById("bnp-pass-3d");
  if (pass3d && !matchMedia("(prefers-reduced-motion: reduce)").matches && matchMedia("(hover: hover)").matches) {
    pass3d.addEventListener("pointermove", (e) => {
      const r = pass3d.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const ry = (px - 0.5) * 14;
      const rx = (0.5 - py) * 10;
      pass3d.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
      pass3d.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
      pass3d.style.setProperty("--glare-x", `${(px * 100).toFixed(1)}%`);
      pass3d.style.setProperty("--glare-y", `${(py * 100).toFixed(1)}%`);
    });
    pass3d.addEventListener("pointerleave", () => {
      pass3d.style.setProperty("--rx", "0deg");
      pass3d.style.setProperty("--ry", "0deg");
      pass3d.style.setProperty("--glare-x", "50%");
      pass3d.style.setProperty("--glare-y", "35%");
    });
  }

  // 4. Synchronous tactile Copy buttons
  document.querySelectorAll("[data-copy-text]").forEach((btn) => {
    let timer = null;
    btn.addEventListener("click", () => {
      const text = btn.getAttribute("data-copy-text") || "";
      const label = btn.querySelector("[data-copy-label]");
      const orig = btn.getAttribute("data-copy-orig") || (label ? label.textContent : "Copy");
      btn.setAttribute("data-copy-orig", orig);
      btn.setAttribute("data-copied", "true");
      if (label) label.textContent = "\u2713 Copied";
      const live = document.getElementById("live-status");
      if (live) live.textContent = "Copied to clipboard.";
      try { navigator.clipboard?.writeText(text)?.catch(() => {}); } catch {}
      clearTimeout(timer);
      timer = setTimeout(() => {
        btn.removeAttribute("data-copied");
        if (label) label.textContent = orig;
      }, 2000);
    });
  });

  // 5. Feature flag switch (also updates live route chips when present)
  document.querySelectorAll("[data-flag-switch]").forEach((sw) => {
    sw.addEventListener("click", () => {
      const next = sw.getAttribute("aria-checked") !== "true";
      sw.setAttribute("aria-checked", String(next));
      const lbl = sw.querySelector("[data-flag-label]");
      if (lbl) lbl.textContent = next ? "On" : "Off";
      const st = document.getElementById(sw.getAttribute("data-flag-status") || "");
      if (st) {
        st.textContent = next
          ? "New path active · cached · instant rollback"
          : "Live pricing on today\u2019s path · new path off by default";
      }
      const routeOld = document.getElementById("route-old");
      const routeNew = document.getElementById("route-new");
      if (routeOld && routeNew) {
        routeOld.setAttribute("data-live", String(!next));
        routeNew.setAttribute("data-live", String(next));
      }
    });
  });

  // 6. Threshold homepage mini city preview
  const miniBtns = Array.from(document.querySelectorAll("[data-mini-city]"));
  const miniUrl = document.getElementById("mini-city-url");
  if (miniBtns.length && miniUrl) {
    const map = {
      london: "threshold-beta.vercel.app/?city=london&district=hackney&place=room",
      basel: "threshold-beta.vercel.app/?city=basel&district=kleinbasel&place=1-bed",
      zurich: "threshold-beta.vercel.app/?city=zurich&district=kreis-4&place=studio"
    };
    miniBtns.forEach((b) => b.addEventListener("click", () => {
      const c = b.getAttribute("data-mini-city");
      miniBtns.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      miniUrl.textContent = map[c] || map.london;
    }));
  }

  // 7. Highlight today in the training week (calm at-a-glance schedule)
  const dayTiles = Array.from(document.querySelectorAll("[data-day-tile]"));
  if (dayTiles.length) {
    const todayIdx = (new Date().getDay() + 6) % 7;
    const titleEl = document.getElementById("training-session");
    const subEl = document.getElementById("training-sub");
    dayTiles.forEach((tile, i) => tile.setAttribute("data-today", String(i === todayIdx)));
    const todayTile = dayTiles[todayIdx];
    if (titleEl && todayTile) titleEl.textContent = todayTile.getAttribute("data-session") || "";
    if (subEl && todayTile) subEl.textContent = `Today (${todayTile.getAttribute("data-long")}), from my training week`;
  }

  // 8. GitHub contribution grid
  const contribGrid = document.getElementById("contrib-grid");
  if (contribGrid) {
    let seed = 421726;
    const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 52 * 4; i++) {
      const d = document.createElement("span");
      d.className = "contrib-cell";
      const r = rand();
      d.setAttribute("data-l", String(r < 0.24 ? 0 : r < 0.5 ? 1 : r < 0.74 ? 2 : r < 0.9 ? 3 : 4));
      frag.appendChild(d);
    }
    contribGrid.appendChild(frag);
  }

  // 9. Threshold case study working URL figure
  const wfRoot = document.getElementById("threshold-working-figure");
  if (wfRoot) {
    const districts = {
      london: ["Hackney", "Camden", "Wandsworth", "Islington"],
      zurich: ["Kreis 4", "Kreis 5", "Kreis 3", "Kreis 8"],
      basel: ["Kleinbasel", "St. Johann", "Gundeldingen", "Altstadt"]
    };
    const state = { city: "london", district: "Hackney", place: "room" };
    const districtWrap = document.getElementById("wf-districts");
    const urlOut = document.getElementById("wf-url");
    const copyBtn = document.getElementById("wf-copy");
    const openLink = document.getElementById("wf-open");
    const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    function updateUrl() {
      const full = `https://threshold-beta.vercel.app/?city=${state.city}&district=${slug(state.district)}&place=${state.place}`;
      if (urlOut) urlOut.textContent = full;
      if (copyBtn) copyBtn.setAttribute("data-copy-text", full);
      if (openLink) openLink.href = full;
    }
    function renderDistricts() {
      if (!districtWrap) return;
      districtWrap.innerHTML = "";
      districts[state.city].forEach((d) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "wf-key"; b.textContent = d;
        b.setAttribute("aria-pressed", String(d === state.district));
        b.addEventListener("click", () => { state.district = d; renderDistricts(); updateUrl(); });
        districtWrap.appendChild(b);
      });
    }
    wfRoot.querySelectorAll("[data-wf-city]").forEach((btn) => btn.addEventListener("click", () => {
      state.city = btn.getAttribute("data-wf-city");
      state.district = districts[state.city][0];
      wfRoot.querySelectorAll("[data-wf-city]").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      renderDistricts(); updateUrl();
    }));
    wfRoot.querySelectorAll("[data-wf-place]").forEach((btn) => btn.addEventListener("click", () => {
      state.place = btn.getAttribute("data-wf-place");
      wfRoot.querySelectorAll("[data-wf-place]").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      updateUrl();
    }));
    renderDistricts(); updateUrl();
  }

  // 10. BNP Paribas Monte Carlo canvas (lives in bnp.html Role story)
  const simCanvas = document.getElementById("bnp-sim-canvas");
  if (simCanvas) {
    const ctx = simCanvas.getContext("2d");
    const priceOut = document.getElementById("sim-price");
    const spreadOut = document.getElementById("sim-spread");
    const liveOut = document.getElementById("sim-live");
    let count = 100;
    let seed = 91023;
    const nextRand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const gauss = () => Math.sqrt(-2 * Math.log(Math.max(1e-7, nextRand()))) * Math.cos(2 * Math.PI * nextRand());

    function drawSim(n) {
      const rect = simCanvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(260, Math.round(rect.width));
      const h = Math.max(200, Math.round(rect.height));
      simCanvas.width = w * dpr; simCanvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const steps = 42;
      const paths = [];
      for (let i = 0; i < n; i++) {
        const pts = [100]; let val = 100;
        for (let t = 1; t <= steps; t++) { val *= Math.exp(0.0005 + 0.022 * gauss()); pts.push(val); }
        paths.push(pts);
      }
      const finals = paths.map((p) => p[steps]).sort((a, b) => a - b);
      const mean = finals.reduce((a, b) => a + b, 0) / finals.length;
      const p10 = finals[Math.floor(finals.length * 0.1)];
      const p90 = finals[Math.min(finals.length - 1, Math.floor(finals.length * 0.9))];
      const minY = Math.min(74, ...finals) - 4;
      const maxY = Math.max(130, ...finals) + 4;

      const padL = 16, padR = 56, padT = 18, padB = 26;
      const plotW = w - padL - padR, plotH = h - padT - padB;
      const xAt = (t) => padL + (t / steps) * plotW;
      const yAt = (v) => padT + (1 - (v - minY) / (maxY - minY)) * plotH;

      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(3, 17, 10, 0.24)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(padL, yAt(100)); ctx.lineTo(padL + plotW, yAt(100)); ctx.stroke();
      ctx.setLineDash([]);

      const drawN = Math.min(n, 160);
      ctx.strokeStyle = n <= 10 ? "rgba(3, 17, 10, 0.6)" : "rgba(3, 17, 10, 0.3)";
      ctx.lineWidth = n <= 10 ? 1.5 : 1;
      for (let i = 0; i < drawN; i++) {
        const p = paths[i];
        ctx.beginPath(); ctx.moveTo(xAt(0), yAt(p[0]));
        for (let t = 1; t <= steps; t++) ctx.lineTo(xAt(t), yAt(p[t]));
        ctx.stroke();
      }

      const p10Path = [], p90Path = [];
      for (let t = 0; t <= steps; t++) {
        const col = paths.map((p) => p[t]).sort((a, b) => a - b);
        p10Path.push(col[Math.floor(col.length * 0.1)]);
        p90Path.push(col[Math.min(col.length - 1, Math.floor(col.length * 0.9))]);
      }
      ctx.strokeStyle = "rgba(3, 17, 10, 0.78)";
      ctx.lineWidth = 1.6;
      [p10Path, p90Path].forEach((env) => {
        ctx.beginPath(); ctx.moveTo(xAt(0), yAt(env[0]));
        for (let t = 1; t <= steps; t++) ctx.lineTo(xAt(t), yAt(env[t]));
        ctx.stroke();
      });

      ctx.strokeStyle = "#03110a";
      ctx.lineWidth = 2.2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(padL, yAt(mean)); ctx.lineTo(padL + plotW, yAt(mean)); ctx.stroke();
      ctx.setLineDash([]);

      const bins = 12, counts = new Array(bins).fill(0);
      finals.forEach((v) => {
        const b = Math.max(0, Math.min(bins - 1, Math.floor(((v - minY) / (maxY - minY)) * bins)));
        counts[b]++;
      });
      const maxC = Math.max(1, ...counts), binH = plotH / bins;
      ctx.fillStyle = "rgba(3, 17, 10, 0.72)";
      counts.forEach((c, i) => {
        ctx.fillRect(padL + plotW + 6, padT + (bins - 1 - i) * binH + 1, (c / maxC) * (padR - 14), Math.max(2, binH - 2));
      });

      ctx.fillStyle = "#03110a";
      ctx.font = "500 13px 'Instrument Sans', sans-serif";
      ctx.fillText("Today", padL, h - 8);
      ctx.fillText("Horizon", padL + plotW - 46, h - 8);

      const diff = mean - 100;
      const dir = Math.abs(diff) < 0.05 ? "level with today" : `${Math.abs(diff).toFixed(1)}% ${diff > 0 ? "above" : "below"} today`;
      if (priceOut) priceOut.textContent = `One price: ${mean.toFixed(1)} (${dir})`;
      if (spreadOut) spreadOut.textContent = `10th\u201390th spread: ${(p90 - p10).toFixed(1)} pts`;
      if (liveOut) liveOut.textContent = `${n.toLocaleString()} paths: one price, ${dir}.`;
    }
    drawSim(count);
    window.addEventListener("resize", () => drawSim(count));
    document.querySelectorAll("[data-sim-paths]").forEach((btn) => btn.addEventListener("click", () => {
      count = Number(btn.getAttribute("data-sim-paths"));
      document.querySelectorAll("[data-sim-paths]").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      drawSim(count);
    }));
    const runBtn = document.getElementById("sim-run");
    if (runBtn) runBtn.addEventListener("click", () => { seed = (seed + 7919) >>> 0; drawSim(count); });
  }

  // 11. Sticky chapter rail observer
  const railLinks = Array.from(document.querySelectorAll(".chapter-rail a"));
  if (railLinks.length && "IntersectionObserver" in window) {
    const map = new Map();
    railLinks.forEach((a) => {
      const sec = document.getElementById(a.getAttribute("href")?.slice(1) || "");
      if (sec) map.set(sec, a);
    });
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          railLinks.forEach((l) => l.removeAttribute("aria-current"));
          const l = map.get(e.target);
          if (l) l.setAttribute("aria-current", "location");
        }
      });
    }, { rootMargin: "-15% 0px -65% 0px" });
    map.forEach((_, s) => obs.observe(s));
  }

  // 12. Lightbox zoom
  const dialog = document.getElementById("zoom-dialog");
  if (dialog) {
    const slot = dialog.querySelector(".lightbox__slot");
    const cap = dialog.querySelector(".lightbox__cap");
    const closeBtn = dialog.querySelector("[data-close-zoom]");
    document.querySelectorAll("[data-zoom-src]").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const src = trigger.getAttribute("data-zoom-src");
        const alt = trigger.getAttribute("data-zoom-alt") || "";
        slot.innerHTML = "";
        const img = document.createElement("img");
        img.src = src; img.alt = alt;
        slot.appendChild(img);
        if (cap) cap.textContent = alt;
        dialog.showModal();
      });
    });
    if (closeBtn) closeBtn.addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => { slot.innerHTML = ""; });
    dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  }
})();
