import { JSX, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { MoveLeft, Check, ChevronDown, Plus } from "lucide-react";
import { getAppointmentDetail } from "@/services";
import { persistor } from "@/store";
import { CurrencyIcon } from "@/utils";
import type { RootState } from "@/store";
import { AppointmentDetails } from "@/types";

// -------------------- Animations --------------------
const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.5, delay: 0.3 },
    },
};
// -------------------- Component --------------------
export default function SuccessPage(): JSX.Element {
    const dispatch = useDispatch();

    const appointmentId = useSelector(
        (state: RootState) => state.appointment.appointmentId,
    );
    const { tenantId } = useSelector((state: RootState) => state.outletDetails)

    const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showAllServices, setShowAllServices] = useState<boolean>(false);

    useEffect(() => {
        if (!appointmentId) {
            setError("No appointment ID provided");
            setLoading(false);
            return;
        }

        const fetchAppointment = async (): Promise<void> => {
            try {
                const response = await getAppointmentDetail(appointmentId, tenantId);

                if (response.success) {
                    setAppointment(response?.data?.appointment as AppointmentDetails);
                } else {
                    setError("Failed to load appointment details");
                }
            } catch (err) {
                console.error(err);
                setError("An error occurred while fetching appointment details");
            } finally {
                setLoading(false);
            }
        };

        fetchAppointment();
    }, [appointmentId]);

    const handleBookAnother = (): void => {
        dispatch({ type: "RESET_ALL" });
        persistor.purge();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100dvh-56px)]">
                <p>Loading appointment details...</p>
            </div>
        );
    }

    if (error || !appointment) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-56px)]">
                <p className="text-red-600 mb-4">
                    {error || "Appointment not found"}
                </p>

                <button
                    onClick={handleBookAnother}
                    className="px-7 py-3 bg-btn-bg text-btn-text border-btn-bg hover:text-btn-bg-hover hover:border-btn-bg-hover hover:bg-btn-bg-hover text-base cursor-pointer uppercase tracking-wide rounded-sm flex flex-row items-center gap-2"
                >
                    <MoveLeft />
                    Book Another Appointment
                </button>
            </div>
        );
    }

    const { staff, outlet, services } = appointment;

    const totalBasePrice: number = services?.reduce(
        (acc: number, s: any) => acc + Number(s.price || 0),
        0,
    );

    const tipAmt: number = (appointment.tipsCents || 0) / 100;
    const taxAmt = (appointment.taxCents || 0) / 100;
    const totalAmt = (appointment.totalCents || 0) / 100;

    const totalWithTax =
        totalAmt > 0
            ? totalAmt.toFixed(2)
            : (totalBasePrice + tipAmt + taxAmt).toFixed(2);

    const visibleServices = showAllServices
        ? services
        : services.slice(0, 5);

    const remainingCount = services.length - 5;

    return (
        <div className="h-[calc(100dvh-5px)] max-md:h-[calc(100dvh-5px)] overflow-y-auto scrollbar-none">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="flex flex-col h-full items-center justify-center bg-canvas text-center lg:p-12 p-4"
            >
                <div className="w-16 h-16 bg-bg text-white rounded-full shrink-0 flex items-center justify-center text-4xl mb-6 success-pulse">
                    <Check />
                </div>

                <h1 className="font-bebas text-xl md:text-2xl lg:text-4xl mb-2">
                    You're Booked!
                </h1>

                <p className="text-sm text-muted mb-6 leading-normal">
                    Your appointment has been confirmed.
                    <br />
                    A confirmation has been sent to your email.
                </p>

                <div className="w-full max-w-142.5">
                    <div className="bg-white rounded-md text-left mb-6 p-4 shadow-sm">
                        <div className="flex justify-between py-2 pt-0 border-b border-gray-100">
                            <span className="text-gray-600 text-sm font-bold">
                                Outlet Name
                            </span>

                            <span className="text-sm font-medium text-gray-800">
                                {outlet?.outletName || "-"}
                            </span>
                        </div>

                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600 text-sm font-bold">
                                Professional
                            </span>

                            <span className="text-sm font-medium text-gray-800">
                                {staff
                                    ? `${staff?.firstName} ${staff?.lastName}`
                                    : "-"}
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-gray-100">
                            <span className="text-gray-500 text-sm font-bold">
                                Services ({services.length})
                            </span>

                            {services.length > 5 && (
                                <button
                                    onClick={() =>
                                        setShowAllServices((prev) => !prev)
                                    }
                                    className="text-blue-600 text-xs font-medium cursor-pointer"
                                >
                                    {showAllServices ? (
                                        "Hide"
                                    ) : (
                                        <span className="flex flex-row items-center gap-1">
                                            Show
                                            <ChevronDown size={16} />
                                        </span>
                                    )}
                                </button>
                            )}
                        </div>

                        <div className="py-2 border-b border-gray-100 text-gray-600 text-sm whitespace-pre-wrap overflow-y-auto max-h-[23vh] font-bold">
                            {visibleServices?.map((s: any) => (
                                <div
                                    key={s.id}
                                    className="flex justify-between text-sm py-1.5"
                                >
                                    <span className="text-gray-700">
                                        {s.name}
                                    </span>
                                    <span className="text-gray-900 flex flex-row items-center">
                                        <CurrencyIcon size={14} />
                                        {Number(s.price).toFixed(2)}
                                    </span>
                                </div>
                            ))}

                            {!showAllServices && remainingCount > 0 && (
                                <div className="text-center text-xs text-gray-500 mt-2 flex flex-row items-center justify-center gap-1">
                                    <Plus size={14} />
                                    {remainingCount} more services
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600 text-sm font-bold">
                                Date & Time
                            </span>

                            <span className="text-sm font-medium text-gray-800">
                                {appointment.appointmentDate} at{" "}
                                {appointment.startTime}
                            </span>
                        </div>

                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600 text-sm font-bold">
                                Tip
                            </span>

                            <span className="text-gray-800 font-semibold flex flex-row items-center">
                                <CurrencyIcon size={14} />
                                {tipAmt.toFixed(2)}
                            </span>
                        </div>

                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600 text-sm font-bold">
                                Tax
                            </span>

                            <span className="text-gray-800 font-semibold flex flex-row items-center">
                                <CurrencyIcon size={14} />
                                {taxAmt.toFixed(2)}
                            </span>
                        </div>

                        <div className="flex justify-between py-4 pb-0">
                            <span className="text-gray-600 text-sm font-bold">
                                Total Amount
                            </span>

                            <span className="text-red font-semibold flex flex-row items-center">
                                <CurrencyIcon size={14} />
                                {totalWithTax}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleBookAnother}
                        className="bg-btn-bg text-btn-text border-btn-bg hover:text-btn-text-hover hover:border-btn-bg-hover hover:bg-btn-bg-hover px-7 py-2.5 cursor-pointer md:text-base text-sm w-full flex flex-row items-center justify-center gap-2 uppercase tracking-wide rounded-sm transition"
                    >
                        <MoveLeft />
                        Book Another Appointment
                    </button>
                </div>
            </motion.div>
        </div>
    );
}