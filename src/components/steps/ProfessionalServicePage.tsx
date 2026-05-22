import { useSelector, useDispatch } from "react-redux";
import { getUserName } from "@/utils";
import { nextStep } from "@/slices/breadcrumbSlice";
import { setSelectedDate } from "@/slices/slotSlice";
import { toggleProfessional } from "@/slices/serviceSlice";
import Breadcrumb from "@/components/common/Breadcrumb";
import MainLayout from "@/components/common/MainLayout";
import ProfessionalSidebar from "../sidebar/ProfessionalSidebar";
import { ServiceState, Staff } from "@/types";

interface RootState {
  booking: {
    service: ServiceState;
  }
}
export default function ProfessionalServicePage() {
  const dispatch = useDispatch<any>();
  const { staff, selectedProfessional } = useSelector(
    (state: RootState) => state.booking.service,
  );
  const showEmpty = !staff || staff.length === 0;
  const getLeaveInfo = (professional: any) => {
    if (!professional?.futureLeaveDates?.length) {
      return { isOnLeave: false, availableFrom: null };
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

    const formattedAvailableDate = new Date(activeLeave.returnDate.date).toLocaleDateString("en-GB", {
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
        {showEmpty && (
          <p className="aaravpos-no-staff">
            No staff available for selected services
          </p>
        )}
        <div className="aaravpos-staff-wrapper">
          <div className="aaravpos-staff-grid">
            {staff?.map((p: Staff, index: number) => {
              const { isOnLeave, availableFrom } = getLeaveInfo(p);
              return (
                <div
                  key={index}
                  onClick={() => {
                    dispatch(toggleProfessional(p));
                    dispatch(setSelectedDate(null));
                    dispatch(nextStep())
                  }}
                  className={`aaravpos-pro-card ${selectedProfessional?.id === p.id ? "active" : ""}`}
                >
                  <div className="aaravpos-display-flex">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="aaravpos-pro-image" />
                    ) : (
                      <div className="aaravpos-pro-avatar" style={{ background: p.color || "#111", }}>
                        {getUserName(p.name)}
                      </div>
                    )}
                    <div className="aaravpos-pro-info">
                      <p className="aaravpos-pro-name">{p.name}</p>
                      <p className="aaravpos-pro-type">{p.staff_type}</p>
                    </div>
                  </div>
                  {isOnLeave && availableFrom && (
                    <div className="aaravpos-available-badge">
                      <span className="aaravpos-available-dot" />
                      <p className="aaravpos-available-text">
                        Available from {availableFrom}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout >
  );
}
