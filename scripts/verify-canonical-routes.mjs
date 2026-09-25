import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import net from "node:net";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

const redirectContracts = [
  ["/about", "/#about"],
  ["/library", "/#outside-work"],
  ["/lab", "/#experiments"],
];
const expectedSitemapUrls = new Set([
  "https://www.eliasb.dev",
  "https://www.eliasb.dev/work",
  "https://www.eliasb.dev/work/threshold",
  "https://www.eliasb.dev/work/argus-risk",
  "https://www.eliasb.dev/work/flowtime",
]);

function configuredBaseUrl() {
  const value = process.env.CANONICAL_ROUTE_BASE_URL;
  if (!value) return null;

  const baseUrl = new URL(value);
  assert.equal(baseUrl.protocol, "http:", "CANONICAL_ROUTE_BASE_URL must use HTTP");
  assert.ok(["127.0.0.1", "localhost", "[::1]"].includes(baseUrl.hostname), "CANONICAL_ROUTE_BASE_URL must target a local server");
  return baseUrl;
}

async function findAvailablePort() {
  const probe = net.createServer();
  await new Promise((resolve, reject) => {
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", resolve);
  });
  const address = probe.address();
  assert.ok(address && typeof address !== "string", "Could not determine the local server port");
  const port = address.port;
  await new Promise((resolve, reject) => probe.close((error) => error ? reject(error) : resolve()));
  return port;
}

function startBuiltServer(port) {
  const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  return spawn(command, ["exec", "next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

async function waitForServer(baseUrl, server) {
  let lastError;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(`Built server exited before becoming ready with code ${server.exitCode}`);
    }
    try {
      const response = await fetch(baseUrl, { redirect: "manual" });
      if (response.status < 500) return;
    } catch (error) {
      lastError = error;
    }
    await delay(250);
  }
  throw new Error(`Built server did not become ready: ${lastError?.message ?? "timeout"}`);
}

async function verifyRoutes(baseUrl) {
  for (const [route, expectedLocation] of redirectContracts) {
    const response = await fetch(new URL(route, baseUrl), { redirect: "manual" });
    assert.equal(response.status, 308, `${route} should return a permanent redirect`);
    assert.equal(response.headers.get("location"), expectedLocation, `${route} has the wrong Location`);
  }

  for (const [route, expectedCanonical] of [["/work", "https://www.eliasb.dev/work"], ["/work/threshold", "https://www.eliasb.dev/work/threshold"]]) {
    const response = await fetch(new URL(route, baseUrl), { redirect: "manual" });
    assert.equal(response.status, 200, `${route} should render successfully`);
    const document = await response.text();
    const canonical = document.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    assert.equal(canonical, expectedCanonical, `${route} has the wrong canonical URL`);
  }

  const sitemapResponse = await fetch(new URL("/sitemap.xml", baseUrl), { redirect: "manual" });
  assert.equal(sitemapResponse.status, 200, "/sitemap.xml should render successfully");
  const sitemap = await sitemapResponse.text();
  const sitemapUrls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url));
  assert.deepEqual(sitemapUrls, expectedSitemapUrls, "Sitemap URLs do not match the canonical route set");
  for (const route of ["/about", "/library", "/lab"]) {
    assert.equal([...sitemapUrls].some((url) => new URL(url).pathname === route), false, `${route} must be excluded from the sitemap`);
  }
}

const baseUrlFromEnvironment = configuredBaseUrl();
let server;
let baseUrl = baseUrlFromEnvironment;

try {
  if (!baseUrl) {
    const port = await findAvailablePort();
    server = startBuiltServer(port);
    baseUrl = new URL(`http://127.0.0.1:${port}`);
    await waitForServer(baseUrl, server);
  }
  await verifyRoutes(baseUrl);
  console.log("Canonical route checks passed.");
} finally {
  if (server) {
    if (server.exitCode === null) {
      await new Promise((resolve) => {
        server.once("close", resolve);
        server.kill("SIGTERM");
      });
    }
  }
}
