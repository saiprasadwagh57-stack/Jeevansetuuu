import React from "react";

export const MedicalBackgroundDecor: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none opacity-40">
      {/* Soft Ambient Purple/Lavender Radial Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-radial from-[#6750A4]/15 via-[#EADDFF]/10 to-transparent blur-3xl"></div>
      <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-radial from-[#7C5CFC]/15 via-[#F4F0FF]/10 to-transparent blur-3xl"></div>
      <div className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] rounded-full bg-radial from-[#21005D]/10 via-[#EADDFF]/15 to-transparent blur-3xl"></div>

      {/* Floating Healthcare Plus Symbols */}
      <div className="absolute top-20 left-[10%] text-[#6750A4]/15 font-sans font-light text-6xl animate-pulse">
        +
      </div>
      <div className="absolute top-1/2 right-[8%] text-[#7C5CFC]/20 font-sans font-light text-5xl animate-pulse [animation-delay:1s]">
        +
      </div>
      <div className="absolute bottom-1/4 left-[5%] text-[#6750A4]/15 font-sans font-light text-4xl animate-pulse [animation-delay:2s]">
        +
      </div>
      <div className="absolute top-1/4 right-[25%] text-[#21005D]/10 font-sans font-light text-3xl">
        +
      </div>

      {/* Subtle ECG Heartbeat Waves SVG Path */}
      <svg
        className="absolute top-28 left-0 w-full h-24 text-[#6750A4]/10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path d="M0,60 L300,60 L320,10 L340,110 L360,30 L380,80 L400,60 L800,60 L820,10 L840,110 L860,30 L880,80 L900,60 L1200,60" />
      </svg>

      <svg
        className="absolute bottom-32 left-0 w-full h-20 text-[#7C5CFC]/10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path d="M0,60 L150,60 L170,20 L190,100 L210,40 L230,75 L250,60 L650,60 L670,20 L690,100 L710,40 L730,75 L750,60 L1200,60" />
      </svg>
    </div>
  );
};
