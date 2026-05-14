import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { getUserName } from "@/utils";
import { nextStep } from "@/slices/breadcrumbSlice";
import { setSelectedDate } from "@/slices/slotSlice";
import { toggleProfessional } from "@/slices/serviceSlice";
import { useWindowSize } from "@/hooks/useWindowSize";
import Breadcrumb from "@/components/common/Breadcrumb";
import MainLayout from "@/components/common/MainLayout";
import { ServiceState, Staff } from "@/types";
import ProfessionalSidebar from "../sidebar/ProfessionalSidebar";

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

  const showEmpty = !staff || staff.length === 0;

  return (
    <MainLayout
      sidebar={
        <ProfessionalSidebar
          pro={selectedProfessional}
          goToStep={() => dispatch(nextStep())}
        />
      }
    >
      <Breadcrumb />
      <div className="aaravpos-margin-top-20">
        <h1 className="aaravpos-page-title">
          Choose a Professional
        </h1>
        <p className="aaravpos-sub-title">
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
              className="aaravpos-no-staff"
            >
              No staff available for selected services
            </motion.p>
          )}
        </AnimatePresence>
        <div className="aaravpos-staff-wrapper">
          <div className="aaravpos-staff-grid">
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
                    className={`aaravpos-pro-card ${selectedProfessional?.id === p.id
                      ? "active"
                      : ""
                      }`}
                  >
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="aaravpos-pro-image"
                      />
                    ) : (
                      <div
                        className="aaravpos-pro-avatar"
                        style={{ background: p.color || "#111" }}
                      >
                        {getUserName(p.name)}
                      </div>
                    )}
                    <div className="aaravpos-pro-info">
                      <p className="aaravpos-pro-name">{p.name}</p>
                      <p className="aaravpos-pro-type">{p.staff_type}</p>
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
