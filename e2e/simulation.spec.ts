import { expect, test, type Page } from "@playwright/test";
import { SIM, simulate, simulation } from "../src/components/site/simulation-model";
import { simulationCopy } from "../src/content/stretch/simulation-copy";

/*
 * The BNP Paribas simulation (docs/design/DESIGN.md "Figures" and "Motion", #457), on its Role story under The role:
 * the drawing against the model, the arrival stepped by a paused clock, and the controls.
 */

const page_ = "/work/bnp-paribas";
const plot = (page: Page) => page.locator(".sim__plot");
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const hydrated = (page: Page) =>
  page.waitForFunction(() => {
    const element = document.querySelector(".sim__plot");
    return !!element && Object.keys(element).some((key) => key.startsWith("__reactProps$"));
  });

test.describe("The simulation", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(page_);
  });

  test("it sits under The role, on a panel in BNP Paribas's colour, with its heading, and appears nowhere else", async ({ page }) => {
    const sim = page.locator("section#the-role .story-fig__panel .sim");
    await expect(sim).toHaveCount(1);
    await expect(sim.getByRole("heading", { level: 3 })).toHaveText(simulationCopy.title);
    await expect(sim).toHaveAccessibleName(simulationCopy.title);
    for (const other of ["/", "/work/joveen", "/work/optegra"]) {
      await page.goto(other);
      await expect(page.locator(".sim")).toHaveCount(0);
    }
  });

  test("the simulation: its bins sum to the number of paths, the price line sits at the mean of the endpoints, and it says it is illustrative", async ({ page }) => {
    const sim = page.locator(".sim");
    await expect(sim).toHaveAccessibleDescription(/^Illustrative simulated paths/);
    await expect(sim.locator("figcaption")).toHaveText(simulationCopy.caption);
    await expect(sim.locator(".sim__price")).toHaveText(simulationCopy.price);
    await expect(sim.locator(".sim__x")).toHaveText([simulationCopy.start, simulationCopy.end]);
    await sim.scrollIntoViewIfNeeded();
    await expect(plot(page)).toHaveAttribute("data-drawn", String(SIM.paths));
    const { mean } = simulation();
    const reading = await plot(page).evaluate((element, at) => {
      const box = element.getBoundingClientRect();
      const line = element.querySelector(".sim__price")!.getBoundingClientRect();
      return {
        bins: [...element.querySelectorAll<HTMLElement>(".sim__bin")].map((bin) => [Number(bin.dataset.count), bin.querySelectorAll("i").length]),
        offset: Math.abs(line.top - (box.top + at * box.height)),
      };
    }, mean);
    // Each endpoint is one dot in its band (a hundred walks is one a dot), and the bands hold every walk.
    for (const [count, dots] of reading.bins) expect(dots).toBe(count);
    expect(reading.bins.reduce((sum, [count]) => sum + count, 0)).toBe(SIM.paths);
    expect(reading.offset).toBeLessThan(1.5);
    // The walks are painted: a cloud, not an empty canvas. The paint follows the settled marker by an effect, so poll it.
    const painted = () =>
      plot(page).evaluate((element) => {
        const canvas = element.querySelector<HTMLCanvasElement>(".sim__paths")!;
        if (!canvas.width || !canvas.height) return 0;
        const pixels = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height).data;
        let count = 0;
        for (let index = 3; index < pixels.length; index += 4) if (pixels[index] > 0) count += 1;
        return count / (canvas.width * canvas.height);
      });
    await expect.poll(painted).toBeGreaterThan(0.05);
  });

  test("the simulation's walks are painted only when it comes into view, and are not in the server's HTML", async ({ page }) => {
    const html = await (await page.request.get(page_)).text();
    expect(html).toMatch(/<canvas class="sim__paths"[^>]*><\/canvas>/);
    await page.setViewportSize({ width: width(page), height: 700 });
    await page.goto(page_);
    await hydrated(page);
    await expect(plot(page)).not.toHaveAttribute("data-drawn");
    await page.locator(".sim").scrollIntoViewIfNeeded();
    await expect(plot(page)).toHaveAttribute("data-drawn", String(SIM.paths));
  });

  test("without script the dots and the price line are there", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.reload();
    await expect(page.locator(".sim__bin")).toHaveCount(SIM.bins);
    await expect(page.locator(".sim__price")).toBeVisible();
  });

  test("with reduced motion it is drawn finished on sight, with nothing armed", async ({ page }) => {
    await hydrated(page);
    await page.locator(".sim").scrollIntoViewIfNeeded();
    await expect(plot(page)).toHaveAttribute("data-drawn", String(SIM.paths));
    await expect(plot(page)).not.toHaveAttribute("data-armed");
    await expect(page.locator(".sim__bin i[data-landed]")).toHaveCount(0);
  });
});

