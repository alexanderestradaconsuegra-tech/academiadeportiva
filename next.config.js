/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    domains: ["api.dicebear.com", "ui-avatars.com"],
  },
}

module.exports = nextConfig
