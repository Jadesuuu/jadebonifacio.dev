import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getColorTokens } from "@/lib/css-tokens";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/**
 * Favicon: the "jb_" mark in Geist Mono on the dark --bg, generated from the
 * same tokens as the site. Always dark; a favicon cannot follow the theme.
 */
export default async function Icon() {
  const [font, c] = await Promise.all([
    readFile(path.join(process.cwd(), "src/assets/fonts/GeistMono-Regular.ttf")),
    getColorTokens("dark"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: c.bg,
          color: c.fg,
          fontFamily: "Geist Mono",
          fontSize: 30,
          letterSpacing: "0.02em",
          paddingBottom: 4,
        }}
      >
        jb<span style={{ color: c["fg-faint"] }}>_</span>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Geist Mono", data: font, weight: 400, style: "normal" }],
    },
  );
}
