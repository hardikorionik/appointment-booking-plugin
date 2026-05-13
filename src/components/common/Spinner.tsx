import { JSX } from "react";

export default function Spinner(): JSX.Element {
    return (
        <div className="flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-btn-bg-hover border-t-transparent rounded-full animate-spin" />
        </div>
    );
}