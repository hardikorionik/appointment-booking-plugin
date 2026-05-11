import { createSlice } from "@reduxjs/toolkit";
import { InitBookingState } from "@/types";

const initialState: InitBookingState = {
  outletData: null
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    clearBooking: (state) => {
      state.outletData = null;
    },
    setOutletData: (state, action) => {
      state.outletData = action.payload;
    },
  },
});


export const { clearBooking, setOutletData } = bookingSlice.actions;
export default bookingSlice.reducer;
