import {
  useMemo,
  useRef,
  useState,
  useEffect,
  ReactNode,
  JSX,
} from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { DateTime } from "luxon";
import { X, MoveRight } from "lucide-react";
import { getUserName, CurrencyIcon } from "@/utils";
import { calculateServiceTax } from "@/utils/taxHelper";
import type {
  RootState,
  ServiceItem,
  StaffMember,
  Slot,
} from "@/types";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface ExtendedServiceItem extends ServiceItem {
  tax: number;
  unitTax: number;
}

interface OrderSidebarProps {
  buttonText?: string;
  onButtonClick: () => void;
  showTaxesOnlyIfTime?: boolean;
  showTip?: boolean;
  tipPct?: number;
  onTipChange?: (tip: number) => void;
  consentRequired?: boolean;
  consentCompleted?: number;
  totalConsents?: number;
  checkingConsent?: boolean;
  loading?: boolean;
  isBookingDisabled?: boolean;
  handleSidebarOpen?: () => void;
}

export default function OrderSidebar({
  buttonText,
  onButtonClick,
  showTaxesOnlyIfTime = false,
  showTip = false,
  tipPct = 0,
  onTipChange,
  consentRequired = false,
  consentCompleted = 0,
  totalConsents = 0,
  checkingConsent = false,
  loading = false,
  isBookingDisabled = false,
  handleSidebarOpen,
}: OrderSidebarProps): JSX.Element {
  const { selectedSlotIndexes, slots, selectedDate } = useSelector(
    (state: RootState) => state.slots,
  );

  const { staff, selectedServices, selectedProfessional } = useSelector(
    (state: RootState) => state.service,
  );

  const { outletTimeZone } = useSelector(
    (state: RootState) => state.outletDetails,
  );

  const startDate = DateTime.now().setZone(outletTimeZone ?? "UTC");

  const [customTip, setCustomTip] = useState<string>("");

  const [isCustomTip, setIsCustomTip] =
    useState<boolean>(false);

  const firstRef = useRef<HTMLDivElement | null>(null);

  const thirdRef = useRef<HTMLDivElement | null>(null);

  const [secondHeight, setSecondHeight] =
    useState<number>(0);

  const TIP_OPTIONS: number[] = [0, 5, 10, 15, 20];

  const allSlots = useMemo<Slot[]>(() => {
    return [
      ...(slots?.morning || []),
      ...(slots?.afternoon || []),
      ...(slots?.evening || []),
    ];
  }, [slots]);

  const SLOT_INTERVAL = 15;

  const selectedStaffServices = useMemo<
    ExtendedServiceItem[]
  >(() => {
    if (!selectedProfessional?.id) return [];

    const staffMember = staff?.find(
      (s: StaffMember) => s.id === selectedProfessional.id,
    );

    if (!staffMember) return [];

    return selectedServices.map((svc: any) => {
      const assignment = staffMember.assignments?.find(
        (a) => a.id === svc.id,
      );

      const updatedSvc = {
        ...svc,
        price:
          assignment?.price ||
          svc.price ||
          svc.min_price ||
          0,

        duration:
          assignment?.duration ||
          svc.estimated_time ||
          svc.min_time ||
          0,
      };

      return {
        ...updatedSvc,
        tax: calculateServiceTax(updatedSvc),
        unitTax: calculateServiceTax(updatedSvc, {
          perUnit: true,
        }),
      };
    });
  }, [selectedProfessional, staff, selectedServices]);

  const totalBasePrice = selectedStaffServices.reduce(
    (sum, s) => sum + Number(s.price) * (s.qty || 1),
    0,
  );

  const totalDuration = selectedStaffServices.reduce(
    (sum, s) => sum + Number(s.duration) * (s.qty || 1),
    0,
  );

  const requiredSlots = Math.ceil(
    totalDuration / SLOT_INTERVAL,
  );

  const formatTimeRange = (
    startIndex: number,
  ): string => {
    if (!allSlots.length) return "";

    const start = allSlots[startIndex]?.start_time;

    const endSlot =
      allSlots[startIndex + requiredSlots - 1];

    if (!start || !endSlot) return "";

    const end =
      endSlot.end_time || endSlot.start_time;

    return `${start} - ${end}`;
  };

  const safeDate = selectedDate || {
    day: startDate.day,
    month: startDate.month,
    year: startDate.year,
  };

  const selectedStartIndex =
    selectedSlotIndexes?.[0];

  const timeRange =
    selectedStartIndex !== undefined
      ? formatTimeRange(selectedStartIndex)
      : null;

  // const dateStr = timeRange
  //   ? `${MONTH_NAMES[safeDate.month]} ${safeDate.day} at ${timeRange}`
  //   : null;
  const monthIndex = safeDate.month ?? 0;

  const dateStr = timeRange
    ? `${MONTH_NAMES[monthIndex]} ${safeDate.day} at ${timeRange}`
    : null;

  const taxAmt = selectedStaffServices.reduce(
    (sum, s) => sum + s.tax,
    0,
  );

  const safeTipPct = Number(tipPct) || 0;

  const tipAmt = showTip
    ? (totalBasePrice * safeTipPct) / 100
    : 0;

  const total = totalBasePrice + taxAmt + tipAmt;

  useEffect(() => {
    if (
      showTip &&
      (tipPct === null || tipPct === undefined)
    ) {
      onTipChange?.(0);
    }
  }, [showTip, tipPct, onTipChange]);

  const finalButtonText = useMemo<
    ReactNode
  >(() => {
    if (loading) return "Processing...";

    if (checkingConsent)
      return "Checking consents...";

    if (
      consentRequired &&
      consentCompleted < totalConsents
    ) {
      return `Sign Consents (${consentCompleted}/${totalConsents})`;
    }

    return (
      <>
        {buttonText || "Book Appointment"}
        <MoveRight />
      </>
    );
  }, [
    loading,
    checkingConsent,
    consentRequired,
    consentCompleted,
    totalConsents,
    buttonText,
  ]);

  const isButtonDisabled =
    isBookingDisabled ||
    loading ||
    checkingConsent ||
    !timeRange;

  useEffect(() => {
    const calculateHeight = (): void => {
      const firstHeight =
        firstRef.current?.offsetHeight || 0;

      const thirdHeight =
        thirdRef.current?.offsetHeight || 0;

      const totalOffset =
        ((firstHeight +
          (isCustomTip
            ? 70
            : showTip
              ? 68
              : 56)) ||
          0) + thirdHeight;

      setSecondHeight(
        window.innerHeight - totalOffset,
      );
    };

    calculateHeight();

    const resizeObserver = new ResizeObserver(
      () => {
        calculateHeight();
      },
    );

    if (thirdRef.current) {
      resizeObserver.observe(thirdRef.current);
    }

    if (firstRef.current) {
      resizeObserver.observe(firstRef.current);
    }

    window.addEventListener(
      "resize",
      calculateHeight,
    );

    return () => {
      resizeObserver.disconnect();

      window.removeEventListener(
        "resize",
        calculateHeight,
      );
    };
  }, [
    selectedStaffServices,
    showTip,
    consentCompleted,
    totalConsents,
    isCustomTip,
  ]);

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="first" ref={firstRef}>
        <p className="font-bebas text-xl mb-3 flex flex-row justify-between items-center">
          Your Order

          {handleSidebarOpen && (
            <button
              onClick={handleSidebarOpen}
              className="md:hidden block w-auto p-2 text-3xl border-none cursor-pointer rounded"
            >
              <X />
            </button>
          )}
        </p>

        {selectedProfessional?.id && (
          <div className="flex items-center gap-3 mb-3 p-3 border border-border rounded bg-white">
            {selectedProfessional.imageUrl ? (
              <img
                src={selectedProfessional.imageUrl}
                alt={selectedProfessional.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full text-white flex items-center justify-center"
                style={{
                  background:
                    selectedProfessional.color ||
                    "#111",
                }}
              >
                {getUserName(
                  selectedProfessional.name,
                )}
              </div>
            )}

            <div>
              <p className="text-sm font-semibold">
                {selectedProfessional.name}
              </p>

              <p className="text-xs text-gray-500">
                {selectedProfessional.staff_type}
              </p>
            </div>
          </div>
        )}

        <div className="text-sm mb-3 border-b border-border pb-2 font-bold flex justify-between">
          <span>Date & Time:</span>

          {dateStr ? (
            <span className="text-red">
              {dateStr}
            </span>
          ) : (
            <span className="text-muted">
              No time selected
            </span>
          )}
        </div>
      </div>

      <ul
        className="overflow-y-scroll mb-1 no-scrollbar"
        style={{ height: `${secondHeight}px` }}
      >
        {selectedStaffServices?.length > 0 &&
          selectedStaffServices.map(
            (svc, index) => (
              <li
                key={svc.id}
                className={`flex justify-between text-sm py-1.5 ${index !==
                  selectedStaffServices?.length - 1
                  ? "border-b border-dotted border-gray-400"
                  : ""
                  }`}
              >
                <span className="flex justify-between flex-row items-center gap-1">
                  {svc.name} <X size={12} />{" "}
                  {svc.qty} ({svc.duration} min)
                </span>

                <span className="flex flex-col items-end">
                  <span className="flex items-center">
                    <CurrencyIcon size={12} />
                    {svc.price}
                  </span>

                  {svc.tax > 0 && (
                    <span className="flex items-center text-[11px] text-gray-700">
                      + Tax:{" "}
                      <CurrencyIcon size={11} />
                      {svc.unitTax.toFixed(2)}
                    </span>
                  )}
                </span>
              </li>
            ),
          )}
      </ul>

      <div className="third" ref={thirdRef}>
        {showTip && (
          <>
            <p className="text-[10px] font-bold uppercase tracking-[1.5px] mt-4 mb-2">
              Add Tip
            </p>

            <div className="flex gap-1 mb-2">
              {[...TIP_OPTIONS, "custom"].map(
                (item, index) => {
                  const isCustom =
                    item === "custom";

                  const isActive = isCustom
                    ? isCustomTip
                    : safeTipPct === item;

                  const isFirst = index === 0;

                  const isLast =
                    index ===
                    [...TIP_OPTIONS, "custom"]
                      .length -
                    1;

                  return (
                    <button
                      key={item}
                      onClick={() => {
                        if (isCustom) {
                          setIsCustomTip(true);

                          onTipChange?.(
                            Number(customTip) || 0,
                          );
                        } else {
                          setIsCustomTip(false);

                          setCustomTip("");

                          onTipChange?.(
                            Number(item),
                          );
                        }
                      }}
                      className={`
                      px-2 py-1.5 border rounded-sm cursor-pointer text-xs text-center
                      ${isFirst || isLast ? "flex-none w-16" : "flex-1"}
                      ${isActive
                          ? "bg-red text-white border-red"
                          : "bg-white border-border"
                        }
                    `}
                    >
                      {isCustom
                        ? "Custom"
                        : item === 0
                          ? "No tip"
                          : `${item}%`}
                    </button>
                  );
                },
              )}
            </div>

            <AnimatePresence initial={false}>
              {isCustomTip && (
                <motion.div
                  initial={{
                    height: 0,
                    opacity: 0,
                  }}
                  animate={{
                    height: "auto",
                    opacity: 1,
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.25,
                    ease: "easeInOut",
                  }}
                  className="overflow-hidden"
                >
                  <input
                    id="number"
                    name="number"
                    type="number"
                    placeholder="Enter %"
                    value={customTip}
                    onChange={(e) => {
                      const value =
                        e.target.value;

                      if (
                        value === "" ||
                        (Number(value) >= 0 &&
                          Number(value) <=
                          100)
                      ) {
                        setCustomTip(value);

                        onTipChange?.(
                          Number(value) || 0,
                        );
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-sm text-sm mb-3"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {consentRequired &&
          consentCompleted < totalConsents && (
            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-sm">
              <p className="text-xs text-yellow-800 font-medium">
                Consent Required:{" "}
                {consentCompleted}/
                {totalConsents} completed
              </p>

              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div
                  className="bg-yellow-600 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${(consentCompleted /
                      totalConsents) *
                      100
                      }%`,
                  }}
                />
              </div>
            </div>
          )}

        <div className="mt-auto">
          <PriceRow
            label="Service"
            value={
              <span className="flex items-center">
                <CurrencyIcon size={14} />
                {totalBasePrice.toFixed(2)}
              </span>
            }
          />

          {showTip && (
            <PriceRow
              label={`Tip (${safeTipPct}%)`}
              value={
                <span className="flex items-center">
                  <CurrencyIcon size={14} />
                  {tipAmt.toFixed(2)}
                </span>
              }
            />
          )}

          {(!showTaxesOnlyIfTime ||
            timeRange) && (
              <PriceRow
                label="Taxes"
                value={
                  <span className="flex items-center">
                    <CurrencyIcon size={14} />
                    {taxAmt.toFixed(2)}
                  </span>
                }
              />
            )}

          <div className="flex justify-between text-lg pt-3 border-t mt-2">
            <span className="font-semibold">
              Total
            </span>

            <span className="font-mono font-semibold text-red text-lg flex items-center">
              <CurrencyIcon size={18} />
              {total.toFixed(2)}
            </span>
          </div>

          <button
            onClick={onButtonClick}
            disabled={isButtonDisabled}
            className="cta-btn px-2 h-11 w-full py-3.75 bg-ink text-white border-none font-dm text-sm font-bold tracking-[1.5px] uppercase cursor-pointer mt-3.5 rounded-sm transition-all duration-200 disabled:bg-[#ccc] disabled:cursor-not-allowed max-md:py-3.5 max-md:text-xs"
          >
            <span className="flex flex-row justify-center items-center gap-2">
              {finalButtonText}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface PriceRowProps {
  label: string;
  value: ReactNode;
}

function PriceRow({
  label,
  value,
}: PriceRowProps): JSX.Element {
  return (
    <div className="flex justify-between text-sm font-semibold text-gray-700 mb-1.5">
      <span>{label}</span>

      <span className="font-mono flex flex-row items-center">
        {value}
      </span>
    </div>
  );
}