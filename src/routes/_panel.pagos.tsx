import { createFileRoute } from "@tanstack/react-router";
import { CrudModule } from "@/components/CrudModule";
import { Status } from "@/components/PageHeader";
import { money, totales, useLookups, useStore, type Pago } from "@/lib/store";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_panel/pagos")({
  head: pageHead("Pagos", "Registro de pagos de facturas."),
  component: Page,
});

function Page() {
  const { db, save, remove } = useStore();
  const L = useLookups();
  const fac = (id: number) => db.facturas.find((f) => f.id === id);
  return (
    <CrudModule<Pago>
      title="Pagos" subtitle="Cobros asociados a facturas" singular="Pago"
      rows={db.pagos}
      filter={{ label: "Método", options: ["Efectivo", "Transferencia bancaria", "Tarjeta"], match: (r, v) => r.metodo === v }}
      columns={[
        { label: "Factura", render: (r) => <span className="font-mono font-semibold">{fac(r.facturaId)?.numero ?? "—"}</span>, search: (r) => fac(r.facturaId)?.numero ?? "" },
        { label: "Cliente", render: (r) => L.cliente(fac(r.facturaId)?.clienteId ?? 0), search: (r) => L.cliente(fac(r.facturaId)?.clienteId ?? 0) },
        { label: "Fecha", render: (r) => r.fecha },
        { label: "Monto", render: (r) => <span className="font-semibold">{money(r.monto)}</span> },
        { label: "Método", render: (r) => r.metodo },
        { label: "Estado", render: (r) => <Status value={r.estado} />, search: (r) => r.estado },
      ]}
      fields={[
        { key: "facturaId", label: "Factura", type: "select", required: true, full: true, options: db.facturas.map((f) => ({ value: f.id, label: `${f.numero} · ${L.cliente(f.clienteId)} · ${money(totales(f).total)}` })) },
        { key: "fecha", label: "Fecha", type: "date", required: true },
        { key: "monto", label: "Monto (USD)", type: "number", required: true },
        { key: "metodo", label: "Método de pago", type: "select", required: true, options: ["Efectivo", "Transferencia bancaria", "Tarjeta"].map((v) => ({ value: v, label: v })) },
        { key: "estado", label: "Estado", type: "select", required: true, options: ["Completado", "Pendiente", "Anulado"].map((v) => ({ value: v, label: v })) },
      ]}
      empty={{ facturaId: 0, fecha: new Date().toISOString().slice(0, 10), monto: 0, metodo: "Efectivo", estado: "Completado" }}
      onSave={(p) => save("pagos", p)}
      onDelete={(id) => remove("pagos", id)}
    />
  );
}
