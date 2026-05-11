import { useState, useEffect, useMemo, useRef, JSX } from "react";
import { toast } from "react-toastify";
import { DateTime } from "luxon";
import { useSelector, useDispatch } from "react-redux";
import { Check, CalendarDays, CreditCard, Store } from "lucide-react";
import { createAppointment, createCheckin } from "@/slices/appointmentSlice";
import { payCustomerDirect, finalizeInvoice } from "@/services";
import OrderSidebar from "@/components/sidebar/OrderSidebar";
import PaymentModal from "@/components/modals/PaymentModal";
import ConsentModal from "@/components/modals/ConsentModal";
import {
    isConsentRequiredService,
    getOnlineBookingRuleMethod,
    getConsentFrequency,
    checkConsentRequirement,
    submitFinalConsent,
} from "@/services";
import { getUserName } from "@/utils";
import MainLayout from "@/components/common/MainLayout";
import Breadcrumb from "@/components/common/Breadcrumb";
import { nextStep } from "@/slices/breadcrumbSlice";
import { setAppointmentId, setTips } from "@/slices/appointmentSlice";
import "react-toastify/dist/ReactToastify.css";
import { calculateServiceTax } from "@/utils";
import type { RootState } from "@/store";
import { PaymentMeta, PayType, Service, StaffMember, ConsentCheckStatus, EnrichedService, Slot, PaymentPayload, SelectedDateType, ConsentDraftEntry, ConsentDraftMap, CardType, CardData, ConsentModalPayload, SignatureType, AppointmentPayload, CheckinPayload, SubmitFinalConsentPayload } from "@/types";

// ─── Domain Types ───────────────────────────────────────────────────────────
// ─── Constants ───────────────────────────────────────────────────────────────

