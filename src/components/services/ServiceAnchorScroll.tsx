"use client";

import { useEffect } from "react";

/** Scrolls to and briefly highlights a service card when the URL has a hash (e.g. /services#business-cards). */
export function ServiceAnchorScroll() {
  useEffect(() => {
    const scrollToHash = () => {
      const slug = window.location.hash.replace(/^#/, "");
      if (!slug) return;

      const el = document.getElementById(slug);
      if (!el) return;

      window.requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-accent", "ring-offset-2");
        window.setTimeout(() => {
          el.classList.remove("ring-2", "ring-accent", "ring-offset-2");
        }, 2800);
      });
    };

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  return null;
}
