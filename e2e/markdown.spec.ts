import { expect, test } from "@playwright/test";
import { profile } from "../src/content/site";
import { projects } from "../src/content/projects";
import { howIWork } from "../src/content/stretch/how-i-work";
import { opening } from "../src/content/stretch/opening";
import { roleStories } from "../src/content/stretch/role-stories";
import { work } from "../src/content/stretch/work";

// The site as Markdown (src/content/markdown.ts): /index.md is the homepage, /llms.txt points at it and the pages under it, and the
// homepage's head says so with rel="alternate". Neither is linked on the page.

test.describe("The Markdown version", () => {
  test("/index.md is the homepage in text, section by section", async ({ request }) => {
    const response = await request.get("/index.md");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/markdown");
    const text = await response.text();
    expect(text).toMatch(/^# Elias Bennett\n/);
    expect(text).toContain(`> ${opening.headline}`);
    for (const heading of ["## Work", "### Where I’m headed", "## Things I make", "## How I work", "## Off the clock", "## Say hello"]) expect(text, heading).toContain(heading);
    for (const { employer, dates } of Object.values(roleStories)) {
      expect(text).toContain(employer);
      expect(text).toContain(dates);
    }
    for (const { habit } of howIWork.beats) expect(text).toContain(habit);
    for (const project of projects) expect(text, project.name).toContain(project.name);
    expect(text).toContain(profile.links.email.replace("mailto:", ""));
    // Only what is authored: nothing the page fetches live, and nothing it retired.
    expect(text).not.toContain("Made by Elias");
    expect(text).not.toMatch(/Between books|Dark Age/);
  });

  test("every link in it goes to a page that exists", async ({ request }) => {
    const text = await (await request.get("/index.md")).text();
    const links = [...text.matchAll(/\]\((https:\/\/www\.eliasb\.dev(\/[^)]*))\)/g)].map((match) => match[2]);
    expect(links.length).toBeGreaterThan(5);
    for (const path of new Set(links)) expect((await request.get(path)).status(), path).toBe(200);
  });

  test("/llms.txt is the short index, with the homepage, the résumé, each role and each case study", async ({ request }) => {
    const response = await request.get("/llms.txt");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/plain");
    const text = await response.text();
    expect(text).toMatch(/^# Elias Bennett\n\n> /);
    expect(text).toContain("https://www.eliasb.dev/index.md");
    expect(text).toContain("https://www.eliasb.dev/resume");
    for (const { slug } of Object.values(roleStories)) expect(text).toContain(`/work/${slug}`);
    for (const project of projects.filter((one) => one.links.caseStudy)) expect(text).toContain(project.links.caseStudy!);
    expect(work.employers.length).toBeGreaterThan(0);
  });

  test("the homepage's head points to the Markdown, and nothing on the page does", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('head link[rel="alternate"][type="text/markdown"]')).toHaveAttribute("href", /\/index\.md$/);
    await expect(page.locator('a[href$="index.md"], a[href$="llms.txt"]')).toHaveCount(0);
    await expect(page.getByText("index.md")).toHaveCount(0);
  });
});
