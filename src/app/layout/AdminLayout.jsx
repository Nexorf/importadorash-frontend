import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/store/auth";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    TooltipProvider,
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";

/* lucide-react */
import {
    Menu,
    X,
    Boxes,
    BarChart3,
    Settings,
    LogOut,
    Search,
    ChevronLeft,
    User2,
} from "lucide-react";

/* --------------------------- Links de navegación -------------------------- */
const NAV = [
    { to: "/admin/products", label: "Productos", icon: Boxes },
    { to: "/admin/categories", label: "Categorias", icon: Settings },
    { to: "/admin/reports", label: "Reportes", icon: BarChart3 },
];

/* ------------------------------- Componente ------------------------------- */
export default function AdminLayout() {
    const { isAuth, logout, verify, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        verify(); // esto hará logout si está inválido
    }, [verify]);

    useEffect(() => {
        if (!loading && !isAuth) {
            navigate("/login", { replace: true });
        }
    }, [loading, isAuth, navigate]);

    useEffect(() => {
        if (!isAuth) navigate("/login");
    }, [isAuth, navigate]);

    const current = useMemo(() => {
        const f = NAV.find((n) => location.pathname.startsWith(n.to));
        return f?.label ?? "Administrador";
    }, [location.pathname]);

    const Brand = (
        <Link to="/" className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white font-bold text-[#763DF2] shadow-sm">
                IS
            </div>
            <div className="leading-tight">
                <div className="text-base font-semibold">ImportStoreSh</div>
                <div className="text-[11px] text-white/80">Panel de control</div>
            </div>
        </Link>
    );

    const NavList = ({ onItemClick }) => (
        <nav className="space-y-1">
            {NAV.map((item) => {
                const Icon = item.icon;
                return (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={onItemClick}
                        className={({ isActive }) =>
                            [
                                "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                                "border border-transparent",
                                isActive
                                    ? "bg-muted/70 ring-1 ring-border/50"
                                    : "hover:bg-muted/60 hover:border-border/40",
                            ].join(" ")
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {/* Indicador lateral */}
                                <span
                                    aria-hidden
                                    className={`absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full transition-all duration-300 ${
                                        isActive ? "h-[22px] w-[4px] opacity-100" : "h-[0px] w-[4px] opacity-0 group-hover:h-[22px] group-hover:opacity-100"
                                    }`}
                                    style={{
                                        background: "linear-gradient(180deg,#763DF2,#9450F2)",
                                    }}
                                />
                                <Icon className={`h-4.5 w-4.5 ${isActive ? "text-foreground" : "text-muted-foreground"}`} />
                                <span className="truncate">{item.label}</span>
                                {/* pill iluminación */}
                                <span className="pointer-events-none absolute inset-0 -z-[1] rounded-xl bg-primary/5 opacity-0 blur-sm transition-opacity group-hover:opacity-100" />
                            </>
                        )}
                    </NavLink>
                );
            })}
        </nav>
    );

    return (
        <TooltipProvider delayDuration={200}>
            <div className="min-h-dvh bg-background text-foreground md:grid md:grid-cols-[260px,1fr]">
                {/* Sidebar desktop */}
                <aside className="relative hidden md:flex md:flex-col md:border-r md:border-border/40 md:bg-card">
                    {/* Brand con degradado */}
                    <div
                        className="p-4 text-white"
                        style={{
                            background:
                                "linear-gradient(135deg,#763DF2 0%, #9450F2 50%, #A885F2 100%)",
                        }}
                    >
                        {Brand}
                    </div>

                    {/* Navegación con scroll suave */}
                    <ScrollArea className="flex-1 px-3 py-3">
                        <NavList />
                    </ScrollArea>

                    {/* Footer del sidebar */}
                    <div className="border-t border-border/40 p-3">
                        <Button
                            variant="outline"
                            onClick={logout}
                            className="w-full gap-2 border-border/40"
                        >
                            <LogOut className="h-4 w-4" />
                            Salir
                        </Button>
                    </div>
                </aside>

                {/* Drawer móvil */}
                <div className="md:hidden">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button
                                size="icon"
                                variant="outline"
                                className="fixed left-3 top-3 z-50 rounded-lg bg-background/80 backdrop-blur border-border/40"
                                aria-label="Abrir menú"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-80 p-0">
                            <div
                                className="flex items-center justify-between p-4 text-white"
                                style={{
                                    background:
                                        "linear-gradient(135deg,#763DF2 0%, #9450F2 50%, #A885F2 100%)",
                                }}
                            >
                                {Brand}
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setOpen(false)}
                                    className="text-white hover:bg-white/15"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                            <div className="p-3">
                                <NavList onItemClick={() => setOpen(false)} />
                                <Separator className="my-3" />
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setOpen(false);
                                        logout();
                                    }}
                                    className="w-full gap-2 border-border/40"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Salir
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Columna principal */}
                <div className="flex min-h-dvh flex-col">
                    {/* Topbar */}
                    <header className="sticky top-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur">
                        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 lg:px-6">
                            <div className="min-w-0">
                                <div className="text-xs text-muted-foreground">Administrador</div>
                                <h1 className="truncate text-lg font-semibold">{current}</h1>
                            </div>

                        </div>
                    </header>

                    {/* Contenido */}
                    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </TooltipProvider>
    );
}
