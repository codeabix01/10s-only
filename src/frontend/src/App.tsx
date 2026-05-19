import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AdminPage from "@/pages/AdminPage";
import ApplyPage from "@/pages/ApplyPage";
import HomePage from "@/pages/HomePage";
import PortalPage from "@/pages/PortalPage";
import StatusPage from "@/pages/StatusPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const queryClient = new QueryClient();

const rootRoute = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Outlet />
      </Layout>
    </QueryClientProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const applyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apply",
  component: ApplyPage,
});

const statusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/status",
  component: StatusPage,
});

const portalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/portal",
  component: () => (
    <ProtectedRoute>
      <PortalPage />
    </ProtectedRoute>
  ),
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => (
    <ProtectedRoute requireAdmin>
      <AdminPage />
    </ProtectedRoute>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  applyRoute,
  statusRoute,
  portalRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
