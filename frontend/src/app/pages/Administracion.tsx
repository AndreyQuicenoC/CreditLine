import { useState } from "react";
import { UserPlus, Save, HardDrive, Edit2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface SystemUser {
  id: string;
  nombre: string;
  email: string;
  rol: "ADMIN" | "OPERARIO";
  ultimoAcceso: string;
}

interface SystemSettings {
  tasaInteres: number;
  impuestoRetraso: number;
}

export function Administracion() {
  const [users, setUsers] = useState<SystemUser[]>([
    {
      id: "1",
      nombre: "Admin Principal",
      email: "admin@creditline.com",
      rol: "ADMIN",
      ultimoAcceso: "2026-04-29",
    },
    {
      id: "2",
      nombre: "Operario Demo",
      email: "operario@creditline.com",
      rol: "OPERARIO",
      ultimoAcceso: "2026-04-29",
    },
  ]);

  const [settings, setSettings] = useState<SystemSettings>({
    tasaInteres: 10,
    impuestoRetraso: 5,
  });

  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    nombre: "",
    email: "",
    rol: "OPERARIO" as const,
  });

  const handleAddUser = () => {
    if (!newUser.nombre.trim() || !newUser.email.trim()) {
      toast.error("Completa todos los campos");
      return;
    }

    const user: SystemUser = {
      id: Date.now().toString(),
      nombre: newUser.nombre,
      email: newUser.email,
      rol: newUser.rol,
      ultimoAcceso: new Date().toISOString().split("T")[0],
    };

    setUsers([...users, user]);
    toast.success(`Usuario ${newUser.nombre} creado`);
    setNewUser({ nombre: "", email: "", rol: "OPERARIO" });
    setShowNewUserModal(false);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
    toast.success("Usuario eliminado");
  };

  const handleSaveSettings = () => {
    if (settings.tasaInteres < 0 || settings.impuestoRetraso < 0) {
      toast.error("Los valores no pueden ser negativos");
      return;
    }
    toast.success("Configuración guardada");
  };

  const handleBackup = () => {
    toast.success("Respaldo creado: 2026-04-29 05:30 AM");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-20">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
            Administración
          </h1>
          <p className="text-[#64748B]">
            Gestión de usuarios y configuración del sistema
          </p>
        </div>

        {/* Sección Usuarios */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#0F172A] mb-1">
                Nuevo Usuario
              </h2>
              <p className="text-[#64748B] text-sm">
                Usuarios del Sistema
              </p>
            </div>
            <button
              onClick={() => setShowNewUserModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] text-white rounded-lg hover:bg-[#1E3A8A] transition-colors font-medium"
            >
              <UserPlus size={18} />
              Nuevo Usuario
            </button>
          </div>

          {/* User Count */}
          <div className="mb-6 text-sm text-[#64748B]">
            <strong className="text-[#0F172A]">{users.length}</strong> usuarios registrados
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#334155]">
                    Usuario
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#334155]">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#334155]">
                    Rol
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#334155]">
                    Último acceso
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#334155]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span className="font-medium text-[#0F172A]">
                        {user.nombre}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[#64748B]">
                      {user.email}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.rol === "ADMIN"
                            ? "bg-[#EFF6FF] text-[#2563EB]"
                            : "bg-[#F0FDF4] text-[#16A34A]"
                        }`}
                      >
                        {user.rol === "ADMIN" ? "Administrador" : "Operario"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[#64748B] text-sm">
                      {user.ultimoAcceso}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <button className="p-1.5 text-[#64748B] hover:bg-[#F1F5F9] rounded-lg transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sección Configuración General */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#0F172A] mb-6">
            Configuración General
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Tasa de Interés */}
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                Tasa de Interés Predeterminada
              </label>
              <p className="text-xs text-[#64748B] mb-3">
                Tasa aplicada a nuevos préstamos
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.tasaInteres}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      tasaInteres: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="flex-1 px-4 py-3 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#0F172A]"
                />
                <span className="text-xl font-semibold text-[#0F172A]">%</span>
              </div>
            </div>

            {/* Impuesto por Retraso */}
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                Impuesto por Retraso
              </label>
              <p className="text-xs text-[#64748B] mb-3">
                Cargo adicional (%) aplicado a pagos atrasados
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.impuestoRetraso}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      impuestoRetraso: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="flex-1 px-4 py-3 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#0F172A]"
                />
                <span className="text-xl font-semibold text-[#0F172A]">%</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-2 px-6 py-3 bg-[#2563EB] text-white rounded-lg hover:bg-[#1E3A8A] transition-colors font-medium"
          >
            <Save size={18} />
            Guardar Configuración
          </button>
        </div>

        {/* Sección Información del Sistema */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-8">
          <h2 className="text-2xl font-bold text-[#0F172A] mb-6">
            Información del Sistema
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="border border-[#E2E8F0] rounded-lg p-4">
              <p className="text-sm text-[#64748B] font-medium mb-1">
                Versión
              </p>
              <p className="text-2xl font-bold text-[#0F172A]">1.0.0</p>
            </div>
            <div className="border border-[#E2E8F0] rounded-lg p-4">
              <p className="text-sm text-[#64748B] font-medium mb-1">
                Entorno
              </p>
              <p className="text-2xl font-bold text-[#0F172A]">Demo</p>
            </div>
            <div className="border border-[#E2E8F0] rounded-lg p-4">
              <p className="text-sm text-[#64748B] font-medium mb-1">
                Último respaldo
              </p>
              <p className="text-lg font-bold text-[#0F172A]">
                2026-04-29
              </p>
              <p className="text-xs text-[#64748B]">03:00 AM</p>
            </div>
            <div className="border border-[#E2E8F0] rounded-lg p-4">
              <p className="text-sm text-[#64748B] font-medium mb-1">
                Base de datos
              </p>
              <p className="text-lg font-bold text-[#0F172A]">
                PostgreSQL
              </p>
              <p className="text-xs text-[#64748B]">Supabase</p>
            </div>
          </div>

          <button
            onClick={handleBackup}
            className="flex items-center gap-2 px-6 py-3 bg-[#16A34A] text-white rounded-lg hover:bg-[#15803D] transition-colors font-medium"
          >
            <HardDrive size={18} />
            Crear Respaldo Ahora
          </button>
        </div>
      </div>

      {/* Modal: Nuevo Usuario */}
      {showNewUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#0F172A]">
                Crear Nuevo Usuario
              </h3>
              <button
                onClick={() => setShowNewUserModal(false)}
                className="p-1 hover:bg-[#F1F5F9] rounded-lg transition-colors"
              >
                <X size={20} className="text-[#64748B]" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={newUser.nombre}
                  onChange={(e) =>
                    setNewUser({ ...newUser, nombre: e.target.value })
                  }
                  placeholder="ej: Juan Pérez"
                  className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#0F172A]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  placeholder="ej: juan@example.com"
                  className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#0F172A]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">
                  Rol
                </label>
                <select
                  value={newUser.rol}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      rol: e.target.value as "ADMIN" | "OPERARIO",
                    })
                  }
                  className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#0F172A]"
                >
                  <option value="OPERARIO">Operario</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowNewUserModal(false)}
                className="flex-1 px-4 py-2 border border-[#E2E8F0] text-[#0F172A] rounded-lg hover:bg-[#F8FAFC] transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddUser}
                className="flex-1 px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1E3A8A] transition-colors font-medium"
              >
                Crear Usuario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
