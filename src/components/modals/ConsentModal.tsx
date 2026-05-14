import { useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { RotateCw, Check, X } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import { ConsentPayload, ConsentModalProps, ConsentFormData } from "@/types";


const ConsentModal = ({
    onClose,
    onConfirm,
    enforcement,
    heading,
    consent,
}: ConsentModalProps) => {
    const sigCanvasRef = useRef<SignatureCanvas | null>(null);
    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ConsentFormData>({
        defaultValues: {
            accepted: false,
            typedName: "",
            signatureDataUrl: "",
            emailMe: false,
        },
        mode: "onChange",
    });

    const accepted = watch("accepted");
    const typedName = watch("typedName");
    const signatureDataUrl = watch("signatureDataUrl");

    const resetForm = () => {
        reset();
        if (enforcement === "DRAW_SIGNATURE") {
            sigCanvasRef.current?.clear();
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleClearSignature = () => {
        sigCanvasRef.current?.clear();
        setValue("signatureDataUrl", "");
    };

    const onSubmit = (data: ConsentFormData) => {
        let finalSignatureDataUrl = "";
        if (enforcement === "DRAW_SIGNATURE") {
            const canvas = sigCanvasRef.current;
            if (canvas && !canvas.isEmpty()) {
                finalSignatureDataUrl = canvas
                    .getCanvas()
                    .toDataURL("image/png");
            } else {
                return;
            }
        }

        const payload: ConsentPayload = {
            accepted: enforcement === "CHECKBOX_ONLY"
                ? data.accepted
                : false,
            typedName: enforcement === "TYPED_NAME"
                ? data.typedName.trim()
                : "",
            signatureDataUrl: finalSignatureDataUrl,
            emailMe: data.emailMe,
        };

        onConfirm(payload);
        resetForm();
        onClose();
    };

    const canSubmit = !isSubmitting && (enforcement === "CHECKBOX_ONLY" ? accepted
        : enforcement === "TYPED_NAME" ? typedName?.trim().length > 2
            : enforcement === "DRAW_SIGNATURE" ? !!signatureDataUrl : false);

    return (
        <div className="arravpos-consent-overlay">
            <div className="arravpos-consent-backdrop" />
            <div className="arravpos-consent-modal">
                {/* Header */}
                <div className="arravpos-consent-header">
                    <h3 className="arravpos-consent-title">
                        {heading || "Consent Form"}
                    </h3>
                    <button
                        onClick={handleClose}
                        className="arravpos-consent-close-btn"
                    >
                        <X />
                    </button>
                </div>
                <div className="arravpos-consent-content-wrapper">
                    <div className="arravpos-consent-content-box">
                        <div
                            dangerouslySetInnerHTML={{
                                __html: consent,
                            }}
                            className="arravpos-consent-content"
                        />
                    </div>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    {enforcement === "CHECKBOX_ONLY" && (
                        <label className="arravpos-consent-checkbox-label" htmlFor="accepted">
                            <input
                                type="checkbox"
                                {...register("accepted", {
                                    required:
                                        "You must accept terms",
                                })}
                                id="accepted"
                                className="arravpos-consent-checkbox"
                            />
                            <span className="arravpos-consent-checkbox-text">
                                I have read and agree to the terms above
                            </span>
                        </label>
                    )}
                    {enforcement === "TYPED_NAME" && (
                        <div className="arravpos-consent-typed-wrapper">
                            <label className="arravpos-consent-input-label" htmlFor="typedName">
                                Full Name
                                <span className="arravpos-consent-required">
                                    *
                                </span>
                            </label>
                            <input
                                {...register("typedName", {
                                    required:
                                        "Name is required",
                                    validate: (v) =>
                                        v.trim().length > 2 ||
                                        "Enter full name",
                                })}
                                id="typedName"
                                placeholder="Type your full name"
                                className={`arravpos-consent-input ${errors.typedName
                                    ? "arravpos-consent-input-error"
                                    : "arravpos-consent-input-normal"
                                    }`}
                            />
                            <p className="arravpos-consent-helper-text">
                                By typing your name, you agree to the consent above
                            </p>
                            {errors.typedName && (
                                <p className="arravpos-consent-error">
                                    {errors.typedName.message}
                                </p>
                            )}
                        </div>
                    )}
                    {enforcement === "DRAW_SIGNATURE" && (
                        <Controller
                            control={control}
                            name="signatureDataUrl"
                            rules={{
                                validate: () =>
                                    sigCanvasRef.current &&
                                        !sigCanvasRef.current.isEmpty()
                                        ? true
                                        : "Signature required",
                            }}
                            render={({ field }) => (
                                <div className="arravpos-consent-signature-wrapper">
                                    <SignatureCanvas
                                        ref={sigCanvasRef}
                                        canvasProps={{
                                            className:
                                                "arravpos-consent-signature-canvas",
                                        }}
                                        onEnd={() => {
                                            const canvas =
                                                sigCanvasRef.current;

                                            if (!canvas) return;

                                            const dataUrl =
                                                canvas
                                                    .getCanvas()
                                                    .toDataURL(
                                                        "image/png"
                                                    );

                                            field.onChange(dataUrl);
                                        }}
                                    />
                                    {errors.signatureDataUrl && (
                                        <p className="arravpos-consent-error arravpos-consent-error-signature">
                                            {errors.signatureDataUrl.message}
                                        </p>
                                    )}
                                    <div className="arravpos-consent-signature-actions">
                                        <button
                                            type="button"
                                            onClick={
                                                handleClearSignature
                                            }
                                            className="arravpos-consent-clear-btn"
                                        >
                                            <RotateCw size={14} />
                                            Clear
                                        </button>
                                        <label
                                            className="arravpos-consent-email-label"
                                            htmlFor="emailme"
                                        >
                                            <input
                                                type="checkbox"
                                                {...register(
                                                    "emailMe"
                                                )}
                                                id="emailme"
                                                className="arravpos-consent-email-checkbox"
                                            />
                                            <span className="arravpos-consent-email-text">
                                                Email me
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        />
                    )}
                    <div className="arravpos-consent-footer">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="arravpos-consent-cancel-btn"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className={`arravpos-consent-submit-btn ${!canSubmit
                                ? "arravpos-consent-submit-disabled"
                                : "arravpos-consent-submit-active"
                                }`}
                        >
                            <Check />
                            {enforcement ===
                                "DRAW_SIGNATURE" ||
                                enforcement === "TYPED_NAME"
                                ? "Sign & Continue"
                                : "I Agree"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConsentModal;