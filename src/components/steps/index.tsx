import { ComponentType, JSX, useEffect } from "react";
import { useSelector, } from "react-redux";
import ProfessionalServicePage from "@/components/steps/ProfessionalServicePage";
import Professionals from "@/components/steps/Professionals";
import ServiceProfessionalPage from "@/components/steps/ServiceProfessionalPage";
import ServicesPage from "@/components/steps/ServicesPage";
import TimePage from "@/components/steps/TimePage";
import ConfirmPage from "@/components/steps/ConfirmPage";
import DetailsPage from "@/components/steps/DetailsPage";
import SuccessPage from "@/components/steps/SuccessPage";
import NotFoundPage from "@/components/common/NotFoundPage";
import { RootState } from "@/store"; // adjust path as needed
import { StepKey, PageMap } from "@/types";

function AppContent(): JSX.Element {
  const { currentStep } = useSelector(
    (state: RootState) => state.breadcrumbs
  );
  const { isService } = useSelector(
    (state: RootState) => state.outletDetails
  );

  const PAGE_MAP: PageMap = {
    services: isService ? ServicesPage : ServiceProfessionalPage,
    professionals: isService ? Professionals : ProfessionalServicePage,
    time: TimePage,
    details: DetailsPage,
    confirm: ConfirmPage,
    success: SuccessPage,
    notfound: NotFoundPage,
  };

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

export default function DefaultAppointment(): JSX.Element {
  return (
    <AppContent />
  );
}