import {
    useDispatch,
    useSelector,
} from "react-redux";
import {
    ChevronRight,
    CircleCheck,
    ChevronLeft,
} from "lucide-react";
import { goToStep } from "@/slices/breadcrumbSlice";
import { persistor } from "@/store";
import { useWindowSize } from "@/hooks/useWindowSize";
import { StepItem } from "@/types";
import type {
    RootState,
    AppDispatch,
} from "@/store";

const SERVICE_STEPS: StepItem[] = [
    { label: "Service", page: "services" },
    { label: "Professional", page: "professionals" },
    { label: "Time", page: "time" },
    { label: "Details", page: "details" },
    {
        label: (
            <span className="flex items-center gap-1">Done <CircleCheck size={13} /></span>
        ),
        page: "confirm",
    },
];

const STEPS: StepItem[] = [
    { label: "Professional", page: "professionals", },
    { label: "Service", page: "services" },
    { label: "Time", page: "time" },
    { label: "Details", page: "details" },
    {
        label: (
            <span className="flex items-center gap-1">Done <CircleCheck size={13} /></span>
        ),
        page: "confirm",
    },
];


export default function Breadcrumb() {
    const dispatch = useDispatch<AppDispatch>();
    const { width } = useWindowSize();
    const {
        isService,
        currentStep,
        completedSteps,
    } = useSelector(
        (state: RootState) => state.breadcrumbs
    );
    const steps = isService ? SERVICE_STEPS : STEPS;
    const currentIndex = steps.findIndex(
        (s) => s.page === currentStep
    );

    const clearAllData = () => {
        dispatch({ type: "RESET_ALL" });
        persistor.purge();
    };

    const goToPrev = () => {
        if (currentIndex <= 0) return;
        const prevStep =
            steps[currentIndex - 1];
        if (prevStep.page === "services") {
            clearAllData();
        } else {
            dispatch(goToStep(prevStep.page));
        }
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
                <nav className="flex items-center gap-1.5 text-xs overflow-x-auto whitespace-nowrap">
                    {steps.map((step: StepItem, i: number) => {
                        const isActive = currentStep === step.page;
                        const isCompleted = completedSteps?.includes(step.page);
                        const isClickable = isCompleted || i <= currentIndex;
                        return (
                            <span key={step.page} className="flex items-center gap-1">
                                {i > 0 && <ChevronRight size={14} className="text-gray-300" />}
                                <span
                                    onClick={() => {
                                        if (!isClickable) return;
                                        if (step.page === "services") {
                                            clearAllData();
                                        } else {
                                            dispatch(goToStep(step.page));
                                        }
                                    }}
                                    className={["transition-colors duration-150",
                                        isClickable ? "cursor-pointer hover:text-black" : "cursor-not-allowed text-gray-400",
                                        isActive ? "text-red-500 font-semibold" : "",
                                    ].join(" ")}
                                >
                                    {step.label}
                                </span>
                            </span>
                        );
                    })}
                </nav>
            )}
        </>
    );
}