import type { JSX } from "react";

export default function ServiceSkeletonCard(): JSX.Element {
    return (
        <div className="aaravpos-service-skeleton-card">
            <div className="aaravpos-service-tax-badge"></div>
            <div className="aaravpos-service-title"></div>
            <div className="aaravpos-service-subtitle"></div>
            <div className="aaravpos-service-footer">
                <div className="aaravpos-service-duration"></div>
                <div className="aaravpos-service-price"></div>
            </div>
            <div className="aaravpos-service-qty">
                <div className="aaravpos-service-btn"></div>
                <div className="aaravpos-service-count"></div>
                <div className="aaravpos-service-btn"></div>
            </div>
        </div>
    );
}