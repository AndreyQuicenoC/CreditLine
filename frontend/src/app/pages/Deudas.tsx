import { useState, useMemo } from "react";
import { AlertCircle, Clock, CheckCircle2, Search, Filter, Link as LinkIcon } from "lucide-react";
import { Link } from "react-router";
import { motion } from "motion/react";
import {
  deudasData,
  clientesData,
  calcularTotalPagado,
  calcularEstadoDeuda,
  Deuda,
} from "../data/mockData";
import { Tooltip } from "../components/ui/Tooltip";

type EstadoFilter = "todas" | "al-dia" | "riesgo" | "atrasado";
type ModoFilter = "pendientes" | "pagadas" | "todas";

function DeudaCard({ deuda, estado }: { deuda: Deuda; estado: string }) {
  const cliente = clientesData.find((c) => c.id === deuda.clienteId);
  const totalPagado = calcularTotalPagado(deuda);
  const progreso = Math.min(100, (totalPagado / Math.max(1, deuda.monto)) * 100);
  const saldo = Math.max(0, deuda.monto - totalPagado);

  const estadoStyles: Record<string, { badgeBg: string; badgeText: string; label: string; icon: React.ReactNode; barColor: string; border: string }> = {
    "al-dia": {
      badgeBg: "bg-[#F0FDF4]",
      badgeText: "text-[#16A34A]",
      label: "Al día",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      barColor: "#16A34A",
      border: "border-[#BBF7D0]",
    },
    riesgo: {
      badgeBg: "bg-[#FFFBEB]",
      badgeText: "text-[#F59E0B]",
      label: "En riesgo",
      icon: <Clock className="w-3.5 h-3.5" />,
      barColor: "#F59E0B",
      border: "border-[#FDE68A]",
    },
    atrasado: {
      badgeBg: "bg-[#FEF2F2]",
      badgeText: "text-[#DC2626]",
      label: "Atrasado",
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      barColor: "#DC2626",
      border: "border-[#FECACA]",
    },
    pagada: {
      badgeBg: "bg-[#F1F5F9]",
      badgeText: "text-[#64748B]",
      label: "Pagada",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      barColor: "#64748B",
      border: "border-[#E2E8F0]",
    },
  };

  const s = estadoStyles[estado] ?? estadoStyles["al-dia"];

  return (
    <Link
      to={`/deuda/${deuda.id}`}
      className={`block bg-white rounded-2xl shadow-sm border-2 p-5 hover:shadow-md transition-all ${s.border}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-[#0F172A] text-sm font-medium mb-0.5">{deuda.descripcion}</div>
          <div className="text-[#94A3B8] text-xs">
            {cliente?.nombre ?? "—"} · {deuda.fechaInicio}
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${s.badgeBg} ${s.badgeText}`}
        >
          {s.icon}
          {s.label}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-[#64748B]">Progreso</span>
          <span className="text-[#0F172A] font-medium">{progreso.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-[#E2E8F0] rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all"
            style={{ width: `${progreso}%`, backgroundColor: s.barColor }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#F1F5F9]">
        <div>
          <div className="text-[#94A3B8] text-xs mb-0.5">Monto</div>
          <div className="text-[#0F172A] text-xs font-medium">${(deuda.monto / 1000).toFixed(0)}k</div>
        </div>
        <div>
          <div className="text-[#94A3B8] text-xs mb-0.5">Pagado</div>
          <div className="text-[#16A34A] text-xs font-medium">${(totalPagado / 1000).toFixed(0)}k</div>
        </div>
        <div>
          <div className="text-[#94A3B8] text-xs mb-0.5">Saldo</div>
          <div className="text-[#DC2626] text-xs font-medium">${(saldo / 1000).toFixed(0)}k</div>
        </div>
      </div>

      {deuda.fechaVencimiento && (
        <div className="mt-3 pt-2 border-t border-[#F1F5F9] text-xs text-[#94A3B8]">Vence: {deuda.fechaVencimiento}</div>
      )}
    </Link>
  );
}

export function Deudas() {
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>("todas");
  const [modoFilter, setModoFilter] = useState<ModoFilter>("pendientes");

  const deudas = useMemo(() => {
    return deudasData.filter((d) => {
      const cliente = clientesData.find((c) => c.id === d.clienteId);
      const nombreMatch =
        cliente?.nombre.toLowerCase().includes(search.toLowerCase()) ||
        d.descripcion.toLowerCase().includes(search.toLowerCase());

      if (!nombreMatch) return false;

      if (modoFilter === "pendientes" && d.estado !== "activa") return false;
      if (modoFilter === "pagadas" && d.estado !== "pagada") return false;

      if (estadoFilter !== "todas" && d.estado === "activa") {
        const e = calcularEstadoDeuda(d);
        if (e !== estadoFilter) return false;
      }

      return true;
    });
  }, [search, estadoFilter, modoFilter]);

  const counts = useMemo(() => {
    const active = deudasData.filter((d) => d.estado === "activa");
    return {
      atrasado: active.filter((d) => calcularEstadoDeuda(d) === "atrasado").length,
      riesgo: active.filter((d) => calcularEstadoDeuda(d) === "riesgo").length,
      alDia: active.filter((d) => calcularEstadoDeuda(d) === "al-dia").length,
      pagadas: deudasData.filter((d) => d.estado === "pagada").length,
    };
  }, []);

  const modoOptions: { key: ModoFilter; label: string }[] = [
    { key: "pendientes", label: "Pendientes" },
    { key: "pagadas", label: "Pagadas" },
    { key: "todas", label: "Todas" },
  ];

  const estadoOptions: { key: EstadoFilter; label: string; color: string }[] = [
    { key: "todas", label: "Todos los estados", color: "#64748B" },
    { key: "atrasado", label: `Atrasadas (${counts.atrasado})`, color: "#DC2626" },
    { key: "riesgo", label: `En riesgo (${counts.riesgo})`, color: "#F59E0B" },
    { key: "al-dia", label: `Al día (${counts.alDia})`, color: "#16A34A" },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-[#0F172A] mb-1">Deudas</h1>
        <p className="text-[#64748B]">Seguimiento de todas las deudas registradas</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-[#DC2626]" aria-hidden="true" />
            <span className="text-[#DC2626] text-sm font-medium">Atrasadas</span>
          </div>
          <div className="text-[#DC2626] text-2xl font-semibold">{counts.atrasado}</div>
        </div>
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
            <span className="text-[#F59E0B] text-sm font-medium">En Riesgo</span>
          </div>
          <div className="text-[#F59E0B] text-2xl font-semibold">{counts.riesgo}</div>
        </div>
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" aria-hidden="true" />
            <span className="text-[#16A34A] text-sm font-medium">Al Día</span>
          </div>
          <div className="text-[#16A34A] text-2xl font-semibold">{counts.alDia}</div>
        </div>
        <div className="bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-[#64748B]" aria-hidden="true" />
            <span className="text-[#64748B] text-sm font-medium">Pagadas</span>
          </div>
          <div className="text-[#64748B] text-2xl font-semibold">{counts.pagadas}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por cliente o descripción..."
              className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm"
            />
          </div>

          <Tooltip content="Filtrar por estado de la deuda">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" aria-hidden="true" />
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value as EstadoFilter)}
                className="pl-10 pr-8 py-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] appearance-none bg-white cursor-pointer text-sm min-w-[180px]"
              >
                {estadoOptions.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </Tooltip>
        </div>

        <div className="flex gap-1 mt-4 border-t border-[#F1F5F9] pt-4">
          {modoOptions.map((m) => (
            <button
              key={m.key}
              onClick={() => setModoFilter(m.key)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                modoFilter === m.key ? "bg-[#1E3A8A] text-white" : "text-[#64748B] hover:bg-[#F1F5F9]"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {deudas.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] py-16 text-center">
          <AlertCircle className="w-10 h-10 mx-auto text-[#CBD5E1] mb-3" aria-hidden="true" />
          <p className="text-[#64748B]">No se encontraron deudas con los filtros aplicados.</p>
          {search && (
            <button onClick={() => setSearch("")} className="text-[#2563EB] text-sm mt-2 hover:underline">Limpiar búsqueda</button>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[#64748B] text-sm">{deudas.length} deuda{deudas.length !== 1 ? "s" : ""} encontrada{deudas.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {deudas.map((deuda) => (
              <motion.div key={deuda.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                <DeudaCard deuda={deuda} estado={deuda.estado === "pagada" ? "pagada" : calcularEstadoDeuda(deuda)} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export function Deudas() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-10">
      <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
        Deudas Pendientes
      </h1>
      <p className="text-[#64748B]">Listado de todas las deudas pendientes.</p>
    </div>
  );
}
