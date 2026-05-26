import type { JSX } from "react";

export default function CategoryTabsSkeleton(): JSX.Element {
    return (
        <div className="aaravpos-category-skeleton-wrapper">
            <div className="aaravpos-category-top-tabs">
                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="aaravpos-category-tab small"
                    />
                ))}
            </div>
            <div className="aaravpos-category-bottom-tabs">
                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        className="aaravpos-category-tab"
                    />
                ))}
            </div>
        </div>
    );
}