import { useState, useMemo } from "react";
import {
  Plus,
  Wallet,
  TrendingDown,
  Search,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "../../lib/toast";
import {
  deudasPersonalesData,
  DeudaPersonal,
  AbonoPersonal,
} from "../data/mockData";
import { Tooltip } from "../components/ui/Tooltip";

type ModoFilter = "todas" | "pendientes" | "pagadas";

function fmt(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v.toLocaleString("es-CO")}`;
}

async function generarPDFFinanzas(params: {
  deudas: DeudaPersonal[];
  totalDeuda: number;
  totalPagado: number;
  totalRetrasos: number;
  totalPagosATiempo: number;
  totalIntereses: number;
}) {
  const jspdfModule = await import("jspdf");
  const JsPDF = (jspdfModule as any).jsPDF || (jspdfModule as any).default;
  const autoTableModule = await import("jspdf-autotable");
  const autoTable = (autoTableModule as any).default || autoTableModule;

  const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, pageWidth, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("CreditLine — Finanzas Personales", margin, 12);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Resumen de Deudas Personales · ClustLayer", margin, 19);
  doc.text(
    `Generado: ${new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}`,
    pageWidth - margin,
    19,
    { align: "right" },
  );

  let y = 38;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Resumen General", margin, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Deuda Pendiente", "Total Pagado", "Pagos Atrasados", "Pagos a Tiempo", "Intereses"]],
    body: [[
      `$${params.totalDeuda.toLocaleString("es-CO")}`,
      `$${params.totalPagado.toLocaleString("es-CO")}`,
      String(params.totalRetrasos),
      String(params.totalPagosATiempo),
      `$${params.totalIntereses.toLocaleString("es-CO")}`,
    ]],
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 9, textColor: [15, 23, 42], fontStyle: "bold" },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Detalle de Deudas Personales", margin, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Concepto", "Acreedor", "Monto", "Tasa/mes", "Pagado", "Saldo", "Estado"]],
    body: params.deudas.map((d) => {
      const pagado = d.pagos.reduce((s, p) => s + p.monto, 0);
      const saldo = Math.max(0, d.monto - pagado);
      const atrasados = d.pagos.filter((p) => p.atrasado).length;
      return [
        d.concepto.length > 30 ? d.concepto.substring(0, 30) + "…" : d.concepto,
        d.acreedor,
        `$${d.monto.toLocaleString("es-CO")}`,
        `${d.interesMensual}%`,
        `$${pagado.toLocaleString("es-CO")}`,
        `$${saldo.toLocaleString("es-CO")}`,
        d.estado === "activa" ? (atrasados > 0 ? "Activa c/retrasos" : "Activa") : "Pagada",
      ];
    }),
    theme: "striped",
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 30 },
      2: { cellWidth: 25, halign: "right" },
      3: { cellWidth: 15, halign: "center" },
      4: { cellWidth: 25, halign: "right" },
      5: { cellWidth: 25, halign: "right" },
      6: { cellWidth: 25, halign: "center" },
    },
    didParseCell: (data: any) => {
      if (data.section === "body" && data.column.index === 6) {
        const v = data.cell.raw as string;
        if (v.includes("retrasos")) data.cell.styles.textColor = [245, 158, 11];
        else if (v === "Activa") data.cell.styles.textColor = [37, 99, 235];
        else if (v === "Pagada") data.cell.styles.textColor = [22, 163, 74];
      }
    },
    margin: { left: margin, right: margin },
  });

  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`CreditLine · ClustLayer · Página ${i} de ${totalPages}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 6, { align: "center" });
  }

  doc.save(`finanzas_personales_${new Date().toISOString().slice(0, 10)}.pdf`);
  toast.success("PDF generado", { description: "El reporte de finanzas personales fue descargado." });
}

function NuevaDeudaModal({ onClose, onSave }: { onClose: () => void; onSave: (d: Omit<DeudaPersonal, "id" | "pagos">) => void; }) {
  const [form, setForm] = useState({
    concepto: "",
    acreedor: "",
    monto: "",
    interesMensual: "",
    fechaInicio: "2026-04-29",
    fechaVencimiento: "",
    estado: "activa" as "activa" | "pagada",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.concepto.trim()) e.concepto = "El concepto es requerido.";
    if (!form.acreedor.trim()) e.acreedor = "El acreedor es requerido.";
    if (!form.monto || Number(form.monto) <= 0) e.monto = "El monto debe ser mayor a 0.";
    if (!form.interesMensual || Number(form.interesMensual) < 0) e.interesMensual = "El interés debe ser 0 o mayor.";
    if (!form.fechaInicio) e.fechaInicio = "La fecha de inicio es requerida.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      toast.error("Formulario incompleto", { description: "Revisa los campos requeridos." });
      return;
    }
    onSave({
      concepto: form.concepto,
      acreedor: form.acreedor,
      monto: Number(form.monto),
      interesMensual: Number(form.interesMensual),
      fechaInicio: form.fechaInicio,
      fechaVencimiento: form.fechaVencimiento || undefined,
      estado: form.estado,
    });
  };

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const Field = ({ id, label, req, error, children }: { id: string; label: string; req?: boolean; error?: string; children: React.ReactNode }) => (
    <div>
      <label htmlFor={id} className="block text-[#334155] mb-1.5 text-sm">
        {label} {req && <span className="text-[#DC2626]">*</span>}
      </label>
      {children}
      {error && <p className="text-[#DC2626] text-xs mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="ndp-title">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 id="ndp-title" className="text-[#0F172A] mb-1">Nueva Deuda Personal</h3>
        <p className="text-[#64748B] text-sm mb-5">Registra una nueva deuda personal o financiera.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><Field id="ndp-concepto" label="Concepto / Descripción" req error={errors.concepto}><input id="ndp-concepto" type="text" value={form.concepto} onChange={f("concepto")} className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm ${errors.concepto ? "border-[#DC2626]" : "border-[#E2E8F0]"}`} placeholder="Ej: Tarjeta de crédito Bancolombia" /></Field></div>
          <Field id="ndp-acreedor" label="Acreedor" req error={errors.acreedor}><input id="ndp-acreedor" type="text" value={form.acreedor} onChange={f("acreedor")} className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm ${errors.acreedor ? "border-[#DC2626]" : "border-[#E2E8F0]"}`} placeholder="Ej: Bancolombia" /></Field>
          <Field id="ndp-monto" label="Monto total" req error={errors.monto}><input id="ndp-monto" type="number" min="0" value={form.monto} onChange={f("monto")} className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm ${errors.monto ? "border-[#DC2626]" : "border-[#E2E8F0]"}`} placeholder="1000000" /></Field>
          <Field id="ndp-interes" label="Interés mensual (%)" req error={errors.interesMensual}><input id="ndp-interes" type="number" min="0" step="0.1" value={form.interesMensual} onChange={f("interesMensual")} className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm ${errors.interesMensual ? "border-[#DC2626]" : "border-[#E2E8F0]"}`} placeholder="2" /></Field>
          <Field id="ndp-inicio" label="Fecha de inicio" req error={errors.fechaInicio}><input id="ndp-inicio" type="date" value={form.fechaInicio} onChange={f("fechaInicio")} className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm" /></Field>
          <Field id="ndp-venc" label="Fecha de vencimiento"><input id="ndp-venc" type="date" value={form.fechaVencimiento} onChange={f("fechaVencimiento")} className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm" /></Field>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-3 border border-[#E2E8F0] text-[#334155] rounded-xl hover:bg-[#F8FAFC] transition-colors text-sm">Cancelar</button>
          <button onClick={handleSave} className="flex-1 px-4 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1E3A8A] transition-colors text-sm">Registrar Deuda</button>
        </div>
      </motion.div>
    </div>
  );
}

function RegistrarPagoModal({ deuda, onClose, onSave }: { deuda: DeudaPersonal; onClose: () => void; onSave: (p: Omit<AbonoPersonal, "id" | "deudaId">) => void; }) {
  const [form, setForm] = useState({ monto: "", fecha: "2026-04-29", notas: "", atrasado: false });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.monto || Number(form.monto) <= 0) e.monto = "El monto debe ser mayor a 0.";
    if (!form.fecha) e.fecha = "La fecha es requerida.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) { toast.error("Formulario incompleto", { description: "Revisa los campos requeridos." }); return; }
    onSave({ monto: Number(form.monto), fecha: form.fecha, notas: form.notas, atrasado: form.atrasado });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="rp-title">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 id="rp-title" className="text-[#0F172A] mb-1">Registrar Pago</h3>
        <p className="text-[#64748B] text-sm mb-5">Deuda: <strong className="text-[#0F172A]">{deuda.concepto}</strong></p>
        <div className="space-y-4">
          <div><label htmlFor="rp-monto" className="block text-[#334155] mb-1.5 text-sm">Monto del pago <span className="text-[#DC2626]">*</span></label><input id="rp-monto" type="number" min="1" value={form.monto} onChange={(e) => { setForm((p) => ({ ...p, monto: e.target.value })); setErrors((p) => ({ ...p, monto: "" })); }} className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm ${errors.monto ? "border-[#DC2626]" : "border-[#E2E8F0]"}`} placeholder="0" />{errors.monto && <p className="text-[#DC2626] text-xs mt-1">{errors.monto}</p>}</div>
          <div><label htmlFor="rp-fecha" className="block text-[#334155] mb-1.5 text-sm">Fecha <span className="text-[#DC2626]">*</span></label><input id="rp-fecha" type="date" value={form.fecha} onChange={(e) => { setForm((p) => ({ ...p, fecha: e.target.value })); setErrors((p) => ({ ...p, fecha: "" })); }} className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm ${errors.fecha ? "border-[#DC2626]" : "border-[#E2E8F0]"}`} />{errors.fecha && <p className="text-[#DC2626] text-xs mt-1">{errors.fecha}</p>}</div>
          <div><label htmlFor="rp-notas" className="block text-[#334155] mb-1.5 text-sm">Notas <span className="text-[#94A3B8] text-xs">(opcional)</span></label><textarea id="rp-notas" value={form.notas} onChange={(e) => setForm((p) => ({ ...p, notas: e.target.value }))} className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none text-sm" rows={2} placeholder="Comentario opcional..." /></div>
          <div className="flex items-center gap-3"><input id="rp-atrasado" type="checkbox" checked={form.atrasado} onChange={(e) => setForm((p) => ({ ...p, atrasado: e.target.checked }))} className="w-4 h-4 accent-[#DC2626] cursor-pointer" /><label htmlFor="rp-atrasado" className="text-[#334155] text-sm cursor-pointer">Marcar como pago atrasado</label></div>
        </div>
        <div className="flex gap-3 mt-6"><button onClick={onClose} className="flex-1 px-4 py-3 border border-[#E2E8F0] text-[#334155] rounded-xl hover:bg-[#F8FAFC] transition-colors text-sm">Cancelar</button><button onClick={handleSave} className="flex-1 px-4 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1E3A8A] transition-colors text-sm">Registrar Pago</button></div>
      </motion.div>
    </div>
  );
}

export function FinanzasPersonales() {
  const [deudas, setDeudas] = useState<DeudaPersonal[]>(deudasPersonalesData);
  const [showNuevaDeuda, setShowNuevaDeuda] = useState(false);
  const [pagoDeuda, setPagoDeuda] = useState<DeudaPersonal | null>(null);
  const [search, setSearch] = useState("");
  const [modoFilter, setModoFilter] = useState<ModoFilter>("pendientes");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => deudas.filter((d) => {
    const matchSearch = d.concepto.toLowerCase().includes(search.toLowerCase()) || d.acreedor.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (modoFilter === "pendientes") return d.estado === "activa";
    if (modoFilter === "pagadas") return d.estado === "pagada";
    return true;
  }), [deudas, search, modoFilter]);

  const totalDeuda = deudas.filter((d) => d.estado === "activa").reduce((s, d) => s + Math.max(0, d.monto - d.pagos.reduce((a, p) => a + p.monto, 0)), 0);
  const totalPagado = deudas.reduce((s, d) => s + d.pagos.reduce((a, p) => a + p.monto, 0), 0);
  const allPagos = deudas.flatMap((d) => d.pagos);
  const totalRetrasos = allPagos.filter((p) => p.atrasado).length;
  const totalPagosATiempo = allPagos.filter((p) => !p.atrasado).length;
  const totalInteresesPagados = deudas.reduce((s, d) => {
    const meses = d.pagos.length > 0 ? Math.max(1, Math.round((new Date(d.pagos[d.pagos.length - 1].fecha).getTime() - new Date(d.fechaInicio).getTime()) / (1000 * 60 * 60 * 24 * 30))) : 0;
    return s + d.monto * (d.interesMensual / 100) * meses;
  }, 0);

  const handleNuevaDeuda = (data: Omit<DeudaPersonal, "id" | "pagos">) => { setDeudas((p) => [...p, { ...data, id: `dp${Date.now()}`, pagos: [] }]); toast.success("Deuda personal registrada", { description: `"${data.concepto}" agregada exitosamente.` }); setShowNuevaDeuda(false); };
  const handleRegistrarPago = (pago: Omit<AbonoPersonal, "id" | "deudaId">) => { if (!pagoDeuda) return; const newPago: AbonoPersonal = { ...pago, id: `pp${Date.now()}`, deudaId: pagoDeuda.id }; setDeudas((prev) => prev.map((d) => d.id === pagoDeuda.id ? { ...d, pagos: [...d.pagos, newPago] } : d)); toast.success("Pago registrado", { description: `$${pago.monto.toLocaleString("es-CO")} pagado a "${pagoDeuda.concepto}".` }); setPagoDeuda(null); };

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6 lg:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"><div><h1 className="text-[#0F172A] mb-1">Finanzas Personales</h1><p className="text-[#64748B]">Gestiona tus deudas y compromisos financieros propios</p></div><div className="flex items-center gap-2 shrink-0 flex-wrap"><Tooltip content="Descargar reporte de finanzas en PDF"><button onClick={() => generarPDFFinanzas({ deudas, totalDeuda, totalPagado, totalRetrasos, totalPagosATiempo, totalIntereses: totalInteresesPagados })} className="inline-flex items-center gap-2 bg-[#0F172A] text-white px-4 py-2.5 rounded-xl hover:bg-[#1E293B] transition-colors shadow-sm text-sm" aria-label="Descargar reporte de finanzas en PDF"><Download className="w-4 h-4" aria-hidden="true" /><span className="hidden sm:inline">Descargar PDF</span><span className="sm:hidden">PDF</span></button></Tooltip><Tooltip content="Registrar una nueva deuda personal"><button onClick={() => setShowNuevaDeuda(true)} className="inline-flex items-center gap-2 bg-[#2563EB] text-white px-5 py-2.5 rounded-xl hover:bg-[#1E3A8A] transition-colors shadow-sm text-sm" aria-label="Nueva deuda personal"><Plus className="w-4 h-4" aria-hidden="true" />Nueva Deuda</button></Tooltip></div></div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-4 flex items-center gap-3 col-span-2 sm:col-span-1"><div className="p-2.5 bg-[#FEF2F2] rounded-xl shrink-0"><TrendingDown className="w-5 h-5 text-[#DC2626]" aria-hidden="true" /></div><div className="min-w-0"><div className="text-[#64748B] text-xs">Deuda Pendiente</div><div className="text-[#0F172A] font-semibold text-base truncate">{fmt(totalDeuda)}</div></div></div>
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-4 flex items-center gap-3 col-span-2 sm:col-span-1"><div className="p-2.5 bg-[#F0FDF4] rounded-xl shrink-0"><Wallet className="w-5 h-5 text-[#16A34A]" aria-hidden="true" /></div><div className="min-w-0"><div className="text-[#64748B] text-xs">Total Pagado</div><div className="text-[#0F172A] font-semibold text-base truncate">{fmt(totalPagado)}</div></div></div>
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-4 flex items-center gap-3"><div className="p-2.5 bg-[#FEF2F2] rounded-xl shrink-0"><XCircle className="w-5 h-5 text-[#DC2626]" aria-hidden="true" /></div><div className="min-w-0"><div className="text-[#64748B] text-xs">Pagos Atrasados</div><div className="text-[#DC2626] font-semibold text-base">{totalRetrasos}</div></div></div>
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-4 flex items-center gap-3"><div className="p-2.5 bg-[#F0FDF4] rounded-xl shrink-0"><CheckCircle2 className="w-5 h-5 text-[#16A34A]" aria-hidden="true" /></div><div className="min-w-0"><div className="text-[#64748B] text-xs">Pagos a Tiempo</div><div className="text-[#16A34A] font-semibold text-base">{totalPagosATiempo}</div></div></div>
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-4 flex items-center gap-3"><div className="p-2.5 bg-[#FFFBEB] rounded-xl shrink-0"><AlertCircle className="w-5 h-5 text-[#F59E0B]" aria-hidden="true" /></div><div className="min-w-0"><div className="text-[#64748B] text-xs">Intereses Pagados</div><div className="text-[#F59E0B] font-semibold text-base truncate">{fmt(totalInteresesPagados)}</div></div></div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-4 lg:p-5 mb-6"><div className="flex flex-col sm:flex-row gap-3 mb-4"><div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" aria-hidden="true" /><input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por concepto o acreedor..." className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm" aria-label="Buscar deuda personal" /></div></div><div className="flex gap-1 flex-wrap">{(["pendientes", "pagadas", "todas"] as ModoFilter[]).map((m) => (<button key={m} onClick={() => setModoFilter(m)} className={`px-4 py-2 rounded-lg text-sm transition-colors ${modoFilter === m ? "bg-[#1E3A8A] text-white" : "text-[#64748B] hover:bg-[#F1F5F9]"}`} aria-pressed={modoFilter === m}>{m.charAt(0).toUpperCase() + m.slice(1)}</button>))}</div></div>

      {filtered.length === 0 ? <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] py-16 text-center"><Wallet className="w-10 h-10 mx-auto text-[#CBD5E1] mb-3" aria-hidden="true" /><p className="text-[#64748B]">No se encontraron deudas.</p></div> : <div className="space-y-4">{filtered.map((deuda) => { const totalPag = deuda.pagos.reduce((s, p) => s + p.monto, 0); const saldo = Math.max(0, deuda.monto - totalPag); const progreso = Math.min(100, (totalPag / Math.max(1, deuda.monto)) * 100); const expanded = expandedId === deuda.id; const pagosOrdenados = [...deuda.pagos].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()); return (<motion.div key={deuda.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden"><div className="p-5 lg:p-6"><div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4"><div className="min-w-0"><h4 className="text-[#0F172A] font-medium mb-0.5 truncate">{deuda.concepto}</h4><p className="text-[#64748B] text-sm">{deuda.acreedor} · {deuda.interesMensual}%/mes{deuda.fechaVencimiento && ` · Vence: ${deuda.fechaVencimiento}`}</p></div><div className="flex items-center gap-2 shrink-0 flex-wrap"><span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${deuda.estado === "activa" ? "bg-[#EFF6FF] text-[#2563EB]" : "bg-[#F0FDF4] text-[#16A34A]"}`}>{deuda.estado === "activa" ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}{deuda.estado === "activa" ? "Activa" : "Pagada"}</span>{deuda.estado === "activa" && <Tooltip content="Registrar un pago a esta deuda"><button onClick={() => setPagoDeuda(deuda)} className="px-3 py-1.5 bg-[#2563EB] text-white rounded-lg hover:bg-[#1E3A8A] transition-colors text-xs" aria-label={`Registrar pago para ${deuda.concepto}`}>Registrar Pago</button></Tooltip>}</div></div><div className="mb-4"><div className="flex justify-between text-xs mb-1"><span className="text-[#64748B]">Progreso</span><span className="text-[#0F172A] font-medium">{progreso.toFixed(1)}%</span></div><div className="w-full bg-[#E2E8F0] rounded-full h-2"><div className="bg-[#2563EB] h-2 rounded-full transition-all" style={{ width: `${progreso}%` }} /></div></div><div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#F1F5F9]"><div><div className="text-[#94A3B8] text-xs mb-0.5">Monto</div><div className="text-[#0F172A] text-sm font-medium">{fmt(deuda.monto)}</div></div><div><div className="text-[#94A3B8] text-xs mb-0.5">Pagado</div><div className="text-[#16A34A] text-sm font-medium">{fmt(totalPag)}</div></div><div><div className="text-[#94A3B8] text-xs mb-0.5">Saldo</div><div className="text-[#DC2626] text-sm font-medium">{fmt(saldo)}</div></div></div>{deuda.pagos.length > 0 && <button onClick={() => setExpandedId(expanded ? null : deuda.id)} className="mt-4 text-[#2563EB] text-xs hover:underline" aria-expanded={expanded}>{expanded ? "Ocultar historial" : `Ver historial (${deuda.pagos.length} pagos)`}</button>}</div><AnimatePresence>{expanded && pagosOrdenados.length > 0 && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="border-t border-[#E2E8F0] bg-[#F8FAFC] px-5 lg:px-6 py-4"><h4 className="text-[#64748B] text-xs font-medium uppercase tracking-wide mb-3">Historial de Pagos</h4><div className="space-y-2">{pagosOrdenados.map((pago) => (<div key={pago.id} className="flex items-start sm:items-center justify-between py-2 border-b border-[#E2E8F0] last:border-0 gap-2"><div className="flex items-center gap-2 flex-wrap"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${pago.atrasado ? "bg-[#FEF2F2] text-[#DC2626]" : "bg-[#F0FDF4] text-[#16A34A]"}`}><ArrowDownRight className="w-3 h-3" aria-hidden="true" />{pago.atrasado ? "Atrasado" : "A tiempo"}</span><span className="text-[#64748B] text-xs">{pago.fecha}</span>{pago.notas && <span className="text-[#94A3B8] text-xs hidden sm:block">· {pago.notas}</span>}</div><span className="text-[#0F172A] text-sm font-medium shrink-0">{fmt(pago.monto)}</span></div>))}</div></div></motion.div>)}</AnimatePresence></motion.div>); })}</div>}

      <AnimatePresence>{showNuevaDeuda && <NuevaDeudaModal onClose={() => setShowNuevaDeuda(false)} onSave={handleNuevaDeuda} />}</AnimatePresence>
      <AnimatePresence>{pagoDeuda && <RegistrarPagoModal deuda={pagoDeuda} onClose={() => setPagoDeuda(null)} onSave={handleRegistrarPago} />}</AnimatePresence>
    </div>
  );
}
