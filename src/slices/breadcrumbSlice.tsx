import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Step, BreadcrumbState } from "@/types";


const getStepsOrder = (isService: boolean): Step[] => {
    if (isService) {
        return ["services", "professionals", "time", "details", "confirm", "success"];
    }
    return ["professionals", "services", "time", "details", "confirm", "success",];
};


export const initialState: BreadcrumbState = {
    currentStep: "services",
    completedSteps: ["services"],
    isService: false,
};


const breadcrumbsSlice = createSlice({
    name: "breadcrumbs",
    initialState,
    reducers: {
        goToStep: (state, action) => {
            const steps = getStepsOrder(state.isService);
            const nextStep = action.payload;
            const currentIndex = steps.indexOf(state.currentStep);
            const nextIndex = steps.indexOf(nextStep);
            if (nextIndex <= currentIndex) {
                state.currentStep = nextStep;
                return;
            }
            const prevStep = steps[nextIndex - 1];
            if (state.completedSteps.includes(prevStep)) {
                state.currentStep = nextStep;
            }
        },
        completeStep: (state, action) => {
            const step = action.payload;
            if (!state.completedSteps.includes(step)) {
                state.completedSteps.push(step);
            }
        },
        nextStep: (state) => {
            const steps = getStepsOrder(state.isService);
            const currentIndex = steps.indexOf(state.currentStep);
            const next = steps[currentIndex + 1];
            if (next) {
                if (!state.completedSteps.includes(state.currentStep)) {
                    state.completedSteps.push(state.currentStep);
                }
                state.currentStep = next;
            }
        },
        prevStep: (state) => {
            const steps = getStepsOrder(state.isService);
            const currentIndex = steps.indexOf(state.currentStep);
            const prev = steps[currentIndex - 1];
            if (prev) {
                state.currentStep = prev;
            }
        },
        clearSteps: (state) => {
            state.currentStep = "services";
            state.completedSteps = ["services"];
        },
        setServiceMode: (
            state,
            action: PayloadAction<boolean>
        ) => {
            state.isService = action.payload;
        },
    },
});

export const {
    goToStep,
    completeStep,
    nextStep,
    prevStep,
    clearSteps,
    setServiceMode,
} = breadcrumbsSlice.actions;


export default breadcrumbsSlice.reducer;