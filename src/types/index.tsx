import { ComponentType } from "react";

// Types for the booking plugin
export type BookingPluginProps = {
  bookingCode: string;
};

export type StepKey =
  | "services"
  | "professionals"
  | "time"
  | "details"
  | "confirm"
  | "success"
  | "notfound";

export type PageMap = Record<StepKey, ComponentType>;

// Types for customizable themes
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

// Main layout types
export type MainLayoutProps = {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  renderButton?: React.ReactNode;
  isConfirm?: boolean;
  handleSidebarOpen?: () => void;
  isSidebarOpen?: boolean;
};

export interface Outlet {
  id: string;
  outletName: string;
  timeZone: string;
  image: string;
  tenantId: string;
  address: string;
  isOpen: boolean;
}

// Service related types
export type GetStaffSlotsArgs = {
  staffId: string;
  date: string;
};

export type SlotGroups = {
  morning: Slot[];
  afternoon: Slot[];
  evening: Slot[];
};

export type SlotsState = {
  selectedSlotIndexes: number[];
  selectedSlotIds: string[];
  selectedDate: string | null;
  selectedTime: string | null;
  slots: SlotGroups;
  loading: boolean;
};

export type StaffSlotsResponse = {
  groups: SlotGroups;
};

export interface Service {
  id: string;
  name: string;
  description: string;

  // Pricing
  price: string | null;
  min_price: string | null;
  max_price: string | null;
  price_mode: "FIXED" | "RANGE";

  // Online Pricing
  online_price: string | null;
  online_min_price: string | null;
  online_max_price: string | null;
  online_price_mode: "FIXED" | "RANGE" | null;

  // Time
  estimated_time: number | null;
  min_time: number | null;
  max_time: number | null;
  time_mode: "FIXED" | "RANGE";

  // Buffer
  buffer_time: boolean;
  has_buffer_time: boolean;
  before_buffer_time: number | null;
  after_buffer_time: number | null;

  // IDs
  tenant_id: string;
  outlet_id: string | null;
  category_id: string;

  // Dates
  created_at: string;
  updated_at: string;

  // Taxes
  taxes: string[];
  taxRows: any[];

  // Processing
  has_processing_time: boolean;
  processing_time: number | null;
  finishing_time: number | null;

  // Online
  available_online: boolean;
  online_description: string;

  // Other
  sortOrder: number;
  auto_assign_to_all_staff: boolean;

  // Consent
  requires_consent: boolean;
  enforcement: Record<string, any>;

  consent_rule: any | null;
  consent_form: any | null;
  consent_template: any | null;

  consent_form_id: string | null;
  consent_rule_id: string | null;
}

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

export interface StaffServiceAssignment {
  id: string;
  staffName: string;
  name: string;
  categoryId: string;
  price: number;
  duration: number; // duration in minutes
  assigned_at: string; // ISO date string
  assigned_via: string;
  assigned: boolean;
}

export interface StaffMember {
  color: string;
  firstName: string;
  futureLeaveDates: string[]; // Change type if dates are objects
  id: string;
  imageUrl: string;
  is_service_provider: boolean;
  lastName: string;
  name: string;
  outletId: string;
  outletName: string;
  staff_type: string;
  tenantId: string;
  userId: string;
  assignments: StaffServiceAssignment[];
}

export interface Staff {
  assignments: any;
  id: string;
  name: string;
  firstname: string;
  lastname: string;
}

export interface ServiceResponse {
  categories: Category[];
  staff: Staff[];
}

export interface Slot {
  id: string;
  startTime: string;
  endTime: string;
}

export type SlotsResponse = Slot[];

// Breadcrumb related types
export type Step =
  | "services"
  | "professionals"
  | "time"
  | "details"
  | "confirm"
  | "success";

export type StepItem = {
  label: React.ReactNode;
  page: Step;
};

export type BookingState = {
  step: Step;
  staff: Staff[];
  services: Service[];
  slots: Slot[];
  selectedStaff?: Staff;
  selectedService?: Service;
  selectedSlot?: Slot;
  loading: boolean;
  error?: string;
};

export interface BreadcrumbState {
  currentStep: Step;
  completedSteps: Step[];
  isService: boolean;
}

// Appointment related types
export type BookingMode = "booking" | "checkin";

export interface UserDetails {
  name?: string;
  email?: string;
  phone?: string;
}

export interface AppointmentResponse {
  id?: string;
  appointmentId?: string;
  customerId?: string;
  customer?: {
    id?: string;
  };
  [key: string]: any;
}

export interface AppointmentPayload {
  [key: string]: any;
}

export interface AppointmentState {
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

// Service response type
export interface ServiceItem {
  id: string;
  name: string;
  qty: number;
  duration?: number;
  price?: number;
}

export interface ServiceState {
  categories: Category[];
  staff: Staff[];
  selectedCategory: Category | null;
  selectedServices: ServiceItem[];
  selectedProfessional: Staff | null;
  loading: boolean;
  error: string | null;
}

export interface FetchServicePayload {
  tenantId: string;
  outletId: string;
}

export interface FetchServiceResponse {
  categories: Category[];
  staff: Staff[];
}

// Booking slice types
export type OutletData = {
  id: string;
  timeZone: string;
  createdAt: string;
  currency?: string;
};

export type InitBookingPayload = {
  outletData: OutletData;
  outletTimeZoneDate: string;
  outletTimeZoneYear: number;
  outletTimeZone: string;
  token?: string | null;
};

export type InitBookingArgs = {
  outletId: string;
};

export type InitBookingState = {
  outletData: OutletData | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  outletId: string | null;
  outletTimeZoneDate: string | null;
  outletTimeZoneYear: number | null;
  outletTimeZone: string | null;
};

/* TAX TYPES */
export interface TaxRow {
  isActive: boolean;
}

/* PROFESSIONAL ASSIGNMENT */
export interface Assignment {
  id: string;
  categoryId: string;
}

/* FILTERED CATEGORY */
export interface FilteredCategory extends Category {
  services: Service[];
}

// sucess page types
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

// customer details types
export interface FormValues {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export interface Customer {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
}

export interface FetchCustomerResponse {
  data?: Customer[];
}
export interface ProfessionalSidebarProps {
  pro: Staff | null;
  goToStep: (step: Step) => void;
}
