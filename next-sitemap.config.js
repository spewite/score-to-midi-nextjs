/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://score-to-midi.com/',
  // Choose output based on your build: 'standalone' if using SSR or 'export' for static export
  output: 'export',

  // Since your content doesn't change frequently, "monthly" is a good option
  changefreq: 'monthly',

  // With a single page, you can set the homepage priority high
  priority: 1.0,

  // Use the default sitemap file name
  sitemapBaseFileName: 'sitemap',

  // No alternate refs needed if you don't have multi-language support
  alternateRefs: [],

  // With only one URL, sitemapSize and autoLastmod are fine at their defaults
  sitemapSize: 5000,
  autoLastmod: true,

  // Exclude any paths if needed (e.g., if you have hidden or admin routes)
  exclude: [],

  // Generate a robots.txt file so search engines know your sitemap location
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [{ userAgent: '*', allow: '/' }],
    // You can add additionalSitemaps here if you have more than one
    additionalSitemaps: [],
  },

  // If you want to add extra paths (for example, a custom 404 page), use additionalPaths
  additionalPaths: async (config) => [],
};
