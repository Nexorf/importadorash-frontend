import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { whatsappLink } from "@/lib/whatsapp.js";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
    MessageCircle,
    ShieldCheck,
    Sparkles,
    Target,
    HeartHandshake,
    PackageCheck,
    ScrollText,
} from "lucide-react";

export default function AboutPage() {
    const name = "Importsite SH";
    const mission =
        "Conectar a proveedores globales con clientes en Ecuador mediante importaciones confiables, transparentes y seguras; ofreciendo productos de calidad a precios justos y una atención ágil que genere confianza, valor y empleo local.";
    const vision =
        "Ser la importadora referente a nivel nacional, reconocida por su excelencia operativa, estándares de calidad y servicio, e impulso a la competitividad e innovación del país.";

    const phone = "+593987039983";
    const email = "ventas@importadorash.com";
    const founded = "2004";

    const waUrl = useMemo(
        () => whatsappLink({ phone, text: "Hola 👋, quisiera más información." }),
        [phone]
    );

    const years = useMemo(() => {
        const y = parseInt(founded, 10);
        const now = new Date().getFullYear();
        return Number.isFinite(y) ? Math.max(0, now - y) : 0;
    }, [founded]);

    const historia = `
Importsite SH nació como un sueño familiar: construir un negocio basado en la confianza, el trabajo en equipo y el compromiso con nuestros clientes.
Desde el inicio, nos propusimos acercar al Ecuador productos de calidad, accesibles y confiables, que mejoren la vida de las personas.

Con esfuerzo y constancia, lo que comenzó como una idea compartida se transformó en un proyecto sólido, guiado por valores claros:
honestidad, responsabilidad y servicio. Hoy, Importsite SH es la materialización de ese sueño: una empresa que crece junto a sus clientes,
sumando variedad, innovación y calidad; siempre con la calidez y cercanía que nos caracteriza.
  `.trim();

    return (
        <div className="space-y-8">
            {/* Misión / Visión / Diferenciales */}
            <section className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <Target className="h-4 w-4 text-violet-600" />
                            Misión
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">{mission}</CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <Sparkles className="h-4 w-4 text-violet-600" />
                            Visión
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">{vision}</CardContent>
                </Card>
            </section>

            <section>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <ShieldCheck className="h-4 w-4 text-violet-600" />
                            ¿Qué nos hace diferentes?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        <ul className="list-disc space-y-1 pl-5">
                            <li>Negocio familiar con valores sólidos y trato cercano.</li>
                            <li>Selección rigurosa y control de calidad por lote.</li>
                            <li>Procesos transparentes y seguros en cada transacción.</li>
                            <li>Compromiso con el país: empleo local y desarrollo.</li>
                            <li>Atención personalizada y soluciones a medida.</li>
                        </ul>
                    </CardContent>
                </Card>
            </section>

            {/* Métricas */}
            <section className="grid gap-4 sm:grid-cols-2">
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-semibold">2k+</div>
                        <div className="text-xs text-muted-foreground">Clientes atendidos</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-semibold">97%</div>
                        <div className="text-xs text-muted-foreground">Pedidos a tiempo</div>
                    </CardContent>
                </Card>
            </section>

            {/* Lo que prometemos / Historia */}
            <section className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <PackageCheck className="h-4 w-4 text-violet-600" />
                            Lo que prometemos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                                <ScrollText className="mt-0.5 h-4 w-4" />
                                <span>Condiciones claras: precios, tiempos y garantías por escrito.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <ShieldCheck className="mt-0.5 h-4 w-4" />
                                <span>Seguridad en pagos y trazabilidad de pedidos.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <MessageCircle className="mt-0.5 h-4 w-4" />
                                <span>Respuesta rápida por WhatsApp y seguimiento postventa.</span>
                            </li>
                        </ul>
                        <Separator className="my-3" />
                        <div className="flex flex-wrap gap-2">
                            <Button asChild size="sm">
                                <Link to="/catalogue">Explorar catálogo</Link>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                                <a href={`mailto:${email}`}>Escribirnos</a>
                            </Button>
                            <Button asChild variant="ghost" size="sm" className="text-violet-700">
                                <a href={waUrl} target="_blank" rel="noreferrer">
                                    Cotizar por WhatsApp
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <HeartHandshake className="h-4 w-4 text-violet-600" />
                            Nuestra historia
                        </CardTitle>
                        <CardDescription>El origen de un sueño familiar</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-line text-sm text-muted-foreground">{historia}</p>
                    </CardContent>
                </Card>
            </section>

            {/* Modalidad */}
            <section>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Modalidad</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Operación 100% online (sin local físico por ahora)
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
