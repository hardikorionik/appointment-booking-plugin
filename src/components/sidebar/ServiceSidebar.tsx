import { MoveRight, X } from "lucide-react";
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
        <p className="font-bebas text-3xl mb-0">Your Order</p>

        <p className="text-xs font-semibold text-black/40 uppercase line-clamp-1">
          {outletName || "-"} Outlet
        </p>
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold my-1.5 text-black/40 uppercase line-clamp-1">
          SELECTED SERVICES
        </p>
        {selectedServices?.length > 0 && (
          <ul className="md:h-[calc(100dvh-290px)] h-[calc(100dvh-230px)] overflow-y-scroll mb-1 scrollbar-none">
            {selectedServices?.map((svc, index) => (
              <li
                key={svc.id}
                className={`flex justify-between flex-row items-center gap-2 text-sm py-2 ${
                  index !== selectedServices?.length - 1
                    ? "border-b border-dotted border-gray-400"
                    : ""
                }`}
              >
                <span className="flex justify-between flex-row items-center gap-1">
                  {svc.name} <X size={12} /> {svc.qty}
                </span>
                <span className="flex justify-between flex-row items-center gap-1">
                  ({svc.min_time || svc.estimated_time} min)
                </span>

                <span className="flex flex-row items-center">
                  <CurrencyIcon size={12} />
                  {svc.price || svc.min_price}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* <div className="h-px bg-border mt-auto my-2.5" /> */}

      <div className="flex justify-between text-lg mb-0.5">
        <span className="font-semibold">Subtotal</span>

        <span className="font-mono font-semibold flex flex-row items-center">
          <CurrencyIcon size={18} />
          {totalPrice}
        </span>
      </div>

      <div>
        <button
          onClick={() => goToStep("professionals")}
          disabled={!selectedServices.length}
          className="bg-btn-bg text-btn-text border-btn-bg px-2 w-full relative py-3 font-dm text-sm font-bold tracking-[1.5px] uppercase cursor-pointer mt-3.5 rounded-sm transition-all duration-200 disabled:bg-[#ccc] disabled:cursor-not-allowed max-md:py-3.5 max-md:text-xs"
        >
          <span className="flex flex-row justify-center items-center gap-2">
            Choose Professional <MoveRight />
            {/* Choose Time <MoveRight /> */}
          </span>
        </button>
      </div>
    </>
  );
}
