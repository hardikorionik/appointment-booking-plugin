import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  id: "",
  outletName: "",
  timeZone: "",
  image: "",
  tenantId: "",
  address: "",
  isOpen: false,
  outletTimeZoneDate: "",
  outletTimeZoneYear: "",
  createdAt: "",
  isService: true,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    clearBooking: () => {
      return initialState;
    },
    setOutletData: (_state, action: PayloadAction<typeof initialState>) => {
      return action.payload;
    },
  },
});

export const { clearBooking, setOutletData } = bookingSlice.actions;
export default bookingSlice.reducer;