import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
} from "@reduxjs/toolkit";
import { fetchAllCategoriesAndStaffService } from "@/services";
import { FetchServiceResponse, FetchServicePayload, ServiceState, Category, ServiceItem, Staff } from "@/types";


export const fetchServiceData = createAsyncThunk<FetchServiceResponse, FetchServicePayload, { rejectValue: string }>(
  "service/fetchServiceData",
  async ({ tenantId, outletId }, { rejectWithValue }) => {
    try {
      const res = await fetchAllCategoriesAndStaffService(tenantId, outletId);
      return {
        categories: res?.categories ?? [],
        staff: res?.staff ?? [],
      };
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data || err?.message || "Something went wrong"
      );
    }
  }
);


const initialState: ServiceState = {
  categories: [],
  staff: [],
  selectedCategory: null,
  selectedServices: [],
  selectedProfessional: null,
  loading: false,
  error: null,
};

const serviceSlice = createSlice({
  name: "service",
  initialState,
  reducers: {
    setCategory: (state, action: PayloadAction<Category | null>) => {
      state.selectedCategory = action.payload;
    },
    toggleService: (state, action: PayloadAction<Omit<ServiceItem, "qty">>) => {
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
    toggleProfessional: (state, action: PayloadAction<Staff | null>) => {
      state.selectedProfessional = action.payload;
    },
    clearServices: () => initialState,
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchServiceData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchServiceData.fulfilled, (state, action: PayloadAction<FetchServiceResponse>) => {
          state.loading = false;
          state.categories = action.payload.categories;
          state.staff = action.payload.staff;
          if (action.payload.categories.length) {
            state.selectedCategory = null;
          }
        }
      )
      .addCase(fetchServiceData.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to fetch service data";
      });
  },
});

export const {
  setCategory,
  toggleService,
  clearServices,
  incrementService,
  decrementService,
  toggleProfessional,
} = serviceSlice.actions;

export default serviceSlice.reducer;