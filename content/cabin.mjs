// Room details for the "Superior Cabin on Boat", copied from the property's listing.
// Edit here and rebuild. These lists render on the page AND feed the HotelRoom structured data,
// so only include facts confirmed by the listing or the owner.
export default {
  name: "Superior Cabin on Boat",
  sizeM2: 10,
  beds: [
    { count: 1, type: "Queen bed" },
    { count: 1, type: "Futon bed" },
  ],
  views: ["Lake view", "River view"],
  smokingAllowed: false,

  // Shown as the cabin intro paragraph.
  summary:
    "A twin/double cabin with air conditioning, soundproofed walls, and a balcony with lake views. It has a fully equipped private kitchen and a private bathroom with a walk-in shower.",

  highlights: [
    "Private kitchen",
    "Private bathroom",
    "Balcony",
    "Lake and river views",
    "Air conditioning",
    "Soundproofing",
    "Minibar",
    "Free Wi-Fi",
  ],

  groups: [
    {
      title: "In your private kitchen",
      items: ["Refrigerator", "Microwave", "Oven", "Stovetop", "Electric kettle", "Kitchenware", "Dining table"],
    },
    {
      title: "In your private bathroom",
      items: ["Bath", "Shower", "Toilet", "Towels", "Slippers", "Free toiletries", "Toilet paper"],
    },
    {
      title: "In the cabin",
      items: [
        "Air conditioning (single-room unit)", "Fan", "Soundproofing", "Minibar", "Sofa", "Seating area",
        "Dining area", "Wardrobe or closet", "Dressing room", "Clothes rack", "Linens", "Hypoallergenic",
        "Socket near the bed", "Radio", "Hardwood or parquet floors", "Carpeted", "Outdoor furniture",
        "Wake-up service", "Hand sanitizer",
      ],
    },
    {
      title: "For families",
      items: ["Baby safety gates", "Books, DVDs, or music for children"],
    },
  ],

  // Shown with their condition; never marked as included in structured data.
  qualified: [
    { label: "Extra towels and sheets", note: "available for an extra fee." },
    { label: "Upper floors", note: "accessible by stairs only." },
    { label: "Smoking", note: "not allowed in the cabin." },
  ],

  // Room-level review score from the listing.
  bedScore: { label: "Comfy beds", score: "10", reviews: 10 },
};
