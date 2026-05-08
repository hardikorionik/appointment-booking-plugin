import React, { useEffect, useState } from "react";
import { BookingPluginProps, Category } from "@/types";
import { fetchAllCategoriesAndStaffService } from "@/services";

export const BookingPlugin: React.FC<BookingPluginProps> = ({ tenantId, outletId }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                const data = await fetchAllCategoriesAndStaffService(tenantId, outletId);
                if (data?.success) {
                    console.log("API Response:", data?.categories);
                    setCategories(data?.data?.categories || [] || []);
                } else {
                    setError("Failed to fetch categories");
                }
            } catch (err: any) {
                setError(err?.message || "Failed to fetch categories");
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);


    if (loading) {
        return <div className="p-4">Loading...</div>;
    }

    if (error) {
        return (
            <div className="p-4 text-red-500">
                {error}
            </div>
        );
    }

    console.log("Fetched Categories:", categories);
    return (
        <div className="p-4 border rounded bg-red-400 text-white">
            <h2 className="text-5xl font-bold">
                Booking Plugin
            </h2>
            <div>
                <h3 className="font-semibold mb-2 text-lg">
                    Categories
                </h3>
                {categories.length === 0 ? (
                    <p className="text-white">No categories found</p>
                ) : (
                    categories.map((category) => (
                        <div
                            key={category.id}
                            className="p-2 border-b border-white"
                        >
                            {category.name}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};