
const token: string = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbnRpdHlJZCI6IjJlNGQ3OGFiLWNjNTItNGU4Mi04NTRhLTZjNmYwMzA4ZDFmMiIsImVudGl0eVR5cGUiOiJzdG9yZSIsImVtYWlsIjoic2hlYXJicmlsbGllbmNlQHZvbW90by5jb20iLCJ0ZW5hbnRJZCI6IjczYTUyY2Y3LTUwMjMtNDJmYi1iMjBmLTUwYWE2YzAzZGM2ZiIsImNsdXN0ZXJJZCI6IjdiNmE5YzhlLTRmNWQtNGEyYS05YjBhLTlhNmY1YzhmNGQyMSIsInJvbGVzIjpbeyJpZCI6IjBhOTQ5ZTVmLTgzYTItNDkxOC04ZjQ2LWEzZmQwNDc5MmI2NyIsIm5hbWUiOiJzdG9yZV9vd25lciJ9XSwiaWF0IjoxNzcxNjc3ODg5LCJleHAiOjE5Mjk0NjU4ODl9._fPXdjH_3ksNrlMTxAQN3ChnWVchXcNaatHsGhvTVTM`;
const BASE_URL =
    "https://prod.aaravpos.com/api/v1";


//  Get Outlet Details 
export const getOutletDetailsById = async (outletId: string) => {
    const res = await fetch(`${BASE_URL}/outlet/${outletId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) {
        throw new Error(
            "Failed to fetch services"
        );
    }
    const reponse = await res.json();

    return reponse;
};

//  Get All Services 
export const fetchAllCategoriesAndStaffService = async (bookingCode: string, tenantId?: string, outletId?: string) => {
    const params =
        new URLSearchParams({
            available_online: "true",
            is_available_online_category:
                "true",
        });
    tenantId && params.append("tenant_id", tenantId);
    outletId && params.append("outlet_id", outletId);
    const url = `${BASE_URL}/integration/service/code/${bookingCode}?${params}`;

    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) {
        throw new Error(
            "Failed to fetch services"
        );
    }
    const reponse = await res.json();
    return reponse;
};

//  Get Staff Slots
export const fetchStaffSlots = async (staffId: string, date: string) => {
    const res = await fetch(`${BASE_URL}/staff/slots/${staffId}?date=${date}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );
    if (!res.ok) {
        throw new Error(
            "Failed to fetch services"
        );
    }
    const reponse = await res.json();

    return reponse;
};

export const createAppointmentApi = async (payload: unknown) => {
    const res = await fetch(`${BASE_URL}/appointment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        throw new Error(
            "Failed to fetch services"
        );
    }
    const reponse = await res.json();

    return reponse;
};

export const createCheckinApi = async (payload: unknown) => {
    const res = await fetch(`${BASE_URL}/appointment/checkin`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        throw new Error(
            "Failed to fetch services"
        );
    }
    const reponse = await res.json();

    return reponse;
};