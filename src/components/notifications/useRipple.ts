import { useRef, useCallback } from "react";

export function useRipple() {
  const ref = useRef<HTMLDivElement>(null);

  const fire = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;

    import("gsap").then(({ gsap }) => {
      const { left, top } = el.getBoundingClientRect();
      const dot = document.createElement("span");
      Object.assign(dot.style, {
        position: "absolute",
        borderRadius: "50%",
        pointerEvents: "none",
        width: "8px",
        height: "8px",
        transform: "translate(-50%,-50%) scale(0)",
        background: "rgba(99,102,241,.22)",
        left: `${e.clientX - left}px`,
        top: `${e.clientY - top}px`,
      });
      el.style.position = "relative";
      el.style.overflow = "hidden";
      el.appendChild(dot);
      gsap.to(dot, {
        scale: 55,
        opacity: 0,
        duration: 0.65,
        ease: "power2.out",
        onComplete: () => dot.remove(),
      });
    });
  }, []);

  return { ref, fire };
}