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

/** Stored in DB when a package booking skips scheduling via consultation credit. */
export const CONSULTATION_CREDIT_TIME_SLOT =
  "Consultation applied — no additional meeting";

/** Stored in DB for simple product/service orders (no appointment). */
export const ORDER_TIME_SLOT = "Order placed — we'll contact you";

/** Default per-order cap for individual print products. */
export const PRINT_ORDER_MAX_DEFAULT = 5;

/** Legacy sentinel variants still present in older records. */
export const CONSULTATION_CREDIT_TIME_SLOT_VARIANTS = [
  CONSULTATION_CREDIT_TIME_SLOT,
  "Consultation credit applied — no additional meeting.",
] as const;