const MONTH_NAMES: string[] = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const CONSENT_DRAFT_KEY = "consentDraftByService";
const SLOT_INTERVAL = 15;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const expiryToNumber = (exp: string): number => {
    const [mm, yy] = exp.split("/");
    return Number(`${mm}${yy}`);
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function ConfirmPage(): JSX.Element {
    const dispatch = useDispatch();

    const { outletData, outletTimeZoneDate, outletTimeZone } = useSelector(
        (state: RootState) => state.booking,
    );
    const { staff, selectedServices, selectedProfessional } = useSelector(
        (state: RootState) => state.service,
    );
    const { selectedSlotIds, selectedDate, selectedTime } = useSelector(
        (state: RootState) => state.slots,
    );
    const { userDetails, bookingMode, tipPct } = useSelector(
        (state: RootState) => state.appointment,
    );

    const services: Service[] = Array.isArray(selectedServices)
        ? selectedServices
        : [selectedServices];

    const { selectedSlotIndexes, slots } = useSelector(
        (state: RootState) => state.slots,
    );

    const [loading, setLoading] = useState<boolean>(false);
    const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
    const [paymentMeta, setPaymentMeta] = useState<PaymentMeta | null>(null);
    const [payType, setPayType] = useState<PayType>("person");
    const [consentOpen, setConsentOpen] = useState<boolean>(false);
    const [consentHeading, setConsentHeading] = useState<string>("");
    const [consentText, setConsentText] = useState<string>("");
    const [consentEnforcement, setConsentEnforcement] = useState<string | null>(null);
    const [pendingConsentServiceId, setPendingConsentServiceId] = useState<string | null>(null);
    const [consentAcceptedMap, setConsentAcceptedMap] = useState<Record<string, boolean>>({});
    const [consentCheckMap, setConsentCheckMap] = useState<Record<string, ConsentCheckStatus>>({});
    const [checkingConsent, setCheckingConsent] = useState<boolean>(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

    const consentFlowLockRef = useRef<boolean>(false);
    const lastOpenedConsentServiceRef = useRef<string>("");

    const todayDate = DateTime.now().setZone(outletTimeZone ?? "UTC");

    // ─── Enriched services ──────────────────────────────────────────────────────

    const selectedStaffServices: EnrichedService[] = services.map((svc) => {
        const staffMember = staff?.find((s) => s.id === selectedProfessional?.id);
        const assignment = staffMember?.assignments?.find((a) => a.id === svc.id);

        const updatedSvc: Service = {
            ...svc,
            price: assignment?.price ?? svc.price ?? svc.min_price ?? 0,
            duration: assignment?.duration ?? svc.estimated_time ?? svc.min_time ?? 0,
        };
        return {
            ...updatedSvc,
            duration: assignment?.duration ?? svc.estimated_time ?? svc.min_time ?? 0,
            tax: calculateServiceTax(updatedSvc),
            unitTax: calculateServiceTax(updatedSvc, { perUnit: true }),
        };
    });

    // ─── Slot / time helpers ────────────────────────────────────────────────────

    const allSlots: Slot[] = [
        ...(slots?.morning ?? []),
        ...(slots?.afternoon ?? []),
        ...(slots?.evening ?? []),
    ];

    const totalDuration: number = selectedStaffServices.reduce(
        (sum, s) => sum + Number(s.duration ?? 0),
        0,
    );

    const requiredSlots: number = Math.ceil(totalDuration / SLOT_INTERVAL);

    const formatTimeRange = (startIndex: number): string => {
        if (!allSlots.length) return "";
        const start = allSlots[startIndex]?.start_time;
        const endSlot = allSlots[startIndex + requiredSlots - 1];
        if (!start || !endSlot) return "";
        const end = endSlot.end_time ?? endSlot.start_time;
        return `${start} - ${end}`;
    };

    const safeDate: SelectedDateType =
        typeof selectedDate === "object" && selectedDate !== null
            ? selectedDate
            : {
                day: todayDate.day,
                month: todayDate.month,
                year: todayDate.year,
            };

    const selectedStartIndex: number | undefined = selectedSlotIndexes?.[0];

    const timeRange: string | null =
        selectedStartIndex !== undefined ? formatTimeRange(selectedStartIndex) : null;

    const dateStr: string | null = timeRange
        ? `${MONTH_NAMES[safeDate.month]} ${safeDate.day} at ${timeRange}`
        : null;

    // ─── IDs from localStorage ──────────────────────────────────────────────────

    const tenantId: string | null = localStorage.getItem("tenantId");
    const outletId: string | null = localStorage.getItem("outletId");

    // ─── Price calculations ─────────────────────────────────────────────────────

    const totalBasePrice: number = selectedStaffServices.reduce(
        (sum, s) => sum + Number(s.price) * (s.qty ?? 1),
        0,
    );

    const taxAmt: number = selectedStaffServices.reduce((sum, s) => sum + s.tax, 0);
    const taxCents: number = Math.round(taxAmt * 100);
    const tipAmt: number = (totalBasePrice * tipPct) / 100;
    const tipCents: number = Math.round(tipAmt * 100);
    const totalWithTax: number = totalBasePrice + tipAmt + taxAmt;

    // ─── Consent logic ──────────────────────────────────────────────────────────

    const servicesNeedingConsent: Service[] = useMemo(() => {
        return services.filter((s) => {
            if (!isConsentRequiredService(s)) return false;
            const enforcementMode = s?.consent_rule?.enforcementMode ?? s?.enforcementMode;
            if (enforcementMode === "FIXED") return false;
            return true;
        });
    }, [services]);

    const consentServiceIds: string[] = useMemo(() => {
        return servicesNeedingConsent.map((s) => String(s.id)).filter(Boolean);
    }, [servicesNeedingConsent]);

    const pickTemplateFromService = (svc: Service): { heading: string; consent: string } => {
        const tpl = svc?.consent_template ?? svc?.consentTemplate ?? null;
        const heading = String(tpl?.heading ?? "").trim();
        const consent = String(tpl?.consent ?? "").trim();
        return { heading, consent };
    };

    const markConsentDone = (serviceId: string | number): void => {
        setConsentAcceptedMap((prev) => ({ ...prev, [String(serviceId)]: true }));
    };

    useEffect(() => {
        if (userDetails && servicesNeedingConsent?.length > 0) {
            runConsentChecks();
        }
    }, [userDetails, servicesNeedingConsent?.length]);

    const runConsentChecks = async (): Promise<void> => {
        const cid = userDetails?.id;
        if (!cid) return;
        setCheckingConsent(true);
        try {
            const nextMap: Record<string, ConsentCheckStatus> = {};
            for (const svc of servicesNeedingConsent) {
                const serviceId = String(svc.id);
                const formId = String(svc.consent_form_id ?? "");
                if (!serviceId || !formId) continue;
                const freq = getConsentFrequency(svc);
                const mustCheck = freq === "EVERY_X_DAYS" || freq === "ONCE_PER_CUSTOMER";
                if (!mustCheck) {
                    nextMap[serviceId] = { data: { checked: true, needsSignature: true } };
                    continue;
                }
                const res = await checkConsentRequirement(cid, formId, serviceId);
                const needsSignature = Boolean(res?.data?.needsSignature);
                nextMap[serviceId] = { data: { checked: true, needsSignature } };
                if (!needsSignature) markConsentDone(serviceId);
            }
            setConsentCheckMap(nextMap);
        } catch (e) {
            console.error(e);
        } finally {
            setCheckingConsent(false);
        }
    };

    const pendingConsentServices: Service[] = useMemo(() => {
        return servicesNeedingConsent.filter((svc) => {
            const sid = String(svc.id);
            if (consentAcceptedMap[sid]) return false;
            const chk = consentCheckMap[sid];
            if (chk?.data?.checked && chk?.data?.needsSignature === false) return false;
            return true;
        });
    }, [servicesNeedingConsent, consentAcceptedMap, consentCheckMap]);

    const totalConsentCount: number = consentServiceIds.length;
    const doneConsentCount: number = totalConsentCount - pendingConsentServices.length;
    const allConsentsDone: boolean = pendingConsentServices.length === 0;

    const startConsentSigning = async (): Promise<void> => {
        if (consentFlowLockRef.current) return;
        consentFlowLockRef.current = true;
        try {
            if (!userDetails?.firstName) {
                toast.warn("Please enter First Name before signing consent.");
                return;
            }
            if (!userDetails?.email && !userDetails?.phone) {
                toast.warn("Please enter Email or Mobile Number before signing consent.");
                return;
            }
            const svc = pendingConsentServices[0];
            if (!svc) {
                await proceedWithBooking();
                return;
            }
            const serviceId = String(svc.id);
            if (lastOpenedConsentServiceRef.current === serviceId && consentOpen) return;
            lastOpenedConsentServiceRef.current = serviceId;

            const formId = String(svc.consent_form_id ?? "");
            if (!formId) {
                toast.error("Consent form missing.");
                return;
            }
            const method = getOnlineBookingRuleMethod(svc);
            if (!method) {
                toast.error("Consent enforcement method not found.");
                return;
            }
            const cid = userDetails?.id;
            const needsCheck = getConsentFrequency(svc) !== "EVERY_VISIT";
            if (needsCheck && cid) {
                const res = await checkConsentRequirement(cid, formId, serviceId);
                const needsSignature = Boolean(res?.data?.needsSignature);
                setConsentCheckMap((prev) => ({
                    ...prev,
                    [serviceId]: { data: { checked: true, needsSignature } },
                }));
                if (!needsSignature) {
                    markConsentDone(serviceId);
                    toast.success("Consent already signed for this service.");
                    setTimeout(() => startConsentSigning(), 250);
                    return;
                }
            } else {
                setConsentCheckMap((prev) => ({
                    ...prev,
                    [serviceId]: { data: { checked: true, needsSignature: true } },
                }));
            }
            const { heading, consent } = pickTemplateFromService(svc);
            if (!heading || !consent) {
                toast.error("Consent template missing.");
                return;
            }
            setConsentHeading(heading);
            setConsentText(consent);
            setConsentEnforcement(method);
            setPendingConsentServiceId(serviceId);
            setConsentOpen(true);
        } catch (e) {
            console.error(e);
            toast.error((e as Error)?.message ?? "Consent check failed");
        } finally {
            consentFlowLockRef.current = false;
        }
    };

    const saveConsentDraft = (serviceId: string | number, data: ConsentDraftEntry): void => {
        try {
            const raw = localStorage.getItem(CONSENT_DRAFT_KEY);
            const obj: ConsentDraftMap = raw ? JSON.parse(raw) : {};
            obj[String(serviceId)] = data;
            localStorage.setItem(CONSENT_DRAFT_KEY, JSON.stringify(obj));
        } catch (e) {
            console.error("Failed to save consent draft", e);
        }
    };

    const readConsentDraft = (): ConsentDraftMap => {
        try {
            return JSON.parse(localStorage.getItem(CONSENT_DRAFT_KEY) ?? "{}") as ConsentDraftMap;
        } catch {
            return {};
        }
    };

    const onConsentConfirm = (modalPayload: ConsentModalPayload): void => {
        const sid = String(pendingConsentServiceId);
        if (!sid) return;
        const svc = servicesNeedingConsent.find((x) => String(x.id) === sid);
        if (!svc) return;
        const formId = String(svc.consent_form_id ?? "");
        const enforcement = getOnlineBookingRuleMethod(svc);
        if (!formId || !enforcement) {
            toast.error("Consent form/method missing.");
            return;
        }
        let signatureType: SignatureType = "CHECKBOX_ONLY";
        if (enforcement === "TYPED_NAME") signatureType = "TYPED_NAME";
        else if (enforcement === "DRAW_SIGNATURE") signatureType = "SIGNATURE_IMAGE";

        saveConsentDraft(sid, {
            serviceId: sid,
            concentFormId: formId,
            signatureType,
            typedName: modalPayload?.typedName,
            isChecked: modalPayload?.accepted,
            signatureDataUrl: modalPayload?.signatureDataUrl,
            emailMe: modalPayload?.emailMe,
        });
        markConsentDone(sid);
        setConsentOpen(false);
        lastOpenedConsentServiceRef.current = "";
        toast.success("Consent captured.");
    };

    const onConsentClose = (): void => {
        setConsentOpen(false);
        setPendingConsentServiceId(null);
    };

    const submitAllConsents = async (
        appointmentId: string | number,
        customerId: string | number,
        staffId: string | number,
    ): Promise<void> => {
        const consentDraft = readConsentDraft();
        const entries = Object.entries(consentDraft)
            .map(([serviceId, cap]) => ({
                serviceId,
                concentFormId: cap.concentFormId,
                captured: cap,
            }))
            .filter((x) => x.serviceId && x.concentFormId);

        for (const item of entries) {
            const { serviceId, concentFormId, captured } = item;
            const signatureType: SignatureType =
                captured.signatureType ||
                (captured.typedName
                    ? "TYPED_NAME"
                    : captured.signatureDataUrl
                        ? "SIGNATURE_IMAGE"
                        : "CHECKBOX_ONLY");

            const submitPayload: SubmitFinalConsentPayload = {
                tenantId,
                outletId,
                appointmentId,
                customerId,
                serviceId,
                formId: concentFormId,
                staffId,
                signatureType,
                typedName: captured.typedName,
                imageUrl: captured.signatureDataUrl,
            };
            if (signatureType === "CHECKBOX_ONLY") {
                submitPayload.isChecked = captured.isChecked ?? true;
            }
            await submitFinalConsent(submitPayload);
        }
        localStorage.removeItem(CONSENT_DRAFT_KEY);
    };

    // ─── Booking payloads ───────────────────────────────────────────────────────

    let formattedDate = "";
    if (selectedDate) {
        formattedDate = `${selectedDate.year}-${String(selectedDate.month + 1).padStart(2, "0")}-${String(selectedDate.day).padStart(2, "0")}`;
    }

    const payload: AppointmentPayload = {
        tenantId,
        outletId,
        staffId: selectedProfessional?.id,
        date: formattedDate,
        startTime: selectedTime,
        serviceIds: services.map((s) => s.id),
        slotIds: selectedSlotIds,
        isWalkIn: false,
        requiresConsent: servicesNeedingConsent.length > 0,
        customer: {
            first_name: userDetails?.firstName,
            last_name: userDetails?.lastName,
            email: userDetails?.email,
            phone: userDetails?.phone,
        },
    };

    const checkinPayload: CheckinPayload = {
        tenantId,
        outletId,
        date: outletTimeZoneDate,
        staffId: selectedProfessional?.id,
        serviceIds: services.map((s) => s.id),
        slotIds: selectedSlotIds,
        startTime: selectedTime,
        customer: {
            first_name: userDetails?.firstName,
            last_name: userDetails?.lastName,
            email: userDetails?.email,
            phone: userDetails?.phone,
        },
    };

    // ─── Booking actions ────────────────────────────────────────────────────────

    const proceedWithBooking = async (): Promise<void> => {
        if (servicesNeedingConsent.length && !allConsentsDone) {
            toast.warn("Please complete all consent forms first");
            return;
        }
        try {
            setLoading(true);
            let result;
            if (bookingMode === "checkin") {
                result = await dispatch(createCheckin(checkinPayload));
            } else {
                result = await dispatch(createAppointment(payload));
            }

            const isSuccess =
                (bookingMode === "checkin" && createCheckin.fulfilled.match(result)) ||
                (bookingMode === "booking" && createAppointment.fulfilled.match(result));

            if (isSuccess) {
                const data = (result as { payload?: { data?: Record<string, unknown> } & Record<string, unknown> }).payload?.data
                    ?? (result as { payload?: Record<string, unknown> }).payload;
                const appointmentId = (data as Record<string, unknown>)?.id ?? (data as Record<string, unknown>)?.appointmentId;
                const customerId = (data as Record<string, unknown>)?.customerId ?? (data as { customer?: { id?: unknown } })?.customer?.id;
                const staffId = (data as Record<string, unknown>)?.staffId ?? selectedProfessional?.id;

                if (bookingMode === "booking" && doneConsentCount > 0) {
                    await submitAllConsents(
                        appointmentId as string | number,
                        customerId as string | number,
                        staffId as string | number,
                    );
                }
                if (payType === "card") {
                    setPaymentMeta({
                        appointmentId: appointmentId as string | number,
                        customerId: customerId as string | number,
                    });
                    setShowPaymentModal(true);
                } else {
                    dispatch(setAppointmentId(String(appointmentId)));
                    dispatch(nextStep("success"));
                }
            }
        } catch (err) {
            toast.error(
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message
                ?? "Something went wrong",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async (): Promise<void> => {
        if (!selectedTime && bookingMode === "booking") return void toast.error("Select time");
        if (!userDetails?.firstName) return void toast.error("Enter first name");
        if (!userDetails?.email && !userDetails?.phone) return void toast.error("Email or phone required");

        if (servicesNeedingConsent.length > 0) {
            if (allConsentsDone) {
                await proceedWithBooking();
            } else {
                await startConsentSigning();
            }
        } else {
            await proceedWithBooking();
        }
    };

    // ─── Payment helpers ────────────────────────────────────────────────────────

    const getCardType = (number: string): CardType => {
        const num = number.replace(/\s/g, "");
        if (/^4/.test(num)) return "VISA";
        if (/^5[1-5]/.test(num)) return "MASTERCARD";
        if (/^3[47]/.test(num)) return "AMEX";
        if (/^6/.test(num)) return "DISCOVER";
        return "UNKNOWN";
    };

    const handlePayment = async (cardData: CardData): Promise<boolean> => {
        try {
            setLoading(true);
            const appointmentId = paymentMeta?.appointmentId;
            const customerId = paymentMeta?.customerId;
            if (!appointmentId || !outletId) {
                toast.error("Something went wrong.");
                return false;
            }
            const detectedCardType = getCardType(cardData.number);
            const paymentPayload: PaymentPayload = {
                appointmentId,
                customerId,
                outletId,
                referenceNo: appointmentId,
                currency: "USD",
                amountCents: Math.round(totalWithTax * 100),
                tipAmountCents: payType === "card" ? tipCents : 0,
                taxAmountCents: payType === "card" ? taxCents : 0,
                transactionBody: {
                    transactionOrigin: 3,
                    transactionCode: "WEB",
                    isDebit: true,
                    processMethod: 3,
                    channelType: 3,
                    tenderInfo: {
                        cardHolderName: cardData.name,
                        cardNumber: cardData.number.replace(/\s/g, ""),
                        cardType: detectedCardType,
                        cardExpiry: expiryToNumber(cardData.expiry),
                        cvData: cardData.cvv,
                    },
                    billingContact: {
                        name: {
                            firstName: userDetails?.firstName ?? "",
                            lastName: userDetails?.lastName ?? "",
                        },
                        email: userDetails?.email ?? "",
                    },
                },
            };

            const resp = await payCustomerDirect(paymentPayload);
            const data = resp?.data?.data ?? resp?.data ?? resp ?? {};
            const orderId = data?.orderId;
            const isSuccess =
                String(data?.mappedStatus).toLowerCase() === "succeeded" ||
                String(data?.reasonMessage).toLowerCase() === "success";

            if (isSuccess) {
                toast.success("Payment successful!");
                if (orderId) {
                    try {
                        await finalizeInvoice(orderId);
                    } catch (err) {
                        toast.warning(
                            err instanceof Error
                                ? err.message
                                : String(err ?? "Payment done, but finalize failed"),
                        );
                    }
                }
            } else {
                toast.warning("Payment pending");
            }
            setShowPaymentModal(false);
            dispatch(setAppointmentId(String(paymentMeta?.appointmentId)));
            dispatch(nextStep("success"));
            return true;
        } catch (err) {
            toast.warning(
                err instanceof Error
                    ? err.message
                    : "Payment failed, but appointment is booked"
            );
            setShowPaymentModal(false);
            dispatch(setAppointmentId(String(paymentMeta?.appointmentId)));
            dispatch(nextStep("success"));
            return true;
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentCancel = (): void => setShowPaymentModal(false);

    const isBookingDisabled = (): boolean => {
        if (!selectedTime) return true;
        if (!userDetails?.firstName) return true;
        if (!userDetails?.email && !userDetails?.phone) return true;
        return false;
    };

    // ─── Render ─────────────────────────────────────────────────────────────────

    return (
        <MainLayout
            isSidebarOpen={isSidebarOpen}
            handleSidebarOpen={() => setIsSidebarOpen((prev) => !prev)}
            sidebar={
                <OrderSidebar
                    buttonText="Book Appointment"
                    onButtonClick={handleBooking}
                    showTip={payType === "card"}
                    tipPct={tipPct}
                    onTipChange={(data: unknown) => dispatch(setTips((data as number) ?? 0))}
                    consentRequired={servicesNeedingConsent?.length > 0}
                    consentCompleted={doneConsentCount}
                    totalConsents={totalConsentCount}
                    checkingConsent={checkingConsent}
                    loading={loading}
                    isBookingDisabled={isBookingDisabled()}
                    handleSidebarOpen={() => setIsSidebarOpen((prev) => !prev)}
                />
            }
            isConfirm={true}
        >
            <>
                <Breadcrumb />
                <div className="mt-5">
                    <h1 className="font-bebas text-xl md:text-2xl lg:text-4xl">
                        Confirm Booking
                    </h1>
                    <p className="text-sm text-black/60 mb-6 max-md:text-xs">
                        Review your appointment details before booking
                    </p>
                    <div className="max-md:max-w-full">
                        <div className="flex gap-3 items-center p-3 bg-surface rounded-sm mb-2">
                            {outletData?.image && (
                                <div className="w-10 h-10 rounded-sm flex items-center justify-center text-white text-xs">
                                    <img
                                        src={outletData?.image ?? "/logo.svg"}
                                        alt="Logo"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div>
                                <p className="font-semibold text-sm">
                                    {outletData?.outletName ?? "-"}
                                </p>
                                <p className="text-xs text-black/70">
                                    {outletData?.address ?? "-"}
                                    <br />
                                </p>
                            </div>
                        </div>
                        <div className="h-[calc(100dvh-285px)] max-md:h-[calc(100dvh-200px)] overflow-y-auto no-scrollbar">
                            <div className="xl:flex gap-7 justify-between">
                                <div className="w-full">
                                    <SectionLabel>Appointment</SectionLabel>
                                    <Card>
                                        <div className="flex items-center gap-3">
                                            <Avatar pro={selectedProfessional} />
                                            <div className="flex-1">
                                                <p className="font-semibold text-sm">
                                                    {selectedProfessional?.name}
                                                </p>
                                                <p className="text-xs text-gray-500 line-clamp-1">
                                                    {services.map((s) => s.name).join(", ")}
                                                </p>
                                            </div>
                                            <span className="font-mono font-semibold">
                                                ${totalBasePrice}
                                            </span>
                                        </div>
                                        <div className="flex flex-row items-center gap-2 mt-3 pt-3 border-t">
                                            <CalendarDays />
                                            <span className="font-semibold text-sm">
                                                {dateStr ?? "No time selected"}
                                            </span>
                                        </div>
                                    </Card>
                                </div>
                                <div className="w-full">
                                    <SectionLabel>Payment Method</SectionLabel>
                                    <PayOption
                                        icon={<Store />}
                                        label="Pay in person"
                                        selected={payType === "person"}
                                        onClick={() => setPayType("person")}
                                    />
                                    <PayOption
                                        icon={<CreditCard />}
                                        label="Pay with card"
                                        selected={payType === "card"}
                                        onClick={() => setPayType("card")}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>

            {showPaymentModal && (
                <PaymentModal
                    onClose={handlePaymentCancel}
                    onPay={handlePayment}
                    amount={totalWithTax}
                />
            )}

            {consentOpen && pendingConsentServiceId && (
                <ConsentModal
                    key={pendingConsentServiceId ?? "consent"}
                    enforcement={consentEnforcement}
                    heading={consentHeading}
                    consent={consentText}
                    serviceKey={pendingConsentServiceId}
                    onClose={onConsentClose}
                    onConfirm={onConsentConfirm}
                />
            )}
        </MainLayout>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface CardProps {
    children: React.ReactNode;
}

function Card({ children }: CardProps): JSX.Element {
    return (
        <div className="bg-white border rounded-sm p-4 mb-2 text-sm">
            {children}
        </div>
    );
}

interface AvatarProps {
    pro: StaffMember;
}

function Avatar({ pro }: AvatarProps): JSX.Element {
    return (
        <>
            {pro.imageUrl ? (
                <img
                    src={pro.imageUrl}
                    alt={pro.name}
                    className="w-10 h-10 rounded-full object-cover"
                />
            ) : (
                <div
                    className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center"
                    style={{ background: pro.color ?? "#111" }}
                >
                    {getUserName(pro.name)}
                </div>
            )}
        </>
    );
}

interface SectionLabelProps {
    children: React.ReactNode;
}

function SectionLabel({ children }: SectionLabelProps): JSX.Element {
    return (
        <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-black/70 mt-5 mb-2">
            {children}
        </p>
    );
}

interface PayOptionProps {
    icon: React.ReactNode;
    label: string;
    selected: boolean;
    onClick: () => void;
}

function PayOption({ icon, label, selected, onClick }: PayOptionProps): JSX.Element {
    return (
        <div
            onClick={onClick}
            className={`flex flex-row items-center gap-3 p-3 border rounded-sm cursor-pointer mb-2 ${selected ? "border-red bg-red/5" : "border-border"
                }`}
        >
            <div>{icon}</div>
            {label}
            <span className="ml-auto">{selected && <Check />}</span>
        </div>
    );
}
