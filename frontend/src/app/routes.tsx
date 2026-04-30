import { Routes as ReactRoutes, Route, Navigate } from 'react-router'
import { useAuth } from './context/AuthContext'
import { RootLayout } from './components/layouts/RootLayout'
import { Dashboard } from './pages/Dashboard'
import { Cartera } from './pages/Cartera'
import { ClienteDetalle } from './pages/ClienteDetalle'
import { DeudaDetalle } from './pages/DeudaDetalle'
import { Deudas } from './pages/Deudas'
import { Estadisticas } from './pages/Estadisticas'
import { FinanzasPersonales } from './pages/FinanzasPersonales'
import { Administracion } from './pages/Administracion'
import { Login } from './pages/Login'
import { NotFound } from './pages/NotFound'
import { NuevoCliente } from './pages/NuevoCliente'
import { Municipios } from './pages/Municipios'

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// Admin Only Route
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />

  return <>{children}</>
}

export default function Routes() {
  const { isAuthenticated } = useAuth()

  return (
    <ReactRoutes>
      {/* Login Route */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login />
        }
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
            <AdminRoute>
              <Municipios />
            </AdminRoute>
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </ReactRoutes>
  )
}
