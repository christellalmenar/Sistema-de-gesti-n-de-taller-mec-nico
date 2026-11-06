import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Cog, Eye, EyeOff, Lock, User, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import heroImg from "@/assets/taller-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión · MotoTaller — Gestión de Taller Mecánico" },
      { name: "description", content: "Acceso al sistema de gestión de taller mecánico de motocicletas: clientes, órdenes, facturación y reportes." },
      { property: "og:title", content: "MotoTaller — Sistema de Gestión de Taller Mecánico" },
      { property: "og:description", content: "Administra clientes, motocicletas, órdenes de trabajo, facturas y pagos." },
    ],
  }),
  component: Login,
});

function Login() {
  const { login, user, ready } = useStore();
  const navigate = useNavigate();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<{ u?: string; p?: string; general?: string }>({});
  const [ok, setOk] = useState(false);

  useEffect(() => { if (ready && user && !ok) navigate({ to: "/dashboard" }); }, [ready, user, ok, navigate]);

  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const e2: typeof err = {};
    if (!u.trim()) e2.u = "El usuario o correo es obligatorio";
    if (!p) e2.p = "La contraseña es obligatoria";
    setErr(e2);
    if (Object.keys(e2).length) return;
    setBusy(true);
    const r = await login(u, p);
    setBusy(false);
    if (r === "user") setErr({ u: "Usuario no registrado" });
    else if (r === "pass") setErr({ p: "Contraseña incorrecta" });
    else if (r === "inactive") setErr({ general: "Usuario desactivado. Contacta al administrador." });
    else if (r === "error") setErr({ general: "No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose." });
    else { setOk(true); setTimeout(() => navigate({ to: "/dashboard" }), 700); }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-steel lg:block">
        <img src={heroImg} alt="Taller de motocicletas" className="absolute inset-0 size-full object-cover opacity-55" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-sidebar via-sidebar/70 to-transparent p-12">
          <div className="mb-4 h-1.5 w-20 rounded hazard" />
          <h2 className="font-display text-5xl font-bold uppercase leading-none text-sidebar-accent-foreground">Control total<br />de tu taller</h2>
          <p className="mt-3 max-w-md text-sidebar-foreground">Clientes, motocicletas, órdenes de trabajo, facturación y reportes en un solo lugar.</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} noValidate className="w-full max-w-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-lg bg-steel text-accent"><Cog className="size-7" /></div>
            <div>
              <p className="font-display text-2xl font-bold uppercase tracking-wide">MotoTaller</p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Sistema de Gestión de Taller Mecánico</p>
            </div>
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold uppercase">Iniciar sesión</h1>
            <p className="text-sm text-muted-foreground">Ingresa tus credenciales para continuar.</p>
          </div>
          {err.general && <Alert tone="error">{err.general}</Alert>}
          {ok && <Alert tone="ok">Acceso exitoso. Redirigiendo…</Alert>}
          <div className="space-y-1.5">
            <Label htmlFor="u">Usuario o correo electrónico</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="u" className="h-11 pl-9" value={u} aria-invalid={!!err.u} onChange={(e) => { setU(e.target.value); setErr({}); }} autoComplete="username" />
            </div>
            {err.u && <p className="text-xs text-destructive">{err.u}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="p" type={show ? "text" : "password"} className="h-11 px-9" value={p} aria-invalid={!!err.p} onChange={(e) => { setP(e.target.value); setErr({}); }} autoComplete="current-password" />
              <button type="button" aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {err.p && <p className="text-xs text-destructive">{err.p}</p>}
          </div>
          <Button type="submit" variant="accent" size="lg" className="h-11 w-full" disabled={busy}>{busy ? "Verificando…" : "Iniciar Sesión"}</Button>

        </form>
      </div>
    </div>
  );
}

function Alert({ tone, children }: { tone: "ok" | "error"; children: React.ReactNode }) {
  const Icon = tone === "ok" ? CheckCircle2 : AlertCircle;
  return <div className={tone === "ok" ? "flex items-center gap-2 rounded-md border border-success/30 bg-success/10 p-3 text-sm text-success" : "flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"}><Icon className="size-4" />{children}</div>;
}
