import { useEffect, useState, ComponentType, JSX } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import ProfessionalServicePage from "@/components/steps/ProfessionalServicePage";
import Professionals from "@/components/steps/Professionals";
import ServiceProfessionalPage from "@/components/steps/ServiceProfessionalPage";
import ServicesPage from "@/components/steps/ServicesPage";
import TimePage from "@/components/steps/TimePage";
import ConfirmPage from "@/components/steps/ConfirmPage";
import DetailsPage from "@/components/steps/DetailsPage";
import SuccessPage from "@/components/steps/SuccessPage";
import NotFoundPage from "@/components/common/NotFoundPage";
import LoaderPage from "@/components/common/LoaderPage";
import { initBooking } from "@/slices/bookingSlice";
import { setServiceMode } from "@/slices/breadcrumbSlice";
import { AppDispatch, RootState } from "@/store"; // adjust path as needed
import { StepKey, PageMap, Outlet } from "@/types";


interface DefaultAppointmentProps {
  outletDetails: Outlet;
}

// ─── AppContent ───────────────────────────────────────────────────────────────

function AppContent({ outletDetails }: { outletDetails: Outlet }): JSX.Element {
  const { currentStep, isService } = useSelector(
    (state: RootState) => state.breadcrumbs
  );
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState<boolean>(true);
  // const [isInvalid, setIsInvalid] = useState<boolean>(false);

  const PAGE_MAP: PageMap = {
    services: isService ? ServicesPage : ServiceProfessionalPage,
    professionals: isService ? Professionals : ProfessionalServicePage,
    time: TimePage,
    details: DetailsPage,
    confirm: ConfirmPage,
    success: SuccessPage,
    notfound: NotFoundPage,
  };

  if (loading) {
    return <LoaderPage />;
  }

  // if (isInvalid) {
  //   return <NotFoundPage />;
  // }

  const PageComponent: ComponentType =
    PAGE_MAP[currentStep as StepKey] ?? NotFoundPage;

  return (
    <div className="h-screen flex flex-col bg-canvas text-copy overflow-hidden">
      <div className="flex-1 relative">
        <div key={currentStep} className="h-full animate-fade-in">
          <PageComponent />
        </div>
      </div>
    </div>
  );
}

export default function DefaultAppointment({
  outletDetails,
}: DefaultAppointmentProps): JSX.Element {
  return (
    <AppContent outletDetails={outletDetails} />
  );
}