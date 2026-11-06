import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// Datos simulados. Cada colección equivale a una tabla MySQL futura.
export type Rol = "Administrador" | "Recepcionista" | "Mecánico";
export interface Usuario { id: number; nombre: string; usuario: string; email: string; password: string; rol: Rol; activo: boolean; ultimoAcceso: string }
export interface Cliente { id: number; nombre: string; apellido: string; documento: string; telefono: string; email: string; direccion: string; fecha: string }
export interface Moto { id: number; clienteId: number; marca: string; modelo: string; anio: number; placa: string; color: string; chasis: string; km: number }
export interface Empleado { id: number; nombre: string; cargo: string; telefono: string; email: string; activo: boolean }
export interface Servicio { id: number; codigo: string; nombre: string; descripcion: string; precio: number; activo: boolean }
export type EstadoOrden = "Pendiente" | "En proceso" | "Finalizado" | "Entregado" | "Cancelado";
export interface Orden { id: number; numero: string; clienteId: number; motoId: number; mecanicoId: number; servicios: number[]; ingreso: string; entrega: string; estado: EstadoOrden; observaciones: string }
export interface Item { descripcion: string; cantidad: number; precio: number }
export interface Factura { id: number; numero: string; fecha: string; clienteId: number; motoId: number; items: Item[]; descuento: number; iva: number }
export interface Pago { id: number; facturaId: number; fecha: string; monto: number; metodo: "Efectivo" | "Transferencia bancaria" | "Tarjeta"; estado: "Completado" | "Pendiente" | "Anulado" }

export interface DB { usuarios: Usuario[]; clientes: Cliente[]; motos: Moto[]; empleados: Empleado[]; servicios: Servicio[]; ordenes: Orden[]; facturas: Factura[]; pagos: Pago[] }
export type Col = keyof DB;

const today = new Date();
const d = (offset: number) => { const x = new Date(today); x.setDate(x.getDate() + offset); return x.toISOString().slice(0, 10); };

export const seed: DB = {
  usuarios: [
    { id: 1, nombre: "Cristell Almenar", usuario: "admin", email: "admin@motortaller.com", password: "admin123", rol: "Administrador", activo: true, ultimoAcceso: d(0) + " 08:12" },
    { id: 2, nombre: "Laura Gómez", usuario: "recepcion", email: "recepcion@motortaller.com", password: "recep123", rol: "Recepcionista", activo: true, ultimoAcceso: d(-1) + " 17:40" },
    { id: 3, nombre: "Miguel Rivas", usuario: "mecanico", email: "mrivas@motortaller.com", password: "meca123", rol: "Mecánico", activo: true, ultimoAcceso: d(-2) + " 09:05" },
  ],
  clientes: [
    { id: 1, nombre: "Carlos", apellido: "Martínez", documento: "04567891-2", telefono: "7012-3456", email: "carlos.martinez@mail.com", direccion: "Col. Escalón, San Salvador", fecha: d(-60) },
    { id: 2, nombre: "Ana", apellido: "Rodríguez", documento: "05123478-9", telefono: "7890-1122", email: "ana.rodriguez@mail.com", direccion: "Santa Tecla, La Libertad", fecha: d(-34) },
    { id: 3, nombre: "José", apellido: "Hernández", documento: "03984561-0", telefono: "7455-6677", email: "jose.hdz@mail.com", direccion: "Soyapango, San Salvador", fecha: d(-12) },
    { id: 4, nombre: "María", apellido: "López", documento: "06231457-3", telefono: "7321-9900", email: "maria.lopez@mail.com", direccion: "Antiguo Cuscatlán", fecha: d(-3) },
  ],
  motos: [
    { id: 1, clienteId: 1, marca: "Honda", modelo: "CB 190R", anio: 2022, placa: "M-123456", color: "Rojo", chasis: "LTMKD0796N5100231", km: 18400 },
    { id: 2, clienteId: 2, marca: "Yamaha", modelo: "FZ 2.0", anio: 2021, placa: "M-654321", color: "Azul", chasis: "ME1RG0718M0012874", km: 26750 },
    { id: 3, clienteId: 3, marca: "Suzuki", modelo: "Gixxer 150", anio: 2023, placa: "M-778899", color: "Negro", chasis: "MB8NG4BA7P8100452", km: 7900 },
    { id: 4, clienteId: 4, marca: "Bajaj", modelo: "Pulsar NS200", anio: 2020, placa: "M-445566", color: "Blanco", chasis: "MD2A36FZ9LCB01234", km: 34100 },
  ],
  empleados: [
    { id: 1, nombre: "Miguel Rivas", cargo: "Mecánico senior", telefono: "7111-2233", email: "mrivas@motortaller.com", activo: true },
    { id: 2, nombre: "Óscar Pineda", cargo: "Mecánico", telefono: "7222-3344", email: "opineda@motortaller.com", activo: true },
    { id: 3, nombre: "Laura Gómez", cargo: "Recepcionista", telefono: "7333-4455", email: "recepcion@motortaller.com", activo: true },
    { id: 4, nombre: "Kevin Flores", cargo: "Ayudante de taller", telefono: "7444-5566", email: "kflores@motortaller.com", activo: false },
  ],
  servicios: [
    { id: 1, codigo: "SRV-001", nombre: "Cambio de aceite", descripcion: "Aceite 10W-40 y filtro", precio: 25, activo: true },
    { id: 2, codigo: "SRV-002", nombre: "Mantenimiento general", descripcion: "Revisión completa de 30 puntos", precio: 60, activo: true },
    { id: 3, codigo: "SRV-003", nombre: "Reparación de frenos", descripcion: "Pastillas, líquido y ajuste", precio: 45, activo: true },
    { id: 4, codigo: "SRV-004", nombre: "Cambio de llantas", descripcion: "Montaje y balanceo", precio: 30, activo: true },
    { id: 5, codigo: "SRV-005", nombre: "Diagnóstico mecánico", descripcion: "Escaneo y diagnóstico", precio: 15, activo: true },
    { id: 6, codigo: "SRV-006", nombre: "Reparación de motor", descripcion: "Reparación parcial o total", precio: 220, activo: true },
  ],
  ordenes: [
    { id: 1, numero: "OT-0001", clienteId: 1, motoId: 1, mecanicoId: 1, servicios: [1, 2], ingreso: d(-5), entrega: d(-4), estado: "Entregado", observaciones: "Cliente solicita revisar cadena." },
    { id: 2, numero: "OT-0002", clienteId: 2, motoId: 2, mecanicoId: 2, servicios: [3], ingreso: d(-2), entrega: d(0), estado: "Finalizado", observaciones: "" },
    { id: 3, numero: "OT-0003", clienteId: 3, motoId: 3, mecanicoId: 1, servicios: [5, 6], ingreso: d(-1), entrega: d(3), estado: "En proceso", observaciones: "Ruido en el motor al acelerar." },
    { id: 4, numero: "OT-0004", clienteId: 4, motoId: 4, mecanicoId: 2, servicios: [4], ingreso: d(0), entrega: d(1), estado: "Pendiente", observaciones: "" },
  ],
  facturas: [
    { id: 1, numero: "FAC-0001", fecha: d(-4), clienteId: 1, motoId: 1, items: [{ descripcion: "Cambio de aceite", cantidad: 1, precio: 25 }, { descripcion: "Mantenimiento general", cantidad: 1, precio: 60 }], descuento: 5, iva: 13 },
    { id: 2, numero: "FAC-0002", fecha: d(0), clienteId: 2, motoId: 2, items: [{ descripcion: "Reparación de frenos", cantidad: 1, precio: 45 }, { descripcion: "Pastillas de freno", cantidad: 2, precio: 12 }], descuento: 0, iva: 13 },
  ],
  pagos: [
    { id: 1, facturaId: 1, fecha: d(-4), monto: 90.4, metodo: "Tarjeta", estado: "Completado" },
    { id: 2, facturaId: 2, fecha: d(0), monto: 40, metodo: "Efectivo", estado: "Pendiente" },
  ],
};

