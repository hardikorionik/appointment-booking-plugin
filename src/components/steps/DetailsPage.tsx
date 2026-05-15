import { useState, useEffect, useCallback, useRef, JSX } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { debounce } from "lodash";
import PhoneInput, { isValidPhoneNumber, } from "react-phone-number-input";
import type { CountryCode } from "libphonenumber-js";
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
                <div className="aaravpos-aside">
                    <OrderSidebar
                        buttonText="Confirm Details"
                        onButtonClick={handleSubmit(onSubmit)}
                    />
                </div>
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


                <div className="arravpos-details-section">
                    <h1 className="aaravpos-page-title aaravpos-margin-bottom-20 ">
                        Your Details
                    </h1>

                    <div
                        className="arravpos-details-scroll"
                        style={{ height: `${height - 200}px` }}
                    >
                        <div className="arravpos-details-grid">

                            {/* Phone */}
                            <div className="arravpos-form-group">
                                <label
                                    className="arravpos-form-label"
                                    htmlFor="phone"
                                >
                                    Phone {!emailValue && (
                                        <span className="arravpos-required">*</span>
                                    )}
                                </label>

                                <Controller
                                    control={control}
                                    name="phone"
                                    rules={{
                                        validate: (value) => {
                                            const hasPhone = !!normalizePhone(value);
                                            const hasEmail = !!emailValue?.trim();

                                            if (!hasPhone && !hasEmail) {
                                                return "Enter phone or email";
                                            }

                                            if (
                                                hasPhone &&
                                                !isValidPhoneNumber(value)
                                            ) {
                                                return "Enter valid phone number";
                                            }

                                            return true;
                                        },
                                    }}
                                    render={({ field }) => (
                                        <div className="arravpos-input-wrapper">
                                            <PhoneInput
                                                {...field}
                                                id="phone"
                                                international
                                                countries={allowedCountries}
                                                defaultCountry="US"
                                                value={field.value || ""}
                                                onChange={(value) =>
                                                    handleInputChange(
                                                        value ?? "",
                                                        field.onChange,
                                                        "phone"
                                                    )
                                                }
                                                countryCallingCodeEditable={false}
                                                className="arravpos-custom-input"
                                            />

                                            {loading &&
                                                loadingField === "phone" && (
                                                    <div className="arravpos-loader-wrapper">
                                                        <div className="arravpos-loader" />
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                />

                                {errors.phone && (
                                    <p className="arravpos-error-text">
                                        {errors.phone.message}
                                    </p>
                                )}

                                {isAutoFilled && (
                                    <div className="arravpos-autofill-text">
                                        Using existing customer

                                        <span
                                            onClick={handleClearCustomer}
                                            className="arravpos-clear-text"
                                        >
                                            Clear
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="arravpos-form-group">
                                <label
                                    htmlFor="email"
                                    className="arravpos-form-label"
                                >
                                    Email {!phoneValue && (
                                        <span className="arravpos-required">*</span>
                                    )}
                                </label>
                                <input
                                    id="email"
                                    {...register("email", {
                                        validate: (value) => {
                                            const hasEmail = !!value?.trim();
                                            const hasPhone = !!normalizePhone(phoneValue);

                                            if (!hasEmail && !hasPhone) {
                                                return "Enter phone or email";
                                            }

                                            if (
                                                hasEmail &&
                                                !/^\S+@\S+\.\S+$/.test(value)
                                            ) {
                                                return "Invalid email";
                                            }

                                            return true;
                                        },

                                        onChange: (e) => {
                                            handleInputChange(
                                                e.target.value,
                                                null,
                                                "email"
                                            );
                                        },
                                    })}
                                    autoComplete="email"
                                    placeholder="Email address"
                                    className="arravpos-custom-input"
                                />

                                {errors.firstName && (
                                    <p className="arravpos-error-text">
                                        {errors.firstName.message}
                                    </p>
                                )}
                            </div>

                            {/* First Name */}
                            <div className="arravpos-form-group">
                                <label
                                    htmlFor="first_name"
                                    className="arravpos-form-label"
                                >
                                    First Name{" "}
                                    <span className="arravpos-required">*</span>
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
                                    className="arravpos-custom-input"
                                />

                                {errors.firstName && (
                                    <p className="arravpos-error-text">
                                        {errors.firstName.message}
                                    </p>
                                )}
                            </div>

                            {/* Last Name */}
                            <div className="arravpos-form-group">
                                <label
                                    htmlFor="last_name"
                                    className="arravpos-form-label"
                                >
                                    Last Name
                                </label>

                                <input
                                    id="last_name"
                                    autoComplete="family-name"
                                    {...register("lastName")}
                                    placeholder="Last Name"
                                    className="arravpos-custom-input"
                                />
                            </div>

                        </div>
                    </div>
                </div></form>
        </MainLayout>
    );
}