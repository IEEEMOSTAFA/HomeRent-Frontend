import { useEffect, useRef } from "react";

export function useGsapStagger(ref: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    if (!ref.current) return;

    const children = [...ref.current.children] as HTMLElement[];

    import("gsap").then(({ gsap }) => {
      gsap.fromTo(
        children,
        { y: -14, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.07,
          duration: 0.5,
          ease: "power3.out",
          delay: 0.05,
        }
      );
    });
  }, [ref]);
}