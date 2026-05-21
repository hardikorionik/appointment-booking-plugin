import { useSelector } from "react-redux";
import { MainLayoutProps } from "@/types";

export default function MainLayout({
    children,
    sidebar,
    renderButton,
    isConfirm = false,
}: MainLayoutProps) {
    const { isOpenSidebar } = useSelector((state: any) => state.booking.theme);
    return (
        <div className="aaravpos-main-layout">
            <div className={isOpenSidebar ? "aaravpos-layout-wrapper" : ""}>
                <main className="aaravpos-main-content">
                    {children}
                    {isConfirm ? <button className="aaravpos-btn"><span>View Order</span></button> : renderButton}
                </main>
                <aside className={`aaravpos-sidebar ${isOpenSidebar ? "open" : ""}`}>{sidebar}</aside>
            </div>
            {isOpenSidebar && (
                <div className="aaravpos-sidebar-mobile">
                    <div className="aaravpos-sidebar-mobile-content">{sidebar}</div>
                </div>
            )}
        </div>
    );
}