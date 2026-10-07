"use client";

import {
  type CSSProperties,
  type ElementType,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

// Adds `is-in` the first time the element scrolls into view. Landing CSS keys
// both the fade-in (.lp-reveal) and the looping graphics (.is-in ...) off it,
// so graphics only start animating once someone can see them.
export function Reveal({
  as: Tag = "div",
  className = "",
  delay = 0,
  fade = true,
  children,
}: {
  as?: ElementType;
  className?: string;
  delay?: number;
  fade?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`${fade ? "lp-reveal" : ""} ${inView ? "is-in" : ""} ${className}`}
      style={delay ? ({ "--d": `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
