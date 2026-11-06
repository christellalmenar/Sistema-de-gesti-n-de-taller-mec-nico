import { createFileRoute } from "@tanstack/react-router";
import { Check, Minus } from "lucide-react";
import { CrudModule } from "@/components/CrudModule";
import { Status } from "@/components/PageHeader";
import { useStore, type Rol, type Usuario } from "@/lib/store";
import { pageHead } from "@/lib/seo";
import { NAV } from "@/lib/nav";

export const Route = createFileRoute("/_panel/usuarios")({
  head: pageHead("Usuarios", "Usuarios con acceso al sistema y sus roles."),
  component: Page,
});

const ROLES: Rol[] = ["Administrador", "Recepcionista", "Mecánico"];

function Page() {
  const { db, save, remove, user } = useStore();
  return (
    <div className="space-y-8">
      <CrudModule<Usuario>
        title="Usuarios" subtitle="Cuentas con acceso al sistema" singular="Usuario"
        rows={db.usuarios}
        filter={{ label: "Rol", options: ROLES, match: (r, v) => r.rol === v }}
        columns={[
          { label: "Nombre", render: (r) => <span className="font-semibold">{r.nombre}</span>, search: (r) => r.nombre },
          { label: "Usuario", render: (r) => <span className="font-mono">{r.usuario}</span>, search: (r) => r.usuario },
          { label: "Correo", render: (r) => r.email },
          { label: "Rol", render: (r) => <Status value={r.rol} />, search: (r) => r.rol },
          { label: "Estado", render: (r) => <Status value={r.activo ? "Activo" : "Inactivo"} /> },
          { label: "Último acceso", render: (r) => r.ultimoAcceso },
        ]}
        fields={[
          { key: "nombre", label: "Nombre completo", required: true, full: true },
          { key: "usuario", label: "Usuario", required: true, pattern: /^[a-z0-9._]{3,}$/, hint: "Mínimo 3 caracteres, minúsculas" },
          { key: "email", label: "Correo", type: "email", required: true },
          { key: "password", label: "Contraseña", type: "password", required: false, pattern: /^$|^.{6,}$/, hint: "Deja vacío para conservar la contraseña actual; mínimo 6 caracteres si la cambias" },
          { key: "rol", label: "Rol", type: "select", required: true, options: ROLES.map((v) => ({ value: v, label: v })) },
          { key: "activo", label: "Estado", type: "select", required: true, options: [{ value: "true", label: "Activo" }, { value: "false", label: "Inactivo" }] },
        ]}
        empty={{ nombre: "", usuario: "", email: "", password: "", rol: "Recepcionista", activo: true, ultimoAcceso: "—" }}
        onSave={(u) => save("usuarios", { ...u, activo: String(u.activo) === "true" })}
        onDelete={(id) => { if (id !== user?.id) remove("usuarios", id); }}
      />
      <div className="rounded-lg border bg-card shadow-card">
        <div className="border-b p-4">
          <h2 className="font-display text-xl font-bold uppercase">Permisos por rol</h2>
          <p className="text-sm text-muted-foreground">Módulos visibles para cada rol. Las contraseñas se verifican con bcrypt (pgcrypto) en PostgreSQL.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b">
              <th className="p-3 text-left font-display text-xs uppercase tracking-wider">Módulo</th>
              {ROLES.map((r) => <th key={r} className="p-3 text-center"><Status value={r} /></th>)}
            </tr></thead>
            <tbody>
              {NAV.map((n) => (
                <tr key={n.url} className="border-b last:border-0">
                  <td className="p-3 font-medium"><span className="inline-flex items-center gap-2"><n.icon className="size-4 text-muted-foreground" />{n.title}</span></td>
                  {ROLES.map((r) => <td key={r} className="p-3 text-center">{n.roles.includes(r) ? <Check className="mx-auto size-4 text-success" /> : <Minus className="mx-auto size-4 text-muted-foreground/50" />}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
