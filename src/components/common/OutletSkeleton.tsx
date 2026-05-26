import type { JSX } from "react";

export default function OutletSkeleton(): JSX.Element {
    return (
        <div className="aaravpos-skeleton-card">
            <div className="aaravpos-skeleton-badge"></div>
            <div className="aaravpos-skeleton-content">
                <div className="aaravpos-skeleton-title"></div>
                <div className="aaravpos-skeleton-text"></div>
            </div>
        </div>
    );
}