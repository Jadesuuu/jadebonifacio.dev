import { getProject } from "@/content/projects";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Case study · Jade Bonifacio";

/**
 * One image per case study, titled with the project name. Attaches to
 * app/(site)/work/[slug]/page.tsx automatically once that page exists.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  return renderOgImage({ title: project?.title ?? "Work" });
}
