import React, {useEffect, useMemo, useState} from "react";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {useAuth} from "@/store/auth";

/* shadcn/ui */
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Checkbox} from "@/components/ui/checkbox";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {Separator} from "@/components/ui/separator";
import {Badge} from "@/components/ui/badge";

/* lucide-react */
import {ArrowUpRight, Eye, EyeOff, Loader2, Mail, ShieldCheck} from "lucide-react";

/* -------------------- Schema -------------------- */
const Schema = z.object({
    email: z.email("Email inválido"),
    password: z
        .string()
        .min(8, "Mínimo 8 caracteres")
        .regex(/[A-Z]/, "Incluye una mayúscula")
        .regex(/\d/, "Incluye un número"),
    remember: z.boolean().optional(),
});

export default function LoginPage() {
    const login = useAuth((s) => s.login);
    const isAuth = useAuth((s) => s.isAuth);
    const navigate = useNavigate();
    const location = useLocation();

    const [serverError, setServerError] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [capsOn, setCapsOn] = useState(false);

    const from = useMemo(() => {
        const st = location.state;
        return (st && st.from) || "/admin/products";
    }, [location.state]);

    const form = useForm({
        resolver: zodResolver(Schema),
        defaultValues: { email: "", password: "", remember: true },
        mode: "onTouched",
    });

    const {
        control,
        handleSubmit,
        setValue,
        formState: { isSubmitting },
    } = form;

    /* Cargar email recordado */
    useEffect(() => {
        const remembered = localStorage.getItem("remember_email");
        if (remembered) {
            setValue("email", remembered);
            setValue("remember", true);
        }
    }, [setValue]);

    useEffect(() => {
        if (isAuth) navigate(from, { replace: true });
    }, [isAuth, from, navigate]);

    const onSubmit = async (data) => {
        setServerError("");
        try {
            if (data.remember) localStorage.setItem("remember_email", data.email);
            else localStorage.removeItem("remember_email");

            await login({ username: data.email, password: data.password });
            navigate(from, { replace: true });
        } catch (e) {
            setServerError(e?.message || "No pudimos iniciar sesión. Inténtalo nuevamente.");
        }
    }

    /* -------------------- UI -------------------- */
    return (
        <div className="relative flex min-h-screen items-center justify-center px-4  bg-gradient-to-br from-[#763DF2]/10 via-background to-[#A885F2]/10">
            {/* Glow decorativo */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 overflow-hidden"
            >
                <div className="absolute -top-20 left-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute -bottom-32 right-10 h-80 w-80 rounded-full bg-[#9450F2]/20 blur-3xl" />
            </div>

            <div className="relative mx-auto grid w-full max-w-6xl gap-8 px-4 md:grid-cols-2 md:gap-12">
                {/* Lado visual */}
                <Card className="order-2 hidden border-none bg-gradient-to-br from-card to-card/70 shadow-xl md:order-1 md:flex md:flex-col">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#763DF2] to-[#9450F2] text-background text-base font-bold shadow-lg">
                                SH
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold">Importadora SH</CardTitle>
                                <CardDescription className="text-xs">Panel administrativo</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col">
                        <div className="space-y-3 text-sm text-muted-foreground">
                            <p>
                                Gestiona productos, ofertas, reportes e información de empresa desde un solo lugar.
                            </p>
                            <ul className="list-inside list-disc">
                                <li>CRUD de productos</li>
                                <li>Reportes e inventario PDF</li>
                                <li>Datos de empresa</li>
                            </ul>
                        </div>

                        <Separator className="my-6" />

                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="rounded-full bg-gradient-to-r from-[#763DF2] to-[#9450F2] text-white">Seguro</Badge>
                            <Badge variant="outline" className="rounded-full">Rendimiento</Badge>
                        </div>

                        <div className="mt-auto pt-8 text-xs text-muted-foreground">
                            ¿Necesitas ayuda? <Link to="/contact" className="underline">Contáctanos</Link>.
                        </div>
                    </CardContent>
                </Card>

                {/* Formulario */}
                <Card className="order-1 border-none bg-card/90 shadow-lg backdrop-blur-xl md:order-2">
                    <CardHeader>
                        <CardTitle className="text-2xl font-extrabold bg-gradient-to-r from-[#763DF2] to-[#A885F2] bg-clip-text text-transparent">Iniciar sesión</CardTitle>
                        <CardDescription className="text-sm">Accede con tus credenciales de administrador.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        {...field}
                                                        type="email"
                                                        autoComplete="email"
                                                        placeholder="admin@importadorash.com"
                                                        className="pr-10"
                                                    />
                                                    <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contraseña</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        {...field}
                                                        type={showPwd ? "text" : "password"}
                                                        autoComplete="current-password"
                                                        placeholder="••••••••"
                                                        className="pr-10"
                                                        onKeyUp={(e) => setCapsOn(e.getModifierState && e.getModifierState("CapsLock"))}
                                                    />
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        className="absolute right-1.5 top-1/2 -translate-y-1/2"
                                                        onClick={() => setShowPwd((s) => !s)}
                                                    >
                                                        {showPwd ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </FormControl>

                                        </FormItem>
                                    )}
                                />

                                <div className="flex items-center justify-between gap-2">
                                    <FormField
                                        control={form.control}
                                        name="remember"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center gap-2 space-y-0">
                                                <FormControl>
                                                    <Checkbox checked={!!field.value} onCheckedChange={(v) => field.onChange(Boolean(v))} />
                                                </FormControl>
                                                <FormLabel className="text-sm font-normal">Recuérdame</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {serverError && (
                                    <Alert variant="destructive" role="alert">
                                        <AlertDescription>{serverError}</AlertDescription>
                                    </Alert>
                                )}

                                <Button type="submit" className="w-full rounded-xl bg-gradient-to-r from-[#763DF2] to-[#A885F2] text-white shadow hover:brightness-110" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Ingresando...
                                        </>
                                    ) : (
                                        "Entrar"
                                    )}
                                </Button>
                            </form>
                        </Form>

                        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                            <span>© {new Date().getFullYear()} Importadora SH</span>
                            <a
                                href="https://nexorf.com"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded-md px-2 py-1 ring-1 ring-border hover:bg-muted"
                            >
                                Powered by Nexorf <ArrowUpRight className="h-3.5 w-3.5" />
                            </a>
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                            <ShieldCheck className="h-4 w-4 text-[#763DF2]" />
                            <span>Datos cifrados y protegidos. Tus credenciales no se comparten.</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

