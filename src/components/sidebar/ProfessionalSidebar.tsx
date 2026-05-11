import { MoveRight, X } from "lucide-react";

import { getUserName, CurrencyIcon } from "@/utils";

import {
  Staff,
  Step,
  Service,
} from "@/types";
import { JSX } from "react";

interface SelectedStaffService extends Service {
  qty: number;
  duration?: number;
  tax?: number;
}

interface ProfessionalSidebarProps {
  pro: Staff | null;
  selectedStaffServices: SelectedStaffService[];
  totalPrice: number;
  totalDuration: number;
  goToStep: (step: Step) => void;
}

const ProfessionalSidebar = ({
  pro,
  selectedStaffServices,
  totalPrice,
  totalDuration,
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

            <p className="text-xs text-gray-500">
              {pro.staff_type}
            </p>
          </div>
        </div>
      )}

      {selectedStaffServices?.length > 0 && (
        <ul className="md:h-[calc(100dvh-70px)] h-[calc(100dvh-230px)] overflow-y-scroll mb-1 no-scrollbar">
          {selectedStaffServices?.map(
            (svc: SelectedStaffService, index: number) => (
              <li
                key={svc.id}
                className={`flex justify-between text-sm py-2 ${
                  index !== selectedStaffServices.length - 1
                    ? "border-b border-dotted border-gray-400"
                    : ""
                }`}
              >
                <span className="flex justify-between flex-row items-center gap-1">
                  {svc.name} <X size={12} /> {svc.qty} (
                  {svc.min_time || svc.estimated_time} min)
                </span>

                <span className="flex flex-row items-center">
                  <CurrencyIcon size={12} />
                  {svc.price || svc.min_price}
                </span>
              </li>
            ),
          )}
        </ul>
      )}

      <div className="h-px bg-border mt-auto my-2.5" />

      <div className="flex justify-between text-lg mb-0.5">
        <span className="font-semibold">Subtotal</span>

        <span className="font-mono font-semibold flex flex-row items-center">
          <CurrencyIcon size={18} />
          {totalPrice}
        </span>
      </div>

      <div className="flex justify-between text-base">
        <span className="font-semibold">Total Duration</span>

        <span className="font-mono font-semibold">
          {totalDuration} mins
        </span>
      </div>

      <div>
        <button
          disabled={!selectedStaffServices?.length}
          onClick={() => goToStep("time")}
          className="cta-btn w-full relative py-3.75 bg-ink text-white border-none font-dm text-sm font-bold tracking-[1.5px] uppercase cursor-pointer mt-3.5 rounded-sm transition-all duration-200 disabled:bg-[#ccc] disabled:cursor-not-allowed max-md:py-3.5 max-md:text-xs"
        >
          <span className="flex flex-row justify-center items-center gap-2">
            Choose Time <MoveRight />
          </span>
        </button>
      </div>
    </>
  );
};

export default ProfessionalSidebar;