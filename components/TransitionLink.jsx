import { useRouter } from "next/router";
import { useCallback } from "react";
import { useTransition } from "@/context/TransitionContext";

export default function TransitionLink({
  href,
  transition,
  children,
  onClick,
  ...rest
}) {
  const router = useRouter();
  const { start } = useTransition();

  const handleClick = useCallback(
    (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      onClick?.(e);
      const t = typeof transition === "function" ? transition(e) : transition;
      if (t) start(t.kind, t.payload);
      router.push(href);
    },
    [router, href, transition, start, onClick],
  );

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
