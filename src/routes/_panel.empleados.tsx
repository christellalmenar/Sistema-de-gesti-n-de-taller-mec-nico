import { createFileRoute } from "@tanstack/react-router";
import { Power } from "lucide-react";
import { toast } from "sonner";
import { CrudModule } from "@/components/CrudModule";
import { Status } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useStore, type Empleado } from "@/lib/store";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_panel/empleados")({
  head: pageHead("Empleados", "Personal del taller mecánico."),
  component: Page,
});

function Page() {
  const { db, save } = useStore();
  return (
    <CrudModule<Empleado>
      title="Empleados" subtitle="Personal del taller" singular="Empleado"
      rows={db.empleados}
      filter={{ label: "Estado", options: ["Activo", "Inactivo"], match: (r, v) => (r.activo ? "Activo" : "Inactivo") === v }}
      columns={[
        { label: "ID", render: (r) => <span className="font-mono text-muted-foreground">#{r.id}</span> },
        { label: "Nombre", render: (r) => <span className="font-semibold">{r.nombre}</span>, search: (r) => r.nombre },
        { label: "Cargo", render: (r) => r.cargo },
        { label: "Teléfono", render: (r) => r.telefono },
        { label: "Correo", render: (r) => r.email },
        { label: "Estado", render: (r) => <Status value={r.activo ? "Activo" : "Inactivo"} />, search: (r) => (r.activo ? "Activo" : "Inactivo") },
      ]}
      fields={[
        { key: "nombre", label: "Nombre completo", required: true, full: true },
        { key: "cargo", label: "Cargo", type: "select", required: true, options: ["Mecánico senior", "Mecánico", "Ayudante de taller", "Recepcionista", "Administrador"].map((v) => ({ value: v, label: v })) },
        { key: "telefono", label: "Teléfono", required: true, pattern: /^\d{4}-?\d{4}$/, hint: "Formato: 7000-0000" },
        { key: "email", label: "Correo", type: "email", required: true, full: true },
      ]}
      empty={{ nombre: "", cargo: "", telefono: "", email: "", activo: true }}
      onSave={(e) => save("empleados", e)}
      extraActions={(r) => (
        <Button size="icon" variant="ghost" aria-label={r.activo ? "Desactivar" : "Activar"} className={r.activo ? "text-success" : "text-muted-foreground"}
          onClick={async () => { try { await save("empleados", { ...r, activo: !r.activo }); toast.success(`Empleado ${r.activo ? "desactivado" : "activado"}`); } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo actualizar"); } }}>
          <Power />
        </Button>
      )}
    />
  );
}
