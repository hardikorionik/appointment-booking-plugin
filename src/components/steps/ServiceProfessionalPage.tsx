import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Minus, Plus, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

import {
  setCategory,
  toggleService,
  incrementService,
  decrementService,
} from "@/slices/serviceSlice";

import Breadcrumb from "@/components/common/Breadcrumb";
import MainLayout from "@/components/common/MainLayout";
import ServiceProfessionalSidebar from "@/components/sidebar/ServiceSidebar";
import ServiceSkeletonCard from "@/components/common/ServiceSkeleton";

import { nextStep } from "@/slices/breadcrumbSlice";
import { isConsentRequiredService } from "@/services";
import { CurrencyIcon } from "@/utils";

import type { AppDispatch } from "@/store";

import type { Service, ServiceItem, TaxRow, StaffAssignment } from "@/types";

/* ANIMATION */

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
  },

  visible: (index: number) => ({
    opacity: 1,
    y: 0,

    transition: {
      delay: index * 0.05,
      duration: 0.15,
      ease: [0.22, 1, 0.36, 1],
    },
  }),

  exit: {
    opacity: 0,
    y: 8,

    transition: {
      duration: 0.2,
    },
  },
};

type ViewType = "supercategory" | "standalone";

/* COMPONENT */

export default function ServiceProfessionalPage() {
  const dispatch = useDispatch<AppDispatch>();

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const {
    superCategories,
    standaloneCategories,
    selectedCategory,
    selectedServices,
    selectedProfessional,
    loading,
  } = useSelector((state: any) => state.service);

  const [viewType, setViewType] = useState<ViewType>("supercategory");

  const [selectedSuperCategory, setSelectedSuperCategory] = useState<any>(null);

  const [selectedSubCategory, setSelectedSubCategory] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");

  /* ASSIGNED IDS */

  const assignedServiceIds = new Set(
    selectedProfessional
      ? selectedProfessional?.assignments?.map((a: StaffAssignment) => a.id)
      : [],
  );

  const assignedCategoryIds = new Set(
    selectedProfessional
      ? selectedProfessional?.assignments?.map(
        (a: StaffAssignment) => a.categoryId,
      )
      : [],
  );

  // FILTER STANDALONE CATEGORIES
  const filteredStandaloneCategories = standaloneCategories
    .map((category: any) => ({
      ...category,
      services:
        category.services?.filter((service: Service) =>
          assignedServiceIds.has(service.id),
        ) || [],
    }))
    .filter(
      (category: any) =>
        assignedCategoryIds.has(category.id) && category.services.length > 0,
    );

  // FILTER SUPER CATEGORIES
  const filteredSuperCategories = superCategories
    .map((superCat: any) => ({
      ...superCat,
      categories:
        superCat.categories
          ?.map((category: any) => ({
            ...category,
            services:
              category.services?.filter((service: Service) =>
                assignedServiceIds.has(service.id),
              ) || [],
          }))
          .filter(
            (category: any) =>
              assignedCategoryIds.has(category.id) &&
              category.services.length > 0,
          ) || [],
    }))
    .filter((superCat: any) => superCat.categories.length > 0);

  const hasStandaloneServices = filteredStandaloneCategories.length > 0;

  const hasSuperCategoryServices = filteredSuperCategories.length > 0;

  useEffect(() => {
    if (!hasSuperCategoryServices && hasStandaloneServices) {
      setViewType("standalone");
    }

    if (!hasStandaloneServices && hasSuperCategoryServices) {
      setViewType("supercategory");
    }
  }, [hasStandaloneServices, hasSuperCategoryServices]);

  /* STANDALONE SERVICES */
  const allStandaloneServices = filteredStandaloneCategories?.flatMap(
    (cat: any) => cat.services,
  );

  const standaloneServices = selectedCategory
    ? selectedCategory.services
    : allStandaloneServices;

  /* SUPER CATEGORY SERVICES */

  const superCategoryServices = useMemo(() => {
    if (!selectedSuperCategory) return [];

    if (!selectedSubCategory) {
      return selectedSuperCategory.categories?.flatMap(
        (cat: any) => cat.services || [],
      );
    }

    return selectedSubCategory.services || [];
  }, [selectedSuperCategory, selectedSubCategory]);

  /* BASE SERVICES */

  const baseServices =
    viewType === "standalone" ? standaloneServices : superCategoryServices;

  /* ALL SERVICES */

  const allServices = useMemo(() => {
    const standalone = filteredStandaloneCategories?.flatMap(
      (cat: any) => cat.services || [],
    );

    const superCategory = filteredSuperCategories?.flatMap((superCat: any) =>
      superCat.categories?.flatMap((cat: any) => cat.services || []),
    );

    return [...standalone, ...superCategory];
  }, [filteredStandaloneCategories, filteredSuperCategories]);

  /* FILTERED SERVICES */

  const servicesToShow = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (term) {
      return allServices.filter((svc: any) => {
        return (
          svc.name?.toLowerCase().includes(term) ||
          svc.description?.toLowerCase().includes(term)
        );
      });
    }

    return baseServices;
  }, [searchTerm, allServices, baseServices]);

  /* TAX */

  const hasActiveTax = (svc: Service): boolean => {
    return svc.taxRows?.some((tax: TaxRow) => tax.isActive) || false;
  };

  /* TOTAL */

  const totalPrice = selectedServices.reduce((sum: number, s: ServiceItem) => {
    const price = Number(s.price || 0);

    return sum + price * s.qty;
  }, 0);

  /* DEFAULT SUPER CATEGORY */

  useEffect(() => {
    if (
      viewType === "supercategory" &&
      filteredSuperCategories?.length > 0 &&
      !selectedSuperCategory
    ) {
      const firstSuperCategory = filteredSuperCategories[0];

      setSelectedSuperCategory(firstSuperCategory);

      setSelectedSubCategory(null);
    }
  }, [viewType, filteredSuperCategories, selectedSuperCategory]);

  return (
    <MainLayout
      sidebar={
        <ServiceProfessionalSidebar
          selectedServices={selectedServices}
          totalPrice={totalPrice}
          goToStep={() => dispatch(nextStep())}
        />
      }
      renderButton={
        <button
          onClick={() => dispatch(nextStep())}
          disabled={!selectedServices.length}
          className="aaravpos-btn" >
          <span className="aaravpos-btn-content">
            Choose Time <ChevronRight size={16} />
          </span>
        </button>
      }
    >
      <Breadcrumb />
      <div className="aaravpos-margin-top-20">
        {/* HEADER */}
        <h1 className="aaravpos-page-title">
          Choose a Service
        </h1>
        <p className="aaravpos-sub-title">
          Select from {selectedProfessional?.name}'s available services
        </p>
        {/* SWITCH */}
        <div className="aaravpos-topbar">
          <div className="aaravpos-tab-group">
            <button
              onClick={() => {
                if (!hasSuperCategoryServices) return;
                setViewType("supercategory");
                setSelectedSubCategory(null);
                setSelectedSuperCategory(null);
              }}
              className={`aaravpos-tab-btn ${viewType === "supercategory"
                ? "active"
                : "inactive"
                }`}
            >
              Super Category
            </button>
            <button
              onClick={() => {
                if (!hasStandaloneServices) return;
                setViewType("standalone");
              }}
              className={`aaravpos-tab-btn ${viewType === "standalone"
                ? "active"
                : "inactive"
                } ${hasStandaloneServices ? "aaravpos-tab-enabled" : "aaravpos-tab-disabled"}`}
            >
              Standalone
            </button>
          </div>
          {/* SEARCH */}
          <div className="aaravpos-search-wrapper aaravpos-mb-10">
            <span className="aaravpos-search-icon">
              <Search size={14} />
            </span>
            <input
              id="search"
              name="search"
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="aaravpos-search-input"
            />
            <div className="aaravpos-search-actions">
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="aaravpos-search-clear"
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
            {filteredSuperCategories.length > 0 && <div
              ref={scrollRef}
              onWheel={(e) => {
                if (scrollRef.current) {
                  scrollRef.current.scrollLeft += e.deltaY;
                }
              }}
              className="aaravpos-supercategory-wrapper"
            >
              {filteredSuperCategories.map((superCat: any) => (
                <button
                  key={superCat.id}
                  onClick={() => {
                    setSelectedSuperCategory(superCat);

                    setSelectedSubCategory(null);
                  }}
                  className={`aaravpos-supercategory-btn ${selectedSuperCategory?.id === superCat.id
                    ? "active"
                    : ""
                    }`}
                >
                  <h3 className="aaravpos-supercategory-title">
                    {superCat.name}
                  </h3>
                  <p className="aaravpos-supercategory-count">
                    {superCat?.categories?.length || 0} Sub Categories
                  </p>
                </button>
              ))}
            </div>}
            {/* SUB CATEGORIES */}
            {selectedSuperCategory?.categories?.length > 0 && selectedSuperCategory && (
              <div
                ref={scrollRef}
                onWheel={(e) => {
                  if (scrollRef.current) {
                    scrollRef.current.scrollLeft += e.deltaY;
                  }
                }}
                className="aaravpos-supercategory-wrapper"
              >
                <button
                  onClick={() => setSelectedSubCategory(null)}
                  className={`aaravpos-supercategory-btn ${!selectedSubCategory ? "active" : ""
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
                    className={`aaravpos-supercategory-btn ${selectedSubCategory?.id === subCat.id
                      ? "active"
                      : ""
                      }`}
                  >
                    {subCat.name} ({subCat.services.length})
                  </button>
                ))}
              </div>
            )}
          </>
        )}
        {/* STANDALONE CATEGORY UI */}
        {viewType === "standalone" && (
          <div
            ref={scrollRef}
            onWheel={(e) => {
              if (scrollRef.current) {
                scrollRef.current.scrollLeft += e.deltaY;
              }
            }}
            className="aaravpos-supercategory-wrapper"
          >
            <button
              onClick={() => dispatch(setCategory(null))}
              className={`aaravpos-supercategory-btn ${!selectedCategory ? "active" : ""}`}
            >
              All Services (
              {filteredStandaloneCategories.reduce(
                (sum: number, c: any) => sum + c.services.length,
                0,
              )}
              )
            </button>
            {filteredStandaloneCategories.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => dispatch(setCategory(cat))}
                className={`aaravpos-supercategory-btn ${selectedCategory?.id === cat.id
                  ? "active"
                  : ""
                  }`}
              >
                {cat.name} ({cat.services.length})
              </button>
            ))}
          </div>
        )}
        {/* SERVICES */}
        <div className={`aaravpos-services-wrapper ${viewType}`}>
          <div className="aaravpos-services-grid">
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <ServiceSkeletonCard key={i} />
              ))
            ) : (
              <AnimatePresence mode="popLayout">
                {!servicesToShow?.length ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="aaravpos-empty-services"
                  >
                    <h3 className="aaravpos-empty-services-title">
                      No Services Found
                    </h3>
                    <p className="aaravpos-empty-services-text">
                      {searchTerm
                        ? "No services found for your search."
                        : "No services are available for this professional."}
                    </p>
                  </motion.div>
                ) : servicesToShow?.map((svc: any, index: number) => {
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
                      layout
                      onClick={() => {
                        const exists = selectedServices.find(
                          (s: any) => s.id === svc.id,
                        );

                        if (exists && exists.qty === 1) {
                          dispatch(decrementService(String(svc.id)));
                        } else {
                          dispatch(
                            toggleService({
                              ...svc,
                              price: svc.price ? Number(svc.price) : undefined,
                            }),
                          );
                        }
                      }}
                      className={`aaravpos-service-card ${isSelected ? "active" : ""}`}
                    >
                      {/* TAX */}
                      {hasActiveTax(svc) && (
                        <span className="aaravpos-tax-badge">
                          TAX
                        </span>
                      )}
                      {/* CONSENT */}
                      {isConsentRequiredService(svc) && (
                        <span className="aaravpos-consent-badge">
                          CONSENT
                        </span>
                      )}
                      {/* NAME */}
                      <p className="aaravpos-service-title">
                        {svc.name}
                      </p>
                      {/* DESCRIPTION */}
                      <div className="aaravpos-service-description-wrapper">
                        <p className="aaravpos-service-description">
                          {svc.description}
                        </p>
                        {svc.description?.length > 30 && (
                          <div className="aaravpos-service-tooltip">
                            {svc.description}
                          </div>
                        )}
                      </div>
                      {/* PRICE */}
                      <p className="aaravpos-service-price">
                        <span>
                          {svc.estimated_time
                            ? `${svc.estimated_time} min`
                            : `${svc.min_time}-${svc.max_time} min`}
                        </span>
                        <span className="aaravpos-service-price-right">
                          {svc.price ? (
                            <>
                              <CurrencyIcon size={14} />
                              {svc.price}
                            </>
                          ) : (
                            <>
                              <CurrencyIcon size={14} />
                              {svc.min_price} - <CurrencyIcon size={14} />
                              {svc.max_price}
                            </>
                          )}
                        </span>
                      </p>
                      {/* ACTIONS */}
                      <div className="aaravpos-service-actions">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();

                            dispatch(decrementService(String(svc.id)));
                          }}
                          className="aaravpos-service-action-btn"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="aaravpos-service-qty">
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
                              dispatch(
                                toggleService({
                                  ...svc,
                                  price: svc.price
                                    ? Number(svc.price)
                                    : undefined,
                                }),
                              );
                            } else {
                              dispatch(incrementService(String(svc.id)));
                            }
                          }}
                          className="aaravpos-service-action-btn plus"
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
    </MainLayout >
  );
}
