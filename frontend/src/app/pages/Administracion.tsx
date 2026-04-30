import { useState } from "react";
import { Plus, Edit2, Trash2, Shield, User, Save } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useAuth, UserRole } from "../context/AuthContext";
import { Navigate } from "react-router";
import { Tooltip } from "../components/ui/Tooltip";

interface UsuarioSistema {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  ultimoAcceso: string;
}

const initialUsuarios: UsuarioSistema[] = [
  { id: "1", nombre: "Admin Principal", email: "admin@creditline.com", rol: "ADMIN", ultimoAcceso: "2026-04-29" },
  { id: "2", nombre: "Operario Demo", email: "operario@creditline.com", rol: "OPERARIO", ultimoAcceso: "2026-04-29" },
];

interface UsuarioForm {
  nombre: string;
  email: string;
  rol: UserRole;
}

function AdminContent() {
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>(initialUsuarios);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<UsuarioForm>({ nombre: "", email: "", rol: "OPERARIO" });
  const [errors, setErrors] = useState<Partial<UsuarioForm>>({});
  const [tasaInteres, setTasaInteres] = useState(10);
  const [impuestoRetraso, setImpuestoRetraso] = useState(5);

  const openNew = () => {
    setEditingId(null);
    setForm({ nombre: "", email: "", rol: "OPERARIO" });
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
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Correo inválido.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      toast.error("Formulario incompleto", { description: "Revisa los campos requeridos." });
      return;
    }
    if (editingId) {
      setUsuarios((prev) =>
        prev.map((u) => (u.id === editingId ? { ...u, ...form } : u))
      );
      toast.success("Usuario actualizado", { description: `"${form.nombre}" fue actualizado.` });
    } else {
      const newUser: UsuarioSistema = {
        id: `u${Date.now()}`,
        nombre: form.nombre,
        email: form.email,
        rol: form.rol,
        ultimoAcceso: "—",
      };
      setUsuarios((prev) => [...prev, newUser]);
      toast.success("Usuario creado", { description: `"${form.nombre}" fue agregado al sistema.` });
    }
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = () => {
    const u = usuarios.find((x) => x.id === deleteId);
    setUsuarios((prev) => prev.filter((x) => x.id !== deleteId));
    setDeleteId(null);
    toast.success("Usuario eliminado", { description: `"${u?.nombre}" fue eliminado.` });
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[#0F172A] mb-1">Administración</h1>
          <p className="text-[#64748B]">Gestión de usuarios y configuración del sistema</p>
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
          <p className="text-[#64748B] text-sm">{usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""} registrados</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" role="table" aria-label="Lista de usuarios">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th scope="col" className="text-left py-3 px-5 text-[#64748B] text-xs font-medium">Usuario</th>
                <th scope="col" className="text-left py-3 px-5 text-[#64748B] text-xs font-medium hidden sm:table-cell">Email</th>
                <th scope="col" className="text-left py-3 px-5 text-[#64748B] text-xs font-medium">Rol</th>
                <th scope="col" className="text-left py-3 px-5 text-[#64748B] text-xs font-medium hidden md:table-cell">Último acceso</th>
                <th scope="col" className="text-right py-3 px-5 text-[#64748B] text-xs font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${u.rol === "ADMIN" ? "bg-[#EFF6FF]" : "bg-[#F0FDF4]"}`}>
                        {u.rol === "ADMIN" ? (
                          <Shield className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
                        ) : (
                          <User className="w-4 h-4 text-[#16A34A]" aria-hidden="true" />
                        )}
                      </div>
                      <div>
                        <div className="text-[#0F172A] text-sm font-medium">{u.nombre}</div>
                        <div className="text-[#94A3B8] text-xs sm:hidden">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-[#64748B] text-sm hidden sm:table-cell">{u.email}</td>
                  <td className="py-4 px-5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.rol === "ADMIN" ? "bg-[#EFF6FF] text-[#2563EB]" : "bg-[#F0FDF4] text-[#16A34A]"
                    }`}>
                      {u.rol === "ADMIN" ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {u.rol === "ADMIN" ? "Administrador" : "Operario"}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-[#64748B] text-sm hidden md:table-cell">{u.ultimoAcceso}</td>
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
                <div className="text-[#0F172A] text-sm mb-0.5">Tasa de Interés Predeterminada</div>
                <div className="text-[#64748B] text-xs">Tasa aplicada a nuevos préstamos</div>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" value={tasaInteres}
                  onChange={(e) => setTasaInteres(Number(e.target.value))}
                  className="w-20 px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm text-right" />
                <span className="text-[#64748B] text-sm">%</span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[#0F172A] text-sm mb-0.5">Impuesto por Retraso</div>
                <div className="text-[#64748B] text-xs">Cargo adicional (%) aplicado a pagos atrasados</div>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" min="0" step="0.5" value={impuestoRetraso}
                  onChange={(e) => setImpuestoRetraso(Number(e.target.value))}
                  className="w-20 px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm text-right" />
                <span className="text-[#64748B] text-sm">%</span>
              </div>
            </div>
            <button
              onClick={() => toast.success("Configuración guardada", { description: "Los cambios fueron aplicados." })}
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
              ["Versión", "1.0.0"],
              ["Entorno", "Demo"],
              ["Último respaldo", "2026-04-29 03:00 AM"],
              ["Base de datos", "Local (mockData)"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B] text-sm">{k}</span>
                <span className="text-[#0F172A] text-sm font-medium">{v}</span>
              </div>
            ))}
            <button
              onClick={() => toast.success("Respaldo iniciado", { description: "Se está generando el respaldo del sistema." })}
              className="w-full mt-2 bg-[#0F172A] text-white py-2.5 rounded-xl hover:bg-[#1E293B] transition-colors text-sm"
            >
              Crear Respaldo Ahora
            </button>
          </div>
        </div>
      </div>

      {/* User form modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            role="dialog" aria-modal="true" aria-labelledby="user-form-title">
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
                {editingId ? "Modifica los datos del usuario." : "Registra un nuevo usuario en el sistema."}
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="uf-nombre" className="block text-[#334155] mb-1.5 text-sm">
                    Nombre completo <span className="text-[#DC2626]">*</span>
                  </label>
                  <input id="uf-nombre" type="text" value={form.nombre}
                    onChange={(e) => { setForm((p) => ({ ...p, nombre: e.target.value })); setErrors((p) => ({ ...p, nombre: "" })); }}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm ${errors.nombre ? "border-[#DC2626]" : "border-[#E2E8F0]"}`}
                    placeholder="Nombre del usuario" />
                  {errors.nombre && <p className="text-[#DC2626] text-xs mt-1">{errors.nombre}</p>}
                </div>
                <div>
                  <label htmlFor="uf-email" className="block text-[#334155] mb-1.5 text-sm">
                    Correo electrónico <span className="text-[#DC2626]">*</span>
                  </label>
                  <input id="uf-email" type="email" value={form.email}
                    onChange={(e) => { setForm((p) => ({ ...p, email: e.target.value })); setErrors((p) => ({ ...p, email: "" })); }}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm ${errors.email ? "border-[#DC2626]" : "border-[#E2E8F0]"}`}
                    placeholder="correo@ejemplo.com" />
                  {errors.email && <p className="text-[#DC2626] text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="uf-rol" className="block text-[#334155] mb-1.5 text-sm">
                    Rol <span className="text-[#DC2626]">*</span>
                  </label>
                  <select id="uf-rol" value={form.rol}
                    onChange={(e) => setForm((p) => ({ ...p, rol: e.target.value as UserRole }))}
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white text-sm">
                    <option value="OPERARIO">Operario</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-3 border border-[#E2E8F0] text-[#334155] rounded-xl hover:bg-[#F8FAFC] transition-colors text-sm">
                  Cancelar
                </button>
                <button onClick={handleSave}
                  className="flex-1 px-4 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1E3A8A] transition-colors text-sm">
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            role="alertdialog" aria-modal="true">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
            >
              <div className="w-12 h-12 bg-[#FEF2F2] rounded-xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-[#DC2626]" aria-hidden="true" />
              </div>
              <h3 className="text-[#0F172A] text-center mb-2">¿Eliminar usuario?</h3>
              <p className="text-[#64748B] text-sm text-center mb-6">
                Esta acción eliminará a{" "}
                <strong className="text-[#0F172A]">
                  "{usuarios.find((u) => u.id === deleteId)?.nombre}"
                </strong>{" "}
                permanentemente.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)}
                  className="flex-1 px-4 py-3 border border-[#E2E8F0] text-[#334155] rounded-xl hover:bg-[#F8FAFC] transition-colors text-sm">
                  Cancelar
                </button>
                <button onClick={handleDelete}
                  className="flex-1 px-4 py-3 bg-[#DC2626] text-white rounded-xl hover:bg-[#B91C1C] transition-colors text-sm">
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