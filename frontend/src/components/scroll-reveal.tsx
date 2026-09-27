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

    el.style.opacity = "0";

    const reveal = () => {
      setTimeout(() => {
        el.classList.add(`animate-${animation}`);
        el.style.opacity = "";
      }, delay);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(el);

    // Fallback : si après 1.5s l'élément n'a pas été révélé, on force
    const fallback = setTimeout(() => {
      el.style.opacity = "";
      el.classList.add(`animate-${animation}`);
    }, 1500 + delay);

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
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
