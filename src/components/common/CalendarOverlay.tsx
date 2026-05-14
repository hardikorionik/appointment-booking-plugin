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
      className="aaravpos-date-modal-overlay"
      onClick={(e: React.MouseEvent<HTMLDivElement>) =>
        e.target === e.currentTarget && onClose()
      }
    >
      <div className="aaravpos-date-modal">
        <div className="aaravpos-date-modal-header">
          <h2 className="aaravpos-date-modal-title">
            Pick a Date
          </h2>

          <button
            onClick={onClose}
            className="aaravpos-date-close-btn"
          >
            <X />
          </button>
        </div>
        <div className="aaravpos-date-modal-body">
          <div className="aaravpos-date-nav">
            <button
              disabled={currentMonthIndex === 0}
              onClick={() =>
                setCurrentMonthIndex((prev) =>
                  Math.max(prev - 1, 0),
                )
              }
              className="aaravpos-date-nav-btn"
            >
              <ChevronLeft />
            </button>

            <div className="aaravpos-date-month-label">
              {currentMonth?.label}
            </div>

            <button
              disabled={currentMonthIndex === months.length - 1}
              onClick={() =>
                setCurrentMonthIndex((prev) =>
                  Math.min(prev + 1, months.length - 1),
                )
              }
              className="aaravpos-date-nav-btn"
            >
              <ChevronRight />
            </button>
          </div>

          <div className="aaravpos-calendar-grid">
            {WD.map((d, i) => (
              <div
                key={i}
                className="aaravpos-calendar-weekday"
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
                    "aaravpos-calendar-day",
                    !sel && !past
                      ? "aaravpos-calendar-day-active"
                      : "",
                    today && !sel
                      ? "aaravpos-calendar-day-today"
                      : "",
                    sel
                      ? "aaravpos-calendar-day-selected"
                      : "",
                    past
                      ? "aaravpos-calendar-day-disabled"
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
  );
}