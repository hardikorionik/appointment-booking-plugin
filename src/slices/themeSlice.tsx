import { createSlice } from "@reduxjs/toolkit";
import { ThemeSettings } from "@/types";

const initialState: ThemeSettings = {
    button: {
        bg: '#d7263d',
        text: '#ffffff',
        bgHover: '#1f2937',
        textHover: '#ffffff',
    },
    colors: {
        bg: '#fafaf8',
        link: '#385b5a',
        text: '#e09898',
        bgHover: '#4c6f6e',
        textHover: '#ffffff',
    },
    isOpenSidebar: false
};

const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        setTheme: (state, action) => {
            state.button = action.payload?.button;
            state.colors = action.payload?.colors;
        },
        setSidebarOpen: (state, action) => {
            state.isOpenSidebar = action.payload
        },
    },
});

export const { setTheme, setSidebarOpen } = themeSlice.actions;

export default themeSlice.reducer;