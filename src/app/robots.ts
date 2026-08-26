import type { MetadataRoute } from "next"

// Belt-and-suspenders alongside the noindex meta tag in layout.tsx — some
// crawlers weigh robots.txt more than the meta tag, so both are set to the
// same rule rather than relying on just one.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  }
}