test.describe("The simulation, arriving", () => {
  test.use({ reducedMotion: "no-preference" });

  test("the simulation arrives walk by walk over 1.6 s: each endpoint lands as a dot, and the price follows the mean so far and settles on the run's", async ({ page }) => {
    await page.clock.install();
    await page.goto(page_);
    await hydrated(page);
    // Hold the clock still, so only runFor moves the arrival.
    await page.clock.pauseAt(new Date(Date.now() + 60_000));
    const landed = page.locator(".sim__bin i[data-landed]");
    const at = () => page.locator(".sim__price").evaluate((element) => Number((element as HTMLElement).style.getPropertyValue("--at")));
    await expect(plot(page)).toHaveAttribute("data-armed", "");
    await expect(landed).toHaveCount(0);
    await page.locator(".sim").scrollIntoViewIfNeeded();
    // Step the clock a frame at a time until the first walk is in, then halfway: nothing is waited out.
    await expect.poll(async () => {
      await page.clock.runFor(16);
      return plot(page).getAttribute("data-arrived");
    }).not.toBeNull();
    await page.clock.runFor(SIM.arrival / 2);
    // Read in one go, so no frame falls between the count, the dots and the price.
    const state = await plot(page).evaluate((element) => ({
      arrived: Number(element.getAttribute("data-arrived")),
      landed: element.querySelectorAll(".sim__bin i[data-landed]").length,
      at: Number(element.querySelector<HTMLElement>(".sim__price")!.style.getPropertyValue("--at")),
    }));
    expect(state.arrived).toBeGreaterThan(SIM.paths * 0.35);
    expect(state.arrived).toBeLessThan(SIM.paths * 0.75);
    expect(state.landed).toBe(state.arrived);
    const { ends, mean } = simulation();
    expect(state.at).toBeCloseTo(ends.slice(0, state.arrived).reduce((sum, end) => sum + end, 0) / state.arrived / SIM.height, 9);
    await page.clock.runFor(SIM.arrival);
    await expect(plot(page)).toHaveAttribute("data-drawn", String(SIM.paths));
    await expect(plot(page)).not.toHaveAttribute("data-armed");
    await expect(landed).toHaveCount(SIM.paths);
    expect(await at()).toBeCloseTo(mean, 9);
  });
});

