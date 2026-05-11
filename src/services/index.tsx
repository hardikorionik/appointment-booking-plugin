import { ConsentCheckStatus, ConsentFormResponse, PaymentPayload, Service, SignatureType, SubmitFinalConsentPayload } from "@/types";

const token: string = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbnRpdHlJZCI6IjJlNGQ3OGFiLWNjNTItNGU4Mi04NTRhLTZjNmYwMzA4ZDFmMiIsImVudGl0eVR5cGUiOiJzdG9yZSIsImVtYWlsIjoic2hlYXJicmlsbGllbmNlQHZvbW90by5jb20iLCJ0ZW5hbnRJZCI6IjczYTUyY2Y3LTUwMjMtNDJmYi1iMjBmLTUwYWE2YzAzZGM2ZiIsImNsdXN0ZXJJZCI6IjdiNmE5YzhlLTRmNWQtNGEyYS05YjBhLTlhNmY1YzhmNGQyMSIsInJvbGVzIjpbeyJpZCI6IjBhOTQ5ZTVmLTgzYTItNDkxOC04ZjQ2LWEzZmQwNDc5MmI2NyIsIm5hbWUiOiJzdG9yZV9vd25lciJ9XSwiaWF0IjoxNzcxNjc3ODg5LCJleHAiOjE5Mjk0NjU4ODl9._fPXdjH_3ksNrlMTxAQN3ChnWVchXcNaatHsGhvTVTM`;
const BASE_URL =
    "https://prod.aaravpos.com/api/v1";


//  Get Outlet Details 
export const getOutletDetailsById = async (outletId: string | number) => {
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
export const fetchStaffSlots = async (staffId?: string | number, date?: string) => {
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

// Get Appointment Details by ID
export const getAppointmentDetail = async (
    appointmentId: string,
) => {
    const res = await fetch(
        `${BASE_URL}/appointment/detail/${appointmentId}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        },
    );

    if (!res.ok) {
        throw new Error("Failed to fetch appointment details");
    }

    const response = await res.json();

    return response;
};

// Fetch Customers for Dropdown
export const fetchCustomer = async ({
    search,
}: {
    search: string;
}) => {
    const res = await fetch(
        `${BASE_URL}/customer/drop-down/list?search=${encodeURIComponent(search || "")}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        },
    );

    if (!res.ok) {
        throw new Error("Failed to fetch customers");
    }

    const response = await res.json();

    return response;
};

// Pay Customer Directly
export const payCustomerDirect = async (payload: PaymentPayload) => {
    try {
        const res = await fetch(
            `${BASE_URL}/payment/pay/customer/direct`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            },
        );

        const response = await res.json();

        if (!res.ok) {
            throw response;
        }

        return response;
    } catch (error) {
        throw error;
    }
};

// Finalize Invoice
export const finalizeInvoice = async (orderId: string) => {
    try {
        const res = await fetch(
            `${BASE_URL}/payment/orders/${orderId}/invoicing/finalize`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        const response = await res.json();

        if (!res.ok) {
            throw response;
        }

        return response;
    } catch (error) {
        throw error;
    }
};



/* ─────────────────────────────────────────────────────────────
 * HELPERS
 * ───────────────────────────────────────────────────────────── */

export const getConsentFrequency = (
    svc: Service,
): "EVERY_X_DAYS" | "ONCE_PER_CUSTOMER" | "EVERY_VISIT" => {
    const freq =
        svc?.consent_rule?.frequency ??
        (svc as any)?.consentFrequency ??
        (svc as any)?.frequency ??
        "EVERY_VISIT";

    if (
        freq === "EVERY_X_DAYS" ||
        freq === "ONCE_PER_CUSTOMER" ||
        freq === "EVERY_VISIT"
    ) {
        return freq;
    }

    return "EVERY_VISIT";
};

// ✅ Check if service requires consent
export const isConsentRequiredService = (svc: Service): boolean => {
    const requires = Boolean(
        svc?.requires_consent ?? (svc as any)?.requiresConsent,
    );
    const formId = String(
        svc?.consent_form_id ?? (svc as any)?.consentFormId ?? "",
    ).trim();
    return requires && !!formId;
};

// ✅ Get enforcement type
export const getOnlineBookingRuleMethod = (
    svc: Service,
): SignatureType | null => {
    const rules =
        (svc?.consent_rule as any)?.channelRules ||
        (svc?.consent_rule as any)?.channel_rules ||
        [];
    const rule = Array.isArray(rules)
        ? rules.find(
            (r: any) =>
                String(r?.channel || "").toUpperCase() ===
                "ONLINE_BOOKING",
        )
        : null;
    const raw =
        rule?.method ||
        (svc as any)?.enforcement?.ONLINE_BOOKING ||
        (svc as any)?.enforcement?.online_booking;

    if (
        raw === "DRAW_SIGNATURE" ||
        raw === "TYPED_NAME" ||
        raw === "CHECKBOX_ONLY"
    ) {
        return raw;
    }
    return null;
};

/* ─────────────────────────────────────────────────────────────
 * API
 * ───────────────────────────────────────────────────────────── */

// ✅ Get consent form
export const getConsentFormByFormId = async (
    formId: string | number,
): Promise<ConsentFormResponse> => {
    const res = await fetch(
        `${BASE_URL}/concent/formId/${formId}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        },
    );
    if (!res.ok) {
        throw new Error("Failed to fetch consent form");
    }

    return res.json();
};

// ✅ Check if signature required
export const checkConsentRequirement = async (
    customerId: string | number,
    formId: string | number,
    serviceId: string | number,
): Promise<ConsentCheckStatus> => {
    const res = await fetch(
        `${BASE_URL}/concent/check/${customerId}/${formId}?serviceId=${serviceId}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        },
    );

    if (!res.ok) {
        throw new Error("Failed to check consent requirement");
    }

    return res.json();
};

// ✅ Get client IP
export const getIpAddress = async (): Promise<string> => {
    const res = await fetch("https://api.ipify.org?format=json");

    if (!res.ok) {
        throw new Error("Failed to fetch IP address");
    }

    const data: { ip: string } = await res.json();

    return data.ip;
};

// ✅ Submit final consent
export const submitFinalConsent = async (
    payloadData: SubmitFinalConsentPayload,
) => {
    const {
        tenantId,
        outletId,
        appointmentId,
        customerId,
        serviceId,
        formId,
        staffId,
        signatureType,
        isChecked,
        typedName,
        imageUrl,
    } = payloadData;

    const ip = await getIpAddress();

    const payload: Record<string, unknown> = {
        tenantId,
        appointmentId,
        customerId,
        serviceIds: [serviceId],
        outletId,
        concentFormId: formId,
        signatureType,
        channel: "Online_Web",
        staffId,
        ipAddress: ip,
    };

    if (signatureType === "CHECKBOX_ONLY") {
        payload.isChecked = isChecked ?? true;
    }

    if (typedName) {
        payload.typedName = typedName;
    }

    if (imageUrl) {
        payload.imageUrl = imageUrl;
    }

    const res = await fetch(
        `${BASE_URL}/concent/customer-sign`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        },
    );

    const response = await res.json();

    if (!res.ok) {
        throw response;
    }

    return response;
};