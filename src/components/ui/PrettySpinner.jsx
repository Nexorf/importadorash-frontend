import React from "react";

export default function PrettySpinner({ label = "Cargando..." }) {
    return (
        <div className="flex items-center justify-center gap-3">
            {/* aro con conic-gradient + máscara para hueco central */}
            <span
                className="inline-block h-7 w-7 animate-[spin_0.9s_linear_infinite] rounded-full
                   bg-[conic-gradient(from_0deg,theme(colors.violet.500),theme(colors.fuchsia.500),transparent_70%)]
                   [mask:radial-gradient(farthest-side,transparent_45%,black_46%)]"
                aria-hidden
            />
            <span className="text-sm text-muted-foreground">{label}</span>
        </div>
    );
}
