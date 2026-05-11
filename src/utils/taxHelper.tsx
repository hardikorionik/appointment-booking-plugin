import { Service } from "@/types";

interface TaxRow {
  isActive: boolean;
  taxType: "FIXED" | "PERCENTAGE";
  taxRate: number;
}

interface TaxableService extends Service {
  qty?: number;
  taxRows?: TaxRow[];
}

interface CalculateTaxOptions {
  perUnit?: boolean;
}

export const getServiceBasePrice = (svc: TaxableService): number => {
  return Number(svc.price || svc.min_price || 0);
};

export const calculateServiceTax = (
  svc: TaxableService,
  { perUnit = false }: CalculateTaxOptions = {},
): number => {
  const basePrice = getServiceBasePrice(svc);

  const qty = perUnit ? 1 : svc.qty || 1;

  if (!svc.taxRows || !svc.taxRows.length) return 0;

  return svc.taxRows.reduce((total: number, tax: TaxRow) => {
    if (!tax.isActive) return total;

    if (tax.taxType === "FIXED") {
      return total + tax.taxRate * qty;
    }

    if (tax.taxType === "PERCENTAGE") {
      return total + (basePrice * qty * tax.taxRate) / 100;
    }

    return total;
  }, 0);
};