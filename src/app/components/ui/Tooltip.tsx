import React from "react";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  return (
    <div className="relative flex items-center group">
      {children}
      <span className="absolute bottom-full mb-2 hidden px-2 py-1 text-xs border-gray-300 text-gray bg-white rounded opacity-0 group-hover:block group-hover:opacity-100 transition-opacity duration-200">
        {text}
      </span>
    </div>
  );
};

export default Tooltip;