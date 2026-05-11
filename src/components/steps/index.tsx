import { useState, ComponentType, JSX } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import ProfessionalServicePage from "@/components/pages/ProfessionalServicePage";
import Professionals from "@/components/pages/Professionals";
import ServiceProfessionalPage from "@/components/pages/ServiceProfessionalPage";
import ServicesPage from "@/components/pages/ServicesPage";
import TimePage from "@/components/pages/TimePage";
import ConfirmPage from "@/components/pages/ConfirmPage";
import DetailsPage from "@/components/pages/DetailsPage";
import SuccessPage from "@/components/pages/SuccessPage";
import NotFoundPage from "@/components/pages/NotFoundPage";
import LoaderPage from "@/components/ui/LoaderPage";
import { initBooking } from "@/slices/bookingSlice";
import { setServiceMode } from "@/slices/breadcrumbSlice";
import { AppDispatch, RootState } from "@/store"; // adjust path as needed
import { StepKey, PageMap, Outlet } from "@/types";


interface DefaultAppointmentProps {
  outletDetails: Outlet;
}
const REDIRECT_ROUTES: string[] = [
  "/google",
  "/outlook",
  "/ics",
  "/cancelAppointment",
];

// ─── AppContent ───────────────────────────────────────────────────────────────

function AppContent({ outletDetails }: { outletDetails: Outlet }): JSX.Element {
  const { currentStep, isService } = useSelector(
    (state: RootState) => state.breadcrumbs
  );
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();

  const [loading, setLoading] = useState<boolean>(true);
  const [isInvalid, setIsInvalid] = useState<boolean>(false);

  const PAGE_MAP: PageMap = {
    services: isService ? ServicesPage : ServiceProfessionalPage,
    professionals: isService ? Professionals : ProfessionalServicePage,
    time: TimePage,
    details: DetailsPage,
    confirm: ConfirmPage,
    success: SuccessPage,
    notfound: NotFoundPage,
  };

  const pathname: string = location.pathname;
  const isRedirectRoute: boolean = REDIRECT_ROUTES.includes(pathname);

  // useEffect(() => {
  //   const init = async (): Promise<void> => {
  //     if (isRedirectRoute) {
  //       setLoading(false);
  //       return;
  //     }
  //     if (!tenantId || !outletId || !ref) {
  //       setIsInvalid(true);
  //       setLoading(false);
  //       return;
  //     }
  //     try {
  //       localStorage.setItem("tenantId", tenantId);
  //       localStorage.setItem("outletId", outletId);
  //       localStorage.setItem("isService", String(isService));
  //       await dispatch(initBooking({ tenantId, outletId, ref }));
  //       await dispatch(setServiceMode(isService));
  //     } catch (err: unknown) {
  //       console.error(err);
  //       setIsInvalid(true);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   init();
  // }, [dispatch, isRedirectRoute]);

  if (isRedirectRoute) {
    return <LoaderPage />;
  }

  if (loading) {
    return <LoaderPage />;
  }

  if (isInvalid) {
    return <NotFoundPage />;
  }

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