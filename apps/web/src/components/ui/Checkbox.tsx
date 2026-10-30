import * as React from "react";
import { cn } from "@/utils/cn";

function Checkbox({
    className,
    ...props
}: React.ComponentProps<"input">) {
    return (
        <input
            type="checkbox"
            data-slot="checkbox"
            className={cn(
                "h-4 w-4 shrink-0 cursor-pointer rounded border border-input",
                "accent-[#1a3560]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                "disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        />
    );
}

export { Checkbox };