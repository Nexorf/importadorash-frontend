import { Link } from "react-router-dom";
import {
    Mail,
    Phone,
    MessageCircle,
    ArrowUpRight,
    Facebook,
    Instagram,
    Twitter,
    Youtube,
} from "lucide-react";

const PHONE_DISPLAY = "098 703 9983";
const PHONE_INTL = "+593987039983";
const EMAIL = "ventas@importadorash.com";
const HOURS = "08h00 – 19h00";

export default function Footer() {
    const year = new Date().getFullYear();
    const waUrl = `https://wa.me/${PHONE_INTL.replace(/\D/g, "")}?text=${encodeURIComponent(
        "Hola 👋, me interesa su catálogo y quisiera más información."
    )}`;

    return (
        <footer className="relative mt-16 text-white">
            <div
                aria-hidden
                className="pointer-events-none absolute -top-10 left-0 right-0 h-10"
                style={{
                    background:
                        "radial-gradient(80% 120% at 50% 120%, transparent 50%, rgba(118,61,242,0.35) 55%, transparent 60%)",
                    maskImage:
                        "radial-gradient(120% 100% at 50% 0%, black 60%, transparent 61%)",
                    WebkitMaskImage:
                        "radial-gradient(120% 100% at 50% 0%, black 60%, transparent 61%)",
                }}
            />

            <div
                className="relative overflow-hidden"
                style={{
                    background: "linear-gradient(160deg, #6F34F2 0%, #8A45F2 45%, #A885F2 100%)",
                }}
            >
                <div className="pointer-events-none absolute -left-24 -top-28 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
                <div className="pointer-events-none absolute -right-28 -bottom-28 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-10"
                    style={{
                        background:
                            "radial-gradient(1px 1px at 10% 20%, #fff 20%, transparent 21%), radial-gradient(1px 1px at 80% 70%, #fff 20%, transparent 21%), radial-gradient(1px 1px at 30% 80%, #fff 20%, transparent 21%)",
                        backgroundSize: "120px 120px, 140px 140px, 160px 160px",
                    }}
                />

                <div className="mx-auto w-full max-w-7xl px-6 py-14 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
                        {/* Marca + contacto */}
                        <div className="relative rounded-2xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-[#6F34F2] font-extrabold shadow-sm">
                                    IS
                                </div>
                                <div>
                                    <div className="text-lg font-semibold leading-tight tracking-tight">
                                        Importsite SH
                                    </div>
                                    <div className="text-sm text-white/85">Atención 100% online</div>
                                </div>
                            </div>

                            <p className="mt-4 max-w-xs text-sm text-white/90">
                                Productos de calidad y atención ágil. Horario: <strong>{HOURS}</strong>.
                            </p>

                            <ul className="mt-5 space-y-2 text-sm">
                                <li className="group flex items-start gap-2">
                                    <Mail className="mt-0.5 h-4 w-4 opacity-90" />
                                    <a
                                        href={`mailto:${EMAIL}`}
                                        className="underline decoration-white/30 underline-offset-2 transition hover:decoration-transparent hover:opacity-100"
                                    >
                                        {EMAIL}
                                    </a>
                                </li>

                                <li className="group flex items-start gap-2">
                                    <Phone className="mt-0.5 h-4 w-4 opacity-90" />
                                    <a
                                        href={`tel:${PHONE_INTL.replace(/\D/g, "")}`}
                                        className="underline decoration-white/30 underline-offset-2 hover:decoration-transparent"
                                    >
                                        {PHONE_DISPLAY}
                                    </a>
                                </li>

                                <li className="group flex items-start gap-2">
                                    <MessageCircle className="mt-0.5 h-4 w-4 opacity-90" />
                                    <a
                                        href={waUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="underline decoration-white/30 underline-offset-2 hover:decoration-transparent"
                                    >
                                        WhatsApp
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Empresa */}
                        <nav aria-label="Empresa" className="lg:col-span-1">
                            <h3 className="text-sm font-semibold tracking-wide text-white/95">Empresa</h3>
                            <ul className="mt-4 space-y-3 text-sm text-white/90">
                                <li>
                                    <Link
                                        className="group inline-flex items-center gap-1 rounded px-1 py-0.5 transition hover:-translate-y-0.5 hover:text-white"
                                        to="/about"
                                    >
                                        Acerca de nosotros
                                        <ArrowUpRight className="h-3.5 w-3.5 opacity-70 transition group-hover:translate-x-0.5" />
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        className="group inline-flex items-center gap-1 rounded px-1 py-0.5 transition hover:-translate-y-0.5 hover:text-white"
                                        to="/catalogue"
                                    >
                                        Catálogo
                                        <ArrowUpRight className="h-3.5 w-3.5 opacity-70 transition group-hover:translate-x-0.5" />
                                    </Link>
                                </li>
                            </ul>
                        </nav>

                        {/* Ayuda */}
                        <nav aria-label="Ayuda" className="lg:col-span-1">
                            <h3 className="text-sm font-semibold tracking-wide text-white/95">Ayuda</h3>
                            <ul className="mt-4 space-y-3 text-sm text-white/90">
                                <li>
                                    <Link
                                        className="group inline-flex items-center gap-1 rounded px-1 py-0.5 transition hover:-translate-y-0.5 hover:text-white"
                                        to="/contact"
                                    >
                                        Contacto
                                        <ArrowUpRight className="h-3.5 w-3.5 opacity-70 transition group-hover:translate-x-0.5" />
                                    </Link>
                                </li>
                                <li>
                                    <a
                                        className="group inline-flex items-center gap-1 rounded px-1 py-0.5 transition hover:-translate-y-0.5 hover:text-white"
                                        href={waUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Soporte por WhatsApp
                                        <ArrowUpRight className="h-3.5 w-3.5 opacity-70 transition group-hover:translate-x-0.5" />
                                    </a>
                                </li>
                            </ul>
                        </nav>

                        {/* CTA */}
                        <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur-sm">
                            <p className="text-sm/6 text-white/90">
                                ¿Dudas sobre stock o importaciones a medida? Escríbenos y te asesoramos en minutos.
                            </p>
                            <a
                                href={waUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg白/15 px-3 py-2 text-sm font-medium ring-1 ring-inset ring-white/25 transition hover:bg-white/20"
                            >
                                Hablar con un asesor
                                <ArrowUpRight className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    <div className="mt-10 h-px w-full bg-white/20" />

                    {/* bottom bar */}
                    <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <p className="text-xs text-white/85">© {year} Importsite SH. Todos los derechos reservados.</p>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-4 text-white/85">
                                <a href="#" aria-label="Facebook" className="transition hover:scale-110 hover:text-white">
                                    <Facebook className="h-5 w-5" />
                                </a>
                                <a href="#" aria-label="Instagram" className="transition hover:scale-110 hover:text-white">
                                    <Instagram className="h-5 w-5" />
                                </a>
                                <a href="#" aria-label="X" className="transition hover:scale-110 hover:text-white">
                                    <Twitter className="h-5 w-5" />
                                </a>
                                <a href="#" aria-label="YouTube" className="transition hover:scale-110 hover:text-white">
                                    <Youtube className="h-5 w-5" />
                                </a>
                            </div>

                            <a
                                href="https://nexorf.com"
                                target="_blank"
                                rel="noreferrer"
                                className="group inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-xs ring-1 ring-white/20 transition hover:bg-white/15"
                            >
                                Powered by <span className="font-semibold">Nexorf</span>
                                <ArrowUpRight className="h-3.5 w-3.5 opacity-70 transition group-hover:translate-x-0.5" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
