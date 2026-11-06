import { createFileRoute } from "@tanstack/react-router";
import { CrudModule } from "@/components/CrudModule";
import { Status } from "@/components/PageHeader";
import { money, useStore, type Servicio } from "@/lib/store";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_panel/servicios")({
  head: pageHead("Servicios", "Catálogo de servicios y precios del taller."),
  component: Page,
});

function Page() {
  const { db, save, remove } = useStore();
  const next = `SRV-${String(db.servicios.length + 1).padStart(3, "0")}`;
  return (
    <CrudModule<Servicio>
      title="Servicios" subtitle="Catálogo de servicios ofrecidos" singular="Servicio"
      rows={db.servicios}
      filter={{ label: "Estado", options: ["Activo", "Inactivo"], match: (r, v) => (r.activo ? "Activo" : "Inactivo") === v }}
      columns={[
        { label: "Código", render: (r) => <span className="font-mono text-xs font-semibold">{r.codigo}</span>, search: (r) => r.codigo },
        { label: "Servicio", render: (r) => <span className="font-semibold">{r.nombre}</span>, search: (r) => r.nombre },
        { label: "Descripción", render: (r) => r.descripcion },
        { label: "Precio", render: (r) => money(r.precio) },
        { label: "Estado", render: (r) => <Status value={r.activo ? "Activo" : "Inactivo"} />, search: (r) => (r.activo ? "Activo" : "Inactivo") },
      ]}
      fields={[
        { key: "codigo", label: "Código", required: true },
        { key: "nombre", label: "Nombre del servicio", required: true },
        { key: "descripcion", label: "Descripción", type: "textarea" },
        { key: "precio", label: "Precio (USD)", type: "number", required: true },
      ]}
      empty={{ codigo: next, nombre: "", descripcion: "", precio: 0, activo: true }}
      onSave={(s) => save("servicios", s)}
      onDelete={(id) => remove("servicios", id)}
    />
  );
}
