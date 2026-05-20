import { useMemo, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ChevronRight } from "lucide-react";
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
      sum + Number(s.price || s.min_price || 0) * s.qty,
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
            String(a.id) === String(serviceId) && Boolean(a?.assigned),
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

  // =========================================
  // STAFF LEAVE HANDLER
  // =========================================

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
          selectedStaffServices={selectedStaffServices}
          totalPrice={totalPrice}
          totalDuration={totalDuration}
          goToStep={() => dispatch(nextStep())}
        />
      }
      renderButton={null}
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
            {filteredStaff.map((p: Staff, index: number) => {
              const { isOnLeave, availableFrom } = getLeaveInfo(p);
              return (
                <div
                  key={index}
                  onClick={() => {
                    dispatch(toggleProfessional(p));

                    dispatch(setSelectedDate(null));

                    if (isMobile) {
                      dispatch(nextStep());
                    }
                  }}
                  className={`aaravpos-pro-card  ${selectedProfessional?.id === p.id ? "active" : ""
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

                  {/* Available From Badge */}
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
