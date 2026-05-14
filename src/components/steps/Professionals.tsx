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
import type { RootState, AppDispatch } from "@/store";
import type {
  ServiceItem,
  Staff,
  StaffAssignment,
  StaffServiceAssignment,
} from "@/types";
import { ChevronRight } from "lucide-react";

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

  const { staff, selectedServices, selectedProfessional } = useSelector(
    (state: RootState) => state.service,
  );

  const [showEmpty, setShowEmpty] = useState<boolean>(false);

  const selectedServiceIds = selectedServices.map((s: ServiceItem) => s.id);

  const selectedStaffServices: any[] = useMemo(() => {
    if (!selectedProfessional?.id) return [];

    const staffMember = staff.find(
      (s: Staff) => s.id === selectedProfessional.id,
    );

    if (!staffMember) return [];

    return selectedServices.map((svc: ServiceItem) => {
      const assignment = staffMember?.assignments?.find(
        (a: StaffAssignment) => a.id === svc?.id,
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

  const totalPrice = selectedStaffServices.reduce(
    (sum: number, s: StaffServiceAssignment) =>
      sum + Number(s.price || 0) * s.qty,
    0,
  );

  const totalDuration = selectedStaffServices.reduce(
    (sum: number, s: StaffServiceAssignment) =>
      sum + (s?.duration || 0) * s.qty,
    0,
  );

  const filteredStaff = useMemo(() => {
    if (!selectedServiceIds.length) return [];

    return staff.filter((member: Staff) => {
      const assignments = member.assignments ?? [];

      return selectedServiceIds?.every((serviceId: string | number) =>
        assignments.some(
          (a: StaffAssignment) =>
            String(a.id) == String(serviceId) && Boolean(a?.assigned),
        ),
      );
    });
  }, [staff, selectedServiceIds]);

  const isMobile = width < 768;

  const hasServicesSelected = selectedServiceIds.length > 0;

  useEffect(() => {
    if (hasServicesSelected && filteredStaff.length === 0) {
      const t = setTimeout(() => setShowEmpty(true), 300);

      return () => clearTimeout(t);
    } else {
      setShowEmpty(false);
    }
  }, [hasServicesSelected, filteredStaff]);

  return (
    <MainLayout
      sidebar={
        <ProfessionalSidebar
          pro={selectedProfessional}
          selectedStaffServices={selectedStaffServices}
          totalPrice={totalPrice}
          totalDuration={totalDuration}
          goToStep={() => dispatch(nextStep())}
        />
      }
      renderButton={
        <button
          onClick={() => dispatch(nextStep())}
          disabled={!selectedServices.length}
          className="aaravpos-btn"
        >
          <span className="aaravpos-btn-content">
            Choose Time <ChevronRight size={16} />
          </span>
        </button>
      }
    >
      <Breadcrumb />

      <div className="mt-5">
        <h1 className="text-2xl lg:text-4xl font-black uppercase tracking-tight text-gray-900 pt-3">
          Choose a Professional
        </h1>

        <p className="text-sm text-black/60 mb-6">
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
              className="text-sm text-btn-bg/90 font-semibold"
            >
              No staff available for selected services
            </motion.p>
          )}
        </AnimatePresence>

        <div className="h-[calc(100dvh-210px)] max-md:h-[calc(100dvh-200px)] overflow-y-auto scrollbar-none pb-20 lg:pb-4">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(195px,1fr))] gap-3">
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
                        dispatch(nextStep());
                      }
                    }}
                    className={`pro-card border-2 border-black/15 rounded p-3 cursor-pointer transition flex items-center gap-4 ${selectedProfessional?.id === p.id
                      ? "border-btn-bg-hover/80 bg-btn-bg-hover/5"
                      : "bg-white hover:border-btn-bg/80"
                      }`}
                  >
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-12 h-12 rounded-lg object-cover border border-black/10"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                        style={{
                          background: p.color || "#111",
                        }}
                      >
                        {getUserName(p.name)}
                      </div>
                    )}

                    <div>
                      <p className="font-semibold text-md uppercase">
                        {p.name}
                      </p>

                      <p className="text-xs text-gray-500 uppercase">
                        {p.staff_type}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
