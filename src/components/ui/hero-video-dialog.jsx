"use client";

import { useState } from "react";
import { Play, XIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const animationVariants = {
    "from-bottom": { initial: { y: "100%", opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: "100%", opacity: 0 } },
    "from-center": { initial: { scale: 0.5, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.5, opacity: 0 } },
    "from-top": { initial: { y: "-100%", opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: "-100%", opacity: 0 } },
    "from-left": { initial: { x: "-100%", opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: "100%", opacity: 0 } },
    "from-right": { initial: { x: "100%", opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: "100%", opacity: 0 } },
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
    "top-in-bottom-out": { initial: { y: "-100%", opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: "100%", opacity: 0 } },
    "left-in-right-out": { initial: { x: "-100%", opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: "100%", opacity: 0 } },
};

export function HeroVideoDialog({
                                    animationStyle = "from-center",
                                    videoSrc,
                                    thumbnailSrc,
                                    thumbnailAlt = "Video thumbnail",
                                    className,
                                }) {
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const selectedAnimation = animationVariants[animationStyle];

    return (
        <div className={cn("relative", className)}>
            {/* Trigger */}
            <button
                type="button"
                aria-label="Play video"
                className="group relative block w-full cursor-pointer overflow-hidden rounded-xl border border-border/40 bg-transparent p-0"
                onClick={() => setIsVideoOpen(true)}
            >
                <img
                    src={thumbnailSrc}
                    alt={thumbnailAlt}
                    width={1920}
                    height={1080}
                    className="aspect-[16/9] w-full rounded-xl object-cover shadow-lg transition-all duration-300 ease-out group-hover:brightness-90"
                />
                <div className="absolute inset-0 rounded-xl bg-black/10 transition-colors duration-300 group-hover:bg-black/20" />
                <div className="absolute inset-0 grid place-items-center">
                    <div className="flex items-center justify-center rounded-full bg-primary/15 p-2 backdrop-blur-md">
                        <div className="flex items-center justify-center rounded-full bg-gradient-to-b from-primary/40 to-primary p-3 shadow-md transition-transform duration-200 ease-out group-hover:scale-105">
                            <Play className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>
            </button>

            {/* Modal */}
            <AnimatePresence>
                {isVideoOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Escape" || e.key === "Enter" || e.key === " ") setIsVideoOpen(false);
                        }}
                        onClick={() => setIsVideoOpen(false)}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            {...selectedAnimation}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative mx-2 md:mx-6 aspect-video w-[min(95vw,80rem)] max-w-7xl"
                        >
                            {/* Scrim superior para contraste del botón */}
                            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 rounded-t-2xl bg-gradient-to-b from-black/50 to-transparent" />

                            {/* Botón cerrar siempre por encima del iframe */}
                            <button
                                type="button"
                                onClick={() => setIsVideoOpen(false)}
                                className="absolute right-3 top-3 z-[70] inline-flex items-center gap-2 rounded-full bg-neutral-900/70 px-3 py-2 text-white ring-1 ring-white/20 backdrop-blur-md hover:bg-neutral-900/80 dark:bg-neutral-100/80 dark:text-black"
                            >
                                <XIcon className="h-5 w-5" />
                                <span className="text-xs font-medium">Cerrar</span>
                            </button>

                            {/* Contenedor del video debajo en z-order */}
                            <div className="relative z-0 size-full overflow-hidden rounded-2xl ring-1 ring-white/20 shadow-2xl">
                                <iframe
                                    src={videoSrc}
                                    title="Hero Video player"
                                    className="size-full"
                                    allowFullScreen
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
