import { useState } from "react";
import { Users, Settings, Shield } from "lucide-react";
import toast from "../../lib/toast";
import { Link } from "react-router";

export function Administracion() {
  const [activeTab, setActiveTab] = useState("usuarios");

  return (
    <div className="max-w-[1100px] mx-auto px-4 lg:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#0F172A]">Administración</h1>
          <p className="text-[#64748B] text-sm">Configuraciones y administración del sistema</p>
        </div>
        <div>
          <Link to="/administracion/roles" className="text-[#2563EB] hover:underline text-sm">Gestionar roles</Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setActiveTab("usuarios")} className={`px-3 py-2 rounded-xl ${activeTab === "usuarios" ? "bg-[#EFF6FF] text-[#2563EB]" : "text-[#64748B]"}`}>Usuarios</button>
          <button onClick={() => setActiveTab("seguridad")} className={`px-3 py-2 rounded-xl ${activeTab === "seguridad" ? "bg-[#FEF2F2] text-[#DC2626]" : "text-[#64748B]"}`}>Seguridad</button>
          <button onClick={() => setActiveTab("config")} className={`px-3 py-2 rounded-xl ${activeTab === "config" ? "bg-[#F8FAFC] text-[#0F172A]" : "text-[#64748B]"}`}>Configuración</button>
        </div>

        {activeTab === "usuarios" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
              <div className="flex items-center gap-3"><div className="p-2 bg-[#EFF6FF] rounded-lg"><Users className="w-4 h-4 text-[#2563EB]" /></div><div><div className="text-[#0F172A] font-medium">Usuarios</div><div className="text-[#64748B] text-xs">Administrar cuentas de operarios</div></div></div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
              <div className="flex items-center gap-3"><div className="p-2 bg-[#F8FAFC] rounded-lg"><Settings className="w-4 h-4 text-[#0F172A]" /></div><div><div className="text-[#0F172A] font-medium">Ajustes</div><div className="text-[#64748B] text-xs">Preferencias del sistema</div></div></div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
              <div className="flex items-center gap-3"><div className="p-2 bg-[#FEF2F2] rounded-lg"><Shield className="w-4 h-4 text-[#DC2626]" /></div><div><div className="text-[#0F172A] font-medium">Seguridad</div><div className="text-[#64748B] text-xs">Políticas y registros</div></div></div>
            </div>
          </div>
        )}

        {activeTab === "seguridad" && <div className="p-4 text-sm text-[#64748B]">Funciones de seguridad (mock UI)</div>}
        {activeTab === "config" && <div className="p-4 text-sm text-[#64748B]">Configuraciones generales (mock UI)</div>}
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Shield,
  User,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "../../lib/toast";
import { useAuth, UserRole } from "../context/AuthContext";
import { Navigate } from "react-router";
import { Tooltip } from "../components/ui/Tooltip";
import { logger } from "../../utils/logger";
import { usersAPI } from "../services/usersAPI";

interface UsuarioSistema {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  ultimoAcceso: string;
}

interface UsuarioForm {
  nombre: string;
  email: string;
  rol: UserRole;
  password: string;
}

