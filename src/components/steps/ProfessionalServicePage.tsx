import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { getUserName } from "@/utils";
import { nextStep } from "@/slices/breadcrumbSlice";
import { setSelectedDate } from "@/slices/slotSlice";
import { toggleProfessional } from "@/slices/serviceSlice";
import { useWindowSize } from "@/hooks/useWindowSize";
import Breadcrumb from "@/components/common/Breadcrumb";
import MainLayout from "@/components/common/MainLayout";
import ProfessionalServiceSidebar from "@/components/sidebar/ProfessionalServiceSidebar";
import {
  ServiceState,
  Staff,
} from "@/types";

/* =========================
   ROOT STATE TYPE
========================= */

interface RootState {
  service: ServiceState;
}

/* =========================
   ANIMATION
========================= */
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

export default function ProfessionalServicePage() {
  const { width } = useWindowSize();

  const dispatch = useDispatch<any>();

  const { staff, selectedProfessional } = useSelector(
    (state: RootState) => state.service,
  );


  const isMobile = width < 768;

  const showEmpty = (!staff || staff.length === 0);

  return (
    <MainLayout
      sidebar={
        <ProfessionalServiceSidebar
          pro={selectedProfessional}
          goToStep={() => dispatch(nextStep())}
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
        <div className="h-[calc(100dvh-210px)] max-md:h-[calc(100dvh-200px)] overflow-y-auto scrollbar-none pb-20 lg:pb-4">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(195px,1fr))] gap-3">
            <AnimatePresence mode="popLayout">
              {staff?.map((p: Staff, index: number) => {
                return (
                  <motion.div
                    key={p.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    custom={index}
                    layout="position"
                    style={{ willChange: "transform, opacity" }}
                    onClick={() => {
                      dispatch(toggleProfessional(p));

                      dispatch(setSelectedDate(null));

                      if (isMobile) {
                        dispatch(nextStep());
                      }
                    }}
                    className={`pro-card border border-border rounded-sm p-4 cursor-pointer transition flex items-center gap-4 ${selectedProfessional?.id === p.id
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
                        style={{ background: p.color || "#111" }}
                      >
                        {getUserName(p.name)}
                      </div>
                    )}

                    <div>
                      <p className="font-semibold text-sm">{p.name}</p>

                      <p className="text-xs text-gray-500">
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