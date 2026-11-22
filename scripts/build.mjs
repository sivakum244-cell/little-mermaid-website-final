import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import config from "../site.config.mjs";
import cabin from "../content/cabin.mjs";
import property from "../content/property.mjs";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const siteUrl = config.siteUrl.replace(/\/+$/, "");
const wa = String(config.whatsappNumber || "").replace(/\D/g, "");
const a = config.address;
const fullAddress = `${a.street}, ${a.postalCode} ${a.locality}, ${a.countryName}`;

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await cp("src", "dist", { recursive: true, filter: (p) => !p.endsWith("preview.html") });
if (existsSync("public")) await cp("public", "dist", { recursive: true });

// Structured data: only verified facts (name, address, optional contact/image). No ratings, prices, geo.
const ld = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: config.name,
  url: siteUrl + "/",
  address: {
    "@type": "PostalAddress",
    streetAddress: a.street,
    addressLocality: a.locality,
    postalCode: a.postalCode,
    addressCountry: a.country,
  },
};
// Property-level facts from the listing. Check-out time is omitted because the listing contradicts itself.
ld.checkinTime = property.checkinTime;
ld.petsAllowed = property.petsAllowed;
ld.knowsLanguage = property.languages.map((l) => l.code);
ld.amenityFeature = property.groups.flatMap((g) => g.items).map((n) => ({ "@type": "LocationFeatureSpecification", name: n, value: true }));
// HotelRoom: only listed facts. No occupancy, price, or rating (not supplied / not eligible).
const featureNames = [...new Set([...cabin.highlights, ...cabin.groups.flatMap((g) => g.items)])];
ld.containsPlace = {
  "@type": "HotelRoom",
  name: cabin.name,
  floorSize: { "@type": "QuantitativeValue", value: cabin.sizeM2, unitCode: "MTK" },
  bed: cabin.beds.map((b) => ({ "@type": "BedDetails", numberOfBeds: b.count, typeOfBed: b.type })),
  smokingAllowed: cabin.smokingAllowed,
  amenityFeature: featureNames.map((n) => ({ "@type": "LocationFeatureSpecification", name: n, value: true })),
};
if (config.phone) ld.telephone = config.phone;
if (config.email) ld.email = config.email;
if (config.images[0]) ld.image = siteUrl + config.images[0].src;

// Gallery
let gallery;
if (config.images.length) {
  gallery = config.images.map((img, i) => {
    const alt = img.decorative ? "" : esc(img.alt || "");
    const srcset = img.srcset ? ` srcset="${esc(img.srcset)}" sizes="(min-width: 900px) 33vw, 50vw"` : "";
    return `<li><button type="button" class="g-item" data-index="${i}" data-full="${esc(img.src)}" data-alt="${alt}" aria-label="Open image ${i + 1} of ${config.images.length}${alt ? ": " + alt : ""}"><img src="${esc(img.src)}"${srcset} alt="${alt}" width="${img.width || 800}" height="${img.height || 600}" loading="lazy" decoding="async"></button></li>`;
  }).join("\n");
  gallery = `<ul class="gallery" id="gallery">${gallery}</ul>`;
} else {
  const labels = ["Houseboat exterior", "Sun terrace", "Superior Cabin", "Lounge and seating", "Backwater views", "Onboard dining"];
  gallery = `<ul class="gallery gallery--placeholder">${labels.map((l) => `<li><div class="ph" role="img" aria-label="Photo placeholder: ${l}. Approved property photo to be added."><span>${l}</span><small>Photo coming soon</small></div></li>`).join("")}</ul>
<p class="note">Approved property photographs will appear here once added in <code>site.config.mjs</code>.</p>`;
}

