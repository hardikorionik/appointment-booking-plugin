import type { JSX } from "react";
import landing from "@/assets/landing.webp";

export default function NotFoundPage(): JSX.Element {
    return (
        <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">
            <img
                src={landing}
                alt="background"
                className="absolute inset-0 w-full h-full object-cover scale-105 blur-[2px]"
            />

            <div className="absolute inset-0 bg-black/60" />

            <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/20 to-black/80" />

            <div className="absolute w-100 h-100 bg-purple-500/20 blur-[120px] rounded-full top-10 left-10 animate-pulse" />

            <div className="absolute w-75 h-75 bg-pink-500/20 blur-[100px] rounded-full bottom-10 right-10 animate-pulse" />

            <div className="relative z-10 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 sm:p-12 text-center max-w-xl w-[90%]">
                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold text-white tracking-widest drop-shadow-lg">
                    404
                </h1>

                <p className="mt-4 text-lg sm:text-xl text-white/80">
                    Oops! The page you’re looking for doesn’t exist.
                </p>

                <p className="mt-2 text-sm text-white/60">
                    It might have been removed, renamed, or you entered an
                    invalid flow.
                </p>
            </div>
        </div>
    );
}