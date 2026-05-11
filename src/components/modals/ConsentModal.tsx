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
      accepted:
        enforcement === "CHECKBOX_ONLY"
          ? data.accepted
          : false,
      typedName:
        enforcement === "TYPED_NAME"
          ? data.typedName.trim()
          : "",
      signatureDataUrl: finalSignatureDataUrl,
      emailMe: data.emailMe,
    };

    onConfirm(payload);
    resetForm();
    onClose();
  };

  const canSubmit =
    !isSubmitting &&
    (enforcement === "CHECKBOX_ONLY"
      ? accepted
      : enforcement === "TYPED_NAME"
        ? typedName?.trim().length > 2
        : enforcement === "DRAW_SIGNATURE"
          ? !!signatureDataUrl
          : false);

  return (
    <div className="fixed inset-0 z-1024 bg-black/40 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60" />

      <div className="relative bg-white rounded-xl p-4 w-[90%] lg:w-[60%] max-h-[95vh] overflow-y-auto z-10">
        <div className="flex justify-between mb-2.5">
          <h3 className="lg:text-xl text-base font-semibold text-gray-900">
            {heading || "Consent Form"}
          </h3>

          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X />
          </button>
        </div>

        <div className="max-h-[42vh]">
          <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
            <div
              dangerouslySetInnerHTML={{ __html: consent }}
              className="text-gray-700 whitespace-pre-wrap overflow-y-auto max-h-[30vh]"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {enforcement === "CHECKBOX_ONLY" && (
            <label
              className="flex gap-2 items-center mt-3 border-gray-200"
              htmlFor="accepted"
            >
              <input
                type="checkbox"
                {...register("accepted", {
                  required: "You must accept terms",
                })}
                id="accepted"
                className="w-4.5 h-4.5 text-red-500 bg-gray-100 border-gray-300 rounded"
              />

              <span className="text-sm text-gray-700 font-medium">
                I have read and agree to the terms above
              </span>
            </label>
          )}

          {enforcement === "TYPED_NAME" && (
            <div className="mt-4">
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="typedName"
              >
                Full Name{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                {...register("typedName", {
                  required: "Name is required",
                  validate: (v: string) =>
                    v.trim().length > 2 ||
                    "Enter full name",
                })}
                id="typedName"
                placeholder="Type your full name"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none ${errors.typedName
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
                  }`}
              />

              <p className="text-xs text-gray-500 mt-1">
                By typing your name, you agree to the consent above
              </p>

              {errors.typedName && (
                <p className="text-red-500 text-sm">
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
                <div className="mt-4">
                  <SignatureCanvas
                    ref={sigCanvasRef}
                    canvasProps={{
                      className:
                        "w-full h-34 bg-white border border-gray-300 rounded-md overflow-hidden",
                    }}
                    onEnd={() => {
                      const canvas = sigCanvasRef.current;

                      if (!canvas) return;

                      const dataUrl = canvas
                        .getCanvas()
                        .toDataURL("image/png");

                      field.onChange(dataUrl);
                    }}
                  />

                  {errors.signatureDataUrl && (
                    <p className="text-red-500 text-sm my-1">
                      {errors.signatureDataUrl.message}
                    </p>
                  )}

                  <div className="flex justify-between mt-2">
                    <button
                      type="button"
                      onClick={handleClearSignature}
                      className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md flex flex-row items-center gap-1 cursor-pointer"
                    >
                      <RotateCw size={14} />
                      Clear
                    </button>

                    <label
                      className="flex gap-2 text-sm items-center cursor-pointer"
                      htmlFor="emailme"
                    >
                      <input
                        type="checkbox"
                        {...register("emailMe")}
                        id="emailme"
                        className="w-4 h-4 text-red-500 bg-gray-100 border-gray-300 rounded"
                      />

                      <span className="text-sm text-gray-700">
                        Email me
                      </span>
                    </label>
                  </div>
                </div>
              )}
            />
          )}

          <div className="flex justify-end gap-3 mt-5">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 cursor-pointer hover:text-gray-900 border border-gray-300 rounded-md transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!canSubmit}
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition ${!canSubmit
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                }`}
            >
              <Check />

              {enforcement === "DRAW_SIGNATURE" ||
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