import { MoveRight } from "lucide-react";
import { useSelector } from "react-redux";

import { getUserName } from "@/utils";

import { ProfessionalSidebarProps, OutletRootState, } from "@/types";

import { JSX } from "react";

const ProfessionalServiceSidebar = ({
  pro,
  goToStep,
}: ProfessionalSidebarProps): JSX.Element => {
  const { outletName } = useSelector(
    (state: OutletRootState) => state.outletDetails,
  );

  const { isService } = useSelector((state: OutletRootState) => state.outletDetails);

  return (
    <>
      {/* Header */}
      <div className="p-3 border-b border-gray-300">
        <p className="font-black uppercase tracking-tight text-2xl mb-0">
          Your Order
        </p>

        <p className="text-xs font-semibold text-black/40 uppercase line-clamp-1">
          {outletName || "-"} Outlet
        </p>
      </div>

      <div className="flex flex-col justify-between h-full">
        {/* Content */}
        <div className="p-3">
          {/* Professional */}
          {pro?.id && (
            <>
              <p className="text-sm font-semibold my-1.5 text-black/40 uppercase">
                Selected Professional
              </p>

              <div className="flex items-center gap-3 mb-4 py-2 px-3 border border-black/20 rounded">
                {pro.imageUrl ? (
                  <img
                    src={pro.imageUrl}
                    alt={pro.name}
                    className="w-10 h-10 rounded-md object-cover"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-md bg-btn-bg/50 text-white flex items-center justify-center"
                    style={{
                      background: pro.color || "#111",
                    }}
                  >
                    {getUserName(pro.name)}
                  </div>
                )}

                <div>
                  <p className="text-sm font-bold uppercase line-clamp-1">
                    {pro.name}
                  </p>

                  <p className="text-xs text-gray-500 uppercase line-clamp-1">
                    {pro.staff_type}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-300">
          <button
            disabled={!pro}
            onClick={() => goToStep("time")}
            className="bg-btn-bg text-btn-text border-btn-bg hover:text-btn-text-hover hover:border-btn-bg-hover hover:bg-btn-bg-hover px-2 w-full relative py-3 font-dm text-xs font-bold tracking-[1.5px] uppercase cursor-pointer mt-3.5 transition-all duration-200 disabled:bg-btn-bg-hover/70 disabled:cursor-not-allowed max-md:py-3.5 max-md:text-xs"
          >
            <span className="flex flex-row justify-center items-center gap-2">
              {isService ? "Choose Time" : "Choose Services"}
              <MoveRight size={16} />
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfessionalServiceSidebar;
