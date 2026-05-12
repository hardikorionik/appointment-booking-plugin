import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { DateTime } from "luxon";
import { BookingPluginProps, Outlet, RootState } from "@/types";
import { fetchAllCategoriesAndStaffService } from "@/services";
import { setOutletData } from "@/slices/outletSlice";
import { setServicePayload } from "@/slices/serviceSlice";
import { setIsOrder, goToStep } from "@/slices/breadcrumbSlice";
import { applyTheme } from "@/utils/applyTheme";
import ChooseYourOutlet from "@/components/common/ChooseYourOutlet";
import DefaultAppointment from "@/components/steps";

export const BookingPlugin: React.FC<BookingPluginProps> = ({ bookingCode }: { bookingCode: string }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [outlets, setOutlets] = useState<any[]>([]);
    const [selectedOutlet, setSelectedOutlet] = useState<any>(null);
    const { id } = useSelector((state: RootState) => state.outletDetails);

    // Initial API
    const fetchInitialData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetchAllCategoriesAndStaffService(bookingCode);
            if (response?.success) {
                const outletList =
                    response?.data?.data?.outlets || [];
                setOutlets(outletList);
                applyTheme(response?.data?.result);
                if (outletList.length === 1) {
                    handleOutletSelection(outletList[0]);
                }
            } else {
                setError(response?.message || "Failed to fetch data");
            }
        } catch (err: any) {
            console.error(err);
            setError(err?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }, [bookingCode]);

    const fetchOutletData = async (
        tenantId?: string,
        outletId?: string
    ) => {
        try {
            setLoading(true);
            const response = await fetchAllCategoriesAndStaffService(bookingCode, tenantId, outletId);
            if (!response?.success) {
                setError(response?.message || "Failed to fetch outlet data");
            }
            dispatch(setIsOrder(response?.data?.data?.outlets[0]?.isService))
            dispatch(
                setServicePayload({
                    standaloneCategories: response?.data?.data?.standaloneCategories,
                    superCategories: response?.data?.data?.superCategories,
                    staff: response?.data?.data?.staff,
                })
            );
        } catch (err: any) {
            console.error(err);
            setError(err?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleOutletSelection = async (data: Outlet) => {
        if (!data) return;
        await fetchOutletData(data?.tenantId, String(data?.id));
        const updatedOutlet = {
            ...data,
            outletTimeZoneDate: DateTime.now()
                .setZone(data?.timeZone)
                .toFormat("yyyy-MM-dd"),
            outletTimeZoneYear: DateTime.fromISO(
                data?.createdAt,
                { zone: "utc" }
            )
                .setZone(data?.timeZone)
                .year,
        };
        setSelectedOutlet(updatedOutlet?.id);
        dispatch(setOutletData(updatedOutlet));
        dispatch(
            goToStep(
                data?.isService
                    ? "services"
                    : "professionals"
            )
        );
    };

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    if (loading) { return <div className="p-4">Loading...</div> }

    if (error) {
        return (<div className="p-4 text-red-500">{error}</div>);
    }

    return (
        <>
            {outlets.length > 1 && !selectedOutlet && !id ? (
                <ChooseYourOutlet
                    outlets={outlets}
                    onSelectOutlet={(data: Outlet) => {
                        if (!data?.id) return;
                        handleOutletSelection(data)
                    }}
                />
            ) : (
                <DefaultAppointment />
            )}
        </>
    );
};