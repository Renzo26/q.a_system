import { createRootRoute, createRoute, createRouter, redirect, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Login } from "@/routes/Login";
import { Dashboard } from "@/routes/Dashboard";
import { Connect } from "@/routes/Connect";
import { Copilot } from "@/routes/Copilot";
import { Defeitos } from "@/routes/Defeitos";
import { auth } from "@/lib/auth";

const rootRoute = createRootRoute({ component: () => <Outlet /> });

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  beforeLoad: () => {
    if (auth.snapshot().user) throw redirect({ to: "/dashboard" });
  },
  component: Login,
});

/** Layout autenticado (pathless): envolve o app shell e protege os filhos. */
const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_app",
  beforeLoad: () => {
    if (!auth.snapshot().user) throw redirect({ to: "/login" });
  },
  component: AppShell,
});

const dashboardRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/dashboard",
  component: Dashboard,
});

const copilotRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/argus",
  component: Copilot,
});

const defeitosRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/defeitos",
  component: Defeitos,
});

const connectRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/conectar",
  component: Connect,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: auth.snapshot().user ? "/dashboard" : "/login" });
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  appLayoutRoute.addChildren([dashboardRoute, copilotRoute, defeitosRoute, connectRoute]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});
