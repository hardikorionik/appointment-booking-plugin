import { JSX, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { MoveLeft, Check, ChevronDown, Plus } from "lucide-react";
import { getAppointmentDetail } from "@/services";
import { persistor } from "@/store";
import { CurrencyIcon } from "@/utils";
import type { RootState } from "@/store";
import { AppointmentDetails } from "@/types";

// -------------------- Component --------------------
export default function SuccessPage(): JSX.Element {
    const dispatch = useDispatch();

    const appointmentId = useSelector(
        (state: RootState) => state.booking.appointment.appointmentId,
    );
    const { tenantId } = useSelector((state: RootState) => state.booking.outletDetails)

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
        persistor.purge();
        dispatch({ type: "RESET_ALL" });
    };

    if (loading) {
        return (
            <div className="aaravpos-loading-container">
                <p className="aaravpos-loading-text">Loading appointment details...</p>
            </div>
        );
    }

    if (error || !appointment) {
        return (
            <div className="aaravpos-error-container">
                <p className="aaravpos-error-text">
                    {error || "Appointment not found"}
                </p>
                <button
                    onClick={handleBookAnother}
                    className="aaravpos-book-btn"  >
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
        <div className="arravpos-success-wrapper">
            <div className="arravpos-success-motion">
                <div className="arravpos-success-icon success-pulse">
                    <Check />
                </div>
                <h1 className="arravpos-success-title">
                    You're Booked!
                </h1>
                <p className="arravpos-success-description">
                    Your appointment has been confirmed.
                    <br />
                    A confirmation has been sent to your email.
                </p>
                <div className="arravpos-success-content">
                    <div className="arravpos-success-card">
                        <div className="arravpos-success-row arravpos-success-row-first">
                            <span className="arravpos-label">
                                Outlet Name
                            </span>
                            <span className="arravpos-value">
                                {outlet?.outletName || "-"}
                            </span>
                        </div>
                        <div className="arravpos-success-row">
                            <span className="arravpos-label">
                                Professional
                            </span>
                            <span className="arravpos-value">
                                {staff
                                    ? `${staff?.firstName} ${staff?.lastName}`
                                    : "-"}
                            </span>
                        </div>
                        <div className="arravpos-success-row arravpos-services-header">
                            <span className="arravpos-services-label">
                                Services ({services.length})
                            </span>
                            {services.length > 5 && (
                                <button
                                    onClick={() =>
                                        setShowAllServices((prev) => !prev)
                                    }
                                    className="arravpos-show-btn"
                                >
                                    {showAllServices ? (
                                        "Hide"
                                    ) : (
                                        <span className="arravpos-show-btn-inner">
                                            Show
                                            <ChevronDown size={16} />
                                        </span>
                                    )}
                                </button>
                            )}
                        </div>
                        <div className="arravpos-services-list">
                            {visibleServices?.map((s) => (
                                <div
                                    key={s.id}
                                    className="arravpos-service-row"
                                >
                                    <span className="arravpos-service-name">
                                        {s.serviceName}
                                    </span>

                                    <span className="arravpos-service-price">
                                        <CurrencyIcon size={14} />
                                        {Number(s.price).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                            {!showAllServices && remainingCount > 0 && (
                                <div className="arravpos-more-services">
                                    <Plus size={14} />
                                    {remainingCount} more services
                                </div>
                            )}
                        </div>
                        <div className="arravpos-success-row">
                            <span className="arravpos-label">
                                Date & Time
                            </span>

                            <span className="arravpos-value">
                                {appointment.appointmentDate} at{" "}
                                {appointment.startTime}
                            </span>
                        </div>
                        <div className="arravpos-success-row">
                            <span className="arravpos-label">
                                Tip
                            </span>

                            <span className="arravpos-price">
                                <CurrencyIcon size={14} />
                                {tipAmt.toFixed(2)}
                            </span>
                        </div>
                        <div className="arravpos-success-row">
                            <span className="arravpos-label">
                                Tax
                            </span>

                            <span className="arravpos-price">
                                <CurrencyIcon size={14} />
                                {taxAmt.toFixed(2)}
                            </span>
                        </div>
                        <div className="arravpos-total-row">
                            <span className="arravpos-label">
                                Total Amount
                            </span>

                            <span className="arravpos-total-price">
                                <CurrencyIcon size={14} />
                                {totalWithTax}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleBookAnother}
                        className="arravpos-book-btn"
                    >
                        <MoveLeft />
                        Book Another Appointment
                    </button>
                </div>
            </div>
        </div>
    );
}