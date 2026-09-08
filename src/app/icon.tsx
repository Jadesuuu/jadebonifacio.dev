import { renderMark } from "@/lib/mark";

// Rendered once at build and served from the CDN; without this the favicon is
// a serverless ImageResponse on every page view.
export const dynamic = "force-static";

const sizes = [32, 64, 192];

export function generateImageMetadata() {
  return sizes.map((px) => ({
    id: String(px),
    size: { width: px, height: px },
    contentType: "image/png",
  }));
}

/** Favicon in three sizes, all the same jb_ mark. */
export default function Icon({ id }: { id: string }) {
  return renderMark(Number(id));
}