const list = (items, cls = "ticks") => `<ul class="${cls}">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
const bedText = cabin.beds.map((b) => `${b.count} ${b.type.toLowerCase()}`).join(" and ");
const cabinHtml = `<h2 id="stay-title">${esc(cabin.name)}</h2>
    <div class="cabin-intro">
      <p class="lead">${esc(cabin.summary)}</p>
      <dl class="facts">
        <div><dt>Size</dt><dd>${cabin.sizeM2} m²</dd></div>
        <div><dt>Beds</dt><dd>${esc(bedText)}</dd></div>
        <div><dt>View</dt><dd>${esc(cabin.views.join(", "))}</dd></div>
        <div><dt>Smoking</dt><dd>${cabin.smokingAllowed ? "Allowed" : "Not allowed"}</dd></div>
      </dl>
      ${list(cabin.highlights, "chips")}
    </div>
    <div class="cols cols--4">
      ${cabin.groups.map((g) => `<div class="panel"><h3>${esc(g.title)}</h3>${list(g.items)}</div>`).join("\n      ")}
    </div>
    <div class="panel panel--note">
      <h3>Good to know about the cabin</h3>
      <ul class="plain">${cabin.qualified.map((q) => `<li><strong>${esc(q.label)}:</strong> ${esc(q.note)}</li>`).join("")}</ul>
    </div>`;

const propertyHtml = `<h3 class="sub-head" id="property-title">Around the houseboat</h3>
    <div class="cols cols--3">
      ${property.groups.map((g) => `<div class="panel"><h4>${esc(g.title)}</h4>${list(g.items)}</div>`).join("\n      ")}
    </div>
    <div class="cols">
      <div class="panel panel--note panel--span2">
        <h4>Charges and conditions</h4>
        <ul class="plain">${property.qualified.map((q) => `<li><strong>${esc(q.label)}:</strong> ${esc(q.note)}</li>`).join("")}</ul>
      </div>
      <div class="panel">
        <h4>Please ask the property</h4>
        ${list(property.askAbout, "plain")}
      </div>
    </div>`;

const rulesHtml = `<dl class="rules">${property.houseRules.map((r) => `<div><dt>${esc(r.label)}</dt><dd>${esc(r.text)}</dd></div>`).join("")}</dl>`;

const mapLink = config.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.name + ", " + fullAddress)}`;
const mapEmbed = config.mapEmbedUrl
  ? `<iframe class="map" title="Map showing the location of ${esc(config.name)}" src="${esc(config.mapEmbedUrl)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" width="600" height="400"></iframe>`
  : "";

const contactBits = [];
if (config.phone) contactBits.push(`Phone: <a href="tel:${esc(config.phone.replace(/[^\d+]/g, ""))}">${esc(config.phone)}</a>`);
if (config.email) contactBits.push(`Email: <a href="mailto:${esc(config.email)}">${esc(config.email)}</a>`);
const contact = contactBits.length ? `<p class="contact-fallback">${contactBits.join(" &middot; ")}</p>` : "";

const clientConfig = JSON.stringify({ whatsapp: wa, name: config.name }).replace(/</g, "\\u003c");
const ogImage = config.ogImage ? siteUrl + config.ogImage : "";

const map = {
  SITE_URL: siteUrl,
  NAME: esc(config.name),
  ADDRESS: esc(fullAddress),
  STREET: esc(a.street),
  POSTAL: esc(`${a.postalCode} ${a.locality}, ${a.countryName}`),
  JSONLD: JSON.stringify(ld, null, 2).replace(/</g, "\\u003c"),
  GALLERY: gallery,
  CABIN: cabinHtml,
  PROPERTY: propertyHtml,
  HOUSE_RULES: rulesHtml,
  LANGUAGES: esc(property.languages.map((l) => l.name).join(", ")),
  BED_SCORE: esc(cabin.bedScore.score),
  BED_SCORE_LABEL: esc(cabin.bedScore.label),
  BED_SCORE_COUNT: String(cabin.bedScore.reviews),
  MAP_LINK: esc(mapLink),
  MAP_EMBED: mapEmbed,
  CONTACT: contact,
  CLIENT_CONFIG: clientConfig,
  OG_IMAGE_TAGS: ogImage ? `<meta property="og:image" content="${esc(ogImage)}">\n<meta name="twitter:image" content="${esc(ogImage)}">\n<meta name="twitter:card" content="summary_large_image">` : `<meta name="twitter:card" content="summary">`,
  WA_STATE: wa ? "" : " is-unconfigured",
};

let html = await readFile("src/index.html", "utf8");
html = html.replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => (k in map ? map[k] : m));
await writeFile("dist/index.html", html);

await writeFile("dist/robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
await writeFile("dist/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}/</loc></url>\n</urlset>\n`);

console.log("Built dist/" + (wa ? "" : "  (WhatsApp number NOT configured)") + (siteUrl.includes("example.com") ? "  (siteUrl is still the placeholder)" : ""));
