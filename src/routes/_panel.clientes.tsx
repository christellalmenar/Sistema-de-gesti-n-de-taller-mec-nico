import { createFileRoute } from "@tanstack/react-router";
import { CrudModule } from "@/components/CrudModule";
import { useStore, type Cliente } from "@/lib/store";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_panel/clientes")({
  head: pageHead("Clientes", "Registro y administración de clientes del taller."),
  component: Page,
});

function Page() {
  const { db, save, remove } = useStore();
  return (
    <CrudModule<Cliente>
      title="Clientes" subtitle="Personas registradas en el taller" singular="Cliente"
      rows={db.clientes}
      columns={[
        { label: "ID", render: (r) => <span className="font-mono text-muted-foreground">#{r.id}</span> },
        { label: "Nombre completo", render: (r) => <span className="font-semibold">{r.nombre} {r.apellido}</span>, search: (r) => `${r.nombre} ${r.apellido}` },
        { label: "Documento", render: (r) => r.documento },
        { label: "Teléfono", render: (r) => r.telefono },
        { label: "Correo", render: (r) => r.email },
        { label: "Dirección", render: (r) => r.direccion },
        { label: "Registro", render: (r) => r.fecha },
      ]}
      fields={[
        { key: "nombre", label: "Nombre", required: true },
        { key: "apellido", label: "Apellido", required: true },
        { key: "documento", label: "Documento de identidad", required: true, pattern: /^\d{8}-\d$/, hint: "Formato DUI: 00000000-0" },
        { key: "telefono", label: "Teléfono", required: true, pattern: /^\d{4}-?\d{4}$/, hint: "Formato: 7000-0000" },
        { key: "email", label: "Correo electrónico", type: "email", required: true },
        { key: "direccion", label: "Dirección", required: true },
      ]}
      empty={{ nombre: "", apellido: "", documento: "", telefono: "", email: "", direccion: "", fecha: new Date().toISOString().slice(0, 10) }}
      onSave={(c) => save("clientes", c)}
      onDelete={(id) => remove("clientes", id)}
    />
  );
}
