import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getColorTokens } from "@/lib/css-tokens";

/**
 * The "jb_" favicon mark at any square size: Geist Mono on the dark --bg with
 * --fg letters and a --fg-faint cursor. Used by icon.tsx and apple-icon.tsx.
 */
export async function renderMark(px: number) {
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
          fontSize: Math.round(px * 0.47),
          letterSpacing: "0.02em",
          paddingBottom: Math.round(px * 0.06),
        }}
      >
        jb<span style={{ color: c["fg-faint"] }}>_</span>
      </div>
    ),
    {
      width: px,
      height: px,
      fonts: [{ name: "Geist Mono", data: font, weight: 400, style: "normal" }],
    },
  );
}
