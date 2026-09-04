import { renderMark } from "@/lib/mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** apple-touch-icon: the same mark, filled dark so iOS does not add a white tile. */
export default function AppleIcon() {
  return renderMark(180);
}
