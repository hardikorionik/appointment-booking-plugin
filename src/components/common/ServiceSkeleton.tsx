import type { JSX } from "react";

export default function ServiceSkeletonCard(): JSX.Element {
    return (
        <div className="aaravpos-skeleton-card">
            <div
                className="aaravpos-skeleton-shimmer"
                style={{
                    background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
                    animation: "shimmer 1.2s infinite",
                }}
            />
        </div>
    );
}