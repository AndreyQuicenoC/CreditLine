import { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Power,
  Search,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "../../lib/toast";
import { municipiosData, Municipio } from "../data/mockData";
import { Tooltip } from "../components/ui/Tooltip";

export function Municipios() {
  const [municipios, setMunicipios] = useState<Municipio[]>(municipiosData);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formNombre, setFormNombre] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = municipios.filter((m) =>
    m.nombre.toLowerCase().includes(search.toLowerCase()),
  );

  const openNew = () => {
    setEditingId(null);
    setFormNombre("");
    setShowForm(true);
  };

  const openEdit = (m: Municipio) => {
    setEditingId(m.id);
    setFormNombre(m.nombre);
    setShowForm(true);
  };

  const handleSave = () => {
    const trimmed = formNombre.trim();
    if (!trimmed) {
      toast.error("El nombre del municipio es requerido.");
      return;
    }
    if (editingId) {
      setMunicipios((prev) =>
        prev.map((m) => (m.id === editingId ? { ...m, nombre: trimmed } : m)),
      );
      toast.success("Municipio actualizado", {
        description: `"${trimmed}" fue editado correctamente.`,
      });
    } else {
      const newMunicipio: Municipio = {
        id: `m${Date.now()}`,
        nombre: trimmed,
        activo: true,
      };
      setMunicipios((prev) => [...prev, newMunicipio]);
      toast.success("Municipio creado", {
        description: `"${trimmed}" fue agregado al sistema.`,
      });
    }
    setShowForm(false);
    setFormNombre("");
    setEditingId(null);
  };

  const handleToggleActivo = (id: string) => {
    setMunicipios((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const updated = { ...m, activo: !m.activo };
        toast.success(
          updated.activo ? "Municipio activado" : "Municipio desactivado",
          {
            description: `"${m.nombre}" fue ${updated.activo ? "activado" : "desactivado"}.`,
          },
        );
        return updated;
      }),
    );
  };

  const handleDelete = (id: string) => {
    const m = municipios.find((x) => x.id === id);
    setMunicipios((prev) => prev.filter((x) => x.id !== id));
    setDeleteConfirm(null);
    toast.success("Municipio eliminado", {
      description: `"${m?.nombre}" fue eliminado del sistema.`,
    });
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[#0F172A] mb-1">Municipios</h1>
          <p className="text-[#64748B]">
            Administra los municipios disponibles para asignar a clientes
          </p>
        </div>
        <Tooltip content="Agregar nuevo municipio">
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-[#2563EB] text-white px-5 py-2.5 rounded-xl hover:bg-[#1E3A8A] transition-colors shadow-sm"
            aria-label="Agregar nuevo municipio"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Nuevo Municipio
          </button>
        </Tooltip>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
          <div className="text-[#64748B] text-sm mb-1">Total</div>
          <div className="text-[#0F172A] text-2xl font-semibold">
            {municipios.length}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
          <div className="text-[#64748B] text-sm mb-1">Activos</div>
          <div className="text-[#16A34A] text-2xl font-semibold">
            {municipios.filter((m) => m.activo).length}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
          <div className="text-[#64748B] text-sm mb-1">Inactivos</div>
          <div className="text-[#DC2626] text-2xl font-semibold">
            {municipios.filter((m) => !m.activo).length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0]">
        <div className="p-5 border-b border-[#E2E8F0]">
          <div className="relative max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Buscar municipio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-sm"
              aria-label="Buscar municipio por nombre"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table
            className="w-full"
            role="table"
            aria-label="Lista de municipios"
          >
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th
                  scope="col"
                  className="text-left py-3 px-5 text-[#64748B] text-sm font-medium"
                >
                  Municipio
                </th>
                <th
                  scope="col"
                  className="text-center py-3 px-5 text-[#64748B] text-sm font-medium"
                >
                  Estado
                </th>
                <th
                  scope="col"
                  className="text-right py-3 px-5 text-[#64748B] text-sm font-medium"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((municipio) => (
                  <motion.tr
                    key={municipio.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <MapPin
                          className="w-4 h-4 text-[#64748B]"
                          aria-hidden="true"
                        />
                        <span className="text-[#0F172A] font-medium">
                          {municipio.nombre}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          municipio.activo
                            ? "bg-[#F0FDF4] text-[#16A34A]"
                            : "bg-[#FEF2F2] text-[#DC2626]"
                        }`}
                        aria-label={
                          municipio.activo
                            ? "Estado: Activo"
                            : "Estado: Inactivo"
                        }
                      >
                        {municipio.activo ? (
                          <>
                            <CheckCircle
                              className="w-3 h-3"
                              aria-hidden="true"
                            />{" "}
                            Activo
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" aria-hidden="true" />{" "}
                            Inactivo
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip content="Editar municipio">
                          <button
                            onClick={() => openEdit(municipio)}
                            className="p-2 hover:bg-[#EFF6FF] rounded-lg transition-colors text-[#64748B] hover:text-[#2563EB]"
                            aria-label={`Editar ${municipio.nombre}`}
                          >
                            <Edit2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </Tooltip>
                        <Tooltip
                          content={
                            municipio.activo
                              ? "Desactivar municipio"
                              : "Activar municipio"
                          }
                        >
                          <button
                            onClick={() => handleToggleActivo(municipio.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              municipio.activo
                                ? "hover:bg-[#FFFBEB] text-[#64748B] hover:text-[#F59E0B]"
                                : "hover:bg-[#F0FDF4] text-[#64748B] hover:text-[#16A34A]"
                            }`}
                            aria-label={
                              municipio.activo
                                ? `Desactivar ${municipio.nombre}`
                                : `Activar ${municipio.nombre}`
                            }
                          >
                            <Power className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Eliminar municipio">
                          <button
                            onClick={() => setDeleteConfirm(municipio.id)}
                            className="p-2 hover:bg-[#FEF2F2] rounded-lg transition-colors text-[#64748B] hover:text-[#DC2626]"
                            aria-label={`Eliminar ${municipio.nombre}`}
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-[#64748B]">
                    <MapPin
                      className="w-8 h-8 mx-auto mb-2 opacity-30"
                      aria-hidden="true"
                    />
                    <p>No se encontraron municipios.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="form-municipio-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <h3 id="form-municipio-title" className="text-[#0F172A] mb-1">
                {editingId ? "Editar Municipio" : "Nuevo Municipio"}
              </h3>
              <p className="text-[#64748B] text-sm mb-5">
                {editingId
                  ? "Modifica el nombre del municipio."
                  : "Ingresa el nombre del nuevo municipio."}
              </p>
              <div>
                <label
                  htmlFor="municipio-nombre"
                  className="block text-[#334155] mb-2 text-sm"
                >
                  Nombre del municipio{" "}
                  <span className="text-[#DC2626]" aria-label="requerido">
                    *
                  </span>
                </label>
                <input
                  id="municipio-nombre"
                  type="text"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  placeholder="Ej: Medellín, Cali, Bogotá..."
                  aria-required="true"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setFormNombre("");
                  }}
                  className="flex-1 px-4 py-3 border border-[#E2E8F0] text-[#334155] rounded-xl hover:bg-[#F8FAFC] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1E3A8A] transition-colors"
                >
                  {editingId ? "Guardar Cambios" : "Crear Municipio"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-confirm-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6"
            >
              <div className="w-12 h-12 bg-[#FEF2F2] rounded-xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-[#DC2626]" aria-hidden="true" />
              </div>
              <h3
                id="delete-confirm-title"
                className="text-[#0F172A] text-center mb-2"
              >
                ¿Eliminar municipio?
              </h3>
              <p className="text-[#64748B] text-sm text-center mb-6">
                Esta acción no se puede deshacer. El municipio{" "}
                <strong>
                  "{municipios.find((m) => m.id === deleteConfirm)?.nombre}"
                </strong>{" "}
                será eliminado permanentemente.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 border border-[#E2E8F0] text-[#334155] rounded-xl hover:bg-[#F8FAFC] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-3 bg-[#DC2626] text-white rounded-xl hover:bg-[#B91C1C] transition-colors"
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
