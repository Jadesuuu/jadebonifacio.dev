import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getColorTokens } from "@/lib/css-tokens";
import { site } from "@/lib/site";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const fontsDir = path.join(process.cwd(), "src/assets/fonts");

/**
 * Shared OG image (DESIGN.md, Images): dark --bg, a 2px --accent rule above
 * the page title in IBM Plex Sans 600, and the domain in IBM Plex Mono --fg-faint
 * bottom left. Fonts are the vendored TTFs; colours come from globals.css.
 */
export async function renderOgImage({ title }: { title: string }) {
  const [sans, mono, c] = await Promise.all([
    readFile(path.join(fontsDir, "IBMPlexSans-SemiBold.ttf")),
    readFile(path.join(fontsDir, "IBMPlexMono-Regular.ttf")),
    getColorTokens("dark"),
  ]);

  const fontSize = title.length > 48 ? 56 : title.length > 28 ? 64 : 80;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px 64px",
          background: c.bg,
          color: c.fg,
          fontFamily: "Plex Sans",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 28, marginTop: "auto" }}>
          <div style={{ width: 96, height: 2, background: c.accent }} />
          <div
            style={{
              fontSize,
              fontWeight: 600,
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
        </div>
        <div
          style={{
            marginTop: 56,
            fontFamily: "Plex Mono",
            fontSize: 26,
            letterSpacing: "0.02em",
            color: c["fg-faint"],
          }}
        >
          {site.domain}
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Plex Sans", data: sans, weight: 600, style: "normal" },
        { name: "Plex Mono", data: mono, weight: 400, style: "normal" },
      ],
    },
  );
}
