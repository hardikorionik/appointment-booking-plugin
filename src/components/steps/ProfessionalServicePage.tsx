import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence, Variants } from "framer-motion";

import { getUserName } from "@/utils";

import { nextStep } from "@/slices/breadcrumbSlice";
import { setSelectedDate } from "@/slices/slotSlice";
import { toggleProfessional } from "@/slices/serviceSlice";

import { useWindowSize } from "@/hooks/useWindowSize";

import Breadcrumb from "@/components/common/Breadcrumb";
import MainLayout from "@/components/common/MainLayout";
import ProfessionalSidebar from "../sidebar/ProfessionalSidebar";

import { ServiceState, Staff } from "@/types";

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

  /* =========================
     STAFF LEAVE HANDLER
  ========================= */

  const getLeaveInfo = (professional: any) => {
    if (!professional?.futureLeaveDates?.length) {
      return {
        isOnLeave: false,
        availableFrom: null,
      };
    }

    const today = new Date();

    const activeLeave = professional.futureLeaveDates.find((leave: any) => {
      if (leave.status !== "APPROVED" || leave.leaveType !== "FULL_DAY")
        return false;

      const startDate = new Date(leave.startDate);

      const endDate = new Date(leave.endDate);

      return today >= startDate && today <= endDate;
    });

    if (!activeLeave?.returnDate?.date) {
      return {
        isOnLeave: false,
        availableFrom: null,
      };
    }

    const formattedAvailableDate = new Date(
      activeLeave.returnDate.date,
    ).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return {
      isOnLeave: true,
      availableFrom: formattedAvailableDate,
    };
  };

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
        <h1 className="aaravpos-page-title">Choose a Professional</h1>

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
                const { isOnLeave, availableFrom } = getLeaveInfo(p);

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
                    className={`aaravpos-pro-card ${
                      selectedProfessional?.id === p.id ? "active" : ""
                    }`}
                  >
                    <div className="aaravpos-display-flex">
                      {/* Avatar */}
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="aaravpos-pro-image"
                        />
                      ) : (
                        <div
                          className="aaravpos-pro-avatar"
                          style={{
                            background: p.color || "#111",
                          }}
                        >
                          {getUserName(p.name)}
                        </div>
                      )}

                      {/* Staff Info */}
                      <div className="aaravpos-pro-info">
                        <p className="aaravpos-pro-name">{p.name}</p>

                        <p className="aaravpos-pro-type">{p.staff_type}</p>
                      </div>
                    </div>

                    {/* Available From */}
                    {isOnLeave && availableFrom && (
                      <div className="aaravpos-available-badge">
                        <span className="aaravpos-available-dot" />

                        <p className="aaravpos-available-text">
                          Available from {availableFrom}
                        </p>
                      </div>
                    )}
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
