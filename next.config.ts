import type { NextConfig } from "next";
import { caseStudies } from "./src/content/stretch/case-studies";
import { assertCatalogue, featuredSlugs, projects } from "./src/content/projects";

// A featured project without a case study, screenshot or colours fails the
// build (and `next dev`) here, whichever pages use the catalogue.
assertCatalogue(projects, featuredSlugs, Object.keys(caseStudies));

// The projects moved from /work to /things-i-make (#157), so /work can mean
// employment. Permanent redirects, one path at a time: the archive and the three
// case studies that were published at /work/<slug>. The list is frozen: a case
// study added later never lived under /work/, and nothing else there moves (the
// Role stories live there, and so do the projects' screenshots, at their
// published addresses).
const legacyCaseStudySlugs = ["threshold", "argus-risk", "flowtime"];
const movedProjectPaths = [
  { source: "/work", destination: "/things-i-make" },
  ...legacyCaseStudySlugs.map((slug) => ({ source: `/work/${slug}`, destination: `/things-i-make/${slug}` })),
];

// React's development build rebuilds call stacks with eval(). Without this the
// dev server logs a console error on every page, and Next's dev badge becomes a
// red "Issues" pill that floats over page controls and fails the contrast specs.
// Production never allows eval: scripts/verify-release.mjs checks the header.
const devScriptEval = process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";

const securityHeaders = [
  { key: "Content-Security-Policy", value: `default-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; object-src 'none'; script-src 'self' 'unsafe-inline'${devScriptEval}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://i.gr-assets.com https://a.ltrbxd.com; font-src 'self' data:; connect-src 'self'; frame-src 'none'; media-src 'self';` },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // The dev badge is a tab stop and floats over page controls, so the focus and
  // contrast specs would measure it instead of the page. Errors still show.
  devIndicators: false,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.gr-assets.com" },
      { protocol: "https", hostname: "a.ltrbxd.com" },
      { protocol: "https", hostname: "upload.wikimedia.org", port: "", pathname: "/wikipedia/commons/**" },
      { protocol: "https", hostname: "thumb.wikimedia.org", port: "", pathname: "/wikipedia/commons/**" },
    ],
  },
  async redirects() {
    return movedProjectPaths.map((path) => ({ ...path, permanent: true }));
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
