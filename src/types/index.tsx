import { number } from "framer-motion";
import { DateObjectUnits } from "luxon";
import { ComponentType, ReactNode } from "react";

/* ─────────────────────────────────────────────────────────────
 * COMMON TYPES
 * ───────────────────────────────────────────────────────────── */
export interface StepItem {
  label: ReactNode;
  page: string;
}
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

export interface BreadcrumbState {
  currentStep: Step;
  completedSteps: string[];
  isOrder: boolean
}

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
  | "SIGNATURE_IMAGE"
  | "DRAW_SIGNATURE"
  | "TYPED_NAME";

export interface StaffMember {
  id: string;
  name: string;
  firstname?: string;
  lastname?: string;
  imageUrl?: string;
  color?: string;
}

export interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}
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
  id: string | number;
  outletName: string;
  timeZone: string;
  image: string;
  tenantId?: string;
  address: string;
  isOpen: boolean;
  outletTimeZoneDate?: string;
  outletTimeZoneYear?: string;
  createdAt: string;
  isService: boolean;
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
export interface ServiceState {
  standaloneCategories: Category[];
  superCategories: Category[];
  staff: Staff[]; // or StaffMember[] but be consistent
  selectedCategory: Category | null;
  selectedServices: ServiceItem[];
  selectedProfessional: Staff | null;
}

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
  enforcementMode?: string | null;
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
  consentTemplate?: {
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
  id: number | string;
  name: string;
  qty: number;
  duration?: number;
  price?: number | null;
  min_price: number | null;
  tax?: number;
  unitTax?: number;
  estimated_time: number | null;
  min_time: number | null;
  requires_consent?: boolean;
  consent_rule?: {
    enforcementMode?: string | null;
  };
  categoryId?: string;
  assignedts?: string;
  assigned_at?: string;
  assigned_via?: string;
}

/* ─────────────────────────────────────────────────────────────
 * CATEGORY
 * ───────────────────────────────────────────────────────────── */

export interface Category {
  id: string | number;
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

export interface StaffServiceAssignment {
  id: string;
  staffName: string;
  name: string;
  categoryId: string;
  price: number;
  qty: number;
  duration: number; // duration in minutes
  assigned_at: string; // ISO date string
  assigned_via: string;
  assigned: boolean;
  tax?: number;
}

export interface FilteredCategory {
  id: string;
  name: string;
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
  qty?: number;
  assigned_at?: string;
  assigned_via?: string;
  assigned?: boolean;
  assignedts?: string;
}

export interface Staff {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  staff_type?: string;
  imageUrl?: string;
  color?: string;

  assignments?: StaffAssignment[];
}

/* ─────────────────────────────────────────────────────────────
 * SLOT
 * ───────────────────────────────────────────────────────────── */
export type SlotStatus = "AVAILABLE" | "BOOKED";

export interface Slot {
  id?: string;
  startTime?: string;
  endTime?: string;
  available?: boolean;
  start_time?: string;
  end_time?: string;
  status: SlotStatus;
  isBooked?: boolean;
}

export interface SlotGroups {
  morning: Slot[];
  afternoon: Slot[];
  evening: Slot[];
}

export interface SlotsState {
  selectedSlotIndexes: number[];
  selectedSlotIds: (string | number)[];
  selectedDate: SelectedDateType | string | null;
  selectedTime: string | null;

  slots: {
    morning: Slot[];
    afternoon: Slot[];
    evening: Slot[];
  };

  loading: boolean;
}

export interface GetStaffSlotsArgs {
  staffId?: string | number;
  date: string; // e.g. "2026-05-11"
  outletId?: string | number;
}

export interface StaffSlotsResponse {
  groups: {
    morning: Slot[];
    afternoon: Slot[];
    evening: Slot[];
  }
  // optional metadata (if backend sends it)
  staffId?: string | number;
  date?: string;
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

export interface CustomerInfo {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

export interface AppointmentPayload {
  tenantId: string | null;
  outletId: string | null;
  staffId?: string | number;

  date: string;
  startTime: string | null;

  serviceIds: (string | number)[];
  slotIds: (string | number)[];

  isWalkIn: boolean;
  requiresConsent: boolean;

  customer: CustomerInfo;
}

export interface CheckinPayload {
  tenantId: string | null;
  outletId: string | null;

  date: string | null;
  startTime: string | null;

  staffId?: string | number;

  serviceIds: (string | number)[];
  slotIds: (string | number)[];

  customer: Customer;
}

/* ─────────────────────────────────────────────────────────────
 * CONSENT
 * ───────────────────────────────────────────────────────────── */
export type EnforcementType =
  | "CHECKBOX_ONLY"
  | "TYPED_NAME"
  | "DRAW_SIGNATURE";

export interface ConsentFormData {
  accepted: boolean;
  typedName: string;
  signatureDataUrl: string;
  emailMe: boolean;
}

export interface ConsentPayload {
  accepted: boolean;
  typedName: string;
  signatureDataUrl: string;
  emailMe: boolean;
}

export interface ConsentModalProps {
  onClose: () => void;
  onConfirm: (payload: ConsentPayload) => void;
  enforcement: EnforcementType;
  heading?: string;
  consent: string;
}

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
  data: {
    checked: boolean;
    needsSignature: boolean;
  };
}

export interface ConsentFormResponse {
  data: unknown;
}

export interface SubmitFinalConsentPayload {
  tenantId: string | null;
  outletId: string | null;
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

export interface OutletSliceState {
  id: string,
  outletName: string,
  timeZone: string,
  image: string,
  tenantId: string,
  address: string,
  isOpen: false,
  createdAt: string,
  isService: true,
  outletTimeZoneDate: string;
  outletTimeZoneYear: number;
  outletTimeZone: string | null;
  currency: string,
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
  selectedDate: DateObjectUnits | null;
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
  outletDetails: OutletSliceState;
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


export interface CalendarMonth {
  label: string;
  monthIdx: number;
  year: number;
  startDow: number;
  days: number;
}
