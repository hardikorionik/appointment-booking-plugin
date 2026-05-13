import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    outlets: [],
};

const outletListSlice = createSlice({
    name: "outletList",
    initialState,
    reducers: {
        setOutletList: (state, action) => {
            state.outlets = action.payload;
        },

        clearOutletList: (state) => {
            state.outlets = [];
        },
    },
});

export const {
    setOutletList,
    clearOutletList,
} = outletListSlice.actions;

export default outletListSlice.reducer;