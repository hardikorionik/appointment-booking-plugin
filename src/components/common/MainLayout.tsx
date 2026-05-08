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
        <div className="h-screen flex flex-col">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_350px] lg:grid-cols-[minmax(0,1fr)_360px] overflow-hidden relative">
                <main className="p-4">
                    {children}
                    <div className="md:hidden fixed bottom-5 left-0 right-0 flex items-center justify-center z-50 px-4">
                        {isConfirm ? (
                            <button
                                onClick={handleSidebarOpen}
                                className="cta-btn p-3! px-8.5! text-sm relative rounded-full bg-ink text-white hover:text-white border-none font-dm font-bold tracking-[1.5px] uppercase cursor-pointer transition-all duration-200 disabled:bg-[#ccc] disabled:cursor-not-allowed"
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
                <aside className="hidden md:flex flex-col bg-surface border-l border-border p-4 pb-3.5 h-[calc(100dvh-68px)]">
                    {sidebar}
                </aside>
            </div>
            {isSidebarOpen && (
                <div className="fixed z-999 bottom-0 left-0 right-0 h-screen bg-white rounded-t-2xl flex flex-col animate-fade-in">
                    <div className="flex-1 md:px-6 p-4 fixed top-0 left-0 right-0 bottom-0">
                        {sidebar}
                    </div>
                </div>
            )}
        </div>
    );
}