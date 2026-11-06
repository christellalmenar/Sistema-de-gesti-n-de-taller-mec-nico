import { createFileRoute } from "@tanstack/react-router";
import { Bike, ClipboardList, DollarSign, Receipt, UserRound, Wrench, type LucideIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart } from "recharts";
import { PageHeader, Status } from "@/components/PageHeader";
import { money, totales, useLookups, useStore } from "@/lib/store";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_panel/dashboard")({
  head: pageHead("Dashboard", "Resumen de la operación del taller."),
  component: Page,
});

// Ingresos históricos simulados (se reemplazarán por consulta MySQL)
const MESES = [
  { mes: "Ene", ingresos: 3200 }, { mes: "Feb", ingresos: 2900 }, { mes: "Mar", ingresos: 4100 }, { mes: "Abr", ingresos: 3800 },
  { mes: "May", ingresos: 4600 }, { mes: "Jun", ingresos: 4300 }, { mes: "Jul", ingresos: 5100 }, { mes: "Ago", ingresos: 4900 },
  { mes: "Sep", ingresos: 5400 }, { mes: "Oct", ingresos: 5800 },
];
const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function Kpi({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string | number; tone?: boolean }) {
  return (
    <div className={tone ? "relative overflow-hidden rounded-lg bg-steel p-4 text-primary-foreground shadow-card" : "relative overflow-hidden rounded-lg border bg-card p-4 shadow-card"}>
      <div className="flex items-start justify-between">
        <p className={tone ? "text-xs font-semibold uppercase tracking-wider text-primary-foreground/70" : "text-xs font-semibold uppercase tracking-wider text-muted-foreground"}>{label}</p>
        <Icon className="size-5 text-accent" />
      </div>
      <p className="mt-3 font-display text-3xl font-bold">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-lg border bg-card p-4 shadow-card"><h2 className="mb-3 font-display text-lg font-bold uppercase tracking-wide">{title}</h2>{children}</div>;
}

function Page() {
  const { db } = useStore();
  const L = useLookups();
  const hoy = new Date().toISOString().slice(0, 10);
  const mes = hoy.slice(0, 7);
  const factHoy = db.facturas.filter((f) => f.fecha === hoy).reduce((s, f) => s + totales(f).total, 0);
  const ingresosMes = db.pagos.filter((p) => p.fecha.startsWith(mes) && p.estado === "Completado").reduce((s, p) => s + p.monto, 0);
  const realizados = db.ordenes.filter((o) => o.estado === "Finalizado" || o.estado === "Entregado").reduce((s, o) => s + o.servicios.length, 0);
  const pendientes = db.ordenes.filter((o) => o.estado === "Pendiente" || o.estado === "En proceso").length;

  const svcCount = db.servicios.map((s) => ({ name: s.nombre, total: db.ordenes.filter((o) => o.servicios.includes(s.id)).length })).filter((x) => x.total > 0).sort((a, b) => b.total - a.total);
  const estados = ["Pendiente", "En proceso", "Finalizado", "Entregado", "Cancelado"].map((e) => ({ name: e, value: db.ordenes.filter((o) => o.estado === e).length })).filter((x) => x.value);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle={`Resumen general · ${new Date().toLocaleDateString("es-SV", { dateStyle: "full" })}`} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi icon={UserRound} label="Clientes" value={db.clientes.length} />
        <Kpi icon={Bike} label="Motocicletas" value={db.motos.length} />
        <Kpi icon={Wrench} label="Servicios realizados" value={realizados} />
        <Kpi icon={ClipboardList} label="Órdenes pendientes" value={pendientes} />
        <Kpi icon={Receipt} label="Facturación del día" value={money(factHoy)} tone />
        <Kpi icon={DollarSign} label="Ingresos del mes" value={money(ingresosMes)} tone />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><Panel title="Ingresos por mes">
          <div className="h-64"><ResponsiveContainer>
            <AreaChart data={MESES}>
              <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip formatter={(v: number) => money(v)} />
              <Area type="monotone" dataKey="ingresos" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#g)" />
            </AreaChart>
          </ResponsiveContainer></div>
        </Panel></div>
        <Panel title="Estado de órdenes">
          <div className="h-64"><ResponsiveContainer>
            <PieChart>
              <Pie data={estados} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                {estados.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer></div>
          <div className="flex flex-wrap gap-2">{estados.map((e) => <span key={e.name} className="text-xs text-muted-foreground"><Status value={e.name} /> {e.value}</span>)}</div>
        </Panel>
      </div>

      <Panel title="Servicios más solicitados">
        <div className="h-56"><ResponsiveContainer>
          <BarChart data={svcCount} layout="vertical" margin={{ left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis type="number" allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis type="category" dataKey="name" width={140} stroke="var(--muted-foreground)" fontSize={12} />
            <Tooltip />
            <Bar dataKey="total" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer></div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Panel title="Últimos clientes">
          <ul className="space-y-2 text-sm">{[...db.clientes].reverse().slice(0, 4).map((c) => <li key={c.id} className="flex justify-between"><span className="font-medium">{c.nombre} {c.apellido}</span><span className="text-muted-foreground">{c.fecha}</span></li>)}</ul>
        </Panel>
        <Panel title="Últimas órdenes">
          <ul className="space-y-2 text-sm">{[...db.ordenes].reverse().slice(0, 4).map((o) => <li key={o.id} className="flex items-center justify-between gap-2"><span className="font-mono font-medium">{o.numero}</span><Status value={o.estado} /></li>)}</ul>
        </Panel>
        <Panel title="Últimas facturas">
          <ul className="space-y-2 text-sm">{[...db.facturas].reverse().slice(0, 4).map((f) => <li key={f.id} className="flex justify-between"><span><span className="font-mono">{f.numero}</span> · {L.cliente(f.clienteId)}</span><span className="font-semibold">{money(totales(f).total)}</span></li>)}</ul>
        </Panel>
        <Panel title="Servicios recientes">
          <ul className="space-y-2 text-sm">{[...db.ordenes].reverse().slice(0, 4).map((o) => <li key={o.id}><span className="font-medium">{o.servicios.map(L.servicio).join(", ")}</span><br /><span className="text-xs text-muted-foreground">{L.moto(o.motoId)}</span></li>)}</ul>
        </Panel>
      </div>
    </div>
  );
}
