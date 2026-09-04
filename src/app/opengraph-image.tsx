import { ogContentType, ogSize, renderOgImage } from "@/lib/og";
import { site } from "@/lib/site";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = site.defaultTitle;

/** Home (and fallback for any route without its own image). */
export default function Image() {
  return renderOgImage({ title: site.defaultTitle });
}
