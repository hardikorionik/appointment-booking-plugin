import { useMemo, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence, Variants } from "framer-motion";

import { getUserName } from "@/utils";
import { setSelectedDate } from "@/slices/slotSlice";
import { nextStep } from "@/slices/breadcrumbSlice";
import { toggleProfessional } from "@/slices/serviceSlice";
import { useWindowSize } from "@/hooks/useWindowSize";
import { calculateServiceTax } from "@/utils/taxHelper";

import MainLayout from "@/components/common/MainLayout";
import ProfessionalSidebar from "@/components/sidebar/ProfessionalSidebar";
import Breadcrumb from "@/components/common/Breadcrumb";
import ProfessionalSkeletonCard from "@/components/common/ProfessionalSkeletonCard";

import type { RootState, AppDispatch } from "@/store";

import type { ServiceItem, Staff, StaffServiceAssignment, Step } from "@/types";

interface SelectedStaffService extends ServiceItem {
  tax: number;
  duration: number;
  estimated_time?: number | null;
  min_time?: number | null;
  min_price?: string | number | null;
}

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

export default function Professionals() {
  const dispatch = useDispatch<AppDispatch>();

  const { width } = useWindowSize();

  const { staff, selectedServices, selectedProfessional, loading } =
    useSelector((state: RootState) => state.service);

  const [showEmpty, setShowEmpty] = useState<boolean>(false);

  const selectedServiceIds = selectedServices.map((s: ServiceItem) => s.id);

  const selectedStaffServices: SelectedStaffService[] = useMemo(() => {
    if (!selectedProfessional?.id) return [];

    const staffMember = staff.find(
      (s: Staff) => s.id === selectedProfessional.id,
    );

    if (!staffMember) return [];

    return selectedServices.map((svc: ServiceItem) => {
      const assignment = staffMember.assignments.find(
        (a: StaffServiceAssignment) => a.id === svc.id,
      );

      const updatedSvc = {
        ...svc,
        price: assignment?.price || svc.price || svc.min_price || 0,
        duration:
          assignment?.duration || svc.estimated_time || svc.min_time || 0,
      };

      return {
        ...updatedSvc,
        tax: calculateServiceTax(updatedSvc),
      };
    });
  }, [selectedProfessional, staff, selectedServices]);

  const totalTax = selectedStaffServices.reduce(
    (sum: number, s: SelectedStaffService) => sum + s.tax,
    0,
  );

  const totalPrice = selectedStaffServices.reduce(
    (sum: number, s: SelectedStaffService) => sum + Number(s.price) * s.qty,
    0,
  );

  const totalDuration = selectedStaffServices.reduce(
    (sum: number, s: SelectedStaffService) => sum + s.duration * s.qty,
    0,
  );

  const filteredStaff = useMemo(() => {
    if (!selectedServiceIds.length) return [];

    return staff.filter((member: Staff) =>
      selectedServiceIds.every((serviceId: string) =>
        member.assignments.some(
          (a: StaffServiceAssignment) => a.id === serviceId && a.assigned,
        ),
      ),
    );
  }, [staff, selectedServiceIds]);

  const isMobile = width < 768;

  const hasServicesSelected = selectedServiceIds.length > 0;

  useEffect(() => {
    if (!loading && hasServicesSelected && filteredStaff.length === 0) {
      const t = setTimeout(() => setShowEmpty(true), 300);

      return () => clearTimeout(t);
    } else {
      setShowEmpty(false);
    }
  }, [loading, hasServicesSelected, filteredStaff]);

  return (
    <MainLayout
      sidebar={
        <ProfessionalSidebar
          pro={selectedProfessional}
          selectedStaffServices={selectedStaffServices}
          totalTax={totalTax}
          totalPrice={totalPrice}
          totalDuration={totalDuration}
          goToStep={(data: Step) => dispatch(nextStep(data))}
        />
      }
    >
      <Breadcrumb />

      <div className="mt-5">
        <h1 className="font-bebas text-xl md:text-2xl lg:text-4xl">
          Choose a Professional
        </h1>

        <p className="text-sm text-black/60 mb-4">
          Available based on selected services
        </p>

        <AnimatePresence mode="wait">
          {showEmpty && (
            <motion.p
              key="no-staff"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.25 }}
              className="text-sm text-red-500"
            >
              No staff available for selected services
            </motion.p>
          )}
        </AnimatePresence>

        <div className="h-[calc(100dvh-210px)] max-md:h-[calc(100dvh-200px)] overflow-y-auto no-scrollbar pb-20 lg:pb-4">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(195px,1fr))] gap-3">
            {loading ? (
              Array.from({ length: 10 }).map((_, index: number) => (
                <ProfessionalSkeletonCard key={`skeleton-${index}`} />
              ))
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredStaff.map((p: Staff, index: number) => {
                  return (
                    <motion.div
                      key={p.id}
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
                        dispatch(toggleProfessional(p));
                        dispatch(setSelectedDate(null));

                        if (isMobile) {
                          dispatch(nextStep("time"));
                        }
                      }}
                      className={`pro-card border border-border rounded-sm p-4 cursor-pointer transition flex items-center gap-4 ${
                        selectedProfessional?.id === p.id
                          ? "border-red bg-[#fff8f8]"
                          : "bg-white hover:border-red"
                      }`}
                    >
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                          style={{
                            background: p.color || "#111",
                          }}
                        >
                          {getUserName(p.name)}
                        </div>
                      )}

                      <div>
                        <p className="font-semibold text-sm">{p.name}</p>

                        <p className="text-xs text-gray-500">{p.staff_type}</p>
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
