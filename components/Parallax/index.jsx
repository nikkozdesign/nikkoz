import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Parallax({
  className,
  children,
  speed = 1,
  id = "parallax",
}) {
  const trigger = useRef(null);
  const target = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 769px)", () => {
        const setY = gsap.quickSetter(target.current, "y", "px");

        ScrollTrigger.create({
          id,
          trigger: trigger.current,
          scrub: true,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const y = window.innerWidth * speed * 0.1;
            setY(self.progress * y);
          },
        });
      });
    },
    { dependencies: [id, speed] }
  );

  return (
    <div ref={trigger} className={className}>
      <div ref={target}>{children}</div>
    </div>
  );
}
