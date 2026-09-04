import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import { Callout } from "@/components/mdx/Callout";
import { Figure } from "@/components/mdx/Figure";

/** Body links: internal via next/link, external open in a new tab. */
function MdxLink({ href = "", children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const external = /^https?:\/\//.test(href);
  if (external) {
    return (
      <a href={href} className="link-body" target="_blank" rel="noopener" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className="link-body">
      {children as ReactNode}
    </Link>
  );
}

/** Components available inside case-study MDX. */
export const mdxComponents: MDXComponents = {
  a: MdxLink,
  Callout,
  Figure,
};
