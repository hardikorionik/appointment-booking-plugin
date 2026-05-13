import { useSelector } from "react-redux";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { DateTime } from "luxon";
import { CurrencyIcon } from "@/utils";
import { OutletRootState, } from "@/types";

type PaymentFormValues = {
  name: string;
  number: string;
  expiry: string;
  cvv: string;
};

type PaymentPayload = PaymentFormValues;

type PaymentModalProps = {
  onClose: () => void;
  onPay: (payload: PaymentPayload) => Promise<boolean>;
  amount?: number;
};

export const formatCardNumber = (value: string): string => {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
};

export const formatExpiry = (value: string): string => {
  const cleaned = value.replace(/\D/g, "").slice(0, 4);

  if (cleaned.length >= 3) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  }

  return cleaned;
};

export const formatCVV = (value: string): string => {
  return value.replace(/\D/g, "").slice(0, 3);
};

export default function PaymentModal({
  onClose,
  onPay,
  amount,
}: PaymentModalProps) {
  const { timeZone } = useSelector(
    (state: OutletRootState) => state?.outletDetails
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormValues>({
    defaultValues: {
      name: "",
      number: "",
      expiry: "",
      cvv: "",
    },
  });

  const onSubmit: SubmitHandler<PaymentFormValues> = async (data) => {
    const normalized: PaymentPayload = {
      name: data.name.trim(),
      number: data.number.trim(),
      expiry: data.expiry,
      cvv: data.cvv,
    };
    const success = await onPay({
      ...normalized,
    });
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-1020">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        <div className="bg-white rounded-xl w-full max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl p-6 shadow-xl">
          <div className="flex justify-between mb-5">
            <h2 className="text-lg font-semibold">Make a payment</h2>
            <span className="flex flex-row font-semibold items-center">
              <CurrencyIcon size={14} />
              {amount?.toFixed(2)}
            </span>
          </div>
          <div className="space-y-4">
            {/* Card Holder Name */}
            <div>
              <label
                htmlFor="name"
                className="text-xs font-semibold text-gray-600 flex mb-1"
              >
                Card Holder Name <span className="text-red-500">*</span>
              </label>
              <Controller
                name="name"
                control={control}
                rules={{
                  required: "Name required",
                  pattern: {
                    value: /^[A-Za-z ]+$/,
                    message: "Only letters allowed",
                  },
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    id="name"
                    autoComplete="cc-name"
                    placeholder="Card Holder Name"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value.replace(
                        /[^A-Za-z ]/g,
                        ""
                      );

                      field.onChange(value);
                    }}
                    className="w-full py-2.5 px-3 border border-border rounded-sm text-sm outline-none focus:border-red"
                  />
                )}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            {/* Card Number */}
            <div>
              <label
                htmlFor="number"
                className="text-xs font-semibold text-gray-600 flex mb-1"
              >
                Card Number <span className="text-red-500">*</span>
              </label>
              <Controller
                name="number"
                control={control}
                rules={{
                  required: "Card number required",
                  validate: (value: string) =>
                    value.replace(/\s/g, "").length === 16 ||
                    "Must be 16 digits",
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    id="number"
                    placeholder="4242 4242 4242 4242"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      field.onChange(formatCardNumber(e.target.value));
                    }}
                    className="w-full py-2.5 px-3 border border-border rounded-sm text-sm outline-none focus:border-red"
                  />
                )}
              />
              {errors.number && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.number.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Expiry */}
              <div>
                <label
                  htmlFor="expiry"
                  className="text-xs font-semibold text-gray-600 flex mb-1"
                >
                  Expiry Date <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="expiry"
                  control={control}
                  rules={{
                    required: "Expiry required",
                    validate: (value: string) => {
                      if (!/^\d{2}\/\d{2}$/.test(value)) {
                        return "Invalid format";
                      }
                      const [month, year] = value
                        .split("/")
                        .map(Number);
                      if (month < 1 || month > 12) {
                        return "Invalid month";
                      }
                      const dt = DateTime.now().setZone(timeZone);
                      const currentYear = dt.year % 100;
                      const currentMonth = dt.month;
                      if (
                        year < currentYear ||
                        (year === currentYear &&
                          month < currentMonth)
                      ) {
                        return "Card expired";
                      }
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="expiry"
                      placeholder="MM/YY"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        field.onChange(formatExpiry(e.target.value));
                      }}
                      className="w-full py-2.5 px-3 border border-border rounded-sm text-sm outline-none focus:border-red"
                    />
                  )}
                />
                {errors.expiry && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.expiry.message}
                  </p>
                )}
              </div>
              {/* CVV */}
              <div>
                <label
                  htmlFor="cvv"
                  className="text-xs font-semibold text-gray-600 flex mb-1"
                >
                  CVV <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="cvv"
                  control={control}
                  rules={{
                    required: "CVV required",
                    minLength: {
                      value: 3,
                      message: "3 digits required",
                    },
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="cvv"
                      placeholder="CVV"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        field.onChange(formatCVV(e.target.value));
                      }}
                      className="w-full py-2.5 px-3 border border-border rounded-sm text-sm outline-none focus:border-red"
                    />
                  )}
                />
                {errors.cvv && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.cvv.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mt-5">
            <button
              type="button"
              onClick={() => {
                reset();
                onClose();
              }}
              className="p-2 px-4 cursor-pointer rounded-md bg-linear-to-r from-red-500 to-red-600 text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-green p-2 px-4 rounded-md cursor-pointer bg-green-600 text-white disabled:opacity-50"
            >
              {isSubmitting ? "Processing..." : "Proceed"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}