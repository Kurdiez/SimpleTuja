import React from "react";

const EthIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <g>
      <polygon points="16.01,1.5 7.62,16.23 16.01,21.5 24.38,16.18" />
      <line x1="16.01" x2="16.01" y1="30.5" y2="24.1" />
      <polygon points="16.01,30.5 7.62,18.83 16.01,24.1 24.38,18.78" />
      <polygon points="16.01,12.3 7.62,16.23 16.01,21.5 24.38,16.18" />
      <line x1="16.01" x2="16.01" y1="1.5" y2="21.5" />
      <polygon points="16.01,1.5 7.62,16.23 16.01,21.5 24.38,16.18" />
    </g>
  </svg>
);

export default EthIcon;
