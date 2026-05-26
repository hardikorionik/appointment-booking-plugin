import type { JSX } from "react";

export default function OutletSkeleton(): JSX.Element {
    return (
        <div className="aaravpos-professional-skeleton-card">
            <div className="aaravpos-professional-image"></div>
            <div className="aaravpos-professional-content">
                <div className="aaravpos-professional-name"></div>
                <div className="aaravpos-professional-role"></div>
            </div>
        </div>
    );
}