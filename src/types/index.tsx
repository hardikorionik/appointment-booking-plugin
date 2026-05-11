import { ComponentType, ReactNode } from "react";

/* ─────────────────────────────────────────────────────────────
 * COMMON TYPES
 * ───────────────────────────────────────────────────────────── */

export type StepKey =
  | "services"
  | "professionals"
  | "time"
  | "details"
  | "confirm"
  | "success"
  | "notfound";

export type Step =
  | "services"
  | "professionals"
  | "time"
  | "details"
  | "confirm"
  | "success";

export type PageMap = Record<StepKey, ComponentType>;

export type BookingMode = "booking" | "checkin";

export type PayType = "person" | "card";

export type CardType =
  | "VISA"
  | "MASTERCARD"
  | "AMEX"
  | "DISCOVER"
  | "UNKNOWN";

export type SignatureType =
  | "CHECKBOX_ONLY"
  | "TYPED_NAME"
  | "SIGNATURE_IMAGE";

/* ─────────────────────────────────────────────────────────────
 * THEME
 * ───────────────────────────────────────────────────────────── */

export interface ThemeSettings {
  button: {
    bg: string;
    text: string;
    bgHover: string;
    textHover: string;
  };
  colors: {
    bg: string;
    link: string;
    text: string;
    bgHover: string;
    textHover: string;
  };
}

/* ─────────────────────────────────────────────────────────────
 * LAYOUT
 * ───────────────────────────────────────────────────────────── */

export interface MainLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  renderButton?: ReactNode;
  isConfirm?: boolean;
  handleSidebarOpen?: () => void;
  isSidebarOpen?: boolean;
}

/* ─────────────────────────────────────────────────────────────
 * OUTLET
 * ───────────────────────────────────────────────────────────── */

export interface Outlet {
  id: string;
  outletName: string;
  timeZone: string;
  image: string;
  tenantId: string;
  address: string;
  isOpen: boolean;
}

export interface OutletData {
  id?: string;
  outletName?: string;
  address?: string;
  image?: string;
  timeZone?: string;
  createdAt?: string;
  currency?: string;
}

/* ─────────────────────────────────────────────────────────────
 * TAX
 * ───────────────────────────────────────────────────────────── */

export interface TaxRow {
  isActive: boolean;
}

/* ─────────────────────────────────────────────────────────────
 * SERVICE
 * ───────────────────────────────────────────────────────────── */

export interface Service {
  id: string | number;
  name: string;
  description?: string;

  price?: number | string | null;
  min_price?: number | string | null;
  max_price?: number | string | null;

  online_price?: string | null;
  online_min_price?: string | null;
  online_max_price?: string | null;

  price_mode?: "FIXED" | "RANGE";
  online_price_mode?: "FIXED" | "RANGE" | null;

  estimated_time?: number | null;
  min_time?: number | null;
  max_time?: number | null;

  time_mode?: "FIXED" | "RANGE";

  qty?: number;

  taxes?: string[];
  taxRows?: TaxRow[];

  tenant_id?: string;
  outlet_id?: string | null;
  category_id?: string;

  available_online?: boolean;

  requires_consent?: boolean;

  consent_rule?: {
    enforcementMode?: string | null;

    frequency?:
    | "EVERY_X_DAYS"
    | "ONCE_PER_CUSTOMER"
    | "EVERY_VISIT";
  } | null;

  consent_template?: {
    heading?: string;
    consent?: string;
  } | null;

  consent_form_id?: string | number | null;

  duration?: number;
}

export interface EnrichedService extends Service {
  duration: number;
  tax: number;
  unitTax: number;
}

export interface ServiceItem {
  id: string;
  name: string;
  qty: number;
  duration?: number;
  price?: number;
}

/* ─────────────────────────────────────────────────────────────
 * CATEGORY
 * ───────────────────────────────────────────────────────────── */

export interface Category {
  id: string;
  name: string;
  description: string;
  tenant_id: string;
  outlet_id: string;
  created_at: string;
  updated_at: string;
  sortOrder: number;
  is_available_online_category: boolean;
  super_category_id: string | null;
  services: Service[];
}

export interface FilteredCategory extends Category {
  services: Service[];
}

/* ─────────────────────────────────────────────────────────────
 * STAFF
 * ───────────────────────────────────────────────────────────── */

export interface StaffAssignment {
  id: string | number;
  categoryId?: string;
  price?: number;
  duration?: number;
}

export interface Staff {
  id: string;
  name: string;
  firstname?: string;
  lastname?: string;

  imageUrl?: string;
  color?: string;

  assignments?: StaffAssignment[];
}

/* ─────────────────────────────────────────────────────────────
 * SLOT
 * ───────────────────────────────────────────────────────────── */

export interface Slot {
  id?: string;
  startTime?: string;
  endTime?: string;

  start_time?: string;
  end_time?: string;
}

export interface SlotGroups {
  morning: Slot[];
  afternoon: Slot[];
  evening: Slot[];
}

/* ─────────────────────────────────────────────────────────────
 * USER
 * ───────────────────────────────────────────────────────────── */

export interface UserDetails {
  id?: string | number;
  name?: string;

  firstName?: string;
  lastName?: string;

  email?: string;
  phone?: string;
}

export interface Customer {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
}

/* ─────────────────────────────────────────────────────────────
 * APPOINTMENT
 * ───────────────────────────────────────────────────────────── */

export interface AppointmentResponse {
  id?: string;
  appointmentId?: string;
  customerId?: string;

  customer?: {
    id?: string;
  };

  [key: string]: unknown;
}

export interface AppointmentDetails {
  staff?: Staff | null;
  outlet?: Outlet | null;
  services: Service[];

  startLocal?: string;
  appointmentDate: string;
  startTime: string;

