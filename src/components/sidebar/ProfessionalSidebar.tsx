import { ChevronRight, Clock3, Package2 } from "lucide-react";

import { useSelector } from "react-redux";

import { getUserName, CurrencyIcon } from "@/utils";

import { Staff, Step, Service, OutletRootState } from "@/types";

import { RootState } from "@/store";

interface SelectedStaffService extends Service {
  qty: number;
  duration?: number;
  tax?: number;
}

interface ProfessionalSidebarProps {
  pro: Staff | null;
  selectedStaffServices?: SelectedStaffService[];
  totalPrice?: number;
  totalDuration?: number;
  goToStep: (step: Step) => void;
}

const ProfessionalSidebar = ({
  pro,
  selectedStaffServices = [],
  totalPrice = 0,
  totalDuration = 0,
  goToStep,
}: ProfessionalSidebarProps) => {
  const { outletName } = useSelector(
    (state: OutletRootState) => state.outletDetails,
  );

  const { isService } = useSelector((state: RootState) => state.outletDetails);

  const hasServices = selectedStaffServices.length > 0;

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
                    className="w-10 h-10 rounded-lg object-cover border border-black/10"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-lg bg-btn-bg/50 text-white flex items-center justify-center"
                    style={{
                      background: pro.color || "#111",
                    }}
                  >
                    {getUserName(pro.name)}
                  </div>
                )}

                <div className="overflow-hidden">
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

          {/* Services */}
          {hasServices && (
            <>
              <p className="text-sm font-semibold my-1.5 text-black/40 uppercase">
                Selected Services
              </p>

              <ul className="md:h-[calc(100dvh-410px)] h-[calc(100dvh-260px)] overflow-y-auto scrollbar-none">
                {selectedStaffServices.map((svc, index) => (
                  <li
                    key={svc.id}
                    className={`flex flex-col items-start text-sm py-2 ${
                      index !== selectedStaffServices.length - 1
                        ? "border-b border-dotted border-gray-400"
                        : ""
                    }`}
                  >
                    <p className="flex items-center gap-1 line-clamp-1 text-sm font-medium uppercase">
                      {svc.name}
                    </p>

                    <div className="grid grid-cols-3 items-center gap-2 w-full">
                      {/* Qty */}
                      <div className="flex items-center justify-start gap-1 text-xs text-black/60 font-medium">
                        <Package2 size={13} />
                        <span>{svc.qty}</span>
                      </div>

                      {/* Duration */}
                      <div className="flex items-center justify-center gap-1 text-xs text-black/60 font-medium">
                        <Clock3 size={13} />
                        <span>{svc.min_time || svc.estimated_time} min</span>
                      </div>

                      {/* Price */}
                      <p className="flex items-center justify-end gap-1 text-xs text-black/60 font-medium">
                        <CurrencyIcon size={12} />
                        {svc.price || svc.min_price}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-300">
          {/* Totals */}
          {hasServices && (
            <>
              <div className="flex justify-between items-end mb-1">
                <span className="font-medium text-sm text-black/60 uppercase">
                  Subtotal
                </span>

                <span className="font-mono font-semibold flex items-center">
                  <CurrencyIcon size={18} />
                  {totalPrice}
                </span>
              </div>

              <div className="flex justify-between items-end mb-1">
                <span className="font-medium text-sm text-black/60 uppercase">
                  Duration
                </span>

                <span className="font-mono font-semibold">
                  {totalDuration} mins
                </span>
              </div>
            </>
          )}

          {/* Button */}
          <button
            disabled={isService ? !selectedStaffServices.length : !pro}
            onClick={() => goToStep("time")}
            className="bg-btn-bg text-btn-text border-btn-bg hover:text-btn-text-hover hover:border-btn-bg-hover hover:bg-btn-bg-hover px-2 w-full relative py-3 font-dm text-xs font-bold tracking-[1.5px] uppercase cursor-pointer mt-3.5 transition-all duration-200 disabled:bg-btn-bg-hover/70 disabled:cursor-not-allowed max-md:py-3.5 max-md:text-xs"
          >
            <span className="flex flex-row justify-center items-center gap-2">
              {isService ? "Choose Time" : "Choose Services"}

              <ChevronRight size={16} />
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfessionalSidebar;