test.describe("The simulation's controls", () => {
  const step = (page: Page, label: string) => page.locator(".sim__step", { hasText: new RegExp(`^${label}$`) });
  const again = (page: Page) => page.getByRole("button", { name: simulationCopy.again });
  const settled = (page: Page, count: number) => expect(plot(page)).toHaveAttribute("data-drawn", String(count));

  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(page_);
    await hydrated(page);
    await page.locator(".sim").scrollIntoViewIfNeeded();
    await settled(page, SIM.paths);
  });

  test("Paths sets 10, 100 or 1,000 walks, updates the live tabular 10th–90th spread readout to the sampled percentile gap, and tells a screen reader paths, price and spread", async ({ page }) => {
    await expect(page.getByRole("group", { name: simulationCopy.paths }).getByRole("button")).toHaveText(["10", "100", "1,000"]);
    await expect(step(page, "100")).toHaveAttribute("aria-pressed", "true");
    const spreadEl = page.locator(".sim__spread");
    await expect(spreadEl.locator(".sim__spread-label")).toHaveText(simulationCopy.spread);
    await expect(spreadEl).toHaveCSS("font-variant-numeric", /tabular-nums/);
    for (const [label, count] of [["10", 10], ["1,000", 1000], ["100", 100]] as const) {
      await step(page, label).click();
      await settled(page, count);
      await expect(step(page, label)).toHaveAttribute("aria-pressed", "true");
      const seed = Number(await plot(page).getAttribute("data-seed"));
      const run = simulate(seed, count);
      const bins = await page.locator(".sim__bin").evaluateAll((elements) => elements.map((element) => Number((element as HTMLElement).dataset.count)));
      expect(bins).toEqual(run.bins);
      // A dot is a walk, or ten walks at a thousand, and a band with any walks shows one.
      const per = count >= 1000 ? 10 : 1;
      const dots = await page.locator(".sim__bin").evaluateAll((elements) => elements.map((element) => element.querySelectorAll("i").length));
      expect(dots).toEqual(run.bins.map((walks) => Math.ceil(walks / per)));
      await expect(spreadEl.locator(".sim__spread-value")).toHaveText(simulationCopy.formatSpread(run.spread));
      await expect(page.locator(".sim [aria-live='polite']")).toHaveText(simulationCopy.settled(new Intl.NumberFormat("en-GB").format(count), run.change, run.spread));
    }
  });

  test("Run again draws a new set from a new seed, with the same number of walks, moves the price to its mean and recomputes the spread", async ({ page }) => {
    const before = await plot(page).getAttribute("data-seed");
    await again(page).click();
    await expect(plot(page)).not.toHaveAttribute("data-seed", before!);
    await settled(page, SIM.paths);
    const run = simulate(Number(await plot(page).getAttribute("data-seed")), SIM.paths);
    const offset = await plot(page).evaluate((element, at) => {
      const box = element.getBoundingClientRect();
      return Math.abs(element.querySelector(".sim__price")!.getBoundingClientRect().top - (box.top + at * box.height));
    }, run.mean);
    expect(offset).toBeLessThan(1.5);
    await expect(page.locator(".sim__spread-value")).toHaveText(simulationCopy.formatSpread(run.spread));
  });

  test("the controls are buttons of at least 44 px, in reading order after the plot", async ({ page }, testInfo) => {
    // Safari moves focus to buttons with Option-Tab unless its setting says otherwise.
    const tab = testInfo.project.name.startsWith("webkit") ? "Alt+Tab" : "Tab";
    for (const button of [again(page), step(page, "10"), step(page, "100"), step(page, "1,000")]) {
      const box = (await button.boundingBox())!;
      expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
    }
    await again(page).focus();
    const reached = [await page.evaluate(() => document.activeElement?.textContent)];
    for (let index = 0; index < 3; index += 1) {
      await page.keyboard.press(tab);
      reached.push(await page.evaluate(() => document.activeElement?.textContent));
    }
    expect(reached).toEqual([simulationCopy.again, "10", "100", "1,000"]);
  });

  test("pressing the step already chosen draws the run again from an empty plot: no dot is left landed from before", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.clock.install();
    await page.reload();
    await hydrated(page);
    await page.clock.pauseAt(new Date(Date.now() + 60_000));
    await page.locator(".sim").scrollIntoViewIfNeeded();
    // One run arrives in full, so every dot has landed, then the same step is pressed again.
    await step(page, "100").click();
    await page.clock.runFor(SIM.arrival * 1.5);
    await settled(page, SIM.paths);
    await expect(page.locator(".sim__bin i[data-landed]")).toHaveCount(SIM.paths);
    await step(page, "100").click();
    await page.clock.runFor(16);
    expect(Number(await page.locator(".sim__bin i[data-landed]").count())).toBeLessThan(SIM.paths / 4);
  });

  test("a control pressed mid-arrival starts the new run cleanly, and nothing of the old one is left", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.clock.install();
    await page.reload();
    await hydrated(page);
    await page.clock.pauseAt(new Date(Date.now() + 60_000));
    await page.locator(".sim").scrollIntoViewIfNeeded();
    await step(page, "10").click();
    await page.clock.runFor(SIM.arrival / 2);
    expect(Number(await plot(page).getAttribute("data-arrived"))).toBeLessThan(10);
    await step(page, "1,000").click();
    await page.clock.runFor(SIM.arrival * 1.5);
    await settled(page, 1000);
    await expect(plot(page)).not.toHaveAttribute("data-armed");
    const dots = page.locator(".sim__bin i");
    await expect(page.locator(".sim__bin i[data-landed]")).toHaveCount(await dots.count());
    expect(await page.locator(".sim__bin").evaluateAll((elements) => elements.reduce((sum, element) => sum + Number((element as HTMLElement).dataset.count), 0))).toBe(1000);
  });
});

