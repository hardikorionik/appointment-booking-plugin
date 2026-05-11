import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Minus, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  fetchServiceData,
  setCategory,
  toggleService,
  incrementService,
  decrementService,
} from "@/slices/serviceSlice";

import Breadcrumb from "@/components/common/Breadcrumb";
import { isConsentRequiredService } from "@/api/consentService";
import MainLayout from "@/components/common/MainLayout";
import ServiceSidebar from "@/components/ui/ServiceSidebar";
import { nextStep } from "@/slices/breadcrumbSlice";
import { CurrencyIcon } from "@/utils";
import ServiceSkeletonCard from "@/components/common/ServiceSkeleton";
import { useWindowSize } from "@/hooks/useWindowSize";

/* =========================
   TYPES
========================= */

interface TaxRow {
  isActive: boolean;
}

interface Service {
  id: string | number;
  name: string;
  description?: string;
  estimated_time?: number;
  min_time?: number;
  max_time?: number;
  price?: number;
  min_price?: number;
  max_price?: number;
  qty?: number;
  taxRows?: TaxRow[];
}

interface Category {
  id: string | number;
  name: string;
  services: Service[];
}

interface Professional {
  name?: string;
}

interface BookingState {
  outletData: unknown;
}

interface ServiceState {
  categories: Category[];
  selectedCategory: Category | null;
  selectedServices: Service[];
  selectedProfessional: Professional | null;
  loading: boolean;
}

interface RootState {
  booking: BookingState;
  service: ServiceState;
}

/* =========================
   ANIMATION
========================= */

