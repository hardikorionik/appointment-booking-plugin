import { useSelector } from "react-redux";
import { MainLayoutProps, OutletRootState } from "@/types";

export default function MainLayout({
    children,
    sidebar,
    renderButton,
    isConfirm = false,
    isSidebarOpen = false,
    handleSidebarOpen,
}: MainLayoutProps) {
    const { selectedServices, selectedProfessional } = useSelector(
        (state: OutletRootState) => state.booking.service,
    );
    const isDesktopSidebarOpen = selectedServices?.length > 0 || !!selectedProfessional?.id;
    return (
        <div className="aaravpos-main-layout">
            <div className={isDesktopSidebarOpen ? "aaravpos-layout-wrapper" : ""}>
                <main className="aaravpos-main-content">
                    {children}
                    {isConfirm ? <button className="aaravpos-btn" onClick={handleSidebarOpen}><span>View Order</span></button> : renderButton}
                </main>
                <aside className={`aaravpos-sidebar ${isDesktopSidebarOpen ? "open" : ""}`}>{sidebar}</aside>
            </div>
            {isSidebarOpen && (
                <div className="aaravpos-sidebar-mobile">
                    <div className="aaravpos-sidebar-mobile-content">{sidebar}</div>
                </div>
            )}
        </div>
    );
}