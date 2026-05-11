import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { DateTime } from "luxon";
import { BookingPluginProps, Outlet } from "@/types";
import { fetchAllCategoriesAndStaffService } from "@/services";
import { setOutletData } from "@/slices/bookingSlice";
import { goToStep } from "@/slices/breadcrumbSlice";
import ChooseYourOutlet from "@/components/common/ChooseYourOutlet";
import { applyTheme } from "@/utils/applyTheme";
import DefaultAppointment from "@/components/steps";

export const BookingPlugin: React.FC<BookingPluginProps> = ({ bookingCode }: { bookingCode: string }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [outlets, setOutlets] = useState<any[]>([]);
    const [selectedOutlet, setSelectedOutlet] = useState<any>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetchAllCategoriesAndStaffService(bookingCode);
            if (response?.success) {
                const outletList = response?.data?.data?.outlets || [];
                setOutlets(outletList);
                if (outletList?.length === 1) {
                    const outlateObj = outletList[0];
                    const updatedOutlet = {
                        ...outlateObj,
                        outletTimeZoneDate: DateTime.now()
                            .setZone(outlateObj?.timeZone)
                            .toFormat("yyyy-MM-dd"),
                        outletTimeZoneYear: DateTime.fromISO(outlateObj?.createdAt, { zone: "utc" })
                            .setZone(outlateObj?.timeZone)
                            .year,
                    };
                    setSelectedOutlet(updatedOutlet?.id)
                    dispatch(setOutletData(updatedOutlet));
                    dispatch(goToStep(outlateObj?.isService ? "services" : "professionals"));
                }
                applyTheme(response?.data?.result);
            } else {
                setError(response?.message || "Failed to fetch data");
            }
        } catch (err: any) {
            console.error(err);
            setError(err?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) { return <div className="p-4">Loading...</div> }

    if (error) {
        return (<div className="p-4 text-red-500">{error}</div>);
    }

    const handleSetOutletData = (data: Outlet) => {
        if (data) {
            const updatedOutlet = {
                ...data,
                outletTimeZoneDate: DateTime.now()
                    .setZone(data?.timeZone)
                    .toFormat("yyyy-MM-dd"),
                outletTimeZoneYear: DateTime.fromISO(data?.createdAt, { zone: "utc" })
                    .setZone(data?.timeZone)
                    .year,
            };
            setSelectedOutlet(updatedOutlet?.id)
            dispatch(setOutletData(updatedOutlet));
            dispatch(goToStep(data?.isService ? "services" : "professionals"));
        }
    }

    return (
        <>
            {outlets.length > 1 && !selectedOutlet ? (
                <ChooseYourOutlet
                    outlets={outlets}
                    onSelectOutlet={(data: Outlet) => {
                        if (!data?.id) return;
                        handleSetOutletData(data)
                    }}
                />
            ) : (
                <DefaultAppointment />
            )}
        </>
    );
};