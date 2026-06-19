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

export const MEDIA_CATEGORIES = [
  { value: "VIDEO", label: "Video" },
  { value: "PHOTOGRAPHY", label: "Photography" },
  { value: "CAMPAIGNS", label: "Campaigns" },
  { value: "BRANDING", label: "Branding" },
  { value: "OTHER", label: "Other" },
] as const;

export const BOOKING_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/packages", label: "Packages" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/contact", label: "Contact" },
];
