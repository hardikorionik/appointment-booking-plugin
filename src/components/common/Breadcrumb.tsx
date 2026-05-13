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
  { label: "Professional", page: "professionals" },
  { label: "Service", page: "services" },
  { label: "Time", page: "time" },
  { label: "Details", page: "details" },
  {
    label: (
      <span className="flex items-center gap-1">
        Done <CircleCheck size={13} />
      </span>
    ),
    page: "confirm",
  },
];

export default function Breadcrumb() {
  const dispatch = useDispatch<AppDispatch>();
  const { width } = useWindowSize();
  const { isService } = useSelector((state: RootState) => state.outletDetails);

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
    if (currentIndex <= 0) return;
    const prevStep = steps[currentIndex - 1];
    // if (prevStep.page === "services") {
    clearAllData();
    // } else {
    //   dispatch(goToStep(prevStep.page));
    // }
  };

  const currentStepData = steps[currentIndex];

  const isMobile = width < 480;

  return (
    <>
      {isMobile ? (
        <div className="flex items-center flex-row gap-4 font-semibold">
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="flex items-center text-xl disabled:text-gray-200 mr-2 cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="flex flex-row items-center text-base">
            {currentStepData?.label}
          </span>
        </div>
      ) : (
        <nav className="hidden md:grid grid-cols-5 w-full overflow-hidden">
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
                    ? "border-red-500 text-black bg-red-50/40"
                    : "border-transparent text-black/60 hover:text-black",
                ].join(" ")}
              >
                <span
                  className={`${isActive ? "text-red-500" : "text-red-400"}`}
                >
                  {step.icon}
                </span>

                <span>{step.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </>
  );
}
