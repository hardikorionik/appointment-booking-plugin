import { FC, useEffect } from "react";
import landing from "@/assets/landing.webp";
import Loaderlogo from "@/assets/aaravpos-logo.png";

const LoaderPage: FC = () => {
    useEffect(() => {
        const pathname: string = window.location.pathname || "";
        const search: string = window.location.search || "";

        const API_URL: string = `https://prod.aaravpos.com/api/v1`;

        const params = new URLSearchParams(search);
        const token: string = params.get("token") || "";

        if (!token) return;

        const routeMap: Record<string, string> = {
            "/google": "/calendar/google",
            "/outlook": "/calendar/outlook",
            "/ics": "/calendar/ics",
            "/cancelAppointment": "/calendar/cancelAppointment",
        };

        const apiPath = routeMap[pathname];

        if (!apiPath) return;

        const target = `${API_URL}${apiPath}?token=${encodeURIComponent(
            token
        )}`;

        window.location.replace(target);
    }, [window.location.pathname, window.location.search]);

    return (
        <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">
            <img
                src={landing}
                alt="background"
                className="absolute inset-0 w-full h-full object-cover scale-110 blur-[3px]"
            />
            <div className="absolute inset-0 bg-black/70" />
            <div className="absolute inset-0 bg-linear-to-br from-black via-black/40 to-black/90" />
            <div className="absolute w-125 h-125 bg-red-500/20 blur-[140px] rounded-full -top-25 -left-25 animate-pulse" />
            <div className="absolute w-100 h-100 bg-orange-500/20 blur-[120px] rounded-full -bottom-20 -right-20 animate-pulse" />
            <div className="relative z-10 flex flex-col items-center justify-center gap-6 px-8 py-10">
                <div className="relative flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-white/20 border-t-red-500 rounded-full animate-spin"></div>
                </div>
                <div className="relative z-10 flex flex-col items-center justify-center gap-5">
                    <div className="relative flex items-center justify-center">
                        <div className="absolute w-48 h-48 bg-white/10 blur-3xl rounded-full animate-pulse"></div>
                        <img
                            src={Loaderlogo}
                            alt="Logo"
                            className="relative w-44 h-auto animate-pulse"
                        />
                    </div>
                    <div className="text-center">
                        <p className="text-white text-lg tracking-wide font-semibold">
                            Processing your request...
                        </p>
                        <p className="text-white/50 text-sm mt-1">
                            Please wait a moment
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoaderPage;