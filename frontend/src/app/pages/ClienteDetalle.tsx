import { useParams, Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  Phone,
  MapPin,
  CreditCard,
  Plus,
  Mail,
  Home,
  Briefcase,
  FileText,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import toast from "../../lib/toast";
import {
  clientesData,
  deudasData,
  calcularTotalPagado,
  calcularInteresesGenerados,
  calcularEstadoDeuda,
  getMunicipioNombre,
  Deuda,
} from "../data/mockData";
import { Tooltip } from "../components/ui/Tooltip";

function fmt(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`;
  return `$${val.toLocaleString("es-CO")}`;
}

// ── Nueva Deuda Modal ───────────────────────────────────────────────────────
function NuevaDeudaModal({
  clienteNombre,
  onClose,
  onSave,
}: {
  clienteNombre: string;
  onClose: () => void;
  onSave: (data: {
    monto: number;
    interes: number;
    descripcion: string;
    vencimiento: string;
  }) => void;
}) {
  const [form, setForm] = useState({
    monto: "",
    interes: "",
    descripcion: "",
    vencimiento: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.monto || Number(form.monto) <= 0)
      e.monto = "El monto debe ser mayor a 0.";
    if (!form.interes || Number(form.interes) <= 0)
      e.interes = "El interés debe ser mayor a 0.";
    if (!form.descripcion.trim())
      e.descripcion = "La descripción es requerida.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      toast.error("Formulario incompleto", {
        description: "Revisa los campos requeridos.",
      });
      return;
    }
    onSave({
      monto: Number(form.monto),
      interes: Number(form.interes),
      descripcion: form.descripcion,
      vencimiento: form.vencimiento,
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nueva-deuda-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
      >
        <h3 id="nueva-deuda-title" className="text-[#0F172A] mb-1">
          Nueva Deuda
        </h3>
        <p className="text-[#64748B] text-sm mb-5">
          Registrar nueva deuda para{" "}
          <strong className="text-[#0F172A]">{clienteNombre}</strong>
        </p>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="nd-monto"
              className="block text-[#334155] mb-1.5 text-sm"
            >
              Monto <span className="text-[#DC2626]">*</span>
            </label>
            <input
              id="nd-monto"
              type="number"
              min="0"
              value={form.monto}
              onChange={(e) => {
                setForm((p) => ({ ...p, monto: e.target.value }));
                if (errors.monto) setErrors((p) => ({ ...p, monto: "" }));
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm ${
                errors.monto ? "border-[#DC2626]" : "border-[#E2E8F0]"
              }`}
              placeholder="500000"
              aria-required="true"
            />
            {errors.monto && (
              <p className="text-[#DC2626] text-xs mt-1">{errors.monto}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="nd-interes"
              className="block text-[#334155] mb-1.5 text-sm"
            >
              Interés mensual (%) <span className="text-[#DC2626]">*</span>
            </label>
            <input
              id="nd-interes"
              type="number"
              min="0"
              step="0.5"
              value={form.interes}
              onChange={(e) => {
                setForm((p) => ({ ...p, interes: e.target.value }));
                if (errors.interes) setErrors((p) => ({ ...p, interes: "" }));
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm ${
                errors.interes ? "border-[#DC2626]" : "border-[#E2E8F0]"
              }`}
              placeholder="10"
              aria-required="true"
            />
            {errors.interes && (
              <p className="text-[#DC2626] text-xs mt-1">{errors.interes}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="nd-desc"
              className="block text-[#334155] mb-1.5 text-sm"
            >
              Descripción / Motivo <span className="text-[#DC2626]">*</span>
            </label>
            <input
              id="nd-desc"
              type="text"
              value={form.descripcion}
              onChange={(e) => {
                setForm((p) => ({ ...p, descripcion: e.target.value }));
                if (errors.descripcion)
                  setErrors((p) => ({ ...p, descripcion: "" }));
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm ${
                errors.descripcion ? "border-[#DC2626]" : "border-[#E2E8F0]"
              }`}
              placeholder="Ej: Gastos médicos, compra de maquinaria..."
              aria-required="true"
            />
            {errors.descripcion && (
              <p className="text-[#DC2626] text-xs mt-1">
                {errors.descripcion}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="nd-venc"
              className="block text-[#334155] mb-1.5 text-sm"
            >
              Fecha de vencimiento{" "}
              <span className="text-[#94A3B8] text-xs">(opcional)</span>
            </label>
            <input
              id="nd-venc"
              type="date"
              value={form.vencimiento}
              onChange={(e) =>
                setForm((p) => ({ ...p, vencimiento: e.target.value }))
              }
              className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-[#E2E8F0] text-[#334155] rounded-xl hover:bg-[#F8FAFC] transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1E3A8A] transition-colors text-sm"
          >
            Registrar Deuda
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── DeudaCard ───────────────────────────────────────────────────────────────
function DeudaCard({ deuda, estado }: { deuda: Deuda; estado: string }) {
  const totalPagado = calcularTotalPagado(deuda);
  const intereses = calcularInteresesGenerados(deuda);
  const totalConIntereses = deuda.monto + intereses;
  const progreso = Math.min(
    100,
    (totalPagado / Math.max(1, totalConIntereses)) * 100,
  );
  const saldo = Math.max(0, totalConIntereses - totalPagado);

  const estadoStyles: Record<
    string,
    { bg: string; text: string; label: string; icon: React.ReactNode }
  > = {
    "al-dia": {
      bg: "border-[#BBF7D0]",
      text: "text-[#16A34A]",
      label: "Al día",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    riesgo: {
      bg: "border-[#FDE68A]",
      text: "text-[#F59E0B]",
      label: "En riesgo",
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    atrasado: {
      bg: "border-[#FECACA]",
      text: "text-[#DC2626]",
      label: "Atrasado",
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
    pagada: {
      bg: "border-[#E2E8F0]",
      text: "text-[#64748B]",
      label: "Pagada",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
  };

  const s = estadoStyles[estado] ?? estadoStyles["al-dia"];

  return (
    <Link
      to={`/deuda/${deuda.id}`}
      className={`block bg-white rounded-2xl shadow-sm border-2 p-5 hover:shadow-md transition-all ${s.bg}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-[#0F172A] text-sm font-medium mb-0.5">
            {deuda.descripcion}
          </div>
          <div className="text-[#94A3B8] text-xs">
            Desde {deuda.fechaInicio}
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${s.text}`}
          style={{
            backgroundColor: `${s.text.replace("text-[", "").replace("]", "")}15`,
          }}
        >
          {s.icon}
          {s.label}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-[#64748B]">Progreso de pago</span>
          <span className="text-[#0F172A] font-medium">
            {progreso.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-[#E2E8F0] rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all"
            style={{
              width: `${progreso}%`,
              backgroundColor:
                estado === "atrasado"
                  ? "#DC2626"
                  : estado === "riesgo"
                    ? "#F59E0B"
                    : "#16A34A",
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#F1F5F9]">
        <div>
          <div className="text-[#94A3B8] text-xs mb-0.5">Monto</div>
          <div className="text-[#0F172A] text-xs font-medium">
            {fmt(deuda.monto)}
          </div>
        </div>
        <div>
          <div className="text-[#94A3B8] text-xs mb-0.5">Pagado</div>
          <div className="text-[#16A34A] text-xs font-medium">
            {fmt(totalPagado)}
          </div>
        </div>
        <div>
          <div className="text-[#94A3B8] text-xs mb-0.5">Saldo</div>
          <div className="text-[#DC2626] text-xs font-medium">{fmt(saldo)}</div>
        </div>
      </div>

      {deuda.fechaVencimiento && (
        <div className="mt-2 pt-2 border-t border-[#F1F5F9] text-xs text-[#94A3B8]">
          Vence: {deuda.fechaVencimiento}
        </div>
      )}
    </Link>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export function ClienteDetalle() {
  const { clienteId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"info" | "activas" | "pagadas">(
    "info",
  );
  const [showNuevaDeuda, setShowNuevaDeuda] = useState(false);

  // Local state for debts — allows adding new debts without refreshing
  const [localDeudas, setLocalDeudas] = useState<Deuda[]>(() =>
    deudasData.filter((d) => d.clienteId === clienteId),
  );

  const cliente = clientesData.find((c) => c.id === clienteId);

  if (!cliente) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-8 text-center">
        <p className="text-[#64748B]">Cliente no encontrado.</p>
        <Link
          to="/cartera"
          className="text-[#2563EB] hover:underline mt-4 inline-block"
        >
          Volver a Cartera
        </Link>
      </div>
    );
  }

  const allDeudas = localDeudas;
  const deudasActivas = allDeudas.filter((d) => d.estado === "activa");
  const deudasPagadas = allDeudas.filter((d) => d.estado === "pagada");

  const totalPrestadoCliente = allDeudas.reduce((s, d) => s + d.monto, 0);
  const totalRecuperadoCliente = allDeudas.reduce(
    (s, d) => s + calcularTotalPagado(d),
    0,
  );
  const totalInteresesCliente = deudasActivas.reduce(
    (s, d) => s + calcularInteresesGenerados(d),
    0,
  );

  const handleNuevaDeuda = (data: {
    monto: number;
    interes: number;
    descripcion: string;
    vencimiento: string;
  }) => {
    const newDeuda: Deuda = {
      id: `d_new_${Date.now()}`,
      clienteId: clienteId!,
      monto: data.monto,
      interesMensual: data.interes,
      descripcion: data.descripcion,
      fechaInicio: new Date().toISOString().slice(0, 10),
      fechaVencimiento: data.vencimiento || undefined,
      estado: "activa",
      abonos: [],
    };
    setLocalDeudas((prev) => [...prev, newDeuda]);
    toast.success("Deuda registrada", {
      description: `Deuda de $${data.monto.toLocaleString("es-CO")} para ${cliente.nombre}.`,
    });
    setShowNuevaDeuda(false);
    setActiveTab("activas");
  };

  const tabs: { key: "info" | "activas" | "pagadas"; label: string }[] = [
    { key: "info", label: "Información" },
    { key: "activas", label: `Deudas Activas (${deudasActivas.length})` },
    { key: "pagadas", label: `Deudas Pagadas (${deudasPagadas.length})` },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8">
      <Link
        to="/cartera"
        className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] mb-6 transition-colors text-sm"
        aria-label="Volver a la cartera de clientes"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Volver a Cartera
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] rounded-2xl flex items-center justify-center shrink-0">
              <span className="text-white text-xl font-semibold">
                {cliente.nombre.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-[#0F172A] mb-1">{cliente.nombre}</h1>
              <div className="flex flex-wrap items-center gap-3 text-[#64748B] text-sm">
                <span className="flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" aria-hidden="true" />
                  {cliente.cedula}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                  {cliente.telefono}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                  {getMunicipioNombre(cliente.municipioId)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 shrink-0 flex-wrap">
            <Tooltip content="Editar información del cliente">
              <Link
                to={`/cartera/${cliente.id}/editar`}
                className="flex items-center gap-2 px-4 py-2.5 border border-[#E2E8F0] text-[#334155] rounded-xl hover:bg-[#F8FAFC] transition-colors text-sm"
                aria-label="Editar cliente"
              >
                <Edit2 className="w-4 h-4" aria-hidden="true" />
                Editar
              </Link>
            </Tooltip>
            <Tooltip content="Registrar una nueva deuda para este cliente">
              <button
                onClick={() => setShowNuevaDeuda(true)}
                className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2.5 rounded-xl hover:bg-[#1E3A8A] transition-colors text-sm"
                aria-label="Registrar nueva deuda"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                Nueva Deuda
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-[#F8FAFC] rounded-xl">
          <div>
            <div className="text-[#64748B] text-xs mb-0.5">Total Prestado</div>
            <div className="text-[#0F172A] font-semibold truncate">
              {fmt(totalPrestadoCliente)}
            </div>
          </div>
          <div>
            <div className="text-[#64748B] text-xs mb-0.5">
              Total Recuperado
            </div>
            <div className="text-[#16A34A] font-semibold truncate">
              {fmt(totalRecuperadoCliente)}
            </div>
          </div>
          <div>
            <div className="text-[#64748B] text-xs mb-0.5">
              Intereses Activos
            </div>
            <div className="text-[#F59E0B] font-semibold truncate">
              {fmt(totalInteresesCliente)}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 border-b border-[#E2E8F0] overflow-x-auto"
          role="tablist"
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 border-b-2 text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-[#2563EB] text-[#2563EB] font-medium"
                  : "border-transparent text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "info" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6">
            <h3 className="text-[#0F172A] mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
              Contacto
            </h3>
            <div className="space-y-3">
              <div>
                <div className="text-[#64748B] text-xs mb-0.5">
                  Teléfono principal
                </div>
                <div className="text-[#0F172A] text-sm">{cliente.telefono}</div>
              </div>
              {cliente.telefonoAlterno && (
                <div>
                  <div className="text-[#64748B] text-xs mb-0.5">
                    Teléfono alterno
                  </div>
                  <div className="text-[#0F172A] text-sm">
                    {cliente.telefonoAlterno}
                  </div>
                </div>
              )}
              {cliente.email && (
                <div>
                  <div className="text-[#64748B] text-xs mb-0.5">
                    Correo electrónico
                  </div>
                  <a
                    href={`mailto:${cliente.email}`}
                    className="text-[#2563EB] text-sm hover:underline"
                  >
                    {cliente.email}
                  </a>
                </div>
              )}
              <div>
                <div className="text-[#64748B] text-xs mb-0.5">Sexo</div>
                <div className="text-[#0F172A] text-sm">
                  {cliente.sexo === "M" ? "Masculino" : "Femenino"}
                </div>
              </div>
              <div>
                <div className="text-[#64748B] text-xs mb-0.5">
                  Fecha de registro
                </div>
                <div className="text-[#0F172A] text-sm">
                  {cliente.fechaRegistro}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6">
            <h3 className="text-[#0F172A] mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
              Ubicación
            </h3>
            <div className="space-y-3">
              <div>
                <div className="text-[#64748B] text-xs mb-0.5">Municipio</div>
                <div className="text-[#0F172A] text-sm">
                  {getMunicipioNombre(cliente.municipioId)}
                </div>
              </div>
              <div>
                <div className="text-[#64748B] text-xs mb-0.5 flex items-center gap-1">
                  <Home className="w-3 h-3" aria-hidden="true" />
                  Dirección Casa
                </div>
                <div className="text-[#0F172A] text-sm">
                  {cliente.direccionCasa}
                </div>
              </div>
              {cliente.direccionTrabajo && (
                <div>
                  <div className="text-[#64748B] text-xs mb-0.5 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" aria-hidden="true" />
                    Dirección Trabajo
                  </div>
                  <div className="text-[#0F172A] text-sm">
                    {cliente.direccionTrabajo}
                  </div>
                </div>
              )}
            </div>
          </div>

          {cliente.infoExtra && (
            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6">
              <h3 className="text-[#0F172A] mb-3 flex items-center gap-2">
                <FileText
                  className="w-4 h-4 text-[#8B5CF6]"
                  aria-hidden="true"
                />
                Inteligencia del Cliente
              </h3>
              <p className="text-[#334155] text-sm leading-relaxed">
                {cliente.infoExtra}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === "activas" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {deudasActivas.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-12 text-center">
              <TrendingUp
                className="w-10 h-10 mx-auto text-[#CBD5E1] mb-3"
                aria-hidden="true"
              />
              <p className="text-[#64748B]">
                No hay deudas activas para este cliente.
              </p>
              <button
                onClick={() => setShowNuevaDeuda(true)}
                className="mt-4 inline-flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2.5 rounded-xl hover:bg-[#1E3A8A] transition-colors text-sm"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                Registrar Nueva Deuda
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {deudasActivas.map((d) => (
                <DeudaCard
                  key={d.id}
                  deuda={d}
                  estado={calcularEstadoDeuda(d)}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {activeTab === "pagadas" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {deudasPagadas.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-12 text-center">
              <CheckCircle2
                className="w-10 h-10 mx-auto text-[#CBD5E1] mb-3"
                aria-hidden="true"
              />
              <p className="text-[#64748B]">No hay deudas pagadas aún.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full" aria-label="Deudas pagadas">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                      <th className="text-left py-3 px-5 text-[#64748B] text-xs font-medium">
                        Descripción
                      </th>
                      <th className="text-right py-3 px-5 text-[#64748B] text-xs font-medium hidden sm:table-cell">
                        Monto
                      </th>
                      <th className="text-center py-3 px-5 text-[#64748B] text-xs font-medium hidden md:table-cell">
                        Interés
                      </th>
                      <th className="text-right py-3 px-5 text-[#64748B] text-xs font-medium">
                        Total Pagado
                      </th>
                      <th className="text-center py-3 px-5 text-[#64748B] text-xs font-medium hidden sm:table-cell">
                        Abonos
                      </th>
                      <th className="text-center py-3 px-5 text-[#64748B] text-xs font-medium hidden lg:table-cell">
                        Fecha Inicio
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {deudasPagadas.map((d) => (
                      <tr
                        key={d.id}
                        className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
                      >
                        <td className="py-3 px-5">
                          <Link
                            to={`/deuda/${d.id}`}
                            className="text-[#0F172A] text-sm hover:text-[#2563EB]"
                          >
                            {d.descripcion}
                          </Link>
                        </td>
                        <td className="py-3 px-5 text-right text-[#0F172A] text-sm hidden sm:table-cell">
                          {fmt(d.monto)}
                        </td>
                        <td className="py-3 px-5 text-center text-[#64748B] text-sm hidden md:table-cell">
                          {d.interesMensual}%/mes
                        </td>
                        <td className="py-3 px-5 text-right text-[#16A34A] text-sm font-medium">
                          {fmt(calcularTotalPagado(d))}
                        </td>
                        <td className="py-3 px-5 text-center hidden sm:table-cell">
                          <span className="inline-flex items-center justify-center w-7 h-7 bg-[#F0FDF4] text-[#16A34A] rounded-lg text-xs font-medium">
                            {d.abonos.length}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-center text-[#64748B] text-sm hidden lg:table-cell">
                          {d.fechaInicio}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Nueva Deuda Modal */}
      {showNuevaDeuda && (
        <NuevaDeudaModal
          clienteNombre={cliente.nombre}
          onClose={() => setShowNuevaDeuda(false)}
          onSave={handleNuevaDeuda}
        />
      )}
    </div>
  );
}

