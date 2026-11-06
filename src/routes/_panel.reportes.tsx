import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BarChart3, FileDown, Printer, ClipboardList, Receipt, UserRound, Wrench, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Status } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { money, totales, useLookups, useStore } from "@/lib/store";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_panel/reportes")({
  head: pageHead("Reportes", "Reportes de ingresos, servicios, clientes, órdenes y facturación."),
  component: Page,
});

const TIPOS = [
  { id: "ingresos", label: "Ingresos", icon: DollarSign },
  { id: "servicios", label: "Servicios", icon: Wrench },
  { id: "clientes", label: "Clientes", icon: UserRound },
  { id: "ordenes", label: "Órdenes de trabajo", icon: ClipboardList },
  { id: "facturacion", label: "Facturación", icon: Receipt },
] as const;

function Page() {
  const { db } = useStore();
  const L = useLookups();
  const [tipo, setTipo] = useState<(typeof TIPOS)[number]["id"]>("ingresos");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [cli, setCli] = useState("all");
  const [svc, setSvc] = useState("all");
  const [gen, setGen] = useState(0);

  const inRange = (d: string) => (!desde || d >= desde) && (!hasta || d <= hasta);
  const okCli = (id: number) => cli === "all" || Number(cli) === id;

  const data = useMemo(() => {
    void gen;
    const ordenes = db.ordenes.filter((o) => inRange(o.ingreso) && okCli(o.clienteId) && (svc === "all" || o.servicios.includes(Number(svc))));
    const facturas = db.facturas.filter((f) => inRange(f.fecha) && okCli(f.clienteId));
    switch (tipo) {
      case "ingresos": {
        const rows = db.pagos.filter((p) => { const f = db.facturas.find((x) => x.id === p.facturaId); return inRange(p.fecha) && f && okCli(f.clienteId); });
        return { head: ["Fecha", "Factura", "Cliente", "Método", "Estado", "Monto"], rows: rows.map((p) => { const f = db.facturas.find((x) => x.id === p.facturaId)!; return [p.fecha, f.numero, L.cliente(f.clienteId), p.metodo, <Status key="s" value={p.estado} />, money(p.monto)]; }), total: money(rows.filter((p) => p.estado === "Completado").reduce((s, p) => s + p.monto, 0)) };
      }
      case "servicios": {
        const list = db.servicios.filter((s) => svc === "all" || s.id === Number(svc)).map((s) => { const n = ordenes.filter((o) => o.servicios.includes(s.id)).length; return [s.codigo, s.nombre, money(s.precio), n, money(n * s.precio)] as const; });
        return { head: ["Código", "Servicio", "Precio", "Veces solicitado", "Ingreso estimado"], rows: list.map((r) => [...r]), total: money(list.reduce((s, r) => s + Number(r[3]) * Number(String(r[2]).replace(/[$,]/g, "")), 0)) };
      }
      case "clientes": {
        const list = db.clientes.filter((c) => okCli(c.id) && inRange(c.fecha));
        return { head: ["Cliente", "Documento", "Teléfono", "Motos", "Órdenes", "Facturado"], rows: list.map((c) => [`${c.nombre} ${c.apellido}`, c.documento, c.telefono, db.motos.filter((m) => m.clienteId === c.id).length, db.ordenes.filter((o) => o.clienteId === c.id).length, money(db.facturas.filter((f) => f.clienteId === c.id).reduce((s, f) => s + totales(f).total, 0))]), total: `${list.length} cliente(s)` };
      }
      case "ordenes":
        return { head: ["Orden", "Cliente", "Motocicleta", "Mecánico", "Ingreso", "Estado"], rows: ordenes.map((o) => [o.numero, L.cliente(o.clienteId), L.moto(o.motoId), L.empleado(o.mecanicoId), o.ingreso, <Status key="s" value={o.estado} />]), total: `${ordenes.length} orden(es)` };
      case "facturacion":
        return { head: ["Factura", "Fecha", "Cliente", "Subtotal", "IVA", "Total"], rows: facturas.map((f) => { const t = totales(f); return [f.numero, f.fecha, L.cliente(f.clienteId), money(t.subtotal), money(t.iva), money(t.total)]; }), total: money(facturas.reduce((s, f) => s + totales(f).total, 0)) };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, tipo, gen]);

  return (
    <div className="space-y-5">
      <PageHeader title="Reportes" subtitle="Consulta y exporta la información del taller">
        <Button variant="outline" onClick={() => window.print()}><Printer /> Imprimir</Button>
        <Button variant="outline" onClick={() => { toast.info("Selecciona “Guardar como PDF” en el diálogo de impresión"); setTimeout(() => window.print(), 400); }}><FileDown /> Exportar PDF</Button>
      </PageHeader>

      <div className="no-print grid grid-cols-2 gap-2 sm:grid-cols-5">
        {TIPOS.map((t) => (
          <button key={t.id} onClick={() => setTipo(t.id)} className={cn("flex items-center gap-2 rounded-lg border p-3 text-left text-sm font-semibold transition-colors", tipo === t.id ? "border-accent bg-accent/10 text-foreground" : "bg-card hover:bg-secondary")}>
            <t.icon className={cn("size-4", tipo === t.id ? "text-accent" : "text-muted-foreground")} />{t.label}
          </button>
        ))}
      </div>

      <div className="no-print grid gap-3 rounded-lg border bg-card p-4 shadow-card sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-1.5"><Label>Fecha inicial</Label><Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Fecha final</Label><Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Cliente</Label>
          <Select value={cli} onValueChange={setCli}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">Todos</SelectItem>{db.clientes.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nombre} {c.apellido}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-1.5"><Label>Servicio</Label>
          <Select value={svc} onValueChange={setSvc}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">Todos</SelectItem>{db.servicios.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.nombre}</SelectItem>)}</SelectContent></Select></div>
        <div className="flex items-end"><Button variant="accent" className="w-full" onClick={() => { if (desde && hasta && desde > hasta) { toast.error("La fecha inicial no puede ser mayor a la final"); return; } setGen((g) => g + 1); toast.success("Reporte generado"); }}><BarChart3 /> Generar reporte</Button></div>
      </div>

      <div className="rounded-lg border bg-card shadow-card">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-display text-xl font-bold uppercase">Reporte de {TIPOS.find((t) => t.id === tipo)!.label.toLowerCase()}</h2>
          <span className="text-sm text-muted-foreground">{desde || "inicio"} → {hasta || "hoy"}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left">{data.head.map((h) => <th key={h} className="p-3 font-display text-xs uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody>
              {data.rows.length === 0 && <tr><td colSpan={data.head.length} className="p-8 text-center text-muted-foreground">Sin datos para los filtros seleccionados</td></tr>}
              {data.rows.map((r, i) => <tr key={i} className="border-b last:border-0">{r.map((c, j) => <td key={j} className="whitespace-nowrap p-3">{c}</td>)}</tr>)}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end border-t bg-muted/40 p-4 font-display text-lg font-bold">Total: <span className="ml-2 text-accent">{data.total}</span></div>
      </div>
    </div>
  );
}
