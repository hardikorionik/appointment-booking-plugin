import { MoveRight } from "lucide-react";

import { getUserName } from "@/utils";

import { ProfessionalSidebarProps, Staff, Step } from "@/types";
import { JSX } from "react";

const ProfessionalServiceSidebar = ({
  pro,
  goToStep,
}: ProfessionalSidebarProps): JSX.Element => {
  return (
    <>
      <p className="font-bebas text-xl mb-3">Your Order</p>

      {pro?.id && (
        <div className="flex items-center gap-3 mb-3 p-3 border border-border rounded bg-white">
          {pro.imageUrl ? (
            <img
              src={pro.imageUrl}
              alt={pro.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center"
              style={{ background: pro.color || "#111" }}
            >
              {getUserName(pro.name)}
            </div>
          )}

          <div>
            <p className="text-sm font-semibold">{pro.name}</p>

            <p className="text-xs text-gray-500">{pro.staff_type}</p>
          </div>
        </div>
      )}

      <div className="h-px bg-border mt-auto my-2.5" />

      <div>
        <button
          disabled={!pro}
          onClick={() => goToStep("time")}
          className="cta-btn w-full relative py-3.75 bg-ink text-white border-none font-dm text-sm font-bold tracking-[1.5px] uppercase cursor-pointer mt-3.5 rounded-sm transition-all duration-200 disabled:bg-[#ccc] disabled:cursor-not-allowed max-md:py-3.5 max-md:text-xs"
        >
          <span className="flex flex-row justify-center items-center gap-2">
            Choose Services <MoveRight />
          </span>
        </button>
      </div>
    </>
  );
};

export default ProfessionalServiceSidebar;