  tipsCents: number;
  taxCents: number;
  totalCents: number;
}

export interface AppointmentPayload {
  tenantId: string | null;
  outletId: string | null;
  staffId?: string | number;

  date: string;
  startTime: string;

  serviceIds: (string | number)[];
  slotIds: (string | number)[];

  isWalkIn: boolean;
  requiresConsent: boolean;

  customer: Customer;
}

export interface CheckinPayload {
  tenantId: string | null;
  outletId: string | null;

  date: string;
  startTime: string;

  staffId?: string | number;

  serviceIds: (string | number)[];
  slotIds: (string | number)[];

  customer: Customer;
}

/* ─────────────────────────────────────────────────────────────
 * CONSENT
 * ───────────────────────────────────────────────────────────── */

export interface ConsentModalPayload {
  typedName?: string;
  accepted?: boolean;
  signatureDataUrl?: string;
  emailMe?: boolean;
}

export interface ConsentDraftEntry {
  serviceId: string;
  concentFormId: string;

  signatureType: SignatureType;

  typedName?: string;
  isChecked?: boolean;
  signatureDataUrl?: string;
  emailMe?: boolean;
}

export interface ConsentDraftMap {
  [serviceId: string]: ConsentDraftEntry;
}

export interface ConsentCheckStatus {
  checked: boolean;
  needsSignature: boolean;
}


export interface ConsentFormResponse {
  data: unknown;
}

export interface SubmitFinalConsentPayload {
  tenantId: string;
  outletId: string;
  appointmentId: string | number;
  customerId: string | number;
  serviceId: string | number;
  formId: string | number;
  staffId?: string | number;
  signatureType: SignatureType;
  isChecked?: boolean;
  typedName?: string;
  imageUrl?: string;
}

/* ─────────────────────────────────────────────────────────────
 * PAYMENT
 * ───────────────────────────────────────────────────────────── */

export interface PaymentMeta {
  appointmentId: string | number;
  customerId: string | number;
}

export interface CardData {
  name: string;
  number: string;
  expiry: string;
  cvv: string;
}

export interface PaymentPayload {
  appointmentId: string | number;
  customerId: string | number;
  outletId: string;
  referenceNo: string | number;

  currency: string;

  amountCents: number;
  tipAmountCents: number;
  taxAmountCents: number;

  transactionBody: TransactionBody;
}

export interface TransactionBody {
  transactionOrigin: number;
  transactionCode: string;

  isDebit: boolean;

  processMethod: number;
  channelType: number;

  tenderInfo: TenderInfo;

  billingContact: BillingContact;
}

export interface TenderInfo {
  cardHolderName: string;
  cardNumber: string;
  cardType: CardType;
  cardExpiry: number | string;
  cvData: string;
}

export interface BillingContact {
  name: {
    firstName: string;
    lastName: string;
  };

  email: string;
}

/* ─────────────────────────────────────────────────────────────
 * REDUX STATE
 * ───────────────────────────────────────────────────────────── */

export interface BookingSliceState {
  outletData: OutletData | null;
  outletTimeZoneDate: string;
  outletTimeZone: string;
}

export interface ServiceSliceState {
  categories: Category[];
  staff: Staff[];

  selectedCategory: Category | null;
  selectedServices: Service[];

  selectedProfessional: Staff | null;

  loading: boolean;
  error: string | null;
}

export interface SlotsSliceState {
  selectedSlotIds: (string | number)[];
  selectedDate: string | null;
  selectedTime: string;

  selectedSlotIndexes: number[];

  slots: SlotGroups;

  loading: boolean;
}

export interface SelectedDateType {
  day: number;
  month: number;
  year: number;
}

export interface AppointmentSliceState {
  loading: boolean;
  success: boolean;

  error: string | null;

  data: AppointmentResponse | null;

  appointmentId: string | null;
  customerId: string | null;

  userDetails: UserDetails | null;

  tipPct: number;

  bookingMode: BookingMode;
}

export interface RootState {
  booking: BookingSliceState;
  service: ServiceSliceState;
  slots: SlotsSliceState;
  appointment: AppointmentSliceState;
}

/* ─────────────────────────────────────────────────────────────
 * API RESPONSES
 * ───────────────────────────────────────────────────────────── */

export interface ServiceResponse {
  categories: Category[];
  staff: Staff[];
}

export interface FetchCustomerResponse {
  data?: Customer[];
}

export interface FetchServicePayload {
  tenantId: string;
  outletId: string;
}

export interface FetchServiceResponse {
  categories: Category[];
  staff: Staff[];
}

/* ─────────────────────────────────────────────────────────────
 * COMPONENT PROPS
 * ───────────────────────────────────────────────────────────── */

export interface BookingPluginProps {
  bookingCode: string;
}

export interface ProfessionalSidebarProps {
  pro: Staff | null;
  goToStep: (step: Step) => void;
}

/* DATE TYPES */
export interface SelectedDate {
  day: number;
  month: number;
  year: number;
}

export interface DateItem {
  day: number;
  month: number;
  year: number;
  fullDate: string | null;
}

/* SLOT TYPES */
export interface SlotItem {
  id: string | number;
  start_time: string;
  end_time?: string;
  isBooked?: boolean;
  status?: string;
}

/* ROOT STATE */
export interface RootState {
  appointment: {
    bookingMode: BookingMode;
  };

  service: {
    staff: StaffMember[];
    selectedServices: Service[];
    selectedProfessional: StaffMember | null;
  };

  booking: {
    outletTimeZone: string;
  };

  slots: {
    selectedSlotIndexes: number[];
    selectedDate: SelectedDate | null;
    selectedTime: string | null;
    loading: boolean;
    slots: {
      morning: SlotItem[];
      afternoon: SlotItem[];
      evening: SlotItem[];
    };
  };
}
