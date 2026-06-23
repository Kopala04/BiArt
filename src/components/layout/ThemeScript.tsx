import { THEME_STORAGE_KEY } from "@/lib/theme";

/**
 * Blocking script: resolve theme before first paint.
 * Priority: localStorage → OS prefers-color-scheme → light.
 */
export function ThemeScript() {
  const script = `(function(){try{var k="${THEME_STORAGE_KEY}";var s=localStorage.getItem(k);var t=s==="dark"||s==="light"?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");var r=document.documentElement;r.classList.toggle("dark",t==="dark");r.dataset.theme=t;}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
