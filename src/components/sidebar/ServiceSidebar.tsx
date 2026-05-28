import { useDispatch, useSelector } from "react-redux";
import { ChevronRight, Clock3, X, Package2 } from "lucide-react";
// Trash2
import { CurrencyIcon } from "@/utils";
import { OutletRootState, ServiceItem, Step } from "@/types";
import type { AppDispatch } from "@/store";
import { setSidebarOpen } from "@/slices/themeSlice";
// import { deleteService } from "@/slices/serviceSlice";

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
  const dispatch = useDispatch<AppDispatch>();

  const { outletName, isService } = useSelector(
    (state: OutletRootState) => state.booking?.outletDetails,
  );

  return (
    <div className="aaravpos-order-sidebar">
      <div className="aaravpos-order-header">
        <p className="aaravpos-order-title">
          Your Order
        </p>
        <p className="aaravpos-order-subtitle">
          {outletName || "-"} Outlet
        </p>
        <button className="aaravpos-sidebar-close-btn" onClick={() => dispatch(setSidebarOpen(false))}>
          <X size={18} />
        </button>
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
                {/* {selectedServices?.length > 1 && < button
                  className="aaravpos-delete-btn"
                  onClick={() => dispatch(deleteService(svc.id))}
                >
                  <Trash2 size={14} />
                </button>} */}
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
    </div >
  );
}
