import { createSlice } from "@reduxjs/toolkit";

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
  token: ""
};

const outletSlice = createSlice({
  name: "outletDetails",
  initialState,
  reducers: {
    clearBooking: () => {
      return initialState;
    },
    setOutletData: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    setOutletToken: (state, action) => {
      state.token = action.payload;
    },
  },
});

export const { clearBooking, setOutletData, setOutletToken } = outletSlice.actions;
export default outletSlice.reducer;