import { cn } from "@/lib/utils";

type RemoteImageProps = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
};

/** External URLs use native img so any valid image link works in admin and portfolio. */
export function RemoteImage({
  src,
  alt,
  className,
  fill,
  width,
  height,
}: RemoteImageProps) {
  const trimmed = src?.trim();

  if (!trimmed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-slate-200 text-xs text-slate-500",
          fill && "absolute inset-0",
          className
        )}
      >
        —
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin/user image URLs
    <img
      src={trimmed}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      className={cn(fill && "absolute inset-0 h-full w-full object-cover", className)}
    />
  );
}
