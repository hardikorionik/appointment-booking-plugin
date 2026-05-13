import { ChevronRight, Clock3, Package2 } from "lucide-react";
import { useSelector } from "react-redux";
import { CurrencyIcon } from "@/utils";
import { OutletRootState, ServiceItem, Step } from "@/types";

interface ServiceSidebarProps {
  selectedServices: ServiceItem[];
  totalPrice: number;
  goToStep: (step: Step) => void;
}

export default function ServiceSidebar({
  selectedServices,
  totalPrice,
  goToStep,
}: ServiceSidebarProps) {
  const { outletName } = useSelector(
    (state: OutletRootState) => state?.outletDetails,
  );
  return (
    <>
      <div className="p-3 border-b border-gray-300">
        <p className="font-black uppercase tracking-tight text-2xl mb-0">
          Your Order
        </p>

        <p className="text-xs font-semibold text-black/40 uppercase line-clamp-1">
          {outletName || "-"} Outlet
        </p>
      </div>
      <div className="flex flex-col justify-between h-full">
        <div className="p-3 border-b border-gray-300">
          <p className="text-sm font-semibold my-1.5 text-black/40 uppercase line-clamp-1">
            SELECTED SERVICES
          </p>
          {selectedServices?.length > 0 && (
            <ul className="md:h-[calc(100dvh-270px)] h-[calc(100dvh-230px)] overflow-y-scroll scrollbar-none">
              {selectedServices?.map((svc, index) => (
                <li
                  key={svc.id}
                  className={`flex justify-start flex-col items-start text-sm py-2 ${
                    index !== selectedServices?.length - 1
                      ? "border-b border-dotted border-gray-400"
                      : ""
                  }`}
                >
                  <p className="flex justify-between flex-row items-center gap-1 line-clamp-1 text-sm font-medium uppercase">
                    {svc.name}
                  </p>
                  <div className="grid grid-cols-3 items-center gap-2 w-full">
                    <div className="flex items-center justify-start gap-1 text-xs text-black/60 font-medium">
                      <Package2 size={13} />
                      <span>{svc.qty}</span>
                    </div>

                    <div className="flex items-center justify-center gap-1 text-xs text-black/60 font-medium">
                      <Clock3 size={13} />
                      <span>{svc.min_time || svc.estimated_time} min</span>
                    </div>

                    <p className="flex items-center justify-end gap-1 text-xs text-black/60 font-medium">
                      <CurrencyIcon size={12} />
                      {svc.price || svc.min_price}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* <div className="h-px bg-border mt-auto my-2.5" /> */}

        <div className="p-3">
          <div className="flex justify-between items-end mb-1">
            <span className="font-medium text-sm text-black/60 uppercase">
              Subtotal
            </span>

            <span className="font-mono font-semibold flex flex-row items-center">
              <CurrencyIcon size={18} />
              {totalPrice}
            </span>
          </div>

          <div>
            <button
              onClick={() => goToStep("professionals")}
              disabled={!selectedServices.length}
              className="bg-btn-bg text-btn-text border-btn-bg hover:text-btn-text-hover hover:border-btn-bg-hover hover:bg-btn-bg-hover px-2 w-full relative py-3 font-dm text-xs font-bold tracking-[1.5px] uppercase cursor-pointer mt-3.5 transition-all duration-200 disabled:bg-btn-bg-hover/70 disabled:cursor-not-allowed max-md:py-3.5 max-md:text-xs"
            >
              <span className="flex flex-row justify-center items-center gap-2">
                Choose Professional <ChevronRight size={16} />
                {/* Choose Time <ChevronRight size={16} /> */}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
