import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ServiceState, Category, Staff } from "@/types";

const initialState: ServiceState = {
  superCategories: [],
  staff: [],
  selectedCategory: null,
  selectedServices: [],
  selectedProfessional: null,
};

const serviceSlice = createSlice({
  name: "service",
  initialState,
  reducers: {
    setServicePayload: (
      state,
      action: PayloadAction<{
        superCategories: Category[];
        staff: Staff[];
      }>
    ) => {
      state.superCategories = action.payload.superCategories;
      state.staff = action.payload.staff;
    },
    setCategory: (state, action: PayloadAction<Category | null>) => {
      state.selectedCategory = action.payload;
    },
    toggleService: (state, action) => {
      const existing = state.selectedServices.find(
        (s) => s.id === action.payload.id
      );
      if (existing) {
        if (existing.qty < 5) {
          existing.qty += 1;
        }
      } else {
        state.selectedServices.push({
          ...action.payload,
          qty: 1,
        });
      }
    },
    incrementService: (state, action: PayloadAction<string>) => {
      const item = state.selectedServices.find(
        (s) => s.id === action.payload
      );
      if (item && item.qty < 5) {
        item.qty += 1;
      }
    },
    decrementService: (state, action: PayloadAction<string>) => {
      const item = state.selectedServices.find(
        (s) => s.id === action.payload
      );
      if (item) {
        if (item.qty === 1) {
          state.selectedServices =
            state.selectedServices.filter(
              (s) => s.id !== action.payload
            );
        } else {
          item.qty -= 1;
        }
      }
    },
    toggleProfessional: (state, action) => {
      state.selectedProfessional = action.payload;
    },
    clearSelectedServices: (state) => {
      state.selectedServices = [];
    },
    clearSelectedProfessional: (state) => {
      state.selectedProfessional = null;
    },
    deleteService: (state, action: PayloadAction<string>) => {
      state.selectedServices = state.selectedServices.filter(
        (s) => s.id !== action.payload,
      );
    },
  },
});

export const {
  setServicePayload,
  setCategory,
  toggleService,
  clearSelectedServices,
  clearSelectedProfessional,
  incrementService,
  decrementService,
  toggleProfessional,
  deleteService
} = serviceSlice.actions;

export default serviceSlice.reducer;