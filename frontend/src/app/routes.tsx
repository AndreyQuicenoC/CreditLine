import { lazy, Suspense } from "react";
import { Routes as ReactRoutes, Route, Navigate } from "react-router";
import { useAuth } from "./context/AuthContext";
import { RootLayout } from "./components/layouts/layouts/RootLayout";

const Dashboard = lazy(() =>
  import("./pages/Dashboard").then((module) => ({ default: module.Dashboard })),
);
const Cartera = lazy(() =>
  import("./pages/Cartera").then((module) => ({ default: module.Cartera })),
);
const ClienteDetalle = lazy(() =>
  import("./pages/ClienteDetalle").then((module) => ({
    default: module.ClienteDetalle,
  })),
);
const DeudaDetalle = lazy(() =>
  import("./pages/DeudaDetalle").then((module) => ({
    default: module.DeudaDetalle,
  })),
);
const Deudas = lazy(() =>
  import("./pages/Deudas").then((module) => ({ default: module.Deudas })),
);
const Estadisticas = lazy(() =>
  import("./pages/Estadisticas").then((module) => ({
    default: module.Estadisticas,
  })),
);
const FinanzasPersonales = lazy(() =>
  import("./pages/FinanzasPersonales").then((module) => ({
    default: module.FinanzasPersonales,
  })),
);
const Administracion = lazy(() =>
  import("./pages/Administracion").then((module) => ({
    default: module.Administracion,
  })),
);
const Login = lazy(() =>
  import("./pages/Login").then((module) => ({ default: module.Login })),
);
const NotFound = lazy(() =>
  import("./pages/NotFound").then((module) => ({ default: module.NotFound })),
);
const NuevoCliente = lazy(() =>
  import("./pages/NuevoCliente").then((module) => ({
    default: module.NuevoCliente,
  })),
);
const Municipios = lazy(() =>
  import("./pages/Municipios").then((module) => ({
    default: module.Municipios,
  })),
);

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

// Admin Only Route
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}

// Operario Only Route
function OperarioRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isOperario, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isOperario) return <Navigate to="/administracion" replace />;

  return <>{children}</>;
}

export default function Routes() {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Cargando...</p>
          </div>
        </div>
      }
    >
      <ReactRoutes>
        {/* Login Route */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RootLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="cartera" element={<Cartera />} />
          <Route path="cartera/nuevo" element={<NuevoCliente />} />
          <Route path="cartera/:clienteId" element={<ClienteDetalle />} />
          <Route path="cartera/:clienteId/editar" element={<NuevoCliente />} />
          <Route path="deuda/:deudaId" element={<DeudaDetalle />} />
          <Route path="deudas" element={<Deudas />} />
          <Route path="estadisticas" element={<Estadisticas />} />
          <Route path="finanzas-personales" element={<FinanzasPersonales />} />

          {/* Admin Only Routes */}
          <Route
            path="administracion"
            element={
              <AdminRoute>
                <Administracion />
              </AdminRoute>
            }
          />
          <Route
            path="municipios"
            element={
              <OperarioRoute>
                <Municipios />
              </OperarioRoute>
            }
          />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </ReactRoutes>
    </Suspense>
  );
}
