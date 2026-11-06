import { useMemo, useState, type ReactNode } from "react";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/PageHeader";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Field {
  key: string;
  label: string;
  type?: "text" | "email" | "number" | "date" | "select" | "textarea" | "checks" | "password";
  options?: { value: string | number; label: string }[];
  required?: boolean;
  full?: boolean;
  pattern?: RegExp;
  hint?: string;
}
export interface Column<T> { label: string; render: (row: T) => ReactNode; search?: (row: T) => string }

interface Props<T extends { id: number }> {
  title: string;
  subtitle: string;
  singular: string;
  rows: T[];
  columns: Column<T>[];
  fields: Field[];
  empty: Omit<T, "id">;
  onSave: (item: T) => void | Promise<void>;
  onDelete?: (id: number) => void | Promise<void>;
  filter?: { label: string; options: string[]; match: (row: T, v: string) => boolean };
  extraActions?: (row: T) => ReactNode;
}

export function CrudModule<T extends { id: number }>(p: Props<T>) {
  const [q, setQ] = useState("");
  const [f, setF] = useState("all");
  const [editing, setEditing] = useState<any | null>(null);
  const [viewing, setViewing] = useState<T | null>(null);
  const [deleting, setDeleting] = useState<T | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const list = useMemo(() => {
    const s = q.toLowerCase();
    return p.rows.filter((r) => {
      if (p.filter && f !== "all" && !p.filter.match(r, f)) return false;
      if (!s) return true;
      return p.columns.some((c) => (c.search ? c.search(r) : String(c.render(r) ?? "")).toLowerCase().includes(s));
    });
  }, [p.rows, p.columns, q, f, p.filter]);

  const [saving, setSaving] = useState(false);
  const submit = async () => {
    const e: Record<string, string> = {};
    for (const fl of p.fields) {
      const v = editing[fl.key];
      const emptyV = v === "" || v == null || (Array.isArray(v) && v.length === 0) || (fl.type === "select" && !v);
      if (fl.required && emptyV) e[fl.key] = "Campo obligatorio";
      else if (fl.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) e[fl.key] = "Correo no válido";
      else if (fl.pattern && v && !fl.pattern.test(String(v))) e[fl.key] = fl.hint ?? "Formato no válido";
      else if (fl.type === "number" && v !== "" && Number(v) < 0) e[fl.key] = "Debe ser positivo";
    }
    setErrors(e);
    if (Object.keys(e).length) { toast.error("Revisa los campos marcados"); return; }
    const item = { ...editing };
    p.fields.forEach((fl) => { if (fl.type === "number" || (fl.type === "select" && typeof fl.options?.[0]?.value === "number")) item[fl.key] = Number(item[fl.key]); });
    try {
      setSaving(true);
      await p.onSave(item);
      toast.success(editing.id ? `${p.singular} actualizado` : `${p.singular} registrado`);
      setEditing(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el registro");
    } finally { setSaving(false); }
  };

  const set = (k: string, v: any) => { setEditing((x: any) => ({ ...x, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };

  return (
    <div className="space-y-5">
      <PageHeader title={p.title} subtitle={p.subtitle}>
        <Button variant="accent" onClick={() => { setErrors({}); setEditing({ id: 0, ...p.empty }); }}>
          <Plus /> Nuevo {p.singular.toLowerCase()}
        </Button>
      </PageHeader>

      <div className="rounded-lg border bg-card shadow-card">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..." className="pl-9" />
          </div>
          {p.filter && (
            <Select value={f} onValueChange={setF}>
              <SelectTrigger className="sm:w-52"><SelectValue placeholder={p.filter.label} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{p.filter.label}: todos</SelectItem>
                {p.filter.options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <span className="text-sm text-muted-foreground">{list.length} registro(s)</span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {p.columns.map((c) => <TableHead key={c.label} className="whitespace-nowrap font-display text-xs uppercase tracking-wider">{c.label}</TableHead>)}
                <TableHead className="text-right font-display text-xs uppercase tracking-wider">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 && (
                <TableRow><TableCell colSpan={p.columns.length + 1} className="py-10 text-center text-muted-foreground">Sin resultados</TableCell></TableRow>
              )}
              {list.map((r) => (
                <TableRow key={r.id}>
                  {p.columns.map((c) => <TableCell key={c.label} className="whitespace-nowrap">{c.render(r)}</TableCell>)}
                  <TableCell className="text-right whitespace-nowrap">
                    {p.extraActions?.(r)}
                    <Button size="icon" variant="ghost" aria-label="Ver" onClick={() => setViewing(r)}><Eye /></Button>
                    <Button size="icon" variant="ghost" aria-label="Editar" onClick={() => { setErrors({}); setEditing({ ...r }); }}><Pencil /></Button>
                    {p.onDelete && <Button size="icon" variant="ghost" aria-label="Eliminar" className="text-destructive" onClick={() => setDeleting(r)}><Trash2 /></Button>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle className="font-display text-2xl">{editing?.id ? "Editar" : "Nuevo"} {p.singular.toLowerCase()}</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid gap-4 sm:grid-cols-2">
              {p.fields.map((fl) => (
                <div key={fl.key} className={fl.full || fl.type === "textarea" || fl.type === "checks" ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}>
                  <Label>{fl.label}{fl.required && <span className="text-accent"> *</span>}</Label>
                  {fl.type === "select" ? (
                    <Select value={editing[fl.key] ? String(editing[fl.key]) : ""} onValueChange={(v) => set(fl.key, v)}>
                      <SelectTrigger aria-invalid={!!errors[fl.key]}><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>{fl.options!.map((o) => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                  ) : fl.type === "textarea" ? (
                    <Textarea value={editing[fl.key] ?? ""} onChange={(e) => set(fl.key, e.target.value)} />
                  ) : fl.type === "checks" ? (
                    <div className="grid gap-2 rounded-md border p-3 sm:grid-cols-2">
                      {fl.options!.map((o) => {
                        const arr: any[] = editing[fl.key] ?? [];
                        return (
                          <label key={o.value} className="flex items-center gap-2 text-sm">
                            <Checkbox checked={arr.includes(o.value)} onCheckedChange={(c) => set(fl.key, c ? [...arr, o.value] : arr.filter((x) => x !== o.value))} />
                            {o.label}
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <Input type={fl.type ?? "text"} value={editing[fl.key] ?? ""} aria-invalid={!!errors[fl.key]} onChange={(e) => set(fl.key, e.target.value)} />
                  )}
                  {errors[fl.key] && <p className="text-xs text-destructive">{errors[fl.key]}</p>}
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button variant="accent" onClick={submit} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display text-2xl">Detalle de {p.singular.toLowerCase()}</DialogTitle></DialogHeader>
          {viewing && (
            <dl className="divide-y rounded-md border">
              {p.columns.map((c) => (
                <div key={c.label} className="grid grid-cols-3 gap-2 px-4 py-2.5 text-sm">
                  <dt className="text-muted-foreground">{c.label}</dt><dd className="col-span-2 font-medium">{c.render(viewing)}</dd>
                </div>
              ))}
            </dl>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {p.singular.toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={async () => { try { await p.onDelete!(deleting!.id); toast.success(`${p.singular} eliminado`); setDeleting(null); } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo eliminar"); } }}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
