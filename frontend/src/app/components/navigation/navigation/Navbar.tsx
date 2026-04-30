import { Link, useLocation, useNavigate } from "react-router";
import {
  User,
  LogOut,
  CreditCard,
  Home,
  Users,
  MapPin,
  AlertCircle,
  BarChart2,
  Wallet,
  Shield,
  Edit2,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Tooltip } from "../../ui/ui/tooltip";
import { usersAPI } from "../../../services/usersAPI";
import { logger } from "../../../../utils/logger";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileName, setProfileName] = useState(user?.nombre ?? "");
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada", {
      description: "Has salido del sistema correctamente.",
    });
    navigate("/login");
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      toast.error("El nombre no puede estar vacío.");
      return;
    }

    try {
      logger.info("Navbar", "Updating profile", { nombre: profileName });
      
      const res = await usersAPI.updateUser(profileName);

      if (res.data) {
        // Update localStorage with new user data
        const currentUser = JSON.parse(localStorage.getItem('creditline_user') || '{}');
        const updatedUser = { ...currentUser, nombre: profileName };
        localStorage.setItem('creditline_user', JSON.stringify(updatedUser));
        
        // Dispatch event to update AuthContext
        window.dispatchEvent(new Event('user:updated'));
        
        logger.info("Navbar", "Profile updated successfully", { nombre: profileName });
        toast.success("Perfil actualizado", {
          description: "Tu nombre fue actualizado correctamente.",
        });
        setShowProfileModal(false);
      } else {
        logger.warn("Navbar", "Failed to update profile", { error: res.error });
        toast.error("Error al actualizar", { description: res.error || "Intenta de nuevo." });
      }
    } catch (error) {
      logger.error("Navbar", "Error updating profile", error as Error);
      toast.error("Error de conexión", { description: "No se pudo conectar al servidor." });
    }
  };

  const operarioLinks = [
    { path: "/", label: "Inicio", icon: Home },
    { path: "/cartera", label: "Cartera", icon: Users },
    { path: "/municipios", label: "Municipios", icon: MapPin },
    { path: "/deudas", label: "Deudas", icon: AlertCircle },
    { path: "/estadisticas", label: "Estadísticas", icon: BarChart2 },
    { path: "/finanzas-personales", label: "Finanzas", icon: Wallet },
  ];

  const adminLinks = [
    { path: "/administracion", label: "Administración", icon: Shield },
  ];

  const navLinks = user?.rol === "ADMIN" ? adminLinks : operarioLinks;

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 bg-white border-b border-[#E2E8F0] z-50 shadow-sm"
        role="navigation"
        aria-label="Navegación principal"
      >
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Brand + Desktop nav */}
            <div className="flex items-center gap-6 lg:gap-10 min-w-0">
              <Link
                to={user?.rol === "ADMIN" ? "/administracion" : "/"}
                className="flex items-center gap-2 text-[#1E3A8A] shrink-0"
                aria-label="CreditLine — Ir al inicio"
              >
                <CreditCard
                  className="w-5 h-5 text-[#2563EB]"
                  aria-hidden="true"
                />
                <span className="font-semibold text-xl tracking-tight">
                  CreditLine
                </span>
              </Link>

              {/* Desktop nav */}
              <div
                className="hidden lg:flex items-center gap-0.5"
                role="menubar"
              >
                {navLinks.map((link) => (
                  <Tooltip key={link.path} content={link.label} side="bottom">
                    <Link
                      to={link.path}
                      role="menuitem"
                      aria-current={isActive(link.path) ? "page" : undefined}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive(link.path)
                          ? "bg-[#1E3A8A] text-white"
                          : "text-[#334155] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </Tooltip>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* User Menu — icon only */}
              <div className="relative" ref={menuRef}>
                <Tooltip content="Mi perfil" side="bottom">
                  <button
                    onClick={() => setShowUserMenu((v) => !v)}
                    className="flex items-center gap-1.5 p-1.5 hover:bg-[#F1F5F9] rounded-xl transition-colors"
                    aria-haspopup="true"
                    aria-expanded={showUserMenu}
                    aria-label="Menú de usuario"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" aria-hidden="true" />
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#64748B] transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                </Tooltip>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#E2E8F0] py-2 z-50"
                      role="menu"
                    >
                      <div className="px-4 py-2.5 border-b border-[#E2E8F0] mb-1">
                        <p className="text-sm font-medium text-[#0F172A] truncate">
                          {user?.nombre}
                        </p>
                        <p className="text-xs text-[#64748B] truncate">
                          {user?.email}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            user?.rol === "ADMIN"
                              ? "bg-[#EFF6FF] text-[#2563EB]"
                              : "bg-[#F0FDF4] text-[#16A34A]"
                          }`}
                        >
                          {user?.rol === "ADMIN" ? (
                            <Shield className="w-3 h-3" aria-hidden="true" />
                          ) : (
                            <User className="w-3 h-3" aria-hidden="true" />
                          )}
                          {user?.rol === "ADMIN" ? "Administrador" : "Operario"}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setProfileName(user?.nombre ?? "");
                          setShowProfileModal(true);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-[#334155] hover:bg-[#F1F5F9] flex items-center gap-3 transition-colors"
                        role="menuitem"
                      >
                        <Edit2 className="w-4 h-4" aria-hidden="true" />
                        Editar perfil
                      </button>
                      <div className="border-t border-[#E2E8F0] my-1" />
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          handleLogout();
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-[#DC2626] hover:bg-[#FEF2F2] flex items-center gap-3 transition-colors"
                        role="menuitem"
                      >
                        <LogOut className="w-4 h-4" aria-hidden="true" />
                        Cerrar sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors"
                aria-label={
                  mobileOpen ? "Cerrar menú" : "Abrir menú de navegación"
                }
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? (
                  <X className="w-5 h-5 text-[#334155]" aria-hidden="true" />
                ) : (
                  <Menu className="w-5 h-5 text-[#334155]" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-[#E2E8F0] bg-white overflow-hidden"
            >
              <nav
                className="px-4 py-3 space-y-1"
                aria-label="Navegación móvil"
              >
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileOpen(false)}
                      aria-current={isActive(link.path) ? "page" : undefined}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                        isActive(link.path)
                          ? "bg-[#1E3A8A] text-white"
                          : "text-[#334155] hover:bg-[#F1F5F9]"
                      }`}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                      {link.label}
                    </Link>
                  );
                })}
                <div className="border-t border-[#E2E8F0] pt-2 mt-2">
                  <div className="px-4 py-2">
                    <p className="text-xs text-[#64748B] truncate">
                      {user?.nombre}
                    </p>
                    <p className="text-xs text-[#94A3B8] truncate">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    Cerrar sesión
                  </button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-14 h-14 bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] rounded-full flex items-center justify-center">
                  <User className="w-7 h-7 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h3
                    id="profile-modal-title"
                    className="text-[#0F172A] font-semibold"
                  >
                    Mi Perfil
                  </h3>
                  <p className="text-[#64748B] text-sm">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="profile-nombre"
                    className="block text-[#334155] mb-1.5 text-sm"
                  >
                    Nombre completo <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    id="profile-nombre"
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[#334155] mb-1.5 text-sm">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={user?.email}
                    readOnly
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] text-[#64748B] text-sm cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[#334155] mb-1.5 text-sm">
                    Rol
                  </label>
                  <input
                    type="text"
                    value={user?.rol === "ADMIN" ? "Administrador" : "Operario"}
                    readOnly
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] text-[#64748B] text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 px-4 py-3 border border-[#E2E8F0] text-[#334155] rounded-xl hover:bg-[#F8FAFC] transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 px-4 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1E3A8A] transition-colors text-sm"
                >
                  Guardar Cambios
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