const cardVariants = {
  hidden: {
    opacity: 0,
    transform: "translateY(14px)",
  },
  visible: (index: number) => ({
    opacity: 1,
    transform: "translateY(0px)",
    transition: {
      delay: index * 0.05,
      duration: 0.32,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
  exit: {
    opacity: 0,
    transform: "translateY(8px)",
    transition: { duration: 0.2 },
  },
};

export default function ServicesPage() {
  const dispatch = useDispatch<any>();

  const { width } = useWindowSize();

  const { outletData } = useSelector((state: RootState) => state.booking);

  const hasFetched = useRef<boolean>(false);

  const {
    categories,
    selectedCategory,
    selectedServices,
    selectedProfessional,
    loading,
  } = useSelector((state: RootState) => state.service);

  const allServices = categories.flatMap((cat) => cat.services);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");

  const baseServices = selectedCategory
    ? selectedCategory.services
    : allServices;

  const servicesToShow = baseServices.filter((svc) => {
    const term = searchTerm.toLowerCase();

    return (
      svc.name?.toLowerCase().includes(term) ||
      svc.description?.toLowerCase().includes(term)
    );
  });

  const hasActiveTax = (svc: Service) => {
    return svc.taxRows?.some((tax) => tax.isActive);
  };

  useEffect(() => {
    if (hasFetched.current) return;

    const tenantId = localStorage.getItem("tenantId");
    const outletId = localStorage.getItem("outletId");

    if (!tenantId || !outletId) return;

    dispatch(fetchServiceData({ tenantId, outletId }));

    const hasVisited = sessionStorage.getItem("services_visited");

    if (!hasVisited) {
      sessionStorage.setItem("services_visited", "true");
    }

    hasFetched.current = true;
  }, [dispatch]);

  const totalPrice = selectedServices.reduce((sum, s) => {
    const price = Number(s.price || s.min_price || 0);

    return sum + price * (s.qty || 0);
  }, 0);

  return (
    <MainLayout
      sidebar={
        <ServiceSidebar
          selectedServices={selectedServices}
          outletData={outletData}
          totalPrice={totalPrice}
          goToStep={(data: string) => dispatch(nextStep(data))}
        />
      }
      renderButton={
        <button
          onClick={() => dispatch(nextStep("professionals"))}
          disabled={!selectedServices.length}
          className="cta-btn p-3! px-8.5! text-sm relative rounded-full bg-ink text-white hover:text-white border-none font-dm font-bold tracking-[1.5px] uppercase cursor-pointer transition-all duration-200 disabled:bg-[#ccc] disabled:cursor-not-allowed"
        >
          <span>Choose Professional</span>
        </button>
      }
    >
      <Breadcrumb activePage="services" />

      <div className="mt-5">
        <h1 className="font-bebas text-xl md:text-2xl lg:text-4xl">
          Choose a Service
        </h1>

        <p className="text-sm text-black/60 mb-6">
          Select from {selectedProfessional?.name}'s available services
        </p>

        <div className="w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_200px] gap-4 items-start">
          <div
            ref={scrollRef}
            onWheel={(e) => {
              if (scrollRef.current) {
                scrollRef.current.scrollLeft += e.deltaY;
              }
            }}
            className="flex flex-nowrap gap-2 lg:mb-4 overflow-x-auto no-scrollbar max-w-full"
          >
            <button
              onClick={() => dispatch(setCategory(null))}
              className={`px-4 py-2 text-xs cursor-pointer border rounded whitespace-nowrap ${
                !selectedCategory
                  ? "bg-red text-white"
                  : "bg-white border-border hover:border-red/80 hover:text-red transition"
              }`}
            >
              All Services (
              {categories.reduce((sum, c) => sum + c.services.length, 0)})
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => dispatch(setCategory(cat))}
                className={`px-4 py-2 text-xs cursor-pointer border rounded whitespace-nowrap ${
                  selectedCategory?.id === cat.id
                    ? "bg-red text-white"
                    : "bg-white border-border hover:border-red/80 hover:text-red transition"
                }`}
              >
                {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)} (
                {cat.services.length})
              </button>
            ))}
          </div>

          <div className="mb-4 flex items-center">
            <div className="relative w-full max-w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} />
              </span>

              <input
                id="search"
                name="search"
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                className="w-full border border-border rounded-md pl-9 pr-10 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black/20"
              />

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="h-[calc(100dvh-315px)] lg:h-[calc(100dvh-270px)] max-md:h-[calc(100dvh-310px)] overflow-y-auto no-scrollbar pb-20 lg:pb-4">
          <div className="w-full grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-2.5">
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <ServiceSkeletonCard key={i} />
              ))
            ) : (
              <AnimatePresence mode="popLayout">
                {servicesToShow?.map((svc, index) => {
                  const isSelected = selectedServices.some(
                    (s) => s.id === svc.id,
                  );

                  return (
                    <motion.div
                      key={svc.id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      custom={index}
                      layout="position"
                      style={{
                        willChange: "transform, opacity",
                      }}
                      onClick={() => {
                        const exists = selectedServices.find(
                          (s) => s.id === svc.id,
                        );

                        if (exists && exists.qty === 1) {
                          dispatch(decrementService(svc.id));
                        } else {
                          dispatch(toggleService(svc));
                        }
                      }}
                      className={[
                        "service-card relative border-[1.5px] rounded-md p-3 cursor-pointer transition-all",
                        isSelected
                          ? "bg-[#fff8f8] border-red"
                          : "bg-white border-border hover:border-red/80",
                      ].join(" ")}
                    >
                      {hasActiveTax(svc) && (
                        <span className="absolute top-0 left-0 text-[10px] px-2 py-0.5 bg-green-600 text-white rounded-br-md rounded-tl-md">
                          TAX
                        </span>
                      )}

                      {isConsentRequiredService(svc) && (
                        <span className="absolute top-0 right-0 text-[10px] px-2 py-0.5 bg-red text-white rounded-bl-md rounded-tr-md">
                          CONSENT
                        </span>
                      )}

                      <p className="font-bold text-sm mb-1 mt-2 line-clamp-1">
                        {svc.name}
                      </p>

                      <div className="relative group">
                        <p className="text-xs text-muted line-clamp-1">
                          {svc.description}
                        </p>

                        {svc.description?.length > 25 && (
                          <div className="absolute hidden group-hover:block bg-surface text-xs p-2 rounded top-full mt-1 z-10 w-52">
                            {svc.description}
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-black/80 mb-2 flex justify-between mt-1">
                        {svc.estimated_time
                          ? `${svc.estimated_time} min`
                          : `${svc.min_time}-${svc.max_time} min`}

                        <span className="font-mono flex flex-row items-center">
                          <CurrencyIcon size={12} />

                          {svc.price
                            ? svc.price
                            : `${svc.min_price}-${svc.max_price}`}
                        </span>
                      </p>

                      <div className="flex items-center justify-between gap-2 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(decrementService(svc.id));
                          }}
                          className="w-10 h-8 p-2 rounded-md cursor-pointer border border-gray-300 flex items-center justify-center hover:bg-stone-100 transition-all duration-200"
                        >
                          <Minus size={14} />
                        </button>

                        <span className="text-sm font-semibold min-w-5 text-center">
                          {selectedServices.find((s) => s.id === svc.id)?.qty ||
                            0}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();

                            const exists = selectedServices.find(
                              (s) => s.id === svc.id,
                            );

                            if (!exists) {
                              dispatch(toggleService(svc));
                            } else {
                              dispatch(incrementService(svc.id));
                            }
                          }}
                          className="w-10 h-8 p-2 rounded-md cursor-pointer bg-red text-white flex items-center justify-center hover:bg-red/90 transition-all duration-200"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
