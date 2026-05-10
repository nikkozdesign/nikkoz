import { forwardRef } from "react";

const SkobkaLeft = forwardRef(function SkobkaLeft({ className, ...props }, ref) {
  return (
    <svg
      ref={ref}
      {...props}
      className={className}
      width="100"
      height="596"
      viewBox="0 0 100 596"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M99 595C36.2759 508.824 2.03316 405.336 1.02303 298.896C0.0129007 192.456 32.2855 88.3419 93.3629 0.99999"
        stroke="white"
        strokeWidth="2"
      />
    </svg>
  );
});

export default SkobkaLeft;
