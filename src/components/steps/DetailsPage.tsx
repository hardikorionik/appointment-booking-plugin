import { useState, useEffect, useCallback, useRef, JSX } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { debounce } from "lodash";
import PhoneInput, { isValidPhoneNumber, } from "react-phone-number-input";
import type { E164Number, CountryCode } from "libphonenumber-js";
import { useDispatch, useSelector } from "react-redux";
import { nextStep } from "@/slices/breadcrumbSlice";
import Breadcrumb from "@/components/common/Breadcrumb";
import OrderSidebar from "@/components/sidebar/OrderSidebar";
import MainLayout from "@/components/common/MainLayout";
import {
    setUserDetails,
    clearUserDetails,
} from "@/slices/appointmentSlice";

import { useWindowSize } from "@/hooks/useWindowSize";
import { fetchCustomer } from "@/services";

import type { RootState } from "@/store";

import { FormValues, FetchCustomerResponse, OutletRootState } from "@/types";

// -------------------- Constants --------------------
const allowedCountries: CountryCode[] = [
    "IN",
    "US",
    "CA",
    "PH",
    "NZ",
    "AU",
    "CN",
] as const;

// -------------------- Component --------------------
export default function DetailsPage(): JSX.Element {
    const dispatch = useDispatch();
    const { tenantId } = useSelector((state: OutletRootState) => state?.outletDetails);
    const { height } = useWindowSize();

    const { userDetails } = useSelector(
        (state: RootState) => state.appointment,
    );

    const [loading, setLoading] = useState<boolean>(false);

    const [loadingField, setLoadingField] = useState<
        "phone" | "email" | null
    >(null);

    const [isAutoFilled, setIsAutoFilled] =
        useState<boolean>(false);

    const lastQueryRef = useRef<string>("");

    const debouncedFetchRef = useRef<
        (((params: {
            value: string;
            type: "phone" | "email";
        }) => void) & {
            cancel?: () => void;
        }) | null
    >(null);

    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        trigger,
        setValue,
        formState: {
            errors,
            isSubmitted,
            isSubmitting,
        },
    } = useForm<FormValues>({
        defaultValues: {
            firstName: "",
            lastName: "",
            phone: "",
            email: "",
        },
        mode: "onSubmit",
    });

    const phoneValue = watch("phone");
    const emailValue = watch("email");

    // -------------------- Effects --------------------

    useEffect(() => {
        reset(
            { ...userDetails, phone: userDetails?.phone || "", },
            { keepErrors: true, keepDirty: false }
        );
    }, [userDetails, reset]);

    useEffect(() => {
        if (isSubmitted) {
            trigger(["phone", "email"]);
        }
    }, [phoneValue, emailValue, isSubmitted, trigger]);

    // -------------------- Helpers --------------------

    const normalizePhone = (phone?: string): string =>
        phone?.replace(/\s+/g, "") || "";

    const isValidEmail = (email: string): boolean =>
        /^\S+@\S+\.\S+$/.test(email);

    // -------------------- Submit --------------------

    const onSubmit: SubmitHandler<FormValues> = (
        data,
    ): void => {
        const payload = { ...data, phone: data?.phone ?? "", };

        dispatch(setUserDetails(payload));

        dispatch(nextStep());
    };

    // -------------------- Fetch Customer --------------------

    const fetchCustomerData = useCallback(
        async ({
            value,
            type,
        }: {
            value: string;
            type: "phone" | "email";
        }): Promise<void> => {
            if (!value) return;
            let searchKey = "";
            if (type === "phone") {
                if (!isValidPhoneNumber(value)) return;

                searchKey = normalizePhone(value);
            }
            if (type === "email") {
                if (!isValidEmail(value)) return;
                searchKey = value.trim();
            }
            if (!searchKey) return;
            if (
                lastQueryRef.current === searchKey &&
                isAutoFilled
            ) {
                return;
            }
            lastQueryRef.current = searchKey;
            setLoading(true);
            setLoadingField(type);
            try {
                const res: FetchCustomerResponse = await fetchCustomer({ search: searchKey, tenantId });

                const customer = res?.data?.[0];
                if (customer) {
                    setValue("firstName", customer.first_name || "", {
                        shouldValidate: true,
                    });
                    setValue("lastName", customer.last_name || "");
                    if (customer.phone && isValidPhoneNumber(customer.phone)) {
                        setValue("phone", customer.phone);
                    }
                    if (customer.email) {
                        setValue("email", customer.email);
                    }
                    dispatch(
                        setUserDetails({
                            email: customer.email,
                            firstName: customer.first_name,
                            lastName: customer.last_name,
                            phone: customer.phone,
                        }),
                    );
                    setIsAutoFilled(true);
                } else {
                    setIsAutoFilled(false);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
                setLoadingField(null);
            }
        },
        [dispatch, setValue, isAutoFilled],
    );

    // -------------------- Clear Customer --------------------

    const handleClearCustomer = (): void => {
        reset({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
        });
        setIsAutoFilled(false);
        lastQueryRef.current = "";
        dispatch(clearUserDetails());
    };

    // -------------------- Debounce --------------------

    useEffect(() => {
        debouncedFetchRef.current = debounce(
            fetchCustomerData,
            800,
        );
        return () => {
            debouncedFetchRef.current?.cancel?.();
        };
    }, [fetchCustomerData]);

    // -------------------- Input Change --------------------

    const handleInputChange = (
        value: string,
        onChange: ((value: string) => void) | null,
        type: "phone" | "email",
    ): void => {
        if (onChange) {
            onChange(value);
        }
        if (!value) {
            debouncedFetchRef.current?.cancel?.();
            lastQueryRef.current = "";
            setIsAutoFilled(false);
            setLoadingField(null);
            return;
        }
        setLoadingField(type);
        debouncedFetchRef.current?.({
            value,
            type,
        });
    };

    // -------------------- Render --------------------

    return (
        <MainLayout
            sidebar={
                <OrderSidebar
                    buttonText="Confirm Details"
                    onButtonClick={handleSubmit(onSubmit)}
                />
            }
            renderButton={
                <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="aaravpos-btn"
                >
                    <span className="aaravpos-btn-content">
                        {isSubmitting
                            ? "Submitting..."
                            : "Confirm Details"}
                    </span>
                </button>
            }
        >
            <form>
                <Breadcrumb />
                <div className="aaravpos-margin-top-20">
                    <h1 className="font-bebas text-xl md:text-2xl lg:text-4xl">
                        Your Details
                    </h1>
                    <div className="overflow-y-auto scrollbar-none pb-20 lg:pb-4" style={{ height: `${height - 200}px`, }} >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mt-5">
                            <div className="flex flex-col">
                                <label className="text-xs font-semibold text-gray-600 flex mb-1" htmlFor="phone">
                                    Phone {!emailValue && <span className="text-red-500">*</span>}
                                </label>
                                <Controller
                                    control={control}
                                    name="phone"
                                    rules={{
                                        validate: (value) => {
                                            const hasPhone = !!normalizePhone(value);
                                            const hasEmail = !!emailValue?.trim();
                                            if (!hasPhone && !hasEmail) return "Enter phone or email";
                                            if (hasPhone && !isValidPhoneNumber(value))
                                                return "Enter valid phone number";
                                            return true;
                                        },
                                    }}
                                    render={({ field }) => (
                                        <div className="relative">
                                            <PhoneInput
                                                {...field}
                                                id="phone"
                                                international
                                                countries={allowedCountries}
                                                defaultCountry="US"
                                                value={field.value || ""}
                                                onChange={(value?: E164Number) =>
                                                    handleInputChange(value ?? "", field.onChange, "phone")
                                                }
                                                countryCallingCodeEditable={false}
                                                className="w-full py-2 px-3 border border-border rounded-sm text-sm outline-none focus:border-red"
                                            />
                                            {loading && loadingField === "phone" && (
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                    <div className="h-4 w-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.phone.message}
                                    </p>
                                )}
                                {isAutoFilled && (
                                    <div className="mt-1 text-xs flex items-center gap-1 text-gray-600">
                                        Using existing customer<span
                                            onClick={handleClearCustomer}
                                            className="text-red cursor-pointer"
                                        >
                                            Clear
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <label className="text-xs font-semibold text-gray-600 flex mb-1" htmlFor="email">
                                    Email {!phoneValue && <span className="text-red-500">*</span>}
                                </label>
                                <div className="relative">
                                    <input
                                        id="email"
                                        {...register("email", {
                                            validate: (value) => {
                                                const hasEmail = !!value?.trim();
                                                const hasPhone = !!normalizePhone(phoneValue);
                                                if (!hasEmail && !hasPhone) return "Enter phone or email";
                                                if (hasEmail && !/^\S+@\S+\.\S+$/.test(value))
                                                    return "Invalid email";
                                                return true;
                                            },
                                            onChange: (e) => {
                                                handleInputChange(e.target.value, null, "email");
                                            },
                                        })}
                                        autoComplete='email'
                                        placeholder="Email address"
                                        className="w-full py-2 px-3 border border-border rounded-sm text-sm outline-none focus:border-red"
                                    />
                                    {loading && loadingField === "email" && (
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                            <div className="h-4 w-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col ">
                                <label
                                    htmlFor="first_name"
                                    className="text-xs font-semibold text-gray-600 flex mb-1"
                                >
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="first_name"
                                    {...register("firstName", {
                                        required: "First name required",
                                        pattern: {
                                            value: /^[A-Za-z\s]+$/,
                                            message: "Only letters are allowed",
                                        },
                                    })}
                                    autoComplete="given-name"
                                    placeholder="First Name"
                                    className="w-full py-2 px-3 border border-border rounded-sm text-sm outline-none focus:border-red"
                                />
                                {errors.firstName && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.firstName.message}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <label
                                    htmlFor="last_name"
                                    className="text-xs font-semibold text-gray-600 flex mb-1"
                                >
                                    Last Name
                                </label>
                                <input
                                    id="last_name"
                                    autoComplete="family-name"
                                    {...register("lastName")}
                                    placeholder="Last Name"
                                    className="w-full py-2 px-3 border border-border rounded-sm text-sm outline-none focus:border-red"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </MainLayout>
    );
}