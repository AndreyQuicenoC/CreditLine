import { useState } from "react";
import {
  Search,
  Plus,
  MapPin,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import toast from "../../lib/toast";
import {
  clientesData,
  municipiosData,
  deudasData,
  calcularEstadoCliente,
  getMunicipioNombre,
  Cliente,
} from "../data/mockData";
import { Tooltip } from "../components/ui/Tooltip";

const PAGE_SIZE = 8;

// ── Summary helpers ──────────────────────────────────────────────────────────
const totalCapital = deudasData.reduce((s, d) => s + d.monto, 0);
const totalRecuperado = deudasData.reduce(
  (s, d) => s + d.abonos.reduce((a, b) => a + b.monto, 0),
  0,
);
const totalSaldo = deudasData
  .filter((d) => d.estado === "activa")
  .reduce((s, d) => {
    const pagado = d.abonos.reduce((a, b) => a + b.monto, 0);
    return s + Math.max(0, d.monto - pagado);
  }, 0);
const allAbonos = deudasData.flatMap((d) => d.abonos);
const pctCumplimiento =
  allAbonos.length > 0
    ? (
        (allAbonos.filter((a) => !a.atrasado).length / allAbonos.length) *
        100
      ).toFixed(1)
    : "100.0";

function fmtCOP(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`;
  return `$${val.toLocaleString("es-CO")}`;
}

export function Cartera() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>(clientesData);
  const [searchTerm, setSearchTerm] = useState("");
  const [municipioFilter, setMunicipioFilter] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const municipiosActivos = municipiosData.filter((m) => m.activo);

  const filtered = clientes.filter((c) => {
    const matchSearch =
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cedula.includes(searchTerm);
    const matchMunicipio =
      municipioFilter === "todos" || c.municipioId === municipioFilter;
    return matchSearch && matchMunicipio;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleSearch = (v: string) => {
    setSearchTerm(v);
    setCurrentPage(1);
  };

  const handleMunicipio = (v: string) => {
    setMunicipioFilter(v);
    setCurrentPage(1);
  };

  const confirmDelete = (id: string) => setDeleteId(id);

  const handleDelete = () => {
    const c = clientes.find((x) => x.id === deleteId);
    setClientes((prev) => prev.filter((x) => x.id !== deleteId));
    setDeleteId(null);
    toast.success("Cliente eliminado", {
      description: `"${c?.nombre}" fue eliminado de la cartera.`,
    });
  };

  const estadoColor = (e: string) => {
    switch (e) {
      case "al-dia":
        return "bg-[#F0FDF4] text-[#16A34A]";
      case "riesgo":
        return "bg-[#FFFBEB] text-[#F59E0B]";
      case "atrasado":
        return "bg-[#FEF2F2] text-[#DC2626]";
      default:
        return "bg-[#F1F5F9] text-[#64748B]";
    }
  };

  const estadoLabel = (e: string) => {
    switch (e) {
      case "al-dia":
        return "Al día";
      case "riesgo":
        return "En riesgo";
      case "atrasado":
        return "Atrasado";
      default:
        return e;
    }
  };

  const getDeudasActivas = (clienteId: string) =>
    deudasData.filter((d) => d.clienteId === clienteId && d.estado === "activa")
      .length;

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[#0F172A] mb-1">Cartera de Clientes</h1>
          <p className="text-[#64748B]">
            {filtered.length} cliente{filtered.length !== 1 ? "s" : ""}{" "}
            encontrado
            {filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Tooltip content="Registrar un nuevo cliente en la cartera">
          <Link
            to="/cartera/nuevo"
            className="inline-flex items-center gap-2 bg-[#2563EB] text-white px-5 py-2.5 rounded-xl hover:bg-[#1E3A8A] transition-colors shadow-sm"
            aria-label="Agregar nuevo cliente"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Nuevo Cliente
          </Link>
        </Tooltip>
      </div>

      {/* Portfolio summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-4">
          <div className="text-[#64748B] text-xs mb-1">Capital Total</div>
          <div className="text-[#0F172A] font-semibold text-lg truncate">
            {fmtCOP(totalCapital)}
          </div>
          <div className="text-[#94A3B8] text-xs">
            {deudasData.length} préstamos totales
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-4">
          <div className="text-[#64748B] text-xs mb-1">Total Recuperado</div>
          <div className="text-[#16A34A] font-semibold text-lg truncate">
            {fmtCOP(totalRecuperado)}
          </div>
          <div className="text-[#94A3B8] text-xs">
            {((totalRecuperado / totalCapital) * 100).toFixed(1)}% del capital
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-4">
          <div className="text-[#64748B] text-xs mb-1">Saldo Pendiente</div>
          <div className="text-[#DC2626] font-semibold text-lg truncate">
            {fmtCOP(totalSaldo)}
          </div>
          <div className="text-[#94A3B8] text-xs">Deudas activas</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-4">
          <div className="text-[#64748B] text-xs mb-1">
            Tasa de Cumplimiento
          </div>
          <div className="text-[#2563EB] font-semibold text-lg">
            {pctCumplimiento}%
          </div>
          <div className="text-[#94A3B8] text-xs">Abonos a tiempo</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Buscar por nombre o cédula..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-sm"
              aria-label="Buscar cliente por nombre o cédula"
            />
          </div>
          <Tooltip content="Filtrar por municipio">
            <div className="relative">
              <MapPin
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]"
                aria-hidden="true"
              />
              <select
                value={municipioFilter}
                onChange={(e) => handleMunicipio(e.target.value)}
                className="pl-10 pr-8 py-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent appearance-none bg-white cursor-pointer text-sm min-w-[180px]"
                aria-label="Filtrar por municipio"
              >
                <option value="todos">Todos los municipios</option>
                {municipiosActivos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>
          </Tooltip>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full" role="table" aria-label="Tabla de clientes">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th
                  scope="col"
                  className="text-left py-3 px-4 text-[#64748B] text-xs font-medium uppercase tracking-wide"
                >
                  Cliente
                </th>
                <th
                  scope="col"
                  className="text-left py-3 px-4 text-[#64748B] text-xs font-medium uppercase tracking-wide hidden md:table-cell"
                >
                  Teléfono
                </th>
                <th
                  scope="col"
                  className="text-left py-3 px-4 text-[#64748B] text-xs font-medium uppercase tracking-wide hidden sm:table-cell"
                >
                  Municipio
                </th>
                <th
                  scope="col"
                  className="text-center py-3 px-4 text-[#64748B] text-xs font-medium uppercase tracking-wide"
                >
                  Deudas
                </th>
                <th
                  scope="col"
                  className="text-center py-3 px-4 text-[#64748B] text-xs font-medium uppercase tracking-wide"
                >
                  Estado
                </th>
                <th
                  scope="col"
                  className="text-right py-3 px-4 text-[#64748B] text-xs font-medium uppercase tracking-wide"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="wait">
                {paginated.map((cliente) => {
                  const estado = calcularEstadoCliente(cliente.id);
                  const deudasActivas = getDeudasActivas(cliente.id);
                  return (
                    <motion.tr
                      key={cliente.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <div className="text-[#0F172A] text-sm font-medium">
                            {cliente.nombre}
                          </div>
                          <div className="text-[#94A3B8] text-xs">
                            {cliente.cedula}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[#64748B] text-sm hidden md:table-cell">
                        {cliente.telefono}
                      </td>
                      <td className="py-4 px-4 text-[#64748B] text-sm hidden sm:table-cell">
                        {getMunicipioNombre(cliente.municipioId)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 bg-[#EFF6FF] text-[#2563EB] rounded-lg text-sm font-medium">
                          {deudasActivas}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${estadoColor(estado)}`}
                        >
                          {estadoLabel(estado)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip content="Ver resumen rápido" side="top">
                            <button
                              onClick={() => setPreviewId(cliente.id)}
                              className="p-1.5 hover:bg-[#EFF6FF] rounded-lg transition-colors text-[#64748B] hover:text-[#2563EB]"
                              aria-label={`Vista rápida de ${cliente.nombre}`}
                            >
                              <Eye className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Ver detalle completo" side="top">
                            <Link
                              to={`/cartera/${cliente.id}`}
                              className="p-1.5 hover:bg-[#EFF6FF] rounded-lg transition-colors text-[#64748B] hover:text-[#2563EB] inline-flex"
                              aria-label={`Ver detalle de ${cliente.nombre}`}
                            >
                              <ExternalLink
                                className="w-4 h-4"
                                aria-hidden="true"
                              />
                            </Link>
                          </Tooltip>
                          <Tooltip content="Editar cliente" side="top">
                            <Link
                              to={`/cartera/${cliente.id}/editar`}
                              className="p-1.5 hover:bg-[#FFFBEB] rounded-lg transition-colors text-[#64748B] hover:text-[#F59E0B] inline-flex"
                              aria-label={`Editar ${cliente.nombre}`}
                            >
                              <Edit2 className="w-4 h-4" aria-hidden="true" />
                            </Link>
                          </Tooltip>
                          <Tooltip content="Eliminar cliente" side="top">
                            <button
                              onClick={() => confirmDelete(cliente.id)}
                              className="p-1.5 hover:bg-[#FEF2F2] rounded-lg transition-colors text-[#64748B] hover:text-[#DC2626]"
                              aria-label={`Eliminar ${cliente.nombre}`}
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Users
                      className="w-10 h-10 mx-auto text-[#CBD5E1] mb-3"
                      aria-hidden="true"
                    />
                    <p className="text-[#64748B]">
                      No se encontraron clientes.
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => handleSearch("")}
                        className="text-[#2563EB] text-sm mt-2 hover:underline"
                      >
                        Limpiar búsqueda
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-5 mt-2 border-t border-[#E2E8F0]">
            <p className="text-[#64748B] text-sm">
              Página {currentPage} de {totalPages} · {filtered.length} clientes
            </p>
            <div className="flex items-center gap-1">
              <Tooltip content="Página anterior">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Página anterior"
                >
                  <ChevronLeft
                    className="w-4 h-4 text-[#334155]"
                    aria-hidden="true"
                  />
                </button>
              </Tooltip>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  aria-label={`Ir a página ${p}`}
                  aria-current={p === currentPage ? "page" : undefined}
                  className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                    p === currentPage
                      ? "bg-[#2563EB] text-white"
                      : "hover:bg-[#F1F5F9] text-[#334155]"
                  }`}
                >
                  {p}
                </button>
              ))}
              <Tooltip content="Página siguiente">
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Página siguiente"
                >
                  <ChevronRight
                    className="w-4 h-4 text-[#334155]"
                    aria-hidden="true"
                  />
                </button>
              </Tooltip>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm overlay */}
      <AnimatePresence>
        {deleteId && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-client-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
            >
              <div className="w-12 h-12 bg-[#FEF2F2] rounded-xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-[#DC2626]" aria-hidden="true" />
              </div>
              <h3
                id="delete-client-title"
                className="text-[#0F172A] text-center mb-2"
              >
                ¿Eliminar cliente?
              </h3>
              <p className="text-[#64748B] text-sm text-center mb-6">
                Esta acción eliminará a{" "}
                <strong className="text-[#0F172A]">
                  "{clientes.find((c) => c.id === deleteId)?.nombre}"
                </strong>{" "}
                y todos sus registros. No se puede deshacer.
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

      {/* Preview overlay */}
      <AnimatePresence>
        {previewId && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              {clientes.find((c) => c.id === previewId) && (
                <>
                  <div className="mb-5">
                    <h3
                      id="preview-title"
                      className="text-[#0F172A] text-lg font-semibold mb-1"
                    >
                      {clientes.find((c) => c.id === previewId)?.nombre}
                    </h3>
                    <p className="text-[#64748B] text-sm">
                      Resumen rápido del cliente
                    </p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="text-[#94A3B8] text-xs mb-1">Cédula</div>
                      <div className="text-[#0F172A] text-sm font-medium">
                        {clientes.find((c) => c.id === previewId)?.cedula}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#94A3B8] text-xs mb-1">Teléfono</div>
                      <div className="text-[#0F172A] text-sm font-medium">
                        {clientes.find((c) => c.id === previewId)?.telefono}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#94A3B8] text-xs mb-1">Municipio</div>
                      <div className="text-[#0F172A] text-sm font-medium">
                        {getMunicipioNombre(
                          clientes.find((c) => c.id === previewId)?.municipioId || ""
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#94A3B8] text-xs mb-1">Estado</div>
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${estadoColor(
                          calcularEstadoCliente(previewId)
                        )}`}
                      >
                        {estadoLabel(calcularEstadoCliente(previewId))}
                      </span>
                    </div>
                    <div>
                      <div className="text-[#94A3B8] text-xs mb-1">
                        Deudas Activas
                      </div>
                      <div className="text-[#0F172A] text-sm font-medium">
                        {getDeudasActivas(previewId)}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setPreviewId(null)}
                      className="flex-1 px-4 py-3 border border-[#E2E8F0] text-[#334155] rounded-xl hover:bg-[#F8FAFC] transition-colors text-sm"
                    >
                      Cerrar
                    </button>
                    <Link
                      to={`/cartera/${previewId}`}
                      className="flex-1 px-4 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1E3A8A] transition-colors text-sm text-center"
                    >
                      Ver Detalle
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
