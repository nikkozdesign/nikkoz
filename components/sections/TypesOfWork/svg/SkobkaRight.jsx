import { forwardRef } from "react";

const SkobkaRight = forwardRef(function SkobkaRight({ className, ...props }, ref) {
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
        d="M1 1C63.7241 87.176 97.9669 190.664 98.977 297.104C99.9871 403.544 67.7145 507.658 6.63718 595"
        stroke="white"
        strokeWidth="2"
      />
    </svg>
  );
});

export default SkobkaRight;
