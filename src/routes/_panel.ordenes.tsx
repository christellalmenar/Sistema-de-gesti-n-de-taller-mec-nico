import { createFileRoute } from "@tanstack/react-router";
import { CrudModule } from "@/components/CrudModule";
import { Status } from "@/components/PageHeader";
import { useLookups, useStore, type EstadoOrden, type Orden } from "@/lib/store";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_panel/ordenes")({
  head: pageHead("Órdenes de trabajo", "Seguimiento de órdenes de trabajo del taller."),
  component: Page,
});

const ESTADOS: EstadoOrden[] = ["Pendiente", "En proceso", "Finalizado", "Entregado", "Cancelado"];

function Page() {
  const { db, save, remove } = useStore();
  const L = useLookups();
  const counts = ESTADOS.map((e) => ({ e, n: db.ordenes.filter((o) => o.estado === e).length }));
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {counts.map(({ e, n }) => (
          <div key={e} className="rounded-lg border bg-card p-3 shadow-card">
            <Status value={e} />
            <p className="mt-2 font-display text-3xl font-bold">{n}</p>
          </div>
        ))}
      </div>
      <CrudModule<Orden>
        title="Órdenes de trabajo" subtitle="Ingreso, seguimiento y entrega de motocicletas" singular="Orden"
        rows={db.ordenes}
        filter={{ label: "Estado", options: ESTADOS, match: (r, v) => r.estado === v }}
        columns={[
          { label: "N.º orden", render: (r) => <span className="font-mono font-semibold">{r.numero}</span>, search: (r) => r.numero },
          { label: "Cliente", render: (r) => L.cliente(r.clienteId), search: (r) => L.cliente(r.clienteId) },
          { label: "Motocicleta", render: (r) => L.moto(r.motoId), search: (r) => L.moto(r.motoId) },
          { label: "Servicios", render: (r) => r.servicios.map(L.servicio).join(", ") },
          { label: "Ingreso", render: (r) => r.ingreso },
          { label: "Entrega est.", render: (r) => r.entrega },
          { label: "Mecánico", render: (r) => L.empleado(r.mecanicoId), search: (r) => L.empleado(r.mecanicoId) },
          { label: "Estado", render: (r) => <Status value={r.estado} />, search: (r) => r.estado },
          { label: "Observaciones", render: (r) => <span className="text-muted-foreground">{r.observaciones || "—"}</span> },
        ]}
        fields={[
          { key: "numero", label: "Número de orden", required: true },
          { key: "estado", label: "Estado", type: "select", required: true, options: ESTADOS.map((v) => ({ value: v, label: v })) },
          { key: "clienteId", label: "Cliente", type: "select", required: true, options: db.clientes.map((c) => ({ value: c.id, label: `${c.nombre} ${c.apellido}` })) },
          { key: "motoId", label: "Motocicleta", type: "select", required: true, options: db.motos.map((m) => ({ value: m.id, label: `${m.marca} ${m.modelo} · ${m.placa} (${L.cliente(m.clienteId)})` })) },
          { key: "mecanicoId", label: "Mecánico responsable", type: "select", required: true, full: true, options: db.empleados.filter((e) => e.activo && e.cargo.includes("Mecánico")).map((e) => ({ value: e.id, label: e.nombre })) },
          { key: "ingreso", label: "Fecha de ingreso", type: "date", required: true },
          { key: "entrega", label: "Fecha estimada de entrega", type: "date", required: true },
          { key: "servicios", label: "Servicios a realizar", type: "checks", required: true, options: db.servicios.filter((s) => s.activo).map((s) => ({ value: s.id, label: s.nombre })) },
          { key: "observaciones", label: "Observaciones", type: "textarea" },
        ]}
        empty={{ numero: `OT-${String(db.ordenes.length + 1).padStart(4, "0")}`, clienteId: 0, motoId: 0, mecanicoId: 0, servicios: [], ingreso: new Date().toISOString().slice(0, 10), entrega: "", estado: "Pendiente", observaciones: "" }}
        onSave={(o) => save("ordenes", o)}
        onDelete={(id) => remove("ordenes", id)}
      />
    </div>
  );
}
