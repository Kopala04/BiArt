const IMAGE_EXT = /\.(avif|bmp|gif|jpe?g|png|svg|webp)(\?.*)?$/i;

export function isLikelyImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (IMAGE_EXT.test(trimmed)) return true;
  try {
    const host = new URL(trimmed).hostname;
    return (
      host.includes("unsplash.com") ||
      host.includes("cloudinary.com") ||
      host.includes("imgur.com") ||
      host.includes("ibb.co") ||
      host.includes("googleusercontent.com")
    );
  } catch {
    return false;
  }
}

export function mediaPreviewUrl(
  mediaUrl: string,
  thumbnailUrl?: string | null
): string {
  const thumb = thumbnailUrl?.trim();
  if (thumb) return thumb;
  return mediaUrl.trim();
}
