import { useDispatch, useSelector } from "react-redux";
import { ShoppingCart } from "lucide-react";
import { setSidebarOpen } from "@/slices/themeSlice";
import { MainLayoutProps } from "@/types";
import type { AppDispatch } from "@/store";

export default function MainLayout({
    children,
    sidebar,
    renderButton,
}: MainLayoutProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { isOpenSidebar } = useSelector((state: any) => state.booking.theme);
    const { selectedServices } = useSelector((state: any) => state.booking.service);
    return (
        <div className="aaravpos-main-layout">
            <div className={isOpenSidebar ? "aaravpos-layout-wrapper" : ""}>
                <main className="aaravpos-main-content">
                    {children}
                    {renderButton}
                </main>
                <aside className={`aaravpos-sidebar ${isOpenSidebar ? "open" : ""}`}>
                    {!isOpenSidebar &&
                        <button className="aaravpos-cart-btn" onClick={() => dispatch(setSidebarOpen(true))}>
                            <span className="aaravpos-count">{selectedServices?.length}</span>
                            <ShoppingCart size={18} />
                        </button>
                    }
                    {sidebar}
                </aside>
            </div>
            {isOpenSidebar && (
                <div className="aaravpos-sidebar-mobile">
                    <div className="aaravpos-sidebar-mobile-content">{sidebar}</div>
                </div>
            )}
        </div>
    );
}