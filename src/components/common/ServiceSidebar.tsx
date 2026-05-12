import { MoveRight, X } from "lucide-react";
import { CurrencyIcon } from "@/utils";

interface Service {
    id: string | number;
    name: string;
    qty: number;
    min_time?: number;
    estimated_time?: number;
    price?: number;
    min_price?: number;
}

interface ServiceSidebarProps {
    selectedServices: Service[];
    totalPrice: number;
    goToStep: (step: string) => void;
}

export default function ServiceSidebar({
    selectedServices,
    totalPrice,
    goToStep,
}: ServiceSidebarProps) {
    return (
        <>
            <p className="font-bebas text-2xl mb-0">Your Order</p>
            <p className="text-base font-bold text-muted mb-1 border-b border-gray-300 pb-2">
                {/* {outletName || "-"} */}
            </p>
            {selectedServices?.length > 0 && (
                <ul className="md:h-[calc(100dvh-70px)] h-[calc(100dvh-230px)] overflow-y-scroll mb-1 scrollbar-none">
                    {selectedServices?.map((svc, index) => (
                        <li
                            key={svc.id}
                            className={`flex justify-between flex-row items-center text-sm py-2 ${index !== selectedServices.length - 1
                                ? "border-b border-dotted border-gray-400"
                                : ""
                                }`}
                        >
                            <span className="flex justify-between flex-row items-center gap-1">
                                {svc.name}
                                <X size={12} />
                                {svc.qty} ({svc.min_time || svc.estimated_time} min)
                            </span>

                            <span className="flex flex-row items-center">
                                <CurrencyIcon size={12} />
                                {svc.price || svc.min_price}
                            </span>
                        </li>
                    ))}
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
            <div>
                <button
                    onClick={() => goToStep("professionals")}
                    disabled={!selectedServices.length}
                    className="cta-btn px-2 w-full relative py-3.75 bg-ink text-white hover:text-white border-none font-dm text-sm font-bold tracking-[1.5px] uppercase cursor-pointer mt-3.5 rounded-sm transition-all duration-200 disabled:bg-[#ccc] disabled:cursor-not-allowed max-md:py-3.5 max-md:text-xs"
                >
                    <span className="flex flex-row justify-center items-center gap-2">
                        Choose Professional <MoveRight />
                    </span>
                </button>
            </div>
        </>
    );
}