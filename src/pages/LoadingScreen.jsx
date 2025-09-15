import React from "react";
import { Loader2 } from "lucide-react";

export default function LoadingScreen() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#763DF2]/10 via-background to-[#A885F2]/10">
            <div className="mb-6 flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[#763DF2] to-[#9450F2] text-white font-bold shadow-lg">
                    SH
                </div>
                <span className="text-xl font-extrabold bg-gradient-to-r from-[#763DF2] to-[#A885F2] bg-clip-text text-transparent">
          Importadora SH
        </span>
            </div>

            <Loader2 className="h-8 w-8 animate-spin text-[#763DF2]" />

            <p className="mt-4 text-sm text-muted-foreground">Cargando, por favor espera…</p>

            <div className="pointer-events-none absolute -top-20 left-10 h-40 w-40 rounded-full bg-[#763DF2]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 right-10 h-56 w-56 rounded-full bg-[#A885F2]/20 blur-3xl" />
        </div>
    );
}
