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
  const { isService } = useSelector((state: RootState) => state.booking.outletDetails);
  const outlets = useSelector((state: RootState) => state.booking.outletList.outlets);
  const { currentStep, completedSteps } = useSelector(
    (state: RootState) => state.booking.breadcrumbs,
  );
  const steps = isService ? SERVICE_STEPS : STEPS;
  const currentIndex = steps.findIndex((s) => s.page === currentStep);

  const clearAllData = () => {
    persistor.purge();
    dispatch({ type: "RESET_ALL" });
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

  const isMobile = width < 991;

  return (
    <>
      {isMobile ? (
        <div className="aaravpos-mobile-stepper">
          <button
            onClick={goToPrev}
            disabled={false}
            className="aaravpos-mobile-back-btn"
          >
            <ChevronLeft size={22} />
          </button>
          <span className="aaravpos-mobile-step-label">
            {currentStepData?.label}
          </span>
        </div>
      ) : (
        <div className="aaravpos-desktop-stepper">
          {outlets.length > 1 && <button
            onClick={goToPrev}
            className="aaravpos-desktop-back-btn"
          >
            <ChevronLeft size={20} />
          </button>}
          <nav className="aaravpos-step-nav">
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
                  className={`aaravpos-step-btn
                    ${isClickable ? "clickable" : "disabled"}
                    ${isActive ? "active" : "inactive"}
                  `}
                >
                  <span
                    className={`aaravpos-step-icon ${isActive ? "active" : "inactive"
                      }`}
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
