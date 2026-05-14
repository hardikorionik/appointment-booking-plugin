import { MainLayoutProps } from "@/types";

export default function MainLayout({
    children,
    sidebar,
    renderButton,
    isConfirm = false,
    handleSidebarOpen,
    isSidebarOpen = false,
}: MainLayoutProps) {
    return (
        <div className="aaravpos-main-layout">
            <div className="aaravpos-layout-wrapper">
                <main className="aaravpos-main-content">
                    {children}
                    <div className="aaravpos-mobile-button">
                        {isConfirm ? (
                            <button
                                onClick={handleSidebarOpen}
                                className="aaravpos-view-order-btn"
                            >
                                <span>
                                    View Order
                                </span>
                            </button>
                        ) : (
                            renderButton
                        )}
                    </div>
                </main>
                <aside className="aaravpos-sidebar">
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