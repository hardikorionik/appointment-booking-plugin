import { useState, useEffect, useMemo, JSX } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DateTime } from "luxon";
import { toast } from "react-toastify";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar1,
  Sun,
  Moon,
  Sunrise,
} from "lucide-react";
import { getStaffSlots } from "@/slices/slotSlice";
import {
  setSelectedSlots,
  setSelectedDate,
  setSelectedTime,
} from "@/slices/slotSlice";
import { getUserName } from "@/utils";
import { nextStep } from "@/slices/breadcrumbSlice";
import { OutletRootState, SlotItem, DateItem, Slot } from "@/types";
import OrderSidebar from "@/components/sidebar/OrderSidebar";
import MainLayout from "@/components/common/MainLayout";
import Breadcrumb from "@/components/common/Breadcrumb";
import CalendarOverlay from "@/components/common/CalendarOverlay";
import { useWindowSize } from "@/hooks/useWindowSize";
import type { AppDispatch } from "@/store";
import "react-toastify/dist/ReactToastify.css";

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

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function TimePage(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const { height } = useWindowSize();

  const [visibleCount, setVisibleCount] = useState<number>(11);


  const { staff, selectedServices, selectedProfessional } = useSelector(
    (state: OutletRootState) => state.service,
  );

  const { outletTimeZone } = useSelector((state: OutletRootState) => state?.outletDetails);

  const { selectedSlotIndexes, selectedDate, selectedTime, slots, loading } =
    useSelector((state: OutletRootState) => state.slots);

  const [calOpen, setCalOpen] = useState<boolean>(false);
  const [stripStart, setStripStart] = useState<number>(0);

  const SLOT_INTERVAL = 15;

  const allSlots = useMemo(() => {
    return [slots.morning, slots.afternoon, slots.evening].flat();
  }, [slots]);

  const startDate = useMemo(
    () => DateTime.now().setZone(outletTimeZone),
    [outletTimeZone],
  );

  const generateDates = (sdate: DateTime): DateItem[] => {
    try {
      const totalDays = 180;

      if (!sdate.isValid) {
        throw new Error("Invalid timezone or start date");
      }

      return Array.from({ length: totalDays }, (_, i) => {
        const d = sdate.plus({ days: i });

        if (!d.isValid) return null;

        return {
          day: d.day,
          month: d.month,
          year: d.year,
          fullDate: d.toISODate(),
        };
      }).filter(Boolean) as DateItem[];
    } catch (error) {
      console.error("generateDates error:", error);
      return [];
    }
  };

  const dates = useMemo<DateItem[]>(() => {
    return generateDates(startDate);
  }, [startDate]);

  const selectedStaffServices = useMemo(() => {
    if (!selectedProfessional?.id) return [];

    const staffMember = staff?.find((s) => s.id === selectedProfessional.id);

    if (!staffMember) return [];

    return selectedServices.map((svc) => {
      const assignment = staffMember.assignments?.find((a) => a.id === svc.id);

      return {
        ...svc,
        price: assignment?.price || svc.price || svc.min_price || 0,
        duration:
          assignment?.duration || svc.estimated_time || svc.min_time || 0,
        qty: assignment?.qty || 1,
      };
    });
  }, [selectedProfessional, staff, selectedServices]);

  const totalDuration = selectedStaffServices.reduce(
    (sum, s) => sum + Number(s.duration) * (s.qty || 1),
    0,
  );

  const durationMins = totalDuration;

  const requiredSlots = Math.ceil(durationMins / SLOT_INTERVAL);

  useEffect(() => {
    if (!selectedProfessional?.id || !selectedDate) return;

    dispatch(
      getStaffSlots({
        staffId: selectedProfessional?.id,
        date: DateTime.fromObject(selectedDate).toFormat("yyyy-MM-dd"),
      }) as any,
    );
  }, [selectedProfessional?.id, selectedDate, dispatch]);

  const handleShift = (dir: number): void => {
    setStripStart((prev) =>
      Math.max(0, Math.min(dates.length - 11, prev + dir * 4)),
    );
  };

  useEffect(() => {
    if (!selectedDate) {
      dispatch(
        setSelectedDate({
          day: startDate.day,
          month: startDate.month,
          year: startDate.year,
        }),
      );
    }
  }, []);

  useEffect(() => {
    if (!selectedDate || !dates.length) return;

    const selectedIndex = dates.findIndex(
      (d) =>
        d.day === selectedDate.day &&
        d.month === selectedDate.month &&
        d.year === selectedDate.year,
    );

    if (selectedIndex === -1) return;

    const newStart = Math.max(
      0,
      Math.min(
        dates.length - visibleCount,
        selectedIndex - Math.floor(visibleCount / 2),
      ),
    );

    setStripStart(newStart);
  }, [selectedDate, dates, visibleCount]);

  const handlePickDate = (d: DateItem): void => {
    const selected = {
      day: d.day,
      month: d.month,
      year: d.year,
    };

    dispatch(setSelectedDate(selected));
    dispatch(setSelectedTime(null));
  };

  const handleSlotSelect = (selectedIndex: number): void => {
    if (!allSlots.length) return;

    const selectedGroup = allSlots.slice(
      selectedIndex,
      selectedIndex + requiredSlots,
    );

    if (selectedGroup.length < requiredSlots) {
      toast.warning("You don't have sufficient time for selected service");
      return;
    }

    const hasBlocked = selectedGroup.some(
      (s) => s.isBooked || s.status !== "AVAILABLE",
    );

    if (hasBlocked) {
      toast.warning("Selected time range is not fully available");
      return;
    }

    dispatch(setSelectedTime(allSlots[selectedIndex].start_time));

    const indexes = Array.from(
      { length: requiredSlots },
      (_, i) => selectedIndex + i,
    );

    const ids = indexes.map((i) => allSlots[i]?.id);

    dispatch(
      setSelectedSlots({
        indexes,
        ids,
      }),
    );
  };

  useEffect(() => {
    if (!selectedTime || !allSlots.length) return;

    const startIndex = allSlots.findIndex(
      (slot) => slot.start_time === selectedTime,
    );

    if (startIndex === -1) return;

    const restoredIndexes = Array.from(
      { length: requiredSlots },
      (_, i) => startIndex + i,
    );

    const isSame =
      restoredIndexes.length === selectedSlotIndexes.length &&
      restoredIndexes.every((val, i) => val === selectedSlotIndexes[i]);

    if (!isSame) {
      const ids = restoredIndexes.map((i) => allSlots[i]?.id);

      dispatch(
        setSelectedSlots({
          indexes: restoredIndexes,
          ids,
        }),
      );
    }
  }, [selectedTime, allSlots, requiredSlots, selectedSlotIndexes]);

  useEffect(() => {
    if (!allSlots.length || requiredSlots === 0) return;

    let found = false;

    for (let i = 0; i <= allSlots.length - requiredSlots; i++) {
      const group = allSlots.slice(i, i + requiredSlots);

      const isValid = group.every(
        (slot) => !slot.isBooked && slot.status === "AVAILABLE",
      );

      if (isValid) {
        handleSlotSelect(i);
        found = true;
        break;
      }
    }

    if (!found) {
      dispatch(setSelectedTime(null));

      dispatch(
        setSelectedSlots({
          indexes: [],
          ids: [],
        }),
      );
    }
  }, [allSlots, requiredSlots]);

  useEffect(() => {
    const updateCount = (): void => {
      const width = window.innerWidth;

      if (width < 1024) {
        setVisibleCount(5);
      } else if (width < 1280) {
        setVisibleCount(7);
      } else {
        setVisibleCount(11);
      }
    };

    updateCount();

    window.addEventListener("resize", updateCount);

    return () => window.removeEventListener("resize", updateCount);
  }, []);

  const amSlots = slots?.morning || [];
  const pmSlots = slots?.afternoon || [];
  const evSlots = slots?.evening || [];

  const hasAvailable = (slotsArr: Slot[]): boolean =>
    slotsArr.some((s) => !s.isBooked && s.status === "AVAILABLE");

  const getDefaultOpenSection = (): string | null => {
    if (hasAvailable(amSlots)) return "morning";
    if (hasAvailable(pmSlots)) return "afternoon";
    if (hasAvailable(evSlots)) return "evening";

    return null;
  };

  const [openSection, setOpenSection] = useState<string | null>(
    getDefaultOpenSection(),
  );

  const setNextSlotDate = (): void => {
    const tomorrow = DateTime.now().setZone(outletTimeZone).plus({ days: 1 });

    dispatch(
      setSelectedDate({
        day: tomorrow.day,
        month: tomorrow.month,
        year: tomorrow.year,
      }),
    );

    return;
  };

  useEffect(() => {
    const firstSelectedIndex = selectedSlotIndexes[0];

    const selectedSlot = allSlots[firstSelectedIndex];

    if (!selectedSlot) return;

    if (amSlots.some((s) => s.id === selectedSlot.id)) {
      setOpenSection("morning");
    } else if (pmSlots.some((s) => s.id === selectedSlot.id)) {
      setOpenSection("afternoon");
    } else if (evSlots.some((s) => s.id === selectedSlot.id)) {
      setOpenSection("evening");
    }
  }, [selectedSlotIndexes, allSlots, amSlots, pmSlots, evSlots]);

  useEffect(() => {
    const hasAvailable = (slotsArr: Slot[]): boolean =>
      slotsArr?.some((s) => !s.isBooked && s.status === "AVAILABLE");

    const noSlotsAvailable =
      !hasAvailable(amSlots) &&
      !hasAvailable(pmSlots) &&
      !hasAvailable(evSlots);

    if (!loading && noSlotsAvailable) {
      setNextSlotDate();
    }
  }, [loading, amSlots, pmSlots, evSlots]);

  return (
    <MainLayout
      sidebar={
        <OrderSidebar
          buttonText="Fill Details"
          onButtonClick={() => {
            if (!selectedTime || !selectedSlotIndexes.length) {
              toast.warning("Please select a time slot");
              return;
            }

            dispatch(nextStep());
          }}
          showTaxesOnlyIfTime={true}
        />
      }
      renderButton={
        <button
          onClick={() => {
            if (!selectedTime || !selectedSlotIndexes.length) {
              toast.warning("Please select a time slot");
              return;
            }
            dispatch(nextStep());
          }}
          disabled={!selectedTime || !selectedSlotIndexes.length}
          className="cta-btn p-3! px-8.5! text-sm relative rounded-full bg-ink text-white hover:text-white border-none font-dm font-bold tracking-[1.5px] uppercase cursor-pointer transition-all duration-200 disabled:bg-[#ccc] disabled:cursor-not-allowed"
        >
          <span>Fill Details</span>
        </button>
      }
    >
      <Breadcrumb />

      <div className="mt-5 flex items-center justify-between mb-3">
        <h1 className="font-bebas text-xl md:text-2xl lg:text-4xl tracking-[1px] leading-none">
          Choose a Time
        </h1>
      </div>

      <div className="mt-2 mb-6 flex flex-row flex-wrap">
        <div className="flex items-stretch gap-1.5 overflow-x-auto scrollbar-none">

          <DateNavBtn onClick={() => handleShift(-1)}>
            <ChevronLeft size={20} />
          </DateNavBtn>

          {dates.slice(stripStart, stripStart + visibleCount).map((d) => {
            const dt = DateTime.fromISO(d.fullDate || "");
            const dow = dt.weekday % 7;
            const today = DateTime.now().setZone(outletTimeZone).startOf("day");
            const isToday = dt.hasSame(today, "day");
            const isSelected =
              selectedDate?.day === d.day &&
              selectedDate?.month === d.month &&
              selectedDate?.year === d.year;

            return (
              <div
                key={`${d.day}-${d.month}-${d.year}`}
                onClick={() => handlePickDate(d)}
                className={[
                  "shrink-0 flex flex-col items-center px-3 py-2 rounded-sm cursor-pointer",
                  "transition-all duration-150 min-w-12.5 select-none",
                  isSelected ? "bg-red text-white" : "hover:bg-red/10",
                ].join(" ")}
              >
                <span className="text-[10px] uppercase mb-1">
                  {WEEK_DAYS[dow]}
                </span>

                <span className="font-mono text-lg">{d.day}</span>

                {isToday && !isSelected && (
                  <span className="text-[8px] text-red mt-1 font-bold">
                    TODAY
                  </span>
                )}
              </div>
            );
          })}

          <DateNavBtn onClick={() => handleShift(1)}>
            <ChevronRight size={20} />
          </DateNavBtn>
        </div>

        <button
          onClick={() => setCalOpen(true)}
          className="ml-4 p-2 text-sm gap-1.5 font-semibold max-md:text-xs flex flex-col items-center justify-center rounded-sm cursor-pointer transition-all duration-150 min-w-12.5 select-none bg-red text-white!"
        >
          <Calendar1 size={16} />
          {selectedDate?.month != null
            ? `${MONTH_NAMES[selectedDate.month - 1]} ${selectedDate.year}`
            : `${MONTH_NAMES[startDate.month - 1]} ${startDate.year}`}
        </button>
      </div>

      <div className="h-px bg-border mb-5" />

      <div className="flex items-center gap-3 mb-5 p-3 bg-surface rounded-sm border border-border flex-wrap">
        {selectedProfessional?.imageUrl ? (
          <img
            src={selectedProfessional.imageUrl}
            alt={selectedProfessional.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center"
            style={{
              background: selectedProfessional?.color || "#111",
            }}
          >
            {getUserName(selectedProfessional?.name)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{selectedProfessional?.name}</p>

          <p className="text-xs text-muted truncate">
            {selectedStaffServices.map((s: any) => s.name).join(", ")} ·{" "}
            {totalDuration} mins
          </p>
        </div>
      </div>

      <div
        className="overflow-y-auto scrollbar-none pb-20 lg:pb-4"
        style={{ height: `${height - 370}px` }}
      >
        {loading ? (
          <div className="flex items-center justify-center w-full h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-red border-t-transparent"></div>
          </div>
        ) : (
          <>
            <SlotSection
              label="Morning"
              icon={<Sunrise size={18} className="text-orange-400" />}
              slots={amSlots}
              allSlots={allSlots}
              selectedSlotIndexes={selectedSlotIndexes}
              handleSlotSelect={handleSlotSelect}
              isOpen={openSection === "morning"}
              onToggle={() =>
                setOpenSection(openSection === "morning" ? null : "morning")
              }
            />

            <SlotSection
              label="Afternoon"
              icon={<Sun size={18} className="text-orange-400" />}
              slots={pmSlots}
              allSlots={allSlots}
              selectedSlotIndexes={selectedSlotIndexes}
              handleSlotSelect={handleSlotSelect}
              isOpen={openSection === "afternoon"}
              onToggle={() =>
                setOpenSection(openSection === "afternoon" ? null : "afternoon")
              }
            />

            <SlotSection
              label="Evening"
              icon={<Moon size={18} className="text-orange-400" />}
              slots={evSlots}
              allSlots={allSlots}
              selectedSlotIndexes={selectedSlotIndexes}
              handleSlotSelect={handleSlotSelect}
              isOpen={openSection === "evening"}
              onToggle={() =>
                setOpenSection(openSection === "evening" ? null : "evening")
              }
            />
          </>
        )}

        <CalendarOverlay isOpen={calOpen} onClose={() => setCalOpen(false)} />
      </div>
    </MainLayout>
  );
}

interface DateNavBtnProps {
  onClick: () => void;
  children: React.ReactNode;
}

function DateNavBtn({ onClick, children }: DateNavBtnProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      className="shrink-0 w-8.5 bg-surface border p-2 border-border rounded-sm cursor-pointer text-sm text-muted flex items-center justify-center self-stretch transition-all duration-150 hover:border-red hover:text-red hover:bg-[rgba(215,38,61,0.12)]"
    >
      {children}
    </button>
  );
}

interface SlotSectionProps {
  icon: React.ReactNode;
  label: string;
  slots: SlotItem[];
  allSlots: SlotItem[];
  selectedSlotIndexes: number[];
  handleSlotSelect: (index: number) => void;
  isOpen: boolean;
  onToggle: () => void;
}

function SlotSection({
  icon,
  label,
  slots,
  allSlots,
  selectedSlotIndexes,
  handleSlotSelect,
  isOpen,
  onToggle,
}: SlotSectionProps): JSX.Element | null {
  if (!slots || slots?.length === 0) return null;
  return (
    <div className="mb-4 border border-border rounded-sm overflow-hidden">
      <div
        onClick={onToggle}
        className="flex items-center justify-between px-4 py-3 cursor-pointer bg-surface hover:bg-[rgba(215,38,61,0.08)] transition"
      >
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[1.2px] text-black/80">
          <span>{icon}</span> {label}
        </div>
        <span
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""
            }`}
        >
          <ChevronDown />
        </span>
      </div>
      {isOpen && (
        <div className="p-3 border-t border-border bg-white">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2">
            {slots.map((slot: SlotItem) => {
              const globalIndex = allSlots.findIndex((s: SlotItem) => s.id === slot.id);
              const isSelected = selectedSlotIndexes.includes(globalIndex);
              const isDisabled = slot.isBooked || slot.status !== "AVAILABLE";
              return (
                <div
                  key={slot.id}
                  onClick={() => {
                    if (!isDisabled) handleSlotSelect(globalIndex);
                  }}
                  className={[
                    "pro-card flex flex-col items-center justify-center",
                    "p-3 border border-border rounded-sm gap-1 transition-all",
                    isDisabled
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : isSelected
                        ? "bg-[#fff8f8] text-red border-red"
                        : "bg-white hover:text-red hover:border-red cursor-pointer",
                  ].join(" ")}
                >
                  <span className="font-mono text-sm">{slot.start_time}</span>
                  <span className="text-[10px]">
                    {isDisabled ? "Booked" : "Available"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
