import { useSelector } from "react-redux";
import { MainLayoutProps, OutletRootState } from "@/types";

export default function MainLayout({
    children,
    sidebar,
    renderButton,
    isConfirm = false,
    handleSidebarOpen,
    isSidebarOpen = false,
}: MainLayoutProps) {
    const { selectedServices, selectedProfessional } = useSelector(
        (state: OutletRootState) => state.service,
    );

    return (
        <div className="aaravpos-main-layout">
            <div className={`aaravpos-layout-wrapper ${selectedServices?.length > 0 || selectedProfessional?.id ? "with-sidebar" : ""}`}>
                <main className="aaravpos-main-content">
                    {children}
                    {isConfirm ? (
                        <button
                            onClick={handleSidebarOpen}
                            className="aaravpos-btn"
                        >
                            <span>
                                View Order
                            </span>
                        </button>
                    ) : (
                        renderButton
                    )}

                </main>
                <aside className={`aaravpos-sidebar ${isSidebarOpen ? "open" : ""}`}>
                    {sidebar}
                </aside>
            </div>
            {isSidebarOpen && (
                <div className="aaravpos-sidebar-mobile">
                    <div className="aaravpos-sidebar-mobile-content">
                        {sidebar}
                    </div>
                </div>
            )}
        </div>
    );
}