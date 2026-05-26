import type { JSX } from "react";

export default function SlotSkeleton(): JSX.Element {
    return (
        <div className="aaravpos-timeslot-skeleton-wrapper">
            {Array.from({ length: 3 }).map((_, sectionIndex) => (
                <div key={sectionIndex} className="aaravpos-timeslot-skeleton-card">
                    <div className="aaravpos-timeslot-header">
                        <div className="aaravpos-timeslot-icon"></div>
                        <div className="aaravpos-timeslot-title"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}