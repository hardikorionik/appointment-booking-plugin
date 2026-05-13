import {
    configureStore,
    combineReducers,
    UnknownAction,
} from "@reduxjs/toolkit";
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
import breadcrumbs, {
    initialState,
} from "@/slices/breadcrumbSlice";
import outletDetails from "@/slices/outletSlice";
import service from "@/slices/serviceSlice";
import slots from "@/slices/slotSlice";
import appointment from "@/slices/appointmentSlice";
import createWebStorage from "redux-persist/es/storage/createWebStorage";

const appReducer = combineReducers({
    breadcrumbs,
    outletDetails,
    service,
    slots,
    appointment,
});


export type RootState = ReturnType<typeof appReducer>;

const rootReducer = (
    state: RootState | undefined,
    action: UnknownAction
): RootState => {
    if (action.type === "RESET_ALL") {
        return appReducer(
            {
                outletDetails: undefined as never,
                breadcrumbs: {
                    ...initialState,
                },
                service: undefined as never,
                slots: undefined as never,
                appointment: undefined as never,
            },
            action
        );
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
        ? createWebStorage("local")
        : createNoopStorage();

const persistConfig: PersistConfig<RootState> = {
    key: "root",
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