import type { NextConfig } from "next";
import { caseStudies } from "./src/content/stretch/case-studies";
import { assertCatalogue, featuredSlugs, projects } from "./src/content/projects";

// A featured project without a case study, screenshot or colours fails the
// build (and `next dev`) here, whichever pages use the catalogue.
assertCatalogue(projects, featuredSlugs, Object.keys(caseStudies));

// The projects moved from /work to /things-i-make (#157), so /work can mean
// employment. Permanent redirects, one path at a time: the archive and each
// case study. Nothing else under /work/ moves: the Role stories live there, and
// so do the projects' screenshots, which stay at their published addresses.
const movedProjectPaths = [
  { source: "/work", destination: "/things-i-make" },
  ...Object.keys(caseStudies).map((slug) => ({ source: `/work/${slug}`, destination: `/things-i-make/${slug}` })),
];

const securityHeaders = [
  { key: "Content-Security-Policy", value: "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://i.gr-assets.com https://a.ltrbxd.com; font-src 'self' data:; connect-src 'self'; frame-src 'none'; media-src 'self';" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
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
