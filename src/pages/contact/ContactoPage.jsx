import React, { useMemo, useState } from "react";
import { whatsappLink } from "@/lib/whatsapp.js";

import { MessageCircle, Phone, Mail, Clock, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function CopyButton({ text, size = "sm" }) {
    const [copied, setCopied] = useState(false);
    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch {}
    };
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="outline" size={size} onClick={onCopy} className="gap-2">
                    <Copy className="h-4 w-4" />
                    Copiar
                </Button>
            </TooltipTrigger>
            <TooltipContent>{copied ? "¡Copiado!" : "Copiar al portapapeles"}</TooltipContent>
        </Tooltip>
    );
}

const EC_LOCAL_DISPLAY = "098 703 9983";          // cómo quieres mostrarlo
const EC_INTL = "+593987039983";                   // para WhatsApp/teléfono (sin el 0 inicial)
const BUSINESS_HOURS_LABEL = "08h00 – 19h00";      // tu horario

export default function ContactoPage() {
    const phone =  EC_INTL;
    const email = "ventas@importadorash.com";

    const waUrl = useMemo(
        () =>
            whatsappLink({
                phone,
                text: "Hola 👋, me interesa su catálogo y quisiera más información.",
            }),
        [phone]
    );

    return (
        <TooltipProvider delayDuration={150}>
            <div className="space-y-8">
                {/* HERO */}
                <section className="relative overflow-hidden rounded-2xl">
                    <div
                        className="rounded-2xl p-6 md:p-8 text-white"
                        style={{ background: "linear-gradient(135deg,#763DF2 0%,#9450F2 50%,#A885F2 100%)" }}
                    >
                        <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-white/15 blur-3xl" />
                        <div className="pointer-events-none absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

                        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">¿Hablamos?</h1>
                        <p className="mt-2 max-w-2xl text-white/90">
                            Atención online por WhatsApp, teléfono o correo. Horario: <strong>{BUSINESS_HOURS_LABEL}</strong>.
                        </p>

                        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                            <Button
                                asChild
                                size="lg"
                                className="gap-2 font-semibold text-white hover:brightness-110"
                                style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}
                            >
                                <a href={waUrl} target="_blank" rel="noreferrer">
                                    <MessageCircle className="h-5 w-5" />
                                    Hablar por WhatsApp
                                </a>
                            </Button>

                            <Button asChild variant="secondary" size="lg" className="gap-2 bg-white text-[#111826] hover:bg-white/90">
                                <a href={`tel:${phone.replace(/\D/g, "")}`}>
                                    <Phone className="h-5 w-5" />
                                    Llamar ahora
                                </a>
                            </Button>

                            <Button asChild variant="secondary" size="lg" className="gap-2 bg-white text-[#111826] hover:bg-white/90">
                                <a href={`mailto:${email}`}>
                                    <Mail className="h-5 w-5" />
                                    Escribir email
                                </a>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Tarjetas: WhatsApp/Teléfono y Correo (sin Dirección) */}
                <section className="grid gap-4 md:grid-cols-2">
                    {/* WhatsApp / Teléfono */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <MessageCircle className="h-5 w-5 text-green-600" />
                                <CardTitle className="text-base">WhatsApp / Teléfono</CardTitle>
                            </div>
                            <CardDescription>Atención rápida en horario laboral</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <a href={waUrl} target="_blank" rel="noreferrer" className="font-medium hover:underline">
                                    {EC_LOCAL_DISPLAY}
                                </a>
                                <div className="flex items-center gap-2">
                                    <CopyButton text={EC_LOCAL_DISPLAY} />
                                    <Button asChild variant="outline" size="sm" className="gap-2">
                                        <a href={waUrl} target="_blank" rel="noreferrer">
                                            Abrir chat
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </Button>
                                </div>
                            </div>
                            <Separator />
                            <p className="text-xs text-muted-foreground">
                                Si no podemos contestar, te devolvemos la llamada.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Correo */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                <CardTitle className="text-base">Correo</CardTitle>
                            </div>
                            <CardDescription>Respondemos el mismo día hábil</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <a href={`mailto:${email}`} className="break-all font-medium hover:underline">
                                    {email}
                                </a>
                                <CopyButton text={email} />
                            </div>
                            <Separator />
                            <p className="text-xs text-muted-foreground">
                                Incluye tu RUC / datos de facturación si requieres factura.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* Horarios + Cómo comprar (sin retiro en tienda) */}
                <section className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                <CardTitle className="text-base">Horarios</CardTitle>
                            </div>
                            <CardDescription>Atención 100% online</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span>Lun–Sáb</span>
                                <Badge variant="secondary" className="bg-[#F2F2F2] text-[#111826]">{BUSINESS_HOURS_LABEL}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Domingo</span>
                                <Badge variant="secondary" className="bg-[#F2F2F2] text-[#111826]">Cerrado</Badge>
                            </div>
                            <Separator className="my-2" />
                            <p className="text-xs text-muted-foreground">
                                Fuera de horario, deja tu mensaje por WhatsApp y te respondemos a la brevedad.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">¿Cómo comprar?</CardTitle>
                            <CardDescription>Rápido y sin fricción</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm">
                            <ol className="list-decimal space-y-1 pl-5">
                                <li>
                                    Explora el <a className="underline" href="/catalogue">catálogo</a> y agrega al carrito.
                                </li>
                                <li>Finaliza por WhatsApp para coordinar pago y envío.</li>
                                <li>Envío a tu ubicación o punto de encuentro acordado.</li>
                            </ol>
                            <Separator className="my-2" />
                            <p className="text-xs text-muted-foreground">
                                Atendemos también compras mayoristas. ¡Consúltanos!
                            </p>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </TooltipProvider>
    );
}
