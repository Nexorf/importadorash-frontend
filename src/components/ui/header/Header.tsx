import {useEffect, useState} from "react";
import {Link, NavLink, useLocation, useNavigate} from "react-router-dom";
import {useCart} from "../../../store/cart";
import {useAuth} from "../../../store/auth";

const Header = () => {
    // carrito
    const items = useCart((s) => s.items);
    const count = items.reduce((a, b) => a + b.qty, 0);

    // auth
    const isAuth = useAuth((s) => s.isAuth);
    const logout = useAuth((s) => s.logout);

    // búsqueda
    const [q, setQ] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const url = new URL(window.location.href);
        setQ(url.searchParams.get("q") || "");
    }, [location.key]);

    const onSubmit = (e) => {
        e.preventDefault();
        const term = q.trim();
        navigate(term ? `/catalogue?q=${encodeURIComponent(term)}` : "/catalogue");
    };

    const isHome = location.pathname === "/";

    return (
        <header className="top-0 z-40 w-full text-white">
            <div
                style={{
                    background:
                        "linear-gradient(135deg, #763DF2 0%, #9450F2 50%, #A885F2 100%)",
                }}
                className="shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.15)]"
            >
                <div className="mx-auto max-w-7xl px-6 pt-4 pb-8 lg:px-8">
                    {/* TOP BAR */}
                    <div className="relative flex min-h-[56px] items-center justify-between">
                        {/* Marca (izquierda) */}
                        <Link to="/" className="flex items-center gap-3">
                            <div
                                className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[#763DF2] font-bold shadow-sm">
                                IS
                            </div>
                            <div className="leading-tight">
                                <div className="text-base font-semibold">ImportStoreSh</div>
                                <div className="text-[11px] text-white/80">Tu tienda de confianza</div>
                            </div>
                        </Link>

                        {/* Menú CENTRADO absoluto */}
                        <nav
                            className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 text-sm md:flex">
                            <NavLink
                                to="/catalogue"
                                className={({isActive}) =>
                                    `hover:opacity-90 ${
                                        isActive ? "font-semibold underline underline-offset-4" : "opacity-90"
                                    }`
                                }
                            >
                                Catálogo
                            </NavLink>
                            <NavLink
                                to="/contact"
                                className={({isActive}) =>
                                    `hover:opacity-90 ${
                                        isActive ? "font-semibold underline underline-offset-4" : "opacity-90"
                                    }`
                                }
                            >
                                Contacto
                            </NavLink>
                            <NavLink
                                to="/about"
                                className={({isActive}) =>
                                    `hover:opacity-90 ${
                                        isActive ? "font-semibold underline underline-offset-4" : "opacity-90"
                                    }`
                                }
                            >
                                Acerca
                            </NavLink>
                        </nav>

                        <div className="flex items-center gap-1 sm:gap-2">
                            {isAuth && (
                                <>
                                    <Link
                                        to="/admin/products"
                                        title="Panel"
                                        className="rounded-full p-2 hover:bg-white/10"
                                    >
                                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor"
                                             strokeWidth="1.8">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>
                                        </svg>
                                    </Link>
                                    <button
                                        onClick={logout}
                                        title="Salir"
                                        className="rounded-full p-2 hover:bg-white/10"
                                    >
                                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor"
                                             strokeWidth="1.8">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                            <path d="M16 17l5-5-5-5"/>
                                            <path d="M21 12H9"/>
                                        </svg>
                                    </button>
                                </>
                            )}

                            <NavLink
                                to="/basket"
                                className="relative rounded-full p-2 hover:bg-white/10"
                                aria-label={`Carrito (${count})`}
                                title="Carrito"
                            >
                                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor"
                                     strokeWidth="1.8">
                                    <circle cx="9" cy="21" r="1.5"/>
                                    <circle cx="18" cy="21" r="1.5"/>
                                    <path d="M3 3h2l2.4 12.3A2 2 0 0 0 9.4 17h7.8a2 2 0 0 0 2-1.6L21 8H7"/>
                                </svg>
                                {count > 0 && (
                                    <span
                                        className="absolute -right-1 -top-1 rounded-full bg-white px-1.5 py-[2px] text-[10px] font-semibold text-[#763DF2] shadow">
                    {count}
                  </span>
                                )}
                            </NavLink>
                        </div>
                    </div>

                    {/* HERO solo en Home */}
                    {location.pathname === "/" && (
                        <div className="relative mt-8 flex flex-col items-center text-center">
                            <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">
                                Encuentra lo que buscas
                            </h1>
                            <p className="mt-2 text-white/80">
                                Miles de productos de calidad al mejor precio
                            </p>

                            <form
                                onSubmit={onSubmit}
                                className="mx-auto mt-6 flex w-full max-w-3xl items-center rounded-2xl bg-white/95 p-2 shadow-xl ring-2 ring-white/70"
                            >
                                <div className="relative flex-1">
                                    <input
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                        placeholder="Buscar productos..."
                                        aria-label="Buscar productos"
                                        className="w-full rounded-xl bg-transparent px-10 py-3 text-[#111826] placeholder:text-[#111826]/60 outline-none"
                                    />
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#111826]/60"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                    >
                                        <circle cx="11" cy="11" r="7"/>
                                        <path d="M21 21l-4.3-4.3"/>
                                    </svg>
                                </div>
                                <button
                                    type="submit"
                                    className="ml-2 rounded-xl bg-[#763DF2] px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
                                >
                                    Buscar
                                </button>
                            </form>

                            {/* glows */}
                            <div
                                className="pointer-events-none absolute -left-24 -top-14 h-40 w-40 rounded-full bg-white/15 blur-2xl"/>
                            <div
                                className="pointer-events-none absolute -right-16 -bottom-10 h-32 w-32 rounded-full bg-white/15 blur-2xl"/>
                        </div>
                    )}
                </div>
            </div>

            <div className="h-px w-full bg-white/40"/>
        </header>
    );
};

export default Header;
