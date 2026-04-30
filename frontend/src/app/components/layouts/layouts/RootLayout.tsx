import { Outlet, Navigate, useLocation } from "react-router";
import { Navbar } from "../navigation/Navbar";
import { Footer } from "../Footer";
import { useAuth } from "../../context/AuthContext";

export function RootLayout() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Admin can only access /administracion
  if (user?.rol === "ADMIN" && !location.pathname.startsWith("/administracion")) {
    return <Navigate to="/administracion" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Navbar />
      <main className="pt-16 flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