function AdminContent() {
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<UsuarioForm>({
    nombre: "",
    email: "",
    rol: "OPERARIO",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<UsuarioForm>>({});
  const [tasaInteres, setTasaInteres] = useState(10);
  const [impuestoRetraso, setImpuestoRetraso] = useState(5);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Load users and config on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("[Administracion] Loading users and system config");
        logger.info("Administracion", "Loading users and system config");

        // Fetch users
        const usersRes = await usersAPI.listUsers();
        if (usersRes.data) {
          console.log("[Administracion] Users loaded:", usersRes.data.length);
          logger.info("Administracion", "Users loaded successfully", {
            count: usersRes.data.length,
          });
          setUsuarios(
            usersRes.data.map((u) => ({
              id: u.auth_id,
              nombre: u.nombre,
              email: u.email,
              rol: u.rol,
              ultimoAcceso: u.ultimo_acceso || "—",
            })),
          );
        } else {
          console.error(
            "[Administracion] Failed to load users:",
            usersRes.error,
          );
          logger.warn("Administracion", "Failed to load users", {
            error: usersRes.error,
          });
        }

        // Fetch system config
        const configRes = await usersAPI.getSystemConfig();
        if (configRes.data) {
          console.log("[Administracion] System config loaded:", configRes.data);
          logger.info("Administracion", "System config loaded successfully");
          setTasaInteres(configRes.data.tasa_interes);
          setImpuestoRetraso(configRes.data.impuesto_retraso);
        } else {
          console.error(
            "[Administracion] Failed to load system config:",
            configRes.error,
          );
          logger.warn("Administracion", "Failed to load system config", {
            error: configRes.error,
          });
        }
      } catch (error) {
        console.error("[Administracion] Error loading data:", error);
        logger.error("Administracion", "Error loading data", error as Error);
      }
    };

    loadData();
  }, []);

  // Listen for global user updates (e.g., profile edited in Navbar)
  useEffect(() => {
    const handleUserUpdated = () => {
      try {
        const stored = localStorage.getItem("creditline_user");
        if (!stored) return;
        const updated = JSON.parse(stored);
        setUsuarios((prev) =>
          prev.map((u) =>
            u.id === updated.auth_id ? { ...u, nombre: updated.nombre, email: updated.email } : u,
          ),
        );
      } catch (e) {
        /* ignore */
      }
    };

    window.addEventListener("user:updated", handleUserUpdated);
    return () => window.removeEventListener("user:updated", handleUserUpdated);
  }, []);

  const openNew = () => {
    setEditingId(null);
    setForm({ nombre: "", email: "", rol: "OPERARIO", password: "" });
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (u: UsuarioSistema) => {
    setEditingId(u.id);
    setForm({ nombre: u.nombre, email: u.email, rol: u.rol });
    setErrors({});
    setShowForm(true);
  };

  const validate = (): boolean => {
    const e: Partial<UsuarioForm> = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es requerido.";
    if (!form.email.trim()) e.email = "El correo es requerido.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Correo inválido.";
    if (!editingId && !form.password)
      e.password = "La contraseña es requerida.";
    else if (form.password && form.password.length < 6)
      e.password = "Mínimo 6 caracteres.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    console.log("[Administracion] *** HANDLE SAVE CALLED ***", {
      editingId,
      form,
    });
    if (!validate()) {
      console.warn("[Administracion] Validation failed");
      toast.error("Formulario incompleto", {
        description: "Revisa los campos requeridos.",
      });
      return;
    }

    setLoading(true);

    try {
      if (editingId) {
        // Update existing user
        logger.info("Administracion", "Updating user", { userId: editingId });

        const res = await usersAPI.editUser(editingId, {
          nombre: form.nombre,
          rol: form.rol,
          email: form.email,
        });

        if (res.data) {
          setUsuarios((prev) =>
            prev.map((u) =>
              u.id === editingId
                ? { ...u, nombre: form.nombre, rol: form.rol }
                : u,
            ),
          );
          logger.info("Administracion", "User updated successfully", {
            nombre: form.nombre,
            rol: form.rol,
          });
          toast.success("Usuario actualizado", {
            description: `"${form.nombre}" fue actualizado.`,
            action: (
              <button onClick={() => toast.dismiss()} className="font-medium">
                ✕
              </button>
            ),
          });
          setShowForm(false);
          setEditingId(null);
        } else {
          logger.warn("Administracion", "Failed to update user", {
            error: res.error,
          });
          toast.error("Error al actualizar", {
            description: res.error || "Intenta de nuevo.",
            action: (
              <button onClick={() => toast.dismiss()} className="font-medium">
                ✕
              </button>
            ),
          });
        }
      } else {
        // Create new user
        logger.info("Administracion", "Creating new user", {
          email: form.email,
        });

        const res = await usersAPI.createUser({
          nombre: form.nombre,
          email: form.email,
          rol: form.rol,
          password: form.password,
        });

        if (res.data) {
          const newUser = res.data.user;
          setUsuarios((prev) => [
            ...prev,
            {
              id: newUser.auth_id,
              nombre: newUser.nombre,
              email: newUser.email,
              rol: newUser.rol,
              ultimoAcceso: "—",
            },
          ]);
          logger.info("Administracion", "User created successfully", {
            email: form.email,
            rol: form.rol,
          });
          toast.success("Usuario creado", {
            description: `"${form.nombre}" fue agregado al sistema.`,
            action: (
              <button onClick={() => toast.dismiss()} className="font-medium">
                ✕
              </button>
            ),
          });
          setShowForm(false);
          setEditingId(null);
        } else {
          logger.warn("Administracion", "Failed to create user", {
            error: res.error,
            email: form.email,
          });
          // If email already exists, keep modal open and show actionable toast
          toast.error("Error al crear usuario", {
            description: res.error || "Intenta de nuevo.",
            action: (
              <button onClick={() => toast.dismiss()} className="font-medium">
                ✕
              </button>
            ),
          });
        }
      }
    } catch (error) {
      logger.error("Administracion", "Error saving user", error as Error);
      toast.error("Error de conexión", {
        description: "No se pudo conectar al servidor.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const u = usuarios.find((x) => x.id === deleteId);

    try {
      logger.info("Administracion", "Deleting user", {
        userId: deleteId,
        nombre: u?.nombre,
      });

      const res = await usersAPI.deleteUser(deleteId!);

      if (res.data || res.error?.includes("404")) {
        setUsuarios((prev) => prev.filter((x) => x.id !== deleteId));
        setDeleteId(null);
        logger.info("Administracion", "User deleted successfully", {
          nombre: u?.nombre,
        });
        toast.success("Usuario eliminado", {
          description: `"${u?.nombre}" fue eliminado.`,
        });
      } else {
        logger.warn("Administracion", "Failed to delete user", {
          error: res.error,
        });
        toast.error("Error al eliminar", {
          description: "No se pudo eliminar el usuario.",
        });
      }
    } catch (error) {
      logger.error("Administracion", "Error deleting user", error as Error);
      toast.error("Error de conexión", {
        description: "No se pudo conectar al servidor.",
      });
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[#0F172A] mb-1">Administración</h1>
          <p className="text-[#64748B]">
            Gestión de usuarios y configuración del sistema
          </p>
        </div>
        <Tooltip content="Crear nuevo usuario del sistema">
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 bg-[#2563EB] text-white px-5 py-2.5 rounded-xl hover:bg-[#1E3A8A] transition-colors shadow-sm text-sm"
            aria-label="Agregar nuevo usuario"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Nuevo Usuario
          </button>
        </Tooltip>
      </div>

      {/* Usuarios table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-[#E2E8F0]">
          <h3 className="text-[#0F172A]">Usuarios del Sistema</h3>
          <p className="text-[#64748B] text-sm">
            {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""}{" "}
            registrados
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" role="table" aria-label="Lista de usuarios">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th
                  scope="col"
                  className="text-left py-3 px-5 text-[#64748B] text-xs font-medium"
                >
                  Usuario
                </th>
                <th
                  scope="col"
                  className="text-left py-3 px-5 text-[#64748B] text-xs font-medium hidden sm:table-cell"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="text-left py-3 px-5 text-[#64748B] text-xs font-medium"
                >
                  Rol
                </th>
                <th
                  scope="col"
                  className="text-left py-3 px-5 text-[#64748B] text-xs font-medium hidden md:table-cell"
                >
                  Último acceso
                </th>
                <th
                  scope="col"
                  className="text-right py-3 px-5 text-[#64748B] text-xs font-medium"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
                >
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center ${u.rol === "ADMIN" ? "bg-[#EFF6FF]" : "bg-[#F0FDF4]"}`}
                      >
                        {u.rol === "ADMIN" ? (
                          <Shield
                            className="w-4 h-4 text-[#2563EB]"
                            aria-hidden="true"
                          />
                        ) : (
                          <User
                            className="w-4 h-4 text-[#16A34A]"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <div>
                        <div className="text-[#0F172A] text-sm font-medium">
                          {u.nombre}
                        </div>
                        <div className="text-[#94A3B8] text-xs sm:hidden">
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-[#64748B] text-sm hidden sm:table-cell">
                    {u.email}
                  </td>
                  <td className="py-4 px-5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.rol === "ADMIN"
                          ? "bg-[#EFF6FF] text-[#2563EB]"
                          : "bg-[#F0FDF4] text-[#16A34A]"
                      }`}
                    >
                      {u.rol === "ADMIN" ? (
                        <Shield className="w-3 h-3" />
                      ) : (
                        <User className="w-3 h-3" />
                      )}
                      {u.rol === "ADMIN" ? "Administrador" : "Operario"}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-[#64748B] text-sm hidden md:table-cell">
                    {u.ultimoAcceso}
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip content="Editar usuario">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-2 hover:bg-[#EFF6FF] rounded-lg transition-colors text-[#64748B] hover:text-[#2563EB]"
                          aria-label={`Editar ${u.nombre}`}
                        >
                          <Edit2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Eliminar usuario">
                        <button
                          onClick={() => setDeleteId(u.id)}
                          className="p-2 hover:bg-[#FEF2F2] rounded-lg transition-colors text-[#64748B] hover:text-[#DC2626]"
                          aria-label={`Eliminar ${u.nombre}`}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Config */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6">
          <h3 className="text-[#0F172A] mb-4">Configuración General</h3>
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[#0F172A] text-sm mb-0.5">
                  Tasa de Interés Predeterminada
                </div>
                <div className="text-[#64748B] text-xs">
                  Tasa aplicada a nuevos préstamos
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={tasaInteres}
                  onChange={(e) => setTasaInteres(Number(e.target.value))}
                  className="w-20 px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm text-right"
                />
                <span className="text-[#64748B] text-sm">%</span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[#0F172A] text-sm mb-0.5">
                  Impuesto por Retraso
                </div>
                <div className="text-[#64748B] text-xs">
                  Cargo adicional (%) aplicado a pagos atrasados
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={impuestoRetraso}
                  onChange={(e) => setImpuestoRetraso(Number(e.target.value))}
                  className="w-20 px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm text-right"
                />
                <span className="text-[#64748B] text-sm">%</span>
              </div>
            </div>
            <button
              onClick={async () => {
                console.log(
                  "[Administracion] *** GUARDAR CONFIGURACION CLICKED ***",
                  { tasaInteres, impuestoRetraso },
                );
                try {
                  const res = await usersAPI.updateSystemConfig({
                    tasa_interes: tasaInteres,
                    impuesto_retraso: impuestoRetraso,
                  });

                  if (res.data) {
                    toast.success("Configuración guardada", {
                      description: "Los cambios fueron aplicados.",
                    });
                  } else {
                    toast.error("Error al guardar", {
                      description: res.error || "Intenta de nuevo.",
                    });
                  }
                } catch (error) {
                  logger.error(
                    "Administracion",
                    "Error saving config",
                    error as Error,
                  );
                  toast.error("Error de conexión", {
                    description: "No se pudo conectar al servidor.",
                  });
                }
              }}
              className="w-full bg-[#2563EB] text-white py-2.5 rounded-xl hover:bg-[#1E3A8A] transition-colors text-sm flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" aria-hidden="true" />
              Guardar Configuración
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6">
          <h3 className="text-[#0F172A] mb-4">Información del Sistema</h3>
          <div className="space-y-3">
            {[
              ["Versión", "1.1.1"],
              ["Entorno", "Producción"],
              ["Último respaldo", new Date().toLocaleString()],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex items-center justify-between py-2 border-b border-[#F1F5F9]"
              >
                <span className="text-[#64748B] text-sm">{k}</span>
                <span className="text-[#0F172A] text-sm font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User form modal */}
      <AnimatePresence>
        {showForm && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-form-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <h3 id="user-form-title" className="text-[#0F172A] mb-1">
                {editingId ? "Editar Usuario" : "Nuevo Usuario"}
              </h3>
              <p className="text-[#64748B] text-sm mb-5">
                {editingId
                  ? "Modifica los datos del usuario."
                  : "Registra un nuevo usuario en el sistema."}
              </p>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="uf-nombre"
                    className="block text-[#334155] mb-1.5 text-sm"
                  >
                    Nombre completo <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    id="uf-nombre"
                    type="text"
                    value={form.nombre}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, nombre: e.target.value }));
                      setErrors((p) => ({ ...p, nombre: "" }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSave();
                      }
                    }}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm ${errors.nombre ? "border-[#DC2626]" : "border-[#E2E8F0]"}`}
                    placeholder="Nombre del usuario"
                  />
                  {errors.nombre && (
                    <p className="text-[#DC2626] text-xs mt-1">
                      {errors.nombre}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="uf-email"
                    className="block text-[#334155] mb-1.5 text-sm"
                  >
                    Correo electrónico <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    id="uf-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, email: e.target.value }));
                      setErrors((p) => ({ ...p, email: "" }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSave();
                      }
                    }}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm ${errors.email ? "border-[#DC2626]" : "border-[#E2E8F0]"}`}
                    placeholder="correo@ejemplo.com"
                  />
                  {errors.email && (
                    <p className="text-[#DC2626] text-xs mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="uf-rol"
                    className="block text-[#334155] mb-1.5 text-sm"
                  >
                    Rol <span className="text-[#DC2626]">*</span>
                  </label>
                  <select
                    id="uf-rol"
                    value={form.rol}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        rol: e.target.value as UserRole,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSave();
                      }
                    }}
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white text-sm"
                  >
                    <option value="OPERARIO">Operario</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                {!editingId && (
                  <div>
                    <label
                      htmlFor="uf-password"
                      className="block text-[#334155] mb-1.5 text-sm"
                    >
                      Contraseña <span className="text-[#DC2626]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="uf-password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => {
                          setForm((p) => ({ ...p, password: e.target.value }));
                          setErrors((p) => ({ ...p, password: "" }));
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSave();
                          }
                        }}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm ${errors.password ? "border-[#DC2626]" : "border-[#E2E8F0]"}`}
                        placeholder="Mínimo 6 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#64748B] hover:text-[#334155] transition-colors"
                        aria-label={
                          showPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" aria-hidden="true" />
                        ) : (
                          <Eye className="w-4 h-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-[#DC2626] text-xs mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-3 border border-[#E2E8F0] text-[#334155] rounded-xl hover:bg-[#F8FAFC] transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1E3A8A] transition-colors text-sm"
                >
                  {editingId ? "Guardar Cambios" : "Crear Usuario"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteId && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            role="alertdialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
            >
              <div className="w-12 h-12 bg-[#FEF2F2] rounded-xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-[#DC2626]" aria-hidden="true" />
              </div>
              <h3 className="text-[#0F172A] text-center mb-2">
                ¿Eliminar usuario?
              </h3>
              <p className="text-[#64748B] text-sm text-center mb-6">
                Esta acción eliminará a{" "}
                <strong className="text-[#0F172A]">
                  "{usuarios.find((u) => u.id === deleteId)?.nombre}"
                </strong>{" "}
                permanentemente.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-4 py-3 border border-[#E2E8F0] text-[#334155] rounded-xl hover:bg-[#F8FAFC] transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-3 bg-[#DC2626] text-white rounded-xl hover:bg-[#B91C1C] transition-colors text-sm"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Administracion() {
  const { user } = useAuth();
  if (!user || user.rol !== "ADMIN") {
    return <Navigate to="/" replace />;
  }
  return <AdminContent />;
}
