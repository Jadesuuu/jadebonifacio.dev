import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "About · Jade Bonifacio";

export default function Image() {
  return renderOgImage({ title: "About" });
}
