import { ChevronRight, Clock3, Package2 } from "lucide-react";
import { useSelector } from "react-redux";
import { getUserName, CurrencyIcon } from "@/utils";
import { Staff, Step, Service, OutletRootState } from "@/types";
import { RootState } from "@/store";

interface SelectedStaffService extends Service {
  qty: number;
  duration?: number;
  tax?: number;
}

interface ProfessionalSidebarProps {
  pro: Staff | null;
  selectedStaffServices?: SelectedStaffService[];
  totalPrice?: number;
  totalDuration?: number;
  goToStep: (step: Step) => void;
}

const ProfessionalSidebar = ({
  pro,
  selectedStaffServices = [],
  totalPrice = 0,
  totalDuration = 0,
  goToStep,
}: ProfessionalSidebarProps) => {
  const { outletName } = useSelector(
    (state: OutletRootState) => state.outletDetails,
  );

  const { isService } = useSelector((state: RootState) => state.outletDetails);

  const hasServices = selectedStaffServices.length > 0;

  return (
    <div className="aaravpos-order-sidebar">
      <div className="aaravpos-order-header">
        <p className="aaravpos-order-title">
          Your Order
        </p>
        <p className="aaravpos-order-subtitle">
          {outletName || "-"} Outlet
        </p>
      </div>
      <div className="aaravpos-order-sidebar">
        <div className="aaravpos-order-body">
          {/* Professional */}
          {pro?.id && (
            <>
              <p className="text-sm font-semibold my-1.5 text-black/40 uppercase">
                Selected Professional
              </p>
              <div className="aaravpos-pro-card aaravpos-mb-10">
                {pro.imageUrl ? (
                  <img
                    src={pro.imageUrl}
                    alt={pro.name}
                    className="aaravpos-pro-image"
                  />
                ) : (
                  <div
                    className="aaravpos-pro-avatar"
                    style={{
                      background: pro.color || "#111",
                    }}
                  >
                    {getUserName(pro.name)}
                  </div>
                )}
                <div className="aaravpos-pro-info">
                  <p className="aaravpos-pro-name">
                    {pro.name}
                  </p>
                  <p className="aaravpos-pro-type">
                    {pro.staff_type}
                  </p>
                </div>
              </div>
            </>
          )}
          {/* Services */}
          {hasServices && (
            <div className="aaravpos-margin-top-20">
              <p className="aaravpos-order-section-title">
                Selected Services
              </p>
              {selectedStaffServices?.length > 0 &&
                <ul className="aaravpos-pro-order-list">
                  {selectedStaffServices.map((svc) => (
                    <li
                      key={svc.id}
                      className="aaravpos-order-item"
                    >
                      <p className="aaravpos-order-service-name">
                        {svc.name}
                      </p>
                      <div className="aaravpos-order-details">
                        <div className="aaravpos-order-detail">
                          <Package2 size={13} />
                          <span>{svc.qty}</span>
                        </div>
                        {/* Duration */}
                        <div className="aaravpos-order-detail center">
                          <Clock3 size={13} />
                          <span>{svc.min_time || svc.estimated_time} min</span>
                        </div>
                        <p className="aaravpos-order-detail right">
                          <CurrencyIcon size={12} />
                          {svc.price || svc.min_price}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>}
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="aaravpos-order-footer">
          {/* Totals */}
          {hasServices && (
            <>
              <div className="aaravpos-order-subtotal">
                <span className="aaravpos-order-subtotal-label">
                  Subtotal
                </span>
                <span className="aaravpos-order-subtotal-price">
                  <CurrencyIcon size={18} />
                  {totalPrice}
                </span>
              </div>
              <div className="aaravpos-order-subtotal">
                <span className="aaravpos-order-subtotal-label">
                  Duration
                </span>
                <span className="aaravpos-order-subtotal-price">
                  {totalDuration} mins
                </span>
              </div>
            </>
          )}
          {/* Button */}
          <button
            disabled={isService ? !selectedStaffServices.length : !pro}
            onClick={() => goToStep("time")}
            className="aaravpos-common-btn"
          >
            <span className="aaravpos-common-btn-content">
              {isService ? "Choose Time" : "Choose Services"}
              <ChevronRight size={16} />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalSidebar;
