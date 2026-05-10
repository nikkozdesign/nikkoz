import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function RevealText({ children, className }) {
  const ref = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ref.current,
        start: "top 90%",
        end: "bottom 40%",
        scrub: true,
      },
    });

    tl.fromTo(
      ref.current,
      { opacity: 0 },
      { opacity: 1, ease: "power4.out" },
      0
    );

    const inners = ref.current.querySelectorAll(".line__inner");
    if (inners.length) {
      tl.fromTo(
        inners,
        { yPercent: 100 },
        {
          yPercent: 0,
          ease: "power3.out",
          stagger: 0.05,
        },
        0
      );
    } else {
      tl.fromTo(
        ref.current,
        { y: 50 },
        { y: 0, ease: "power4.out" },
        0
      );
    }
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