export function totales(f: Pick<Factura, "items" | "descuento" | "iva">) {
  const subtotal = f.items.reduce((s, i) => s + i.cantidad * i.precio, 0);
  const descuento = Math.min(f.descuento || 0, subtotal);
  const base = subtotal - descuento;
  const iva = +(base * (f.iva / 100)).toFixed(2);
  return { subtotal, descuento, iva, total: +(base + iva).toFixed(2) };
}
export const money = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface Ctx {
  db: DB;
  save: <C extends Col>(col: C, item: DB[C][number]) => Promise<void>;
  remove: (col: Col, id: number) => Promise<void>;
  user: Usuario | null;
  ready: boolean;
  login: (u: string, p: string) => Promise<"ok" | "user" | "pass" | "inactive" | "error">;
  logout: () => void;
}
const StoreCtx = createContext<Ctx | null>(null);
const SKEY = "taller-session";
const API = "http://localhost:3001/api";
const emptyDB: DB = { usuarios: [], clientes: [], motos: [], empleados: [], servicios: [], ordenes: [], facturas: [], pagos: [] };

async function apiRequest<T>(path: string, options: RequestInit = {}, userId?: number): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");
  if (userId) headers.set("x-user-id", String(userId));
  const response = await fetch(`${API}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || "No se pudo completar la operación") as Error & { code?: string; status?: number };
    error.code = payload.code;
    error.status = response.status;
    throw error;
  }
  return payload as T;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(emptyDB);
  const [user, setUser] = useState<Usuario | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    const restore = async () => {
      const sid = Number(localStorage.getItem(SKEY));
      if (sid) {
        try {
          const data = await apiRequest<DB>("/db", {}, sid);
          if (!alive) return;
          setDb(data);
          setUser(data.usuarios.find((u) => u.id === sid) ?? null);
          if (!data.usuarios.some((u) => u.id === sid)) localStorage.removeItem(SKEY);
        } catch {
          localStorage.removeItem(SKEY);
          if (alive) { setDb(emptyDB); setUser(null); }
        }
      }
      if (alive) setReady(true);
    };
    void restore();
    return () => { alive = false; };
  }, []);

  const save: Ctx["save"] = async (col, item) => {
    if (!user) throw new Error("Inicia sesión para guardar cambios");
    const saved = await apiRequest<Record<string, unknown>>(`/${col}`, {
      method: "POST", body: JSON.stringify(item),
    }, user.id);
    const merged = { ...item, ...saved } as DB[typeof col][number];
    if (col === "usuarios") (merged as Usuario).password = "";
    setDb((prev) => {
      const list = prev[col] as { id: number }[];
      const record = merged as { id: number };
      const next = record.id
        ? list.some((x) => x.id === record.id) ? list.map((x) => x.id === record.id ? record : x) : [...list, record]
        : [...list, record];
      return { ...prev, [col]: next };
    });
  };

  const remove: Ctx["remove"] = async (col, id) => {
    if (!user) throw new Error("Inicia sesión para eliminar registros");
    await apiRequest<{ ok: boolean }>(`/${col}/${id}`, { method: "DELETE" }, user.id);
    setDb((prev) => ({ ...prev, [col]: (prev[col] as { id: number }[]).filter((x) => x.id !== id) }));
  };

  const login: Ctx["login"] = async (u, p) => {
    try {
      const result = await apiRequest<{ user: Usuario }>("/login", {
        method: "POST", body: JSON.stringify({ login: u, password: p }),
      });
      const data = await apiRequest<DB>("/db", {}, result.user.id);
      setDb(data);
      setUser(data.usuarios.find((x) => x.id === result.user.id) ?? result.user);
      localStorage.setItem(SKEY, String(result.user.id));
      return "ok";
    } catch (error) {
      const e = error as Error & { code?: string; status?: number };
      if (e.code === "user" || e.status === 404) return "user";
      if (e.code === "pass" || e.status === 401) return "pass";
      if (e.code === "inactive" || e.status === 403) return "inactive";
      return "error";
    }
  };

  const logout = () => { setUser(null); setDb(emptyDB); localStorage.removeItem(SKEY); };

  return <StoreCtx.Provider value={{ db, save, remove, user, ready, login, logout }}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore fuera de StoreProvider");
  return c;
}

export function useLookups() {
  const { db } = useStore();
  return {
    cliente: (id: number) => { const c = db.clientes.find((x) => x.id === id); return c ? `${c.nombre} ${c.apellido}` : "—"; },
    moto: (id: number) => { const m = db.motos.find((x) => x.id === id); return m ? `${m.marca} ${m.modelo} · ${m.placa}` : "—"; },
    empleado: (id: number) => db.empleados.find((x) => x.id === id)?.nombre ?? "—",
    servicio: (id: number) => db.servicios.find((x) => x.id === id)?.nombre ?? "—",
  };
}
