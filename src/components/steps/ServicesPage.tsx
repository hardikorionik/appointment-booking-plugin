import { useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Minus, Plus, X } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  setCategory,
  toggleService,
  incrementService,
  decrementService,
} from "@/slices/serviceSlice";
import Breadcrumb from "@/components/common/Breadcrumb";
import MainLayout from "@/components/common/MainLayout";
import ServiceSidebar from "@/components/sidebar/ServiceSidebar";
import ServiceSkeletonCard from "@/components/common/ServiceSkeleton";
import { isConsentRequiredService } from "@/services";
import { nextStep } from "@/slices/breadcrumbSlice";
import { CurrencyIcon } from "@/utils";
import { OutletRootState , Service, ServiceItem, TaxRow } from "@/types";

const cardVariants: Variants = {
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

type ViewType = "supercategory" | "standalone";

export default function ServicesPage() {
  const dispatch = useDispatch();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const {
    superCategories,
    standaloneCategories,
    selectedCategory,
    selectedServices,
    loading,
  } = useSelector((state: any) => state.service);
  const { outletName } = useSelector(
    (state: OutletRootState) => state?.outletDetails,
  );

  const [viewType, setViewType] = useState<ViewType>("supercategory");

  const [selectedSuperCategory, setSelectedSuperCategory] = useState<any>(null);

  const [selectedSubCategory, setSelectedSubCategory] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const allStandaloneServices = standaloneCategories.flatMap(
    (cat: any) => cat.services,
  );

  const standaloneServices = selectedCategory
    ? selectedCategory.services
    : allStandaloneServices;

  // SUPER CATEGORY SERVICES

  const superCategoryServices = useMemo(() => {
    if (!selectedSubCategory) return [];

    return selectedSubCategory.services || [];
  }, [selectedSubCategory]);

  // FINAL SERVICES
  const baseServices =
    viewType === "standalone" ? standaloneServices : superCategoryServices;

  const servicesToShow = baseServices.filter((svc: any) => {
    const term = searchTerm.toLowerCase();

    return (
      svc.name?.toLowerCase().includes(term) ||
      svc.description?.toLowerCase().includes(term)
    );
  });

  const hasActiveTax = (svc: Service): boolean => {
    return svc.taxRows?.some((tax: TaxRow) => tax.isActive) || false;
  };

  // const mapServiceToItem = (svc: any): Omit<ServiceItem, "qty"> => ({
  //   ...svc,
  //   price: svc.price !== null ? Number(svc.price) : undefined,
  // });

  const totalPrice = selectedServices.reduce((sum: number, s: ServiceItem) => {
    const price = Number(s.price || 0);

    return sum + price * s.qty;
  }, 0);

  return (
    <MainLayout
      sidebar={
        <ServiceSidebar
          selectedServices={selectedServices}
          totalPrice={totalPrice}
          goToStep={(data: string) => dispatch(nextStep())}
        />
      }
      renderButton={
        <button
          onClick={() => dispatch(nextStep())}
          disabled={!selectedServices.length}
          className="cta-btn p-3 px-8 text-sm relative rounded-full bg-ink text-white hover:text-white border-none font-bold tracking-[1.5px] uppercase cursor-pointer transition-all duration-200 disabled:bg-[#ccc] disabled:cursor-not-allowed"
        >
          Choose Professional
        </button>
      }
    >
      <Breadcrumb />

      <div className="mt-5">
        {/* HEADER */}

        <h1 className="font-bebas text-2xl lg:text-4xl uppercase">
          Book A Service
        </h1>

        <p className="text-sm text-black/60 mb-6">
          Select from {outletName} Outlet's available services
        </p>

        {/* SWITCH */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 lg:gap-8 mb-5 border-b border-black/40">
          <div className="flex items-end gap-8 ">
            <button
              onClick={() => {
                setViewType("supercategory");
                setSelectedSubCategory(null);
                setSelectedSuperCategory(null);
              }}
              className={`text-xs uppercase tracking-[2px] font-semibold cursor-pointer pb-4 transition-all ${
                viewType === "supercategory"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-black/40 hover:text-black border-b-2 border-transparent"
              }`}
            >
              Super Category
            </button>

            <button
              onClick={() => {
                setViewType("standalone");
              }}
              className={`text-xs uppercase tracking-[2px] font-semibold cursor-pointer pb-4 transition-all ${
                viewType === "standalone"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-black/40 hover:text-black border-b-2 border-transparent"
              }`}
            >
              Standalone
            </button>
          </div>

          {/* SEARCH */}
          <div className="pb-2">
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} />
              </span>

              <input
                id="search"
                name="search"
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-black/30 rounded-md pl-9 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black/20 w-full"
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

        {/* SUPER CATEGORY UI */}
        {viewType === "supercategory" && (
          <>
            {/* SUPER CATEGORY CARDS */}
            <div
              ref={scrollRef}
              onWheel={(e) => {
                if (scrollRef.current) {
                  scrollRef.current.scrollLeft += e.deltaY;
                }
              }}
              className="flex flex-nowrap gap-2 overflow-x-auto no-scrollbar w-full mb-3 border border-black/20 p-1"
            >
              {superCategories.map((superCat: any) => (
                <button
                  key={superCat.id}
                  onClick={() => {
                    setSelectedSuperCategory(superCat);

                    setSelectedSubCategory(superCat?.categories?.[0] || null);
                  }}
                  className={`border text-left py-3 px-4 transition-all cursor-pointer min-w-fit ${
                    selectedSuperCategory?.id === superCat.id
                      ? "border-red-300 bg-red-50/50"
                      : "border-black/30 bg-white hover:border-red/50"
                  }`}
                >
                  <h3 className="font-medium text-sm mb-1 font-serif">
                    {superCat.name}
                  </h3>

                  <p className="text-[10px] uppercase tracking-[1px] font-semibold text-black/60">
                    {superCat?.categories?.length || 0} Sub Categories
                  </p>
                </button>
              ))}
            </div>

            {/* SUB CATEGORIES */}

            {selectedSuperCategory && (
              <div
                ref={scrollRef}
                onWheel={(e) => {
                  if (scrollRef.current) {
                    scrollRef.current.scrollLeft += e.deltaY;
                  }
                }}
                className="flex flex-nowrap gap-2 overflow-x-auto no-scrollbar w-full mb-5"
              >
                <button
                  onClick={() => dispatch(setCategory(null))}
                  className={`px-4 py-2 text-xs border whitespace-nowrap transition-all cursor-pointer ${
                    !selectedSubCategory
                      ? "bg-black text-white border-black"
                      : "bg-white border-border hover:border-black"
                  }`}
                >
                  All Services (
                  {selectedSuperCategory?.categories?.reduce(
                    (sum: number, c: any) => sum + c.services.length,
                    0,
                  )}
                  )
                </button>
                {selectedSuperCategory?.categories?.map((subCat: any) => (
                  <button
                    key={subCat.id}
                    onClick={() => setSelectedSubCategory(subCat)}
                    className={`px-4 py-2 text-xs border whitespace-nowrap transition-all cursor-pointer ${
                      selectedSubCategory?.id === subCat.id
                        ? "bg-black text-white border-black"
                        : "bg-white border-border hover:border-black"
                    }`}
                  >
                    {subCat.name}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* STANDALONE CATEGORY UI */}
        {viewType === "standalone" && (
          <div className="flex flex-col lg:flex-row gap-4 items-start mb-4">
            <div
              ref={scrollRef}
              onWheel={(e) => {
                if (scrollRef.current) {
                  scrollRef.current.scrollLeft += e.deltaY;
                }
              }}
              className="flex flex-nowrap gap-2 overflow-x-auto no-scrollbar w-full"
            >
              <button
                onClick={() => dispatch(setCategory(null))}
                className={`px-4 py-2 text-xs border whitespace-nowrap transition-all cursor-pointer ${
                  !selectedCategory
                    ? "bg-black text-white border-black"
                    : "bg-white border-border hover:border-black"
                }`}
              >
                All Services (
                {standaloneCategories.reduce(
                  (sum: number, c: any) => sum + c.services.length,
                  0,
                )}
                )
              </button>

              {standaloneCategories.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => dispatch(setCategory(cat))}
                  className={`px-4 py-2 text-xs border whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory?.id === cat.id
                      ? "bg-black text-white border-black"
                      : "bg-white border-border hover:border-black"
                  }`}
                >
                  {cat.name} ({cat.services.length})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SERVICES */}
        <div className="h-[calc(100dvh-315px)] lg:h-[calc(100dvh-270px)] overflow-y-auto no-scrollbar pb-20 lg:pb-4">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3">
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <ServiceSkeletonCard key={i} />
              ))
            ) : (
              <AnimatePresence mode="popLayout">
                {servicesToShow?.map((svc: any, index: number) => {
                  const isSelected = selectedServices.some(
                    (s: any) => s.id === svc.id,
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
                      style={{ willChange: "transform, opacity" }}
                      onClick={() => {
                        const exists = selectedServices.find(
                          (s: any) => s.id === svc.id,
                        );

                        if (exists && exists.qty === 1) {
                          dispatch(decrementService(String(svc.id)));
                        } else {
                          dispatch(toggleService(svc));
                        }
                      }}
                      className={[
                        "relative border rounded-md p-3 cursor-pointer transition-all bg-white",
                        isSelected
                          ? "border-red-400/80 bg-red-50/50"
                          : "border-black/30 hover:border-red/80",
                      ].join(" ")}
                    >
                      {/* TAX */}
                      {hasActiveTax(svc) && (
                        <span className="absolute top-0 left-0 text-[9px] px-2 py-0.5 bg-green-700 text-white rounded-br-md rounded-tl-md">
                          TAX
                        </span>
                      )}

                      {/* CONSENT */}
                      {isConsentRequiredService(svc) && (
                        <span className="absolute top-0 right-0 text-[9px] px-2 py-0.5 bg-black/80 text-white rounded-bl-md rounded-tr-md">
                          CONSENT
                        </span>
                      )}

                      {/* NAME */}
                      <p className="font-bold text-sm mb-1 mt-3 line-clamp-1 uppercase">
                        {svc.name}
                      </p>

                      {/* DESCRIPTION */}
                      <div className="relative group">
                        <p className="text-xs font-semibold text-black/50 line-clamp-1">
                          {svc.description}
                        </p>

                        {svc.description?.length > 30 && (
                          <div className="absolute hidden group-hover:block bg-neutral-100 text-xs p-2 rounded top-3 mt-1 z-10 w-52">
                            {svc.description}
                          </div>
                        )}
                      </div>

                      {/* PRICE */}
                      <p className="text-xs font-semibold text-black/80 mb-2 flex justify-between mt-2">
                        <span>
                          {svc.estimated_time
                            ? `${svc.estimated_time} min`
                            : `${svc.min_time}-${svc.max_time} min`}
                        </span>

                        <span className="font-mono flex items-center gap-1">
                          <CurrencyIcon size={12} />

                          {svc.price
                            ? svc.price
                            : `${svc.min_price}-${svc.max_price}`}
                        </span>
                      </p>

                      {/* ACTIONS */}
                      <div className="flex items-center justify-start mt-4 border border-gray-300 max-w-fit">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();

                            dispatch(decrementService(String(svc.id)));
                          }}
                          className="w-10 h-8 flex items-center justify-center hover:bg-stone-100 transition-all"
                        >
                          <Minus size={14} />
                        </button>

                        <span className="text-sm font-semibold min-w-5 w-10 h-8 border-x border-gray-300 text-center flex items-center justify-center">
                          {selectedServices.find((s: any) => s.id === svc.id)
                            ?.qty || 0}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();

                            const exists = selectedServices.find(
                              (s: any) => s.id === svc.id,
                            );

                            if (!exists) {
                              dispatch(toggleService(svc));
                            } else {
                              dispatch(incrementService(String(svc.id)));
                            }
                          }}
                          className="w-10 h-8 bg-red-600 text-white flex items-center justify-center hover:bg-red-600/80 transition-all"
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
