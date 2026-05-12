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
  currency: "",
};

const outletSlice = createSlice({
  name: "outletDetails",
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

export const { clearBooking, setOutletData } = outletSlice.actions;
export default outletSlice.reducer;