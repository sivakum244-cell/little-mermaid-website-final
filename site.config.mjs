// ============================================================
// EDIT THIS FILE to configure the site, then run: npm run build
// ============================================================
export default {
  name: "Little Mermaid - Houseboat Cruise",

  // Final production domain, no trailing slash. Used for canonical URL, sitemap, robots.txt, Open Graph.
  siteUrl: "https://www.example.com", // TODO: replace with the real domain

  // WhatsApp business number: digits only, with country code, no "+" or spaces (e.g. "919876543210").
  // Leave empty to show a setup message and disable the WhatsApp buttons.
  whatsappNumber: "", // TODO: owner to provide

  // Optional verified contact details. Leave empty to hide.
  phone: "", // e.g. "+91 98765 43210"
  email: "",

  address: {
    street: "Tirumala East Gate Road, Ottathengumkal House",
    postalCode: "688011",
    locality: "Alleppey",
    country: "IN",
    countryName: "India",
  },

  // Optional. Paste a Google Maps share link for the property. If empty, a search link is used.
  mapLink: "",
  // Optional. Paste an embed URL (Google Maps > Share > Embed map > src). Leave empty for no embed.
  mapEmbedUrl: "",

  // Social share image (absolute path from site root, e.g. "/images/og.jpg", 1200x630). Optional.
  ogImage: "",

  // Approved property photos. Put files in /public/images and list them here.
  // Leave the array empty to show placeholder tiles.
  // Provide `src` (jpg/webp), optional `srcset` string, and a descriptive `alt` (describe what is visible).
  // Set decorative: true for purely decorative images (alt is then rendered empty).
  images: [
    // { src: "/images/little-mermaid-deck-view.jpg", width: 1600, height: 1067,
    //   alt: "Sun terrace of the houseboat overlooking the backwater", decorative: false },
  ],
};
