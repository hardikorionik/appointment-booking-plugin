import React, { useEffect, useState } from "react";
import { BookingPluginProps } from "@/types";
import { fetchAllCategoriesAndStaffService } from "@/services";
import ChooseYourOutlet from "@/components/common/ChooseYourOutlet";
import { applyTheme } from "@/utils/applyTheme";
import DefaultAppointment from "./steps";

export const BookingPlugin: React.FC<BookingPluginProps> = ({ bookingCode }: { bookingCode: string }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [outlets, setOutlets] = useState<any[]>([]);
    const [selectedOutlet, setSelectedOutlet] = useState<any>(null);

    const handleSelectOutlet = (outlet: string | null) => {
        setSelectedOutlet(outlet);
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetchAllCategoriesAndStaffService(bookingCode);
            if (response?.success) {
                const outletList = response?.data?.data?.outlets || [];
                setOutlets(outletList);
                if (outletList?.length === 1) {
                    handleSelectOutlet(outletList[0]);
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

    if (loading) {
        return <div className="p-4">Loading...</div>;
    }

    if (error) {
        return (
            <div className="p-4 text-red-500">{error}</div>
        );
    }

    return (
        <>
            {outlets.length > 1 && !selectedOutlet ? (
                <ChooseYourOutlet
                    outlets={outlets}
                    onSelectOutlet={setSelectedOutlet}
                />
            ) : (
                <DefaultAppointment outletDetails={outlets[0] || selectedOutlet} />
            )}
        </>
    );
};