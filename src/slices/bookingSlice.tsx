import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { DateTime } from "luxon";
import { getOutletDetailsById } from "@/services";
import { InitBookingArgs, InitBookingPayload, InitBookingState } from "@/types";


export const initBooking = createAsyncThunk<
  InitBookingPayload,
  InitBookingArgs,
  { rejectValue: string }
>(
  "booking/initBooking",
  async ({ outletId }, { rejectWithValue }) => {
    try {
      const outletRes = await getOutletDetailsById(outletId);

      const nowDate = DateTime.now()
        .setZone(outletRes?.data?.timeZone)
        .toFormat("yyyy-MM-dd");

      const outletYear = DateTime.fromISO(
        outletRes?.data?.createdAt,
        { zone: "utc" }
      )
        .setZone(outletRes?.data?.timeZone)
        .year;

      return {
        outletData: outletRes.data,
        outletTimeZoneDate: nowDate,
        outletTimeZoneYear: outletYear,
        outletTimeZone: outletRes?.data?.timeZone,
        token: outletRes?.data?.token || null,
      };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data ||
        error?.message ||
        "Failed to initialize booking"
      );
    }
  }
);

const initialState: InitBookingState = {
  outletData: null,
  token: null,
  loading: false,
  error: null,
  outletId: null,
  outletTimeZoneDate: null,
  outletTimeZoneYear: null,
  outletTimeZone: null,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,

  reducers: {
    clearBooking: (state) => {
      state.outletData = null;
      state.token = null;
      state.loading = false;
      state.error = null;
      state.outletId = null;
      state.outletTimeZoneDate = null;
      state.outletTimeZoneYear = null;
      state.outletTimeZone = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(initBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token || null;
        state.outletData = action.payload.outletData;
        state.outletTimeZoneDate = action.payload.outletTimeZoneDate;
        state.outletTimeZoneYear = action.payload.outletTimeZoneYear;
        state.outletTimeZone = action.payload.outletTimeZone;
        state.outletId = action.meta.arg.outletId;
      })
      .addCase(initBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to initialize booking";
      });
  },
});


export const { clearBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
