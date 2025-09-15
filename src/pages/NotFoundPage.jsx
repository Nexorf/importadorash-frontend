// src/pages/NotFoundPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

/* lucide-react */
import { ArrowLeft, Home, ShoppingBag, Search, LifeBuoy } from "lucide-react";

export default function NotFoundPage() {
    const navigate = useNavigate();
    const [q, setQ] = useState("");

    const onSearch = (e) => {
        e?.preventDefault?.();
        const term = q.trim();
        navigate(term ? `/catalogue?q=${encodeURIComponent(term)}` : "/catalogue");
    };

    return (
        <div className="relative min-h-dvh w-full overflow-hidden bg-background">
            {/* Fondo sutil: glows + grid */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_40%_at_50%_0%,#000_20%,transparent_70%)]"
            >
                <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_20%_0%,hsl(var(--primary)/.18),transparent_35%),radial-gradient(60%_60%_at_80%_0%,hsl(var(--muted-foreground)/.15),transparent_35%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent,transparent_96%,hsl(var(--border))_97%),linear-gradient(to_bottom,transparent,transparent_96%,hsl(var(--border))_97%)] bg-[size:42px_42px] opacity-[0.12]" />
            </div>

            <div className="relative mx-auto flex min-h-dvh max-w-5xl flex-col items-center justify-center px-4 py-14">
                <div className="text-center overflow-visible">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-primary/20">
            Error 404
          </span>
                    <h1 className="mt-4 bg-gradient-to-r from-[#763DF2] via-[#9450F2] to-[#A885F2] bg-clip-text text-4xl md:text-6xl font-extrabold tracking-tight text-transparent leading-[1.15] pb-3">
                        Página no encontrada
                    </h1>
                    <p className="mt-6 text-sm text-muted-foreground md:text-base">
                        La ruta que intentas abrir no existe, fue movida o cambió de nombre.
                    </p>
                </div>

                {/* Card principal */}
                <Card className="mt-12 w-full max-w-2xl border-border/40 bg-card/90 backdrop-blur">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">¿Qué deseas hacer?</CardTitle>
                        <CardDescription>
                            Puedes volver, ir al inicio, abrir el catálogo, o buscar un producto.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Acciones rápidas */}
                        <div className="grid gap-2 sm:grid-cols-3">
                            <Button variant="outline" className="justify-center" onClick={() => navigate(-1)}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Button>
                            <Button asChild className="justify-center">
                                <Link to="/">
                                    <Home className="mr-2 h-4 w-4" />
                                    Inicio
                                </Link>
                            </Button>
                            <Button variant="secondary" asChild className="justify-center">
                                <Link to="/catalogue">
                                    <ShoppingBag className="mr-2 h-4 w-4" />
                                    Ver catálogo
                                </Link>
                            </Button>
                        </div>

                        <Separator />

                        {/* Buscador */}
                        <form onSubmit={onSearch} className="flex items-center gap-2">
                            <div className="relative w-full">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Buscar productos…"
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" className="shrink-0">
                                Buscar
                            </Button>
                        </form>

                        {/* Ayuda */}
                        <div className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/30 px-3 py-2 text-xs">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <LifeBuoy className="h-4 w-4 text-primary" />
                                ¿Necesitas asistencia?
                            </div>
                            <Link
                                to="/contact"
                                className="rounded-md px-2 py-1 text-primary underline-offset-4 hover:underline"
                            >
                                Contáctanos
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Marca pequeña */}
                <p className="mt-6 text-center text-xs text-muted-foreground">
                    © {new Date().getFullYear()} ImportStoreSh — Panel &amp; Tienda
                </p>
            </div>
        </div>
    );
}
