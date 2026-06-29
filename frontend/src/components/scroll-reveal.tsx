"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Animation = "fade-up" | "fade-in" | "slide-left" | "scale-in";

export function ScrollReveal({
  children,
  animation = "fade-up",
  delay = 0,
  className = "",
  threshold = 0.15,
}: {
  children: ReactNode;
  animation?: Animation;
  delay?: number;
  className?: string;
  threshold?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // État initial — invisible
    el.style.opacity = "0";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.classList.add(`animate-${animation}`);
            el.style.opacity = "";
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [animation, delay, threshold]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export function ScrollRevealGroup({
  children,
  animation = "fade-up",
  stagger = 100,
  className = "",
}: {
  children: ReactNode[];
  animation?: Animation;
  stagger?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <ScrollReveal key={i} animation={animation} delay={i * stagger}>
          {child}
        </ScrollReveal>
      ))}
    </div>
  );
}
