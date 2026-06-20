export const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

export const MEDIA_CATEGORY_VALUES = [
  "VIDEO",
  "PHOTOGRAPHY",
  "CAMPAIGNS",
  "BRANDING",
  "OTHER",
] as const;

export const BOOKING_STATUS_VALUES = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
] as const;

export const NAV_LINKS = [
  { href: "/", key: "home" },
  { href: "/services", key: "services" },
  { href: "/packages", key: "packages" },
  { href: "/portfolio", key: "portfolio" },
  { href: "/contact", key: "contact" },
] as const;

/** Slug of the free consultation service — used for upgrade credits. */
export const CONSULTATION_SERVICE_SLUG = "b2b-consultations";
