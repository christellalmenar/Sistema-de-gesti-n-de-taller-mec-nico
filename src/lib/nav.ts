import {
  LayoutDashboard, Users, UserRound, Bike, HardHat, Wrench, ClipboardList, Receipt, Wallet, BarChart3, Settings,
} from "lucide-react";
import type { Rol } from "@/lib/store";

type NavItem = { title: string; url: string; icon: typeof Users; roles: Rol[] };
const ALL: Rol[] = ["Administrador", "Recepcionista", "Mecánico"];
export const NAV: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ALL },
  { title: "Usuarios", url: "/usuarios", icon: Users, roles: ["Administrador"] },
  { title: "Clientes", url: "/clientes", icon: UserRound, roles: ["Administrador", "Recepcionista"] },
  { title: "Motocicletas", url: "/motocicletas", icon: Bike, roles: ALL },
  { title: "Empleados", url: "/empleados", icon: HardHat, roles: ["Administrador"] },
  { title: "Servicios", url: "/servicios", icon: Wrench, roles: ALL },
  { title: "Órdenes de Trabajo", url: "/ordenes", icon: ClipboardList, roles: ALL },
  { title: "Facturación", url: "/facturacion", icon: Receipt, roles: ["Administrador", "Recepcionista"] },
  { title: "Pagos", url: "/pagos", icon: Wallet, roles: ["Administrador", "Recepcionista"] },
  { title: "Reportes", url: "/reportes", icon: BarChart3, roles: ["Administrador"] },
  { title: "Configuración", url: "/configuracion", icon: Settings, roles: ["Administrador"] },
];

