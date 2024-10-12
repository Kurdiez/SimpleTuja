import React from "react";

interface LogoProps {
  fontSize?: string;
}

const Logo: React.FC<LogoProps> = ({ fontSize = "text-2xl" }) => {
  return (
    <span className={`font-bold ${fontSize} select-none`}>
      <span className="text-orange-600">S</span>
      <span className="text-gray-400">imple</span>
      <span className="text-orange-600">T</span>
      <span className="text-gray-400">u</span>
      <span className="text-orange-600">J</span>
      <span className="text-gray-400">a</span>
    </span>
  );
};

export default Logo;
