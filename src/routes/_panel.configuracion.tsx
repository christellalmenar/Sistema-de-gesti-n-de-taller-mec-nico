import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_panel/configuracion")({
  head: pageHead("Configuración", "Datos del taller y opciones del sistema."),
  component: Page,
});

function Page() {
  const [cfg, setCfg] = useState({ nombre: "MotoTaller", nit: "0614-010190-101-1", telefono: "2222-3344", email: "contacto@motortaller.com", direccion: "Blvd. Los Héroes, San Salvador", iva: "13", moneda: "USD" });
  const field = (k: keyof typeof cfg, label: string) => (
    <div className="space-y-1.5"><Label>{label}</Label><Input value={cfg[k]} onChange={(e) => setCfg({ ...cfg, [k]: e.target.value })} /></div>
  );
  return (
    <div className="space-y-5">
      <PageHeader title="Configuración" subtitle="Datos del taller y parámetros del sistema" />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-5 shadow-card lg:col-span-2">
          <h2 className="mb-4 font-display text-xl font-bold uppercase">Datos del taller</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("nombre", "Nombre comercial")}{field("nit", "NIT")}{field("telefono", "Teléfono")}{field("email", "Correo")}
            <div className="sm:col-span-2">{field("direccion", "Dirección")}</div>
            {field("iva", "IVA por defecto (%)")}{field("moneda", "Moneda")}
          </div>
          <Button variant="accent" className="mt-5" onClick={() => toast.success("Configuración guardada")}><Save /> Guardar cambios</Button>
        </div>
        <div className="space-y-5">
          <div className="rounded-lg border bg-card p-5 shadow-card">
            <h2 className="mb-2 flex items-center gap-2 font-display text-xl font-bold uppercase"><ShieldCheck className="size-5 text-accent" />Seguridad</h2>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>• Contraseñas con <b className="text-foreground">password_hash()</b> + Argon2 (PHP 8)</li>
              <li>• Sesiones PHP y control de acceso por rol</li>
              <li>• Rutas protegidas y validación de formularios</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
