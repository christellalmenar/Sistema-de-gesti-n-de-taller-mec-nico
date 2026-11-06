import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileDown, Plus, Printer, Save, Trash2, X, Eye, Cog } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { money, totales, useLookups, useStore, type Factura } from "@/lib/store";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_panel/facturacion")({
  head: pageHead("Facturación", "Generación de facturas del taller."),
  component: Page,
});

function Page() {
  const { db, save } = useStore();
  const L = useLookups();
  const nuevo = (): Factura => ({ id: 0, numero: `FAC-${String(db.facturas.length + 1).padStart(4, "0")}`, fecha: new Date().toISOString().slice(0, 10), clienteId: 0, motoId: 0, items: [{ descripcion: "", cantidad: 1, precio: 0 }], descuento: 0, iva: 13 });
  const [f, setF] = useState<Factura | null>(null);

  if (!f) {
    return (
      <div className="space-y-5">
        <PageHeader title="Facturación" subtitle="Facturas emitidas">
          <Button variant="accent" onClick={() => setF(nuevo())}><Plus /> Nueva factura</Button>
        </PageHeader>
        <div className="overflow-x-auto rounded-lg border bg-card shadow-card">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left">{["Número", "Fecha", "Cliente", "Motocicleta", "Subtotal", "IVA", "Total", ""].map((h) => <th key={h} className="p-3 font-display text-xs uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody>{db.facturas.map((x) => { const t = totales(x); return (
              <tr key={x.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="p-3 font-mono font-semibold">{x.numero}</td><td className="p-3">{x.fecha}</td><td className="p-3">{L.cliente(x.clienteId)}</td><td className="p-3">{L.moto(x.motoId)}</td>
                <td className="p-3">{money(t.subtotal)}</td><td className="p-3">{money(t.iva)}</td><td className="p-3 font-bold">{money(t.total)}</td>
                <td className="p-3 text-right"><Button size="sm" variant="outline" onClick={() => setF(structuredClone(x))}><Eye /> Abrir</Button></td>
              </tr>); })}</tbody>
          </table>
        </div>
      </div>
    );
  }

  const t = totales(f);
  const motos = db.motos.filter((m) => !f.clienteId || m.clienteId === f.clienteId);
  const setItem = (i: number, k: string, v: string) => setF({ ...f, items: f.items.map((it, j) => (j === i ? { ...it, [k]: k === "descripcion" ? v : Number(v) } : it)) });
  const guardar = async () => {
    if (!f.clienteId || !f.motoId) { toast.error("Selecciona cliente y motocicleta"); return; }
    if (!f.items.length || f.items.some((i) => !i.descripcion || i.cantidad <= 0 || i.precio < 0)) { toast.error("Completa el detalle de la factura"); return; }
    try { await save("facturas", f); toast.success("Factura guardada en PostgreSQL"); setF(null); }
    catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo guardar la factura"); }
  };

  return (
    <div className="space-y-5">
      <PageHeader title={f.id ? `Factura ${f.numero}` : "Nueva factura"} subtitle="Formato compatible con generación PDF (FPDF)">
        <Button variant="accent" onClick={guardar}><Save /> Guardar factura</Button>
        <Button variant="outline" onClick={() => window.print()}><Printer /> Imprimir</Button>
        <Button variant="outline" onClick={() => { toast.info("Selecciona “Guardar como PDF” en el diálogo de impresión"); setTimeout(() => window.print(), 400); }}><FileDown /> Generar PDF</Button>
        <Button variant="ghost" onClick={() => setF(null)}><X /> Cancelar</Button>
      </PageHeader>

      <div className="mx-auto max-w-4xl rounded-lg border bg-card shadow-card">
        <div className="flex flex-col justify-between gap-4 rounded-t-lg bg-steel p-6 text-primary-foreground sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-md bg-accent text-accent-foreground"><Cog /></div>
            <div><p className="font-display text-2xl font-bold uppercase">MotoTaller</p><p className="text-xs text-primary-foreground/70">Taller mecánico de motocicletas · San Salvador</p></div>
          </div>
          <div className="text-right"><p className="font-display text-xl font-bold">FACTURA</p><p className="font-mono">{f.numero}</p></div>
        </div>
        <div className="h-1.5 hazard" />
        <div className="grid gap-4 p-6 sm:grid-cols-3">
          <div className="space-y-1.5"><Label>Fecha</Label><Input type="date" value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Cliente</Label>
            <Select value={f.clienteId ? String(f.clienteId) : ""} onValueChange={(v) => setF({ ...f, clienteId: Number(v), motoId: 0 })}>
              <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
              <SelectContent>{db.clientes.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nombre} {c.apellido}</SelectItem>)}</SelectContent>
            </Select></div>
          <div className="space-y-1.5"><Label>Motocicleta</Label>
            <Select value={f.motoId ? String(f.motoId) : ""} onValueChange={(v) => setF({ ...f, motoId: Number(v) })}>
              <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
              <SelectContent>{motos.map((m) => <SelectItem key={m.id} value={String(m.id)}>{m.marca} {m.modelo} · {m.placa}</SelectItem>)}</SelectContent>
            </Select></div>
        </div>

        <div className="px-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b-2 border-foreground text-left">{["Servicio o producto", "Cantidad", "Precio", "Subtotal", ""].map((h) => <th key={h} className="py-2 pr-2 font-display text-xs uppercase tracking-wider">{h}</th>)}</tr></thead>
              <tbody>{f.items.map((it, i) => (
                <tr key={i} className="border-b">
                  <td className="py-2 pr-2">
                    <Input list="svc" value={it.descripcion} placeholder="Descripción" onChange={(e) => {
                      const s = db.servicios.find((x) => x.nombre === e.target.value);
                      setF({ ...f, items: f.items.map((x, j) => (j === i ? { ...x, descripcion: e.target.value, precio: s ? s.precio : x.precio } : x)) });
                    }} />
                  </td>
                  <td className="w-24 py-2 pr-2"><Input type="number" min={1} value={it.cantidad} onChange={(e) => setItem(i, "cantidad", e.target.value)} /></td>
                  <td className="w-32 py-2 pr-2"><Input type="number" min={0} step="0.01" value={it.precio} onChange={(e) => setItem(i, "precio", e.target.value)} /></td>
                  <td className="w-28 py-2 pr-2 font-semibold">{money(it.cantidad * it.precio)}</td>
                  <td className="no-print w-10"><Button size="icon" variant="ghost" className="text-destructive" aria-label="Quitar línea" onClick={() => setF({ ...f, items: f.items.filter((_, j) => j !== i) })}><Trash2 /></Button></td>
                </tr>
              ))}</tbody>
            </table>
            <datalist id="svc">{db.servicios.map((s) => <option key={s.id} value={s.nombre} />)}</datalist>
          </div>
          <Button variant="outline" size="sm" className="no-print mt-3" onClick={() => setF({ ...f, items: [...f.items, { descripcion: "", cantidad: 1, precio: 0 }] })}><Plus /> Agregar línea</Button>
        </div>

        <div className="flex justify-end p-6">
          <dl className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="font-semibold">{money(t.subtotal)}</dd></div>
            <div className="flex items-center justify-between gap-2"><dt className="text-muted-foreground">Descuento ($)</dt><dd><Input type="number" min={0} className="h-8 w-28 text-right" value={f.descuento} onChange={(e) => setF({ ...f, descuento: Number(e.target.value) })} /></dd></div>
            <div className="flex items-center justify-between gap-2"><dt className="text-muted-foreground">IVA (%)</dt><dd className="flex items-center gap-2"><Input type="number" min={0} className="h-8 w-16 text-right" value={f.iva} onChange={(e) => setF({ ...f, iva: Number(e.target.value) })} /><span className="w-20 text-right font-semibold">{money(t.iva)}</span></dd></div>
            <div className="flex justify-between border-t-2 border-foreground pt-2 font-display text-2xl font-bold"><dt>Total</dt><dd className="text-accent">{money(t.total)}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}
