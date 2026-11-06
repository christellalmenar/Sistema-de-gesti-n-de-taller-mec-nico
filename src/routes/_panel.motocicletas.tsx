import { createFileRoute } from "@tanstack/react-router";
import { CrudModule } from "@/components/CrudModule";
import { useLookups, useStore, type Moto } from "@/lib/store";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_panel/motocicletas")({
  head: pageHead("Motocicletas", "Motocicletas registradas por cliente."),
  component: Page,
});

function Page() {
  const { db, save, remove } = useStore();
  const L = useLookups();
  const marcas = [...new Set(db.motos.map((m) => m.marca))];
  return (
    <CrudModule<Moto>
      title="Motocicletas" subtitle="Vehículos de los clientes" singular="Motocicleta"
      rows={db.motos}
      filter={{ label: "Marca", options: marcas, match: (r, v) => r.marca === v }}
      columns={[
        { label: "ID", render: (r) => <span className="font-mono text-muted-foreground">#{r.id}</span> },
        { label: "Propietario", render: (r) => L.cliente(r.clienteId) },
        { label: "Marca", render: (r) => <span className="font-semibold">{r.marca}</span>, search: (r) => r.marca },
        { label: "Modelo", render: (r) => r.modelo },
        { label: "Año", render: (r) => r.anio },
        { label: "Placa", render: (r) => <span className="rounded border-2 border-foreground/70 px-1.5 font-mono text-xs font-bold">{r.placa}</span>, search: (r) => r.placa },
        { label: "Color", render: (r) => r.color },
        { label: "Chasis", render: (r) => <span className="font-mono text-xs">{r.chasis}</span>, search: (r) => r.chasis },
        { label: "Kilometraje", render: (r) => `${r.km.toLocaleString()} km` },
      ]}
      fields={[
        { key: "clienteId", label: "Cliente propietario", type: "select", required: true, full: true, options: db.clientes.map((c) => ({ value: c.id, label: `${c.nombre} ${c.apellido}` })) },
        { key: "marca", label: "Marca", required: true },
        { key: "modelo", label: "Modelo", required: true },
        { key: "anio", label: "Año", type: "number", required: true },
        { key: "placa", label: "Placa", required: true, pattern: /^[A-Z]{1,2}-?\d{3,6}$/i, hint: "Ej.: M-123456" },
        { key: "color", label: "Color", required: true },
        { key: "chasis", label: "Número de chasis", required: true, pattern: /^[A-HJ-NPR-Z0-9]{17}$/i, hint: "17 caracteres (VIN)" },
        { key: "km", label: "Kilometraje", type: "number", required: true },
      ]}
      empty={{ clienteId: 0, marca: "", modelo: "", anio: new Date().getFullYear(), placa: "", color: "", chasis: "", km: 0 }}
      onSave={(m) => save("motos", m)}
      onDelete={(id) => remove("motos", id)}
    />
  );
}
