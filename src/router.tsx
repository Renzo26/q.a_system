import { createRootRoute, createRoute, createRouter, redirect, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Login } from "@/routes/Login";
import { Dashboard } from "@/routes/Dashboard";
import { Connect } from "@/routes/Connect";
import { Copilot } from "@/routes/Copilot";
import { Defeitos } from "@/routes/Defeitos";
import { Colecoes } from "@/routes/Colecoes";
import { Projetos } from "@/routes/Projetos";
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
  path: "/hunter",
  component: Copilot,
});

const defeitosRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/defeitos",
  component: Defeitos,
});

const colecoesRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/colecoes",
  component: Colecoes,
});

const projetosRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/projetos",
  component: Projetos,
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
  appLayoutRoute.addChildren([
    dashboardRoute,
    projetosRoute,
    copilotRoute,
    defeitosRoute,
    colecoesRoute,
    connectRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});
