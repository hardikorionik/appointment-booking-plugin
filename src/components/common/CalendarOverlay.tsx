import { JSX, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DateTime } from "luxon";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { setSelectedDate } from "@/slices/slotSlice";
import type { OutletRootState, CalendarMonth } from "@/types";

const generateMonths = (outletTimeZone: string): CalendarMonth[] => {
  try {
    if (!outletTimeZone) {
      throw new Error("Missing timezone");
    }

    const today = DateTime.now().setZone(outletTimeZone);

    if (!today.isValid) {
      throw new Error("Invalid timezone");
    }

    return Array.from({ length: 6 }, (_, i) => {
      const d = today.plus({ months: i }).startOf("month");

      return {
        label: d.toFormat("LLLL yyyy"),
        monthIdx: d.month,
        year: d.year,
        startDow: d.startOf("month").weekday % 7,
        days: d.daysInMonth || 0,
      };
    });
  } catch (error) {
    console.error("generateMonths error:", error);
    return [];
  }
};

const WD: string[] = ["S", "M", "T", "W", "T", "F", "S"];

interface CalendarOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

function isPast(monthIdx: number, day: number): boolean {
  return monthIdx === 2 && day < 12;
}

export default function CalendarOverlay({
  isOpen,
  onClose,
}: CalendarOverlayProps): JSX.Element | null {
  const dispatch = useDispatch();

  const { selectedDate } = useSelector(
    (state: OutletRootState) => state.slots,
  );

  const { timeZone, outletTimeZoneYear } = useSelector(
    (state: OutletRootState) => state.outletDetails,
  );

  const [months] = useState<CalendarMonth[]>(
    generateMonths(timeZone || ""),
  );

  const [currentMonthIndex, setCurrentMonthIndex] =
    useState<number>(0);

  const currentMonth = months[currentMonthIndex];

  if (!isOpen) return null;

  const startDate = DateTime.now().setZone(timeZone ?? "UTC");

  const handlePick = (monthIdx: number, day: number): void => {
    dispatch(
      setSelectedDate({
        month: monthIdx,
        day,
        year: outletTimeZoneYear,
      }),
    );

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-200 bg-[rgba(14,14,14,0.55)] backdrop-blur-sm flex items-center justify-center min-h-[calc(100dvh-56px)]"
      onClick={(e: React.MouseEvent<HTMLDivElement>) =>
        e.target === e.currentTarget && onClose()
      }
    >
      <div className="bg-canvas rounded-lg max-w-[95vw] max-h-[90vh] flex flex-col shadow-2xl animate-pop-in max-md:h-[fit] max-md:rounded-t-2xl max-md:rounded-b-none">
        <div className="flex items-center justify-between p-4 border-b border-border max-md:px-4 sticky top-0 bg-canvas z-10">
          <h2 className="font-bebas text-[26px] tracking-[1px] max-md:text-xl">
            Pick a Date
          </h2>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full cursor-pointer bg-surface flex items-center justify-center text-muted hover:bg-red hover:text-white transition"
          >
            <X />
          </button>
        </div>

        <div className="overflow-y-auto px-7 py-5 max-md:px-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <button
                disabled={currentMonthIndex === 0}
                onClick={() =>
                  setCurrentMonthIndex((prev) =>
                    Math.max(prev - 1, 0),
                  )
                }
                className={`text-lg disabled:opacity-30 hover:red transition hover:text-red ${currentMonthIndex === 0
                  ? "cursor-not-allowed"
                  : "cursor-pointer"
                  }`}
              >
                <ChevronLeft />
              </button>

              <div className="text-sm font-semibold">
                {currentMonth?.label}
              </div>

              <button
                disabled={currentMonthIndex === months.length - 1}
                onClick={() =>
                  setCurrentMonthIndex((prev) =>
                    Math.min(prev + 1, months.length - 1),
                  )
                }
                className={`text-lg disabled:opacity-30 hover:red transition hover:text-red ${currentMonthIndex === months.length - 1
                  ? "cursor-not-allowed"
                  : "cursor-pointer"
                  }`}
              >
                <ChevronRight />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1.5 max-md:gap-2">
              {WD.map((d, i) => (
                <div
                  key={i}
                  className="text-[10px] font-semibold uppercase text-muted text-center py-1"
                >
                  {d}
                </div>
              ))}

              {Array.from({
                length: currentMonth?.startDow || 0,
              }).map((_, i) => (
                <div key={`e${i}`} />
              ))}

              {Array.from(
                { length: currentMonth?.days || 0 },
                (_, i) => i + 1,
              ).map((day) => {
                const sel =
                  selectedDate?.month === currentMonth?.monthIdx &&
                  selectedDate?.day === day;

                const today =
                  currentMonth?.monthIdx === startDate.month &&
                  day === startDate.day;

                const past = isPast(
                  currentMonth?.monthIdx || 0,
                  day,
                );

                return (
                  <div
                    key={day}
                    onClick={() => {
                      if (!past) {
                        handlePick(
                          currentMonth.monthIdx,
                          day,
                        );
                      }
                    }}
                    className={[
                      "aspect-square flex items-center justify-center rounded-full",
                      "text-xs font-mono transition-all duration-150",
                      "min-h-8.5 max-md:min-h-10",
                      !sel && !past
                        ? "hover:bg-red/10 hover:text-red cursor-pointer"
                        : "",
                      today && !sel
                        ? "outline-[1.5px] outline-border outline-offset-1"
                        : "",
                      sel
                        ? "cal-avail cal-selected bg-red! text-white!"
                        : "",
                      past
                        ? "opacity-40 cursor-not-allowed"
                        : "",
                    ].join(" ")}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}