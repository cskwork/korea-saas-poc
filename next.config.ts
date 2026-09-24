import type { NextConfig } from "next";
import { MODULE_SLUGS } from "./src/pocs/slugs";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Lets several dev servers share one checkout (e.g. NEXT_DIST_DIR=.next-alt next dev -p 3001).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // PGlite ships WASM + data files that must stay on disk next to the package.
  serverExternalPackages: ["@electric-sql/pglite"],
  // Read from disk at runtime: SQL migrations (PGlite boots by migrating) and the OG image fonts.
  outputFileTracingIncludes: {
    "/**": [
      "./drizzle/**/*",
      "./node_modules/pretendard/dist/public/static/Pretendard-Bold.otf",
      "./node_modules/pretendard/dist/public/static/Pretendard-ExtraBold.otf",
    ],
  },
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    // The POCs used to be static folders under /pocs/NN-<slug>/.
    return [
      { source: "/pocs", destination: "/", permanent: true },
      { source: "/pocs/index.html", destination: "/", permanent: true },
      ...MODULE_SLUGS.map((slug, index) => ({
        source: `/pocs/${String(index + 1).padStart(2, "0")}-${slug}/:path*`,
        destination: `/${slug}`,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
