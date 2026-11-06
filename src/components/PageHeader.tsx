import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 h-1 w-12 rounded hazard" />
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="no-print flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

const tones: Record<string, string> = {
  Pendiente: "bg-warning/20 text-foreground border-warning/40",
  "En proceso": "bg-info/15 text-info border-info/30",
  Finalizado: "bg-success/15 text-success border-success/30",
  Entregado: "bg-primary/10 text-primary border-primary/25",
  Cancelado: "bg-destructive/10 text-destructive border-destructive/25",
  Activo: "bg-success/15 text-success border-success/30",
  Inactivo: "bg-muted text-muted-foreground border-border",
  Completado: "bg-success/15 text-success border-success/30",
  Anulado: "bg-destructive/10 text-destructive border-destructive/25",
  Administrador: "bg-accent/15 text-accent border-accent/30",
  Recepcionista: "bg-info/15 text-info border-info/30",
  Mecánico: "bg-primary/10 text-primary border-primary/25",
};

export function Status({ value }: { value: string }) {
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold", tones[value] ?? tones["Inactivo"])}>
    <span className="size-1.5 rounded-full bg-current" />{value}
  </span>;
}
