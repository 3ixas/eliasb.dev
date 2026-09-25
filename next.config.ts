import type { NextConfig } from "next";

const securityHeaders = [
  { key: "Content-Security-Policy", value: "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://i.gr-assets.com https://a.ltrbxd.com; font-src 'self' data:; connect-src 'self'; frame-src https://open.spotify.com; media-src 'self';" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.gr-assets.com" },
      { protocol: "https", hostname: "a.ltrbxd.com" },
      { protocol: "https", hostname: "upload.wikimedia.org", port: "", pathname: "/wikipedia/commons/**" },
      { protocol: "https", hostname: "thumb.wikimedia.org", port: "", pathname: "/wikipedia/commons/**" },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
