import type { ReactElement } from "react";

export default function ProfessionalSkeletonCard(): ReactElement {
  return (
    <div className="h-20.5 rounded-sm relative overflow-hidden bg-[#e0e0e0]">
      <div
        className="absolute top-0 -left-full h-full w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
          animation: "shimmer 1.2s infinite",
        }}
      />
    </div>
  );
};
