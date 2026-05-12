import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchStaffSlots } from "@/services";
import { GetStaffSlotsArgs, StaffSlotsResponse, SlotsState } from "@/types";

export const getStaffSlots = createAsyncThunk<StaffSlotsResponse, GetStaffSlotsArgs>(
    "slots/getStaffSlots", async ({ tenantId, staffId, date }) => {
        return await fetchStaffSlots(tenantId, staffId, date);
    }
);
const initialState: SlotsState = {
    selectedSlotIndexes: [],
    selectedSlotIds: [],
    selectedDate: null,
    selectedTime: null,
    slots: {
        morning: [],
        afternoon: [],
        evening: [],
    },
    loading: false,
};

const slotSlice = createSlice({
    name: "slots",
    initialState,
    reducers: {
        clearSlots: (state) => {
            state.slots = { morning: [], afternoon: [], evening: [] };
            state.selectedSlotIndexes = [];
            state.selectedSlotIds = [];
            state.selectedDate = null;
            state.selectedTime = null;
        },
        setSelectedSlots: (state, action) => {
            state.selectedSlotIndexes = action.payload.indexes;
            state.selectedSlotIds = action.payload.ids;
        },

        setSelectedDate: (state, action) => {
            state.selectedDate = action.payload;
        },

        setSelectedTime: (state, action) => {
            state.selectedTime = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getStaffSlots.pending, (state) => {
                state.loading = true;
            })
            .addCase(getStaffSlots.fulfilled, (state, action) => {
                state.loading = false;
                state.slots = action.payload?.data?.groups || {
                    morning: [],
                    afternoon: [],
                    evening: [],
                };
            })
            .addCase(getStaffSlots.rejected, (state) => {
                state.loading = false;
            });
    },
});

export const { setSelectedSlots, clearSlots, setSelectedDate, setSelectedTime } = slotSlice.actions;
export default slotSlice.reducer;