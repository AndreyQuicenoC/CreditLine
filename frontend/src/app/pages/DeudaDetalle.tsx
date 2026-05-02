import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowDownRight,
  Download,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import toast from "../../lib/toast";
import {
  deudasData,
  clientesData,
  calcularTotalPagado,
  calcularInteresesGenerados,
  calcularEstadoDeuda,
  Abono,
} from "../data/mockData";
import { Tooltip } from "../components/ui/Tooltip";

async function generarPDFHistorial(params: {
  cliente: { nombre: string; cedula: string; telefono: string; email?: string };
  deuda: {
    id: string;
    descripcion: string;
    monto: number;
    interesMensual: number;
    fechaInicio: string;
    fechaVencimiento?: string;
    estado: string;
    abonos: Abono[];
  };
  totalPagado: number;
  intereses: number;
  saldo: number;
  abonosAtrasados: number;
  abonosATiempo: number;
}) {
  const jspdfModule = await import("jspdf");
  const JsPDF = (jspdfModule as any).jsPDF || (jspdfModule as any).default;
  const autoTableModule = await import("jspdf-autotable");
  const autoTable = (autoTableModule as any).default || autoTableModule;

  const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  // Header band
  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, pageWidth, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("CreditLine — Historial de Abonos", margin, 13);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Gestión de Préstamos Personales · ClustLayer", margin, 20);
  doc.text(
    `Generado: ${new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}`,
    pageWidth - margin,
    20,
    { align: "right" },
  );
  doc.text(
    `Estado: ${params.deuda.estado === "activa" ? "Activa" : "Pagada"}`,
    pageWidth - margin,
    26,
    { align: "right" },
  );

  let y = 38;

  // Client info section
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Información del Cliente", margin, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    body: [
      ["Nombre", params.cliente.nombre, "Cédula", params.cliente.cedula],
      [
        "Teléfono",
        params.cliente.telefono,
        "Email",
        params.cliente.email || "—",
      ],
    ],
    theme: "plain",
    styles: { fontSize: 8, cellPadding: 2, textColor: [15, 23, 42] },
    columnStyles: {
      0: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 30 },
      1: { cellWidth: 55 },
      2: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 25 },
      3: { cellWidth: 55 },
    },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // Loan info section
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Detalle del Préstamo", margin, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    body: [
      [
        "Descripción",
        params.deuda.descripcion,
        "Monto Inicial",
        `$${params.deuda.monto.toLocaleString("es-CO")}`,
      ],
      [
        "Fecha Inicio",
        params.deuda.fechaInicio,
        "Vencimiento",
        params.deuda.fechaVencimiento || "—",
      ],
      [
        "Tasa Mensual",
        `${params.deuda.interesMensual}%`,
        "Intereses Generados",
        `$${params.intereses.toLocaleString("es-CO")}`,
      ],
    ],
    theme: "plain",
    styles: { fontSize: 8, cellPadding: 2, textColor: [15, 23, 42] },
    columnStyles: {
      0: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 30 },
      1: { cellWidth: 55 },
      2: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 30 },
      3: { cellWidth: 55 },
    },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // Summary metrics
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Resumen de Pagos", margin, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [
      [
        "Total Pagado",
        "Saldo Pendiente",
        "Abonos a Tiempo",
        "Abonos Atrasados",
        "Total Abonos",
      ],
    ],
    body: [
      [
        `$${params.totalPagado.toLocaleString("es-CO")}`,
        `$${params.saldo.toLocaleString("es-CO")}`,
        String(params.abonosATiempo),
        String(params.abonosAtrasados),
        String(params.deuda.abonos.length),
      ],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontSize: 8,
      fontStyle: "bold",
    },
    bodyStyles: { fontSize: 9, textColor: [15, 23, 42], fontStyle: "bold" },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Abonos history table
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Historial de Abonos", margin, y);
  y += 4;

  const sortedAbonos = [...params.deuda.abonos].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
  );

  autoTable(doc, {
    startY: y,
    head: [["#", "Fecha", "Tipo", "Monto", "Notas"]],
    body: [
      [
        "0",
        params.deuda.fechaInicio,
        "Préstamo Inicial",
        `$${params.deuda.monto.toLocaleString("es-CO")}`,
        params.deuda.descripcion,
      ],
      ...sortedAbonos.map((a, i) => [
        i + 1,
        a.fecha,
        a.atrasado ? "Abono Atrasado" : "Abono",
        `$${a.monto.toLocaleString("es-CO")}`,
        a.notas || "—",
      ]),
    ],
    theme: "striped",
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 25 },
      2: { cellWidth: 35 },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 65 },
    },
    didParseCell: (data: any) => {
      if (data.section === "body" && data.column.index === 2) {
        const v = data.cell.raw as string;
        if (v === "Abono Atrasado") {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = "bold";
        } else if (v === "Abono") {
          data.cell.styles.textColor = [22, 163, 74];
        } else if (v === "Préstamo Inicial") {
          data.cell.styles.textColor = [37, 99, 235];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
    margin: { left: margin, right: margin },
  });

  // Footer
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `CreditLine · ClustLayer · Página ${i} de ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 6,
      { align: "center" },
    );
  }

  const safeNombre = params.cliente.nombre.replace(/\s+/g, "_").toLowerCase();
  doc.save(`historial_abonos_${safeNombre}_${params.deuda.id}.pdf`);
  toast.success("PDF generado", {
    description: `Historial de abonos de ${params.cliente.nombre} descargado.`,
  });
}

export function DeudaDetalle() {
  const { deudaId } = useParams();
  const [showAbonoModal, setShowAbonoModal] = useState(false);
  const [abonoForm, setAbonoForm] = useState({ monto: "", fecha: "2026-04-29", notas: "", atrasado: false });
  const [abonoErrors, setAbonoErrors] = useState<{ monto?: string; fecha?: string }>({});
  const [abonos, setAbonos] = useState<Abono[]>([]);
  const [initialized, setInitialized] = useState(false);

  const deudaBase = deudasData.find((d) => d.id === deudaId);
  const cliente = deudaBase ? clientesData.find((c) => c.id === deudaBase.clienteId) : null;

  if (deudaBase && !initialized) {
    setAbonos([...deudaBase.abonos]);
    setInitialized(true);
  }

  if (!deudaBase || !cliente) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-8 text-center">
        <p className="text-[#64748B]">Deuda no encontrada.</p>
        <Link to="/cartera" className="text-[#2563EB] hover:underline mt-4 inline-block">Volver a Cartera</Link>
      </div>
    );
  }

  const deuda = { ...deudaBase, abonos };
  const totalPagado = abonos.reduce((s, a) => s + a.monto, 0);
  const intereses = calcularInteresesGenerados(deuda);
  const totalConIntereses = deuda.monto + intereses;
  const saldo = Math.max(0, totalConIntereses - totalPagado);
  const progreso = Math.min(100, (totalPagado / Math.max(1, totalConIntereses)) * 100);
  const estado = calcularEstadoDeuda(deuda);

  const abonosAtrasados = abonos.filter((a) => a.atrasado).length;
  const abonosATiempo = abonos.filter((a) => !a.atrasado).length;

  const abonosOrdenados = [...abonos].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  const validateAbono = () => {
    const e: { monto?: string; fecha?: string } = {};
    if (!abonoForm.monto || Number(abonoForm.monto) <= 0) e.monto = "El monto debe ser mayor a 0.";
    if (!abonoForm.fecha) e.fecha = "La fecha es requerida.";
    setAbonoErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegistrarAbono = () => {
    if (!validateAbono()) {
      toast.error("Formulario incompleto", { description: "Revisa los campos requeridos." });
      return;
    }
    const newAbono: Abono = { id: `a_${Date.now()}`, deudaId: deuda.id, monto: Number(abonoForm.monto), fecha: abonoForm.fecha, notas: abonoForm.notas, atrasado: abonoForm.atrasado };
    setAbonos((prev) => [...prev, newAbono]);
    toast.success("Abono registrado", { description: `$${Number(abonoForm.monto).toLocaleString("es-CO")} registrado correctamente.` });
    setAbonoForm({ monto: "", fecha: "2026-04-29", notas: "", atrasado: false });
    setAbonoErrors({});
    setShowAbonoModal(false);
  };

  const estadoInfo = {
    "al-dia": { color: "#16A34A", bg: "#F0FDF4", label: "Al día", icon: CheckCircle2 },
    riesgo: { color: "#F59E0B", bg: "#FFFBEB", label: "En riesgo", icon: Clock },
    atrasado: { color: "#DC2626", bg: "#FEF2F2", label: "Atrasado", icon: AlertCircle },
    pagada: { color: "#64748B", bg: "#F1F5F9", label: "Pagada", icon: CheckCircle2 },
  };
  const ei = estadoInfo[estado as keyof typeof estadoInfo] ?? estadoInfo["al-dia"];
  const EstadoIcon = ei.icon;

  const handleDescargarPDF = () => {
    generarPDFHistorial({ cliente, deuda: { ...deuda, abonos }, totalPagado, intereses, saldo, abonosAtrasados, abonosATiempo });
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6 lg:py-8">
      <Link to={`/cartera/${deuda.clienteId}`} className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] mb-6 transition-colors text-sm" aria-label={`Volver al detalle de ${cliente.nombre}`}>
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Volver a {cliente.nombre}
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-5 lg:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h1 className="text-[#0F172A] mb-1 truncate">{deuda.descripcion}</h1>
            <p className="text-[#64748B] text-sm">Cliente: <Link to={`/cartera/${cliente.id}`} className="text-[#2563EB] hover:underline">{cliente.nombre}</Link> · Inicio: {deuda.fechaInicio}{deuda.fechaVencimiento && ` · Vence: ${deuda.fechaVencimiento}`}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium" style={{ backgroundColor: ei.bg, color: ei.color }}>
              <EstadoIcon className="w-4 h-4" aria-hidden="true" />
              {ei.label}
            </span>
            <Tooltip content="Descargar historial en PDF">
              <button onClick={handleDescargarPDF} className="flex items-center gap-2 bg-[#0F172A] text-white px-3 py-2 rounded-xl hover:bg-[#1E293B] transition-colors text-sm" aria-label="Descargar historial PDF">
                <Download className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">PDF</span>
              </button>
            </Tooltip>
            {deuda.estado === "activa" && (
              <Tooltip content="Registrar un nuevo abono a esta deuda">
                <button onClick={() => setShowAbonoModal(true)} className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-xl hover:bg-[#1E3A8A] transition-colors text-sm" aria-label="Registrar abono">
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  <span>Abono</span>
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#64748B] text-sm">Progreso de pago</span>
            <span className="text-[#0F172A] font-semibold">{progreso.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-[#E2E8F0] rounded-full h-3">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progreso}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-3 rounded-full" style={{ backgroundColor: ei.color }} role="progressbar" aria-valuenow={progreso} aria-valuemin={0} aria-valuemax={100} aria-label={`Progreso: ${progreso.toFixed(1)}%`} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <div className="bg-[#F8FAFC] rounded-xl p-3 lg:p-4">
            <div className="text-[#64748B] text-xs mb-1">Monto Inicial</div>
            <div className="text-[#0F172A] font-semibold text-sm">${deuda.monto.toLocaleString("es-CO")}</div>
          </div>
          <div className="bg-[#F8FAFC] rounded-xl p-3 lg:p-4">
            <div className="text-[#64748B] text-xs mb-1">Tasa Mensual</div>
            <div className="text-[#F59E0B] font-semibold text-sm">{deuda.interesMensual}%</div>
          </div>
          <div className="bg-[#F8FAFC] rounded-xl p-3 lg:p-4">
            <div className="text-[#64748B] text-xs mb-1">Intereses</div>
            <div className="text-[#F59E0B] font-semibold text-sm">${intereses.toLocaleString("es-CO")}</div>
          </div>
          <div className="bg-[#F8FAFC] rounded-xl p-3 lg:p-4">
            <div className="text-[#64748B] text-xs mb-1">Total Pagado</div>
            <div className="text-[#16A34A] font-semibold text-sm">${totalPagado.toLocaleString("es-CO")}</div>
          </div>
          <div className="bg-[#F8FAFC] rounded-xl p-3 lg:p-4 col-span-2 sm:col-span-1">
            <div className="text-[#64748B] text-xs mb-1">Saldo Pendiente</div>
            <div className="text-[#DC2626] font-semibold text-sm">${saldo.toLocaleString("es-CO")}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-5 lg:p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[#0F172A]">Historial de Movimientos <span className="text-[#64748B] text-sm font-normal ml-2">({abonos.length + 1} registros)</span></h3>
          <Tooltip content="Descargar historial completo en PDF">
            <button onClick={handleDescargarPDF} className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155] rounded-xl hover:bg-[#EFF6FF] hover:text-[#2563EB] hover:border-[#BFDBFE] transition-colors text-xs" aria-label="Descargar historial en PDF">
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              Descargar PDF
            </button>
          </Tooltip>
        </div>

        <div className="overflow-x-auto -mx-5 lg:-mx-6">
          <div className="min-w-full px-5 lg:px-6">
            <table className="w-full" aria-label="Historial de movimientos">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="text-left py-3 px-4 text-[#64748B] text-xs font-medium">Fecha</th>
                  <th className="text-left py-3 px-4 text-[#64748B] text-xs font-medium">Tipo</th>
                  <th className="text-right py-3 px-4 text-[#64748B] text-xs font-medium">Monto</th>
                  <th className="text-left py-3 px-4 text-[#64748B] text-xs font-medium hidden sm:table-cell">Notas</th>
                </tr>
              </thead>
              <tbody>
                {abonosOrdenados.map((mov) => (
                  <tr key={mov.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-4 text-[#64748B] text-sm whitespace-nowrap">{mov.fecha}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${mov.atrasado ? "bg-[#FEF2F2] text-[#DC2626]" : "bg-[#F0FDF4] text-[#16A34A]"}`}>
                        <ArrowDownRight className="w-3 h-3" aria-hidden="true" />
                        <span className="hidden sm:inline">{mov.atrasado ? "Abono atrasado" : "Abono"}</span>
                        <span className="sm:hidden">{mov.atrasado ? "Atrasado" : "Abono"}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-[#0F172A] font-medium text-sm whitespace-nowrap">${mov.monto.toLocaleString("es-CO")}</td>
                    <td className="py-3 px-4 text-[#64748B] text-sm hidden sm:table-cell">{mov.notas || "—"}</td>
                  </tr>
                ))}
                <tr className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-4 text-[#64748B] text-sm whitespace-nowrap">{deuda.fechaInicio}</td>
                  <td className="py-3 px-4"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#EFF6FF] text-[#2563EB]"><Plus className="w-3 h-3" aria-hidden="true" /> Préstamo inicial</span></td>
                  <td className="py-3 px-4 text-right text-[#0F172A] font-medium text-sm whitespace-nowrap">${deuda.monto.toLocaleString("es-CO")}</td>
                  <td className="py-3 px-4 text-[#64748B] text-sm hidden sm:table-cell">{deuda.descripcion}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAbonoModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="abono-modal-title">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h3 id="abono-modal-title" className="text-[#0F172A] mb-1">Registrar Abono</h3>
              <p className="text-[#64748B] text-sm mb-5">Deuda: <strong className="text-[#0F172A]">{deuda.descripcion}</strong></p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="abono-monto" className="block text-[#334155] mb-1.5 text-sm">Monto del abono <span className="text-[#DC2626]">*</span></label>
                  <input id="abono-monto" type="number" min="1" value={abonoForm.monto} onChange={(e) => { setAbonoForm((p) => ({ ...p, monto: e.target.value })); setAbonoErrors((p) => ({ ...p, monto: undefined })); }} className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm ${abonoErrors.monto ? "border-[#DC2626]" : "border-[#E2E8F0]"}`} placeholder="0" aria-required="true" />
                  {abonoErrors.monto && <p className="text-[#DC2626] text-xs mt-1" role="alert">{abonoErrors.monto}</p>}
                </div>

                <div>
                  <label htmlFor="abono-fecha" className="block text-[#334155] mb-1.5 text-sm">Fecha <span className="text-[#DC2626]">*</span></label>
                  <input id="abono-fecha" type="date" value={abonoForm.fecha} onChange={(e) => { setAbonoForm((p) => ({ ...p, fecha: e.target.value })); setAbonoErrors((p) => ({ ...p, fecha: undefined })); }} className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm ${abonoErrors.fecha ? "border-[#DC2626]" : "border-[#E2E8F0]"}`} aria-required="true" />
                  {abonoErrors.fecha && <p className="text-[#DC2626] text-xs mt-1" role="alert">{abonoErrors.fecha}</p>}
                </div>

                <div>
                  <label htmlFor="abono-notas" className="block text-[#334155] mb-1.5 text-sm">Notas <span className="text-[#94A3B8] text-xs">(opcional)</span></label>
                  <textarea id="abono-notas" value={abonoForm.notas} onChange={(e) => setAbonoForm((p) => ({ ...p, notas: e.target.value }))} className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none text-sm" rows={2} placeholder="Comentario opcional sobre este abono..." />
                </div>

                <div className="flex items-center gap-3">
                  <input id="abono-atrasado" type="checkbox" checked={abonoForm.atrasado} onChange={(e) => setAbonoForm((p) => ({ ...p, atrasado: e.target.checked }))} className="w-4 h-4 accent-[#DC2626] cursor-pointer" />
                  <label htmlFor="abono-atrasado" className="text-[#334155] text-sm cursor-pointer">Marcar como abono atrasado</label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => { setShowAbonoModal(false); setAbonoErrors({}); setAbonoForm({ monto: "", fecha: "2026-04-29", notas: "", atrasado: false }); }} className="flex-1 px-4 py-3 border border-[#E2E8F0] text-[#334155] rounded-xl hover:bg-[#F8FAFC] transition-colors text-sm">Cancelar</button>
                <button onClick={handleRegistrarAbono} className="flex-1 px-4 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1E3A8A] transition-colors text-sm">Registrar Abono</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
export function DeudaDetalle() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-10">
      <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
        Detalle de Deuda
      </h1>
      <p className="text-[#64748B]">
        Información completa de la deuda seleccionada.
      </p>
    </div>
  );
}
