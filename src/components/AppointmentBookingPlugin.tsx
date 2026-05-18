import React from "react";
import { BookingPluginProvider } from "@/providers/BookingPluginProvider";
import { BookingPluginContainer } from "./BookingPluginContainer";
import { BookingPluginProps, } from "@/types";


export const AppointmentBookingPlugin: React.FC<BookingPluginProps> = ({
    ...props
}) => {
    return (
        <BookingPluginProvider>
            <BookingPluginContainer {...props} />
        </BookingPluginProvider>
    );
};