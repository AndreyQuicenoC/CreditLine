import { useState, useMemo } from "react";
import { Search, Plus, MapPin } from "lucide-react";
import toast from "../../lib/toast";
import { municipiosData } from "../data/mockData";
import { Tooltip } from "../components/ui/Tooltip";
import { Link } from "react-router";

export function Municipios() {
  const [q, setQ] = useState("");
  const [activosOnly, setActivosOnly] = useState(true);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return municipiosData.filter((m) => (activosOnly ? m.activo : true) && (t === "" || m.nombre.toLowerCase().includes(t) || m.codigo?.includes(t)));
  }, [q, activosOnly]);

  return (
    <div className="max-w-[1100px] mx-auto px-4 lg:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#0F172A]">Municipios</h1>
          <p className="text-[#64748B] text-sm">Administración de municipios registrados</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/municipios/new" className="inline-flex items-center gap-2 bg-[#2563EB] text-white px-3 py-2 rounded-xl hover:bg-[#1E3A8A] transition-colors text-sm">
            <Plus className="w-4 h-4" /> Nuevo Municipio
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <label htmlFor="q" className="sr-only">Buscar municipios</label>
            <div className="flex items-center gap-2 bg-[#F8FAFC] px-3 py-2 rounded-xl border border-[#E2E8F0]">
              <Search className="w-4 h-4 text-[#94A3B8]" />
              <input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar municipio por nombre o código" className="bg-transparent w-full text-sm focus:outline-none" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-2 text-sm text-[#64748B]"><input type="checkbox" checked={activosOnly} onChange={(e) => setActivosOnly(e.target.checked)} className="w-4 h-4" /> Activos</label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((m) => (
          <div key={m.id} className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-start gap-3">
            <div className="p-2 bg-[#EFF6FF] rounded-lg"><MapPin className="w-5 h-5 text-[#2563EB]" /></div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[#0F172A] font-medium">{m.nombre}</div>
                  <div className="text-[#64748B] text-xs">Código: {m.codigo || "—"}</div>
                </div>
                <div className="text-sm text-[#94A3B8]">{m.activo ? "Activo" : "Inactivo"}</div>
              </div>
              <div className="mt-2 text-[#64748B] text-sm">{m.descripcion || "Sin descripción"}</div>
              <div className="mt-3 flex items-center gap-2">
                <Tooltip content="Ver detalle">
                  <Link to={`/municipios/${m.id}`} className="text-[#2563EB] text-sm hover:underline">Abrir</Link>
                </Tooltip>
                <button onClick={() => toast.success("Acción no implementada", { description: "Edición en UI mock only." })} className="text-[#334155] text-sm">Editar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export function Municipios() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-10">
      <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Municipios</h1>
      <p className="text-[#64748B]">Gestión de municipios.</p>
    </div>
  );
}
