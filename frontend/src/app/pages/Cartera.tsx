import { useState } from "react";
import {
  Search,
  Plus,
  MapPin,
  Eye,
  Edit2,
  Trash2,
  ExternalLink,
  Users,
} from "lucide-react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "../../lib/toast";
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

export function Cartera() {
  const [clientes, setClientes] = useState<Cliente[]>(clientesData);
  const [searchTerm, setSearchTerm] = useState("");
  const [municipioFilter, setMunicipioFilter] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[#0F172A] mb-1">Cartera de Clientes</h1>
          <p className="text-[#64748B]">{filtered.length} clientes</p>
        </div>
        <Tooltip content="Registrar un nuevo cliente en la cartera">
          <Link
            to="/cartera/nuevo"
            className="inline-flex items-center gap-2 bg-[#2563EB] text-white px-5 py-2.5 rounded-xl hover:bg-[#1E3A8A] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nuevo Cliente
          </Link>
        </Tooltip>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="search"
              placeholder="Buscar por nombre o cédula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-sm"
            />
          </div>
          <Tooltip content="Filtrar por municipio">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <select className="pl-10 pr-8 py-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] appearance-none bg-white cursor-pointer text-sm min-w-[180px]">
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

        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th className="text-left py-3 px-4 text-[#64748B] text-xs font-medium uppercase tracking-wide">Cliente</th>
                <th className="text-left py-3 px-4 text-[#64748B] text-xs font-medium uppercase tracking-wide hidden md:table-cell">Teléfono</th>
                <th className="text-left py-3 px-4 text-[#64748B] text-xs font-medium uppercase tracking-wide hidden sm:table-cell">Municipio</th>
                <th className="text-center py-3 px-4 text-[#64748B] text-xs font-medium uppercase tracking-wide">Deudas</th>
                <th className="text-center py-3 px-4 text-[#64748B] text-xs font-medium uppercase tracking-wide">Estado</th>
                <th className="text-right py-3 px-4 text-[#64748B] text-xs font-medium uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {paginated.map((cliente) => (
                  <motion.tr key={cliente.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <div className="text-[#0F172A] text-sm font-medium">{cliente.nombre}</div>
                        <div className="text-[#94A3B8] text-xs">{cliente.cedula}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[#64748B] text-sm hidden md:table-cell">{cliente.telefono}</td>
                    <td className="py-4 px-4 text-[#64748B] text-sm hidden sm:table-cell">{getMunicipioNombre(cliente.municipioId)}</td>
                    <td className="py-4 px-4 text-center"><span className="inline-flex items-center justify-center w-7 h-7 bg-[#EFF6FF] text-[#2563EB] rounded-lg text-sm font-medium">{deudasData.filter((d) => d.clienteId === cliente.id && d.estado === 'activa').length}</span></td>
                    <td className="py-4 px-4 text-center"><span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-[#F0FDF4] text-[#16A34A]">Al día</span></td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 hover:bg-[#EFF6FF] rounded-lg transition-colors text-[#64748B] hover:text-[#2563EB]"><Eye className="w-4 h-4" /></button>
                        <Link to={`/cartera/${cliente.id}`} className="p-1.5 hover:bg-[#EFF6FF] rounded-lg transition-colors text-[#64748B] hover:text-[#2563EB]"><ExternalLink className="w-4 h-4" /></Link>
                        <Link to={`/cartera/${cliente.id}/editar`} className="p-1.5 hover:bg-[#FFFBEB] rounded-lg transition-colors text-[#64748B] hover:text-[#F59E0B]"><Edit2 className="w-4 h-4" /></Link>
                        <button className="p-1.5 hover:bg-[#FEF2F2] rounded-lg transition-colors text-[#64748B] hover:text-[#DC2626]" onClick={() => { setDeleteId(cliente.id); toast.success('Cliente eliminado', { description: `"${cliente.nombre}" fue eliminado.` }); }}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
