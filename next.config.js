/** @type {import('next').NextConfig} */

// Applied to every response. These four are safe to set without a browser
// test — they restrict things the app never does.
//
// Content-Security-Policy is deliberately NOT here: layout.tsx injects two
// inline <script> blocks (theme flash prevention and the Supabase config), so
// a CSP without matching nonces or hashes would break the app on load. That
// one needs a real browser test behind Report-Only first, so it stays out
// rather than shipping blind.
const securityHeaders = [
  // Don't let the app be framed — defeats clickjacking of the coach dashboard
  { key: "X-Frame-Options", value: "DENY" },
  // Don't let browsers second-guess declared content types
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send the origin, never the full path, to third parties — player profile
  // URLs carry ids we shouldn't leak in a Referer header
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The app asks for geolocation (GPS tracking) itself; nothing else, and no
  // embedded frame should get camera/mic/payment access through us
  { key: "Permissions-Policy", value: "camera=(), microphone=(), payment=(), geolocation=(self)" },
]

const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: {
    domains: ["api.dicebear.com", "ui-avatars.com"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
}

module.exports = nextConfig
