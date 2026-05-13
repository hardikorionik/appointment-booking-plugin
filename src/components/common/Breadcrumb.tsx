import { useDispatch, useSelector } from "react-redux";
import { goToStep } from "@/slices/breadcrumbSlice";
import { persistor } from "@/store";
import { useWindowSize } from "@/hooks/useWindowSize";
import { StepItem } from "@/types";
import type { RootState, AppDispatch } from "@/store";
import {
  CircleCheck,
  ChevronLeft,
  Scissors,
  User,
  Clock3,
  Info,
  CheckCircle2,
} from "lucide-react";
import { clearBooking } from "@/slices/outletSlice";

const SERVICE_STEPS: StepItem[] = [
  {
    label: "Services",
    page: "services",
    icon: <Scissors size={16} />,
  },
  {
    label: "Professional",
    page: "professionals",
    icon: <User size={16} />,
  },
  {
    label: "Time Slot",
    page: "time",
    icon: <Clock3 size={16} />,
  },
  {
    label: "Details",
    page: "details",
    icon: <Info size={16} />,
  },
  {
    label: "Confirmation",
    page: "confirm",
    icon: <CheckCircle2 size={16} />,
  },
];
const STEPS: StepItem[] = [
  {
    label: "Professional",
    page: "professionals",
    icon: <User size={16} />,
  },
  {
    label: "Service",
    page: "services",
    icon: <Scissors size={16} />,
  },
  {
    label: "Time",
    page: "time",
    icon: <Clock3 size={16} />,
  },
  {
    label: "Details",
    page: "details",
    icon: <Info size={16} />,
  },
  {
    label: (
      <span className="flex items-center gap-1">
        Done <CircleCheck size={13} />
      </span>
    ),
    page: "confirm",
    icon: <CheckCircle2 size={16} />,
  },
];

export default function Breadcrumb() {
  const dispatch = useDispatch<AppDispatch>();
  const { width } = useWindowSize();
  const { isService } = useSelector((state: RootState) => state.outletDetails);
  const outlets = useSelector((state: RootState) => state.outletList.outlets);
  const { currentStep, completedSteps } = useSelector(
    (state: RootState) => state.breadcrumbs,
  );
  const steps = isService ? SERVICE_STEPS : STEPS;
  const currentIndex = steps.findIndex((s) => s.page === currentStep);

  const clearAllData = () => {
    dispatch({ type: "RESET_ALL" });
    persistor.purge();
  };

  const goToPrev = () => {
    if (currentIndex === 0 && outlets.length > 1) {
      clearAllData();
      dispatch(clearBooking());
      return;
    }
    if (currentIndex <= 0) return;
    const prevStep = steps[currentIndex - 1];
    dispatch(goToStep(prevStep.page));
  };

  const currentStepData = steps[currentIndex];

  const isMobile = width < 480;

  return (
    <>
      {isMobile ? (
        <div className="flex items-center flex-row gap-4 font-semibold">
          <button
            onClick={goToPrev}
            disabled={false}
            className="flex items-center text-xl disabled:text-gray-200 mr-2 cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="flex flex-row items-center text-base">
            {currentStepData?.label}
          </span>
        </div>
      ) : (
        <div className="hidden md:flex items-center gap-4 w-full">
          <button
            onClick={goToPrev}
            className="flex cursor-pointer items-center justify-center h-10 w-10 rounded-full border border-gray-200 hover:bg-gray-100 transition outline-none!"
          >
            <ChevronLeft size={20} />
          </button>

          <nav className="grid grid-cols-5 w-full overflow-hidden">
            {steps.map((step: any, i: number) => {
              const isActive = currentStep === step.page;
              const isCompleted = completedSteps?.includes(step.page);
              const isClickable = isCompleted || i <= currentIndex;

              return (
                <button
                  key={step.page}
                  onClick={() => {
                    if (!isClickable) return;
                    dispatch(goToStep(step.page));
                  }}
                  className={[
                    "relative h-10 flex items-center justify-center gap-2 uppercase tracking-[1px] text-[11px] font-semibold transition-all border-b-2",
                    isClickable
                      ? "cursor-pointer"
                      : "cursor-not-allowed opacity-40",
                    isActive
                      ? "border-btn-bg text-black bg-btn-bg-hover/5"
                      : "border-transparent text-black/60 hover:text-black",
                  ].join(" ")}
                >
                  <span
                    className={`${isActive ? "text-btn-bg" : "text-btn-bg-hover"}`}
                  >
                    {step.icon}
                  </span>
                  <span>{step.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
