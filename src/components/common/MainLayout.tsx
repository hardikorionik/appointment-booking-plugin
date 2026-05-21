import { useSelector } from "react-redux";
import { MainLayoutProps, OutletRootState } from "@/types";

export default function MainLayout({
    children,
    sidebar,
    renderButton,
    isConfirm = false,
    isSidebarOpen = false
}: MainLayoutProps) {
    const { selectedServices, selectedProfessional } = useSelector(
        (state: OutletRootState) => state.booking.service,
    );

    const isOpen = selectedServices?.length > 0 || !!selectedProfessional?.id;

    return (
        <div className="aaravpos-main-layout">
            <div className="aaravpos-layout-wrapper ">
                <main className="aaravpos-main-content">
                    {children}

                    {isConfirm ? (
                        <button className="aaravpos-btn">
                            <span>View Order</span>
                        </button>
                    ) : (
                        renderButton
                    )}
                </main>

                <aside
                    className={`aaravpos-barber-sidebar ${isOpen ? "open" : ""}`}
                >
                    {sidebar}
                </aside>
            </div>
            {isSidebarOpen && (
                <div className="aaravpos-barber-sidebar-mobile">
                    <div className="aaravpos-barber-sidebar-mobile-content">
                        {sidebar}
                    </div>
                </div>
            )}
        </div>
    );
}