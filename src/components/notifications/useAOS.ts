import { useEffect } from "react";

export function useAOS() {
  useEffect(() => {
    import("aos").then((AOS) => {
      import("aos/dist/aos.css");
      AOS.default.init({
        once: true,
        easing: "ease-out-cubic",
        duration: 420,
      });
    });
  }, []);
}