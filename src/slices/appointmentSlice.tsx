import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
} from "@reduxjs/toolkit";
import { AppointmentSliceState, AppointmentResponse, AppointmentPayload, BookingMode, UserDetails } from "@/types";
import { createAppointmentApi, } from "@/services";

export const createAppointment = createAsyncThunk<
  AppointmentResponse,
  AppointmentPayload,
  { rejectValue: string }
>(
  "appointment/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await createAppointmentApi(payload);
      return res as AppointmentResponse;
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        err?.error ||
        err?.data?.message ||
        err?.response?.data?.message ||
        "Failed to create appointment";
      return rejectWithValue(errorMessage);
    }
  }
);


// export const createCheckin = createAsyncThunk<
//   AppointmentResponse,
//   AppointmentPayload,
//   { rejectValue: string }
// >(
//   "checkin/create",
//   async (payload, { rejectWithValue }) => {
//     try {
//       const res = await createCheckinApi(payload);
//       return res as AppointmentResponse;
//     } catch (err: any) {
//       return rejectWithValue(
//         err?.message || "Failed to create checkin"
//       );
//     }
//   }
// );


const initialState: AppointmentSliceState = {
  loading: false,
  success: false,
  error: null,
  data: null,
  appointmentId: null,
  customerId: null,
  userDetails: null,
  tipPct: 0,
  bookingMode: "booking",
};

const appointmentSlice = createSlice({
  name: "appointment",
  initialState,
  reducers: {
    resetAppointment: () => initialState,
    setBookingMode: (state, action: PayloadAction<BookingMode>) => {
      state.bookingMode = action.payload;
    },
    setUserDetails: (state, action: PayloadAction<UserDetails>) => {
      state.userDetails = action.payload;
    },
    setTips: (state, action: PayloadAction<number>) => {
      state.tipPct = action.payload;
    },
    setAppointmentId: (state, action: PayloadAction<string>) => {
      state.appointmentId = action.payload;
    },
    clearUserDetails: (state) => {
      state.userDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.data = action.payload;
        const data = action.payload;
        state.appointmentId = data?.id || null;
        state.customerId = data?.customerId || data?.customer?.id || null;
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Appointment failed";
      })
    // .addCase(createCheckin.pending, (state) => {
    //   state.loading = true;
    //   state.error = null;
    // })
    // .addCase(createCheckin.fulfilled, (state, action) => {
    //   state.loading = false;
    //   state.success = true;
    //   state.data = action.payload;
    //   const data = action.payload;
    //   state.appointmentId = data?.id || data?.appointmentId || null;
    //   state.customerId = data?.customerId || state.customerId;
    // })
    // .addCase(createCheckin.rejected, (state, action) => {
    //   state.loading = false;
    //   state.error = action.payload || "Checkin failed";
    // });
  },
});

export const {
  resetAppointment,
  setBookingMode,
  setUserDetails,
  setTips,
  setAppointmentId,
  clearUserDetails,
} = appointmentSlice.actions;

export default appointmentSlice.reducer;