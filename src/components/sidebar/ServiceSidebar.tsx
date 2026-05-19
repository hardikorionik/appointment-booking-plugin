import { ChevronRight, Clock3, Package2 } from "lucide-react";
import { useSelector } from "react-redux";
import { CurrencyIcon } from "@/utils";
import { OutletRootState, ServiceItem, Step } from "@/types";
import { RootState } from "@/store";

interface ServiceSidebarProps {
  selectedServices: ServiceItem[];
  totalPrice: number;
  goToStep: (step: Step) => void;
}

export default function ServiceSidebar({
  selectedServices,
  totalPrice,
  goToStep,
}: ServiceSidebarProps) {
  const { outletName } = useSelector(
    (state: OutletRootState) => state?.outletDetails,
  );
  const { isService } = useSelector((state: RootState) => state.outletDetails);
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
          <p className="aaravpos-order-section-title">
            SELECTED SERVICES
          </p>
          <ul className="aaravpos-order-list">
            {selectedServices?.length > 0 && selectedServices?.map((svc) => (
              <li
                key={svc.id}
                className="aaravpos-order-item"
              >
                <div className="aaravpos-main-text">
                  <p className="aaravpos-order-service-name">
                    {svc.name}
                  </p>
                </div>
                <div className="aaravpos-order-details">
                  <div className="aaravpos-order-detail">
                    <Package2 size={13} />
                    <span>{svc.qty}</span>
                  </div>
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
          </ul>
        </div>
        <div className="aaravpos-divider" />
        <div className="aaravpos-order-footer">
          <div className="aaravpos-order-subtotal">
            <span className="aaravpos-order-subtotal-label">
              Subtotal
            </span>
            <span className="aaravpos-order-subtotal-price">
              <CurrencyIcon size={16} />
              {totalPrice}
            </span>
          </div>
          <div>
            <button
              onClick={() => goToStep("professionals")}
              disabled={!selectedServices.length}
              className="aaravpos-common-btn"
            >
              <span className="aaravpos-common-btn-content">
                {isService ? "Choose Professional" : "Choose Time"}
                <ChevronRight size={16} />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
