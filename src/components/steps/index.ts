import { useSelector } from "react-redux";
import { DollarSign, IndianRupee, Euro, PoundSterling } from "lucide-react";
import { RootState } from "@/store";

type Currency = "USD" | "INR" | "EUR" | "GBP";

const currencyIcons: Record<Currency, React.ElementType> = {
    USD: DollarSign,
    INR: IndianRupee,
    EUR: Euro,
    GBP: PoundSterling,
};

type Props = {
    size?: number;
};


export const CurrencyIcon = ({ size = 20 }: Props) => {
    const currency = useSelector(
        (state: RootState) => state.booking?.outletData?.currency
    ) as Currency | undefined;

    const Icon = currency
        ? currencyIcons[currency]
        : DollarSign;

    return <Icon size={ size } />;
};


export const getUserName = (name: string = ""): string => {
    const parts = name.trim().split(" ").filter(Boolean);

    if (parts.length === 0) return "";

    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";

    return (first + last).toUpperCase();
};