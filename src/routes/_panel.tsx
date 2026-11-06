import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  LogOut, Cog,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import { useStore } from "@/lib/store";
import { NAV } from "@/lib/nav";
import { Status } from "@/components/PageHeader";

export const Route = createFileRoute("/_panel")({ component: PanelLayout });

function AppSidebar() {
  const { user, logout } = useStore();
  const { setOpenMobile } = useSidebar();
  const navigate = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const items = NAV.filter((n) => user && n.roles.includes(user.rol));
  return (
    <Sidebar collapsible="icon" className="no-print">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-1 py-1.5">
          <div className="grid size-9 shrink-0 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground"><Cog className="size-5" /></div>
          <div className="leading-tight group-data-[collapsible=icon]:hidden">
            <p className="font-display text-lg font-bold uppercase tracking-wide text-sidebar-accent-foreground">MotoTaller</p>
            <p className="text-[11px] uppercase tracking-widest text-sidebar-foreground/60">Sistema de gestión</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((i) => (
                <SidebarMenuButton key={i.url} asChild isActive={path === i.url} tooltip={i.title}
                  className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground">
                  <Link to={i.url} onClick={() => setOpenMobile(false)}><i.icon /><span>{i.title}</span></Link>
                </SidebarMenuButton>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Cerrar sesión" onClick={() => { logout(); navigate({ to: "/" }); }}>
              <LogOut /><span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function PanelLayout() {
  const { user, ready } = useStore();
  const navigate = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });
  useEffect(() => { if (ready && !user) navigate({ to: "/" }); }, [ready, user, navigate]);
  if (!ready || !user) return <div className="grid min-h-screen place-items-center text-muted-foreground">Cargando…</div>;
  const allowed = NAV.find((n) => n.url === path)?.roles.includes(user.rol) ?? true;
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="no-print sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-card/90 px-4 backdrop-blur">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-3">
              <div className="text-right leading-tight">
                <p className="text-sm font-semibold">{user.nombre}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Status value={user.rol} />
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {allowed ? <Outlet /> : (
              <div className="mx-auto mt-20 max-w-md rounded-lg border bg-card p-8 text-center shadow-card">
                <h2 className="font-display text-2xl font-bold uppercase">Acceso restringido</h2>
                <p className="mt-2 text-sm text-muted-foreground">Tu rol ({user.rol}) no tiene permiso para este módulo.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
