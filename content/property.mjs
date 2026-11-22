// Property-wide facilities and house rules, copied from the property's listing.
// Edit here and rebuild. Items in `groups` are treated as included and also go into the
// LodgingBusiness structured data. Anything with a charge or condition belongs in `qualified`.
export default {
  groups: [
    {
      title: "On board",
      items: ["Family rooms", "Shared lounge/TV area", "Sun terrace", "Outdoor furniture", "Free Wi-Fi in all areas"],
    },
    {
      title: "Services",
      items: ["Room service", "Daily housekeeping", "Private check-in/check-out", "Luggage storage", "Wake-up service"],
    },
    {
      title: "Food and drink",
      items: ["Breakfast", "Fruits", "Kids' meals", "Minibar"],
    },
    {
      title: "Safety and security",
      items: ["24-hour security", "Security alarm", "Smoke alarms", "Fire extinguishers"],
    },
    {
      title: "Comfort",
      items: ["Allergy-free room", "Hypoallergenic", "Soundproof rooms", "Non-smoking rooms"],
    },
  ],

  qualified: [
    { label: "Parking", note: "public parking is available on site for ₹99 per day. No reservation is needed." },
    { label: "Airport shuttle", note: "available for an additional charge." },
    { label: "Wine/champagne", note: "available for an additional charge." },
    { label: "Special diet menus", note: "available on request." },
    { label: "Canoeing", note: "available for an additional charge." },
    { label: "Fishing", note: "available. Charges may apply." },
    { label: "Breakfast", note: "listed as available. Ask what is included in your stay." },
    {
      label: "Air conditioning",
      note: "listed in the cabin, but the property's general facilities also mark air conditioning as an additional charge. Please confirm when you enquire.",
    },
  ],

  askAbout: [
    "How many guests the cabin suits",
    "Which meals are included",
    "Cruise routes and durations",
    "Whether the boat is private for your party",
    "Your check-out time",
  ],

  languages: [
    { name: "English", code: "en" },
    { name: "Hindi", code: "hi" },
    { name: "Malayalam", code: "ml" },
    { name: "Tamil", code: "ta" },
  ],

  houseRules: [
    { label: "Check-in", text: "From 12:00 to 17:00." },
    {
      label: "Check-out",
      text: "The listing's FAQ says until 09:00, while its house rules say check-out is available 24 hours. Please confirm your check-out time with the property.",
    },
    { label: "Cancellation and prepayment", text: "Policies vary by accommodation type. The property will confirm the conditions that apply to your stay." },
    { label: "Children", text: "Children of all ages are welcome. Guests aged 18 and over are charged as adults." },
    { label: "Cribs and extra beds", text: "The number of cribs allowed depends on the option chosen, and all cribs are subject to availability. There are no extra beds." },
    { label: "Age requirement", text: "There is no minimum age for check-in." },
    { label: "Pets", text: "Pets are not allowed." },
    { label: "Smoking", text: "Smoking is not allowed." },
    { label: "Special requests", text: "The property accepts special requests. Mention them in your enquiry." },
  ],

  // Used in structured data. Keep in sync with the house rules above.
  checkinTime: "12:00",
  petsAllowed: false,
};
