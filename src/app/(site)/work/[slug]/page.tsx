import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeShiki from "@shikijs/rehype";
import { Container } from "@/components/Container";
import { NextRow } from "@/components/NextRow";
import { CaseStudyHeader } from "@/components/mdx/CaseStudyHeader";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { getProject } from "@/content/projects";
import { rehypeShikiOptions } from "@/lib/shiki";
import { site } from "@/lib/site";
import { getWorkSlugs, getWorkSource, type WorkFrontmatter } from "@/lib/work";

export const dynamicParams = false;

export function generateStaticParams() {
  return getWorkSlugs().map((slug) => ({ slug }));
}

async function compile(slug: string) {
  const source = getWorkSource(slug);
  if (!source) return null;
  return compileMDX<WorkFrontmatter>({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: true,
      mdxOptions: { rehypePlugins: [[rehypeShiki, rehypeShikiOptions]] },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const compiled = await compile(slug);
  if (!compiled) return {};
  const { title, summary } = compiled.frontmatter;
  return {
    title,
    description: summary,
    alternates: { canonical: `/work/${slug}` },
    openGraph: { url: `/work/${slug}`, title: `${title} · ${site.title}`, description: summary },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${site.title}`,
      description: summary,
    },
  };
}

/**
 * Case-study page (DESIGN.md). Header, then MDX body in the .prose column,
 * then a "next project →" row so the page never dead-ends. The prose stays in
 * the 680px column; figures and code blocks break out toward 840px via CSS.
 */
export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const compiled = await compile(slug);
  if (!compiled) notFound();

  const { content, frontmatter } = compiled;
  const nextSlug = frontmatter.next;
  const next = nextSlug ? getProject(nextSlug) : undefined;

  return (
    <Container as="article" className="pt-16 md:pt-24">
      <CaseStudyHeader slug={slug} meta={frontmatter} />
      <div className="prose mt-12 md:mt-16">{content}</div>
      {next ? (
        <div className="mt-16 md:mt-24">
          <NextRow label="next project" title={next.title} href={`/work/${next.slug}`} />
        </div>
      ) : null}
    </Container>
  );
}
