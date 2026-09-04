import type { ElementType, ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  id?: string;
};

/**
 * The single content column: 680px max, left-aligned text, centred on the
 * page, 24px horizontal padding on mobile and 32px on desktop.
 * Padding sits outside the 680px so the measure never shrinks below spec.
 */
export function Container({ children, className, as: Tag = "div", id }: ContainerProps) {
  return (
    <Tag id={id} className={["w-full px-6 md:px-8", className].filter(Boolean).join(" ")}>
      <div className="mx-auto w-full max-w-column">{children}</div>
    </Tag>
  );
}
