import {
  siClaude,
  siDocker,
  siGithubactions,
  siJest,
  siMongodb,
  siMui,
  siNestjs,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siPython,
  siReact,
  siReactquery,
  siRedis,
  siShadcnui,
  siSocketdotio,
  siSupabase,
  siTailwindcss,
  siTypescript,
  siVercel,
} from "simple-icons";
import { ToolboxSpotlight } from "@/components/home/ToolboxSpotlight";

/**
 * Toolbox (Portfolio Home v2): six core tiles with brand-tinted icons, then
 * pill rows for the rest of the stack, languages and papers. Every tile and
 * chip carries `data-tile`, which ToolboxSpotlight uses to warm borders and
 * lift tiles near a roaming brass spotlight (the `[data-tools]` styles in
 * globals.css). Icons are inline SVGs from simple-icons so nothing is fetched
 * at runtime; a tool without a brand mark just renders its name.
 */

type Icon = { path: string; width?: number };

type Tool = {
  name: string;
  icon?: Icon;
  /** Brand hex the icon is painted in. Unset icons fall back to --fg-muted. */
  brand?: string;
  /** Faint mono suffix (a version, a level, a sub-stack). */
  note?: string;
};

// simple-icons dropped the AWS mark, so the tile uses a plain cloud glyph.
const AWS_CLOUD: Icon = {
  path: "M6.5 19a4.5 4.5 0 0 1-.42-8.98 6.5 6.5 0 0 1 12.6 1.56A4 4 0 0 1 18 19.5z",
  width: 30,
};

const CORE: Tool[] = [
  { name: "next.js", icon: siNextdotjs, note: "app router · rsc" },
  { name: "react", icon: siReact, brand: "#61DAFB", note: "front-end core" },
  { name: "typescript", icon: siTypescript, brand: "#3178C6", note: "end to end" },
  { name: "nestjs", icon: siNestjs, brand: "#E0234E", note: "di · guards · gateways" },
  { name: "postgresql", icon: siPostgresql, brand: "#4169E1", note: "primary datastore" },
  { name: "aws", icon: AWS_CLOUD, brand: "#FF9900", note: "ec2 · s3 · sns · sqs" },
];

const ROTATION: Tool[] = [
  { name: "tailwind css", icon: siTailwindcss, brand: "#06B6D4" },
  { name: "shadcn/ui", icon: siShadcnui },
  { name: "material ui", icon: siMui, brand: "#007FFF" },
  { name: "node.js", icon: siNodedotjs, brand: "#5FA04E" },
  { name: "python", icon: siPython, brand: "#3776AB" },
  { name: "supabase (rls)", icon: siSupabase, brand: "#3FCF8E" },
  { name: "mongodb", icon: siMongodb, brand: "#47A248" },
  { name: "redis", icon: siRedis, brand: "#FF4438" },
  { name: "oracle pl/sql" },
  { name: "dynamodb" },
  { name: "tanstack query", icon: siReactquery, brand: "#FF4154" },
  { name: "zustand" },
  { name: "vercel", icon: siVercel },
  { name: "docker", icon: siDocker, brand: "#2496ED" },
  { name: "github actions", icon: siGithubactions, brand: "#2088FF" },
  { name: "websockets · socket.io", icon: siSocketdotio },
  { name: "openai api" },
  { name: "claude code", icon: siClaude, brand: "#D97757" },
  { name: "jest", icon: siJest, brand: "#C21325" },
];

const LANGUAGES: Tool[] = [
  { name: "filipino" },
  { name: "english" },
  { name: "japanese", note: "jlpt n4" },
];

const PAPERS: Tool[] = [
  { name: "aws ccp", note: "'26" },
  { name: "philnits fe" },
  { name: "topcit" },
  { name: "cs50x" },
  { name: "nvidia dl workshop" },
];

const rowLabel = "m-0 mb-3 font-mono text-xs tracking-[0.04em] text-fg-faint";

function ToolIcon({ icon, size }: { icon: Icon; size: number }) {
  const width = icon.width ? Math.round((icon.width / 26) * size) : size;
  return (
    <svg
      width={width}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="shrink-0"
      style={{ fill: "var(--brand, var(--fg-muted))" }}
    >
      <path d={icon.path} />
    </svg>
  );
}

function brandStyle(tool: Tool): React.CSSProperties | undefined {
  return tool.brand ? ({ "--brand": tool.brand } as React.CSSProperties) : undefined;
}

function ChipRow({ tools }: { tools: Tool[] }) {
  return (
    <div data-stagger className="mb-2 flex flex-wrap gap-2.5">
      {tools.map((tool) => (
        <span
          key={tool.name}
          data-tile
          className="v2-chip gap-[9px] whitespace-nowrap !px-[15px] !py-[7px]"
          style={brandStyle(tool)}
        >
          {tool.icon ? <ToolIcon icon={tool.icon} size={15} /> : null}
          {tool.name}
          {tool.note ? <span className="text-fg-faint">{tool.note}</span> : null}
        </span>
      ))}
    </div>
  );
}

export function Toolbox() {
  return (
    <div data-tools className="max-w-[820px]">
      <div
        data-stagger
        className="mb-9 grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}
      >
        {CORE.map((tool, i) => (
          <div
            key={tool.name}
            data-tile
            data-big
            className="relative flex min-w-0 flex-col gap-3.5 rounded-[14px] border border-border bg-bg px-4 pb-4 pt-[18px]"
            style={brandStyle(tool)}
          >
            <span className="v2-tile-index absolute right-3.5 top-3 font-mono text-[10px] tracking-[0.06em] text-fg-faint">
              {String(i + 1).padStart(2, "0")}
            </span>
            {tool.icon ? <ToolIcon icon={tool.icon} size={26} /> : null}
            <div className="flex min-w-0 flex-col gap-1">
              <span className="font-mono text-[13.5px] text-fg">{tool.name}</span>
              <span className="font-mono text-[11px] leading-[1.5] text-fg-faint">{tool.note}</span>
            </div>
          </div>
        ))}
      </div>

      <p className={rowLabel}>also in rotation</p>
      <ChipRow tools={ROTATION} />

      <p className={`${rowLabel} mt-8`}>languages</p>
      <ChipRow tools={LANGUAGES} />

      <p className={`${rowLabel} mt-8`}>papers</p>
      <ChipRow tools={PAPERS} />

      <ToolboxSpotlight />
    </div>
  );
}
