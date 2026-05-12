import { createSlice } from "@reduxjs/toolkit";
import { Step, BreadcrumbState } from "@/types";
import { getState } from "@/store";

const getStepsOrder = (): Step[] => {
    const state = getState();
    const isService = state.outletDetails.isService;

    if (isService) {
        return ["services", "professionals", "time", "details", "confirm", "success"];
    }
    return ["professionals", "services", "time", "details", "confirm", "success",];
};

export const initialState: BreadcrumbState = {
    currentStep: "services",
    completedSteps: ["services"],
};

const breadcrumbsSlice = createSlice({
    name: "breadcrumbs",
    initialState,
    reducers: {
        goToStep: (state, action) => {
            const steps = getStepsOrder();
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
            const steps = getStepsOrder();
            const currentIndex = steps.indexOf(state.currentStep as Step);
            const next = steps[currentIndex + 1] as Step | undefined;

            if (next) {
                if (!state.completedSteps.includes(state.currentStep as Step)) {
                    state.completedSteps.push(state.currentStep as Step);
                }
                state.currentStep = next;
            }
        },
        prevStep: (state) => {
            const steps = getStepsOrder();
            const currentIndex = steps.indexOf(state.currentStep as Step);
            const prev = steps[currentIndex - 1] as Step | undefined;
            if (prev) {
                state.currentStep = prev;
            }
        },
        clearSteps: (state) => {
            state.currentStep = "services";
            state.completedSteps = ["services"];
        },
    },
});

export const {
    goToStep,
    completeStep,
    nextStep,
    prevStep,
    clearSteps,
} = breadcrumbsSlice.actions;


export default breadcrumbsSlice.reducer;