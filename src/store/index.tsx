import { configureStore, combineReducers, UnknownAction } from "@reduxjs/toolkit";
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
    PersistConfig,
} from "redux-persist";
// import storage from "redux-persist/lib/storage";
import createWebStorage from "redux-persist/es/storage/createWebStorage";
import breadcrumbs from "@/slices/breadcrumbSlice";
import outletDetails from "@/slices/outletSlice";
import service from "@/slices/serviceSlice";
import slots from "@/slices/slotSlice";
import theme from "@/slices/themeSlice";
import appointment from "@/slices/appointmentSlice";
import outletList from "@/slices/outletListSlice";

const appReducer = combineReducers({
    booking: combineReducers({
        breadcrumbs,
        outletDetails,
        service,
        slots,
        appointment,
        outletList,
        theme
    })
});

export type RootState = ReturnType<typeof appReducer>;

const rootReducer = (
    state: RootState | undefined,
    action: UnknownAction
): RootState => {
    if (action.type === "RESET_ALL") {
        state = undefined;
    }
    return appReducer(state, action);
};

const createNoopStorage = () => {
    return {
        getItem() {
            return Promise.resolve(null);
        },
        setItem(_key: string, value: string) {
            return Promise.resolve(value);
        },
        removeItem() {
            return Promise.resolve();
        },
    };
};

const storage =
    typeof window !== "undefined"
        ? createWebStorage("session")
        : createNoopStorage();

const persistConfig: PersistConfig<RootState> = {
    key: "booking",
    storage,
};

const persistedReducer = persistReducer(
    persistConfig,
    rootReducer
);

export const store = configureStore({
    reducer: persistedReducer,
    devTools: process.env.NODE_ENV !== "production",
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    FLUSH,
                    REHYDRATE,
                    PAUSE,
                    PERSIST,
                    PURGE,
                    REGISTER,
                ],
            },
        }),
});

export const persistor = persistStore(store);

export const getState = store.getState;

export type AppStore = typeof store;

export type AppDispatch = typeof store.dispatch;