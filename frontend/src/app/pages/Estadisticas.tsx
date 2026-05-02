import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle2,
  BarChart2,
  Activity,
  Trophy,
  Download,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { motion } from "motion/react";
import toast from "../../lib/toast";
import {
  deudasData,
  clientesData,
  calcularEstadoDeuda,
  calcularInteresesGenerados,
} from "../data/mockData";
import { Tooltip } from "../components/ui/Tooltip";

type ChartType = "barras" | "lineas" | "pastel";

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const MESES_FULL = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const COLORS = ["#2563EB", "#16A34A", "#F59E0B", "#DC2626", "#8B5CF6", "#06B6D4", "#EC4899", "#F97316"];

function fmt(val: number): string { if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`; if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`; return `$${val.toLocaleString("es-CO")}`; }
function fmtFull(val: number): string { return `$${val.toLocaleString("es-CO")}`; }

function getAllAbonos() { return deudasData.flatMap((d) => d.abonos); }

function buildMetrics(filteredDeudas: typeof deudasData, filteredAbonos: ReturnType<typeof getAllAbonos>) {
  const totalPrestado = filteredDeudas.reduce((s, d) => s + d.monto, 0);
  const totalAbonado = filteredAbonos.reduce((s, a) => s + a.monto, 0);
  const promedioDeuda = filteredDeudas.length ? totalPrestado / filteredDeudas.length : 0;
  const promedioAbono = filteredAbonos.length ? totalAbonado / filteredAbonos.length : 0;
  const allActive = deudasData.filter((d) => d.estado === "activa");
  const deudaTotal = allActive.reduce((s, d) => s + Math.max(0, d.monto - d.abonos.reduce((a, b) => a + b.monto, 0)), 0);
  const deudasAlDia = allActive.filter((d) => calcularEstadoDeuda(d) === "al-dia").length;
  const deudasAtrasadas = allActive.filter((d) => calcularEstadoDeuda(d) === "atrasado").length;
  const deudasFinalizadas = deudasData.filter((d) => d.estado === "pagada").length;
  const totalIntereses = allActive.reduce((s, d) => s + calcularInteresesGenerados(d), 0);
  const prestamoMasAlto = filteredDeudas.length ? Math.max(...filteredDeudas.map((d) => d.monto)) : 0;
  const prestamoMasBajo = filteredDeudas.length ? Math.min(...filteredDeudas.map((d) => d.monto)) : 0;
  const abonoMasGrande = filteredAbonos.length ? Math.max(...filteredAbonos.map((a) => a.monto)) : 0;
  const abonoMasPequeno = filteredAbonos.length ? Math.min(...filteredAbonos.map((a) => a.monto)) : 0;
  return { nuevosPrestamos: filteredDeudas.length, totalPrestado, promedioPrestamo: promedioDeuda, abonoTotal: totalAbonado, abonoPromedio: promedioAbono, deudaTotal, deudasAlDia, deudasAtrasadas, deudasFinalizadas, totalIntereses, prestamoMasAlto, prestamoMasBajo, abonoMasGrande, abonoMasPequeno };
}

async function downloadEstadisticasPDF(metrics: ReturnType<typeof buildMetrics>, filterLabel: string, rankings: { mejores: any[]; peores: any[] }) {
  const jspdfModule = await import("jspdf");
  const JsPDF = (jspdfModule as any).jsPDF || (jspdfModule as any).default;
  const autoTableModule = await import("jspdf-autotable");
  const autoTable = (autoTableModule as any).default || autoTableModule;
  const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("CreditLine — Estadísticas", margin, 12);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Gestión de Préstamos Personales · ClustLayer", margin, 19);
  doc.text(`Filtro: ${filterLabel}`, margin, 25);
  doc.text(`Generado: ${new Date().toLocaleDateString("es-CO")}`, pageWidth - margin, 25, { align: "right" });

  let y = 36;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Resumen de Métricas", margin, y);
  y += 6;

  autoTable(doc, { startY: y, head: [["Métrica", "Valor", "Métrica", "Valor"]], body: [["Nuevos Préstamos", String(metrics.nuevosPrestamos), "Total Prestado", fmtFull(metrics.totalPrestado)], ["Préstamo Promedio", fmtFull(metrics.promedioPrestamo), "Abono Total", fmtFull(metrics.abonoTotal)], ["Abono Promedio", fmtFull(metrics.abonoPromedio), "Deuda Total Activa", fmtFull(metrics.deudaTotal)], ["Deudas al Día", String(metrics.deudasAlDia), "Deudas Atrasadas", String(metrics.deudasAtrasadas)], ["Deudas Finalizadas", String(metrics.deudasFinalizadas), "Intereses Generados", fmtFull(metrics.totalIntereses)], ["Préstamo más Alto", fmtFull(metrics.prestamoMasAlto), "Préstamo más Bajo", fmtFull(metrics.prestamoMasBajo)], ["Abono más Grande", fmtFull(metrics.abonoMasGrande), "Abono más Pequeño", fmtFull(metrics.abonoMasPequeno)]], theme: "grid", headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 8, fontStyle: "bold" }, bodyStyles: { fontSize: 8, textColor: [15, 23, 42] }, columnStyles: { 0: { cellWidth: 45, fontStyle: "bold", textColor: [100, 116, 139] }, 1: { cellWidth: 35 }, 2: { cellWidth: 45, fontStyle: "bold", textColor: [100, 116, 139] }, 3: { cellWidth: 35 } }, margin: { left: margin, right: margin } });

  y = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.text("Clientes más Cumplidos", margin, y); y += 4;
  autoTable(doc, { startY: y, head: [["#", "Cliente", "Abonos a Tiempo", "Abonos Totales", "Cumplimiento"]], body: rankings.mejores.map((c, i) => [i + 1, c.nombre, c.totalAbonos - c.atrasados, c.totalAbonos, `${c.cumplimiento.toFixed(1)}%`]), theme: "striped", headStyles: { fillColor: [22, 163, 74], textColor: 255, fontSize: 8 }, bodyStyles: { fontSize: 8, textColor: [15, 23, 42] }, margin: { left: margin, right: margin } });

  y = (doc as any).lastAutoTable.finalY + 10;
  if (rankings.peores.length > 0) { doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.text("Clientes con más Retrasos", margin, y); y += 4; autoTable(doc, { startY: y, head: [["#", "Cliente", "Abonos Atrasados", "Abonos Totales", "% Retraso"]], body: rankings.peores.map((c, i) => [i + 1, c.nombre, c.atrasados, c.totalAbonos, `${c.totalAbonos > 0 ? ((c.atrasados / c.totalAbonos) * 100).toFixed(1) : 0}%`]), theme: "striped", headStyles: { fillColor: [220, 38, 38], textColor: 255, fontSize: 8 }, bodyStyles: { fontSize: 8, textColor: [15, 23, 42] }, margin: { left: margin, right: margin } }); }

  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) { doc.setPage(i); doc.setFontSize(7); doc.setTextColor(148, 163, 184); doc.text(`CreditLine · ClustLayer · Página ${i} de ${totalPages}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 6, { align: "center" }); }
  doc.save(`estadisticas_creditline_${new Date().toISOString().slice(0, 10)}.pdf`);
  toast.success("PDF generado", { description: "El reporte de estadísticas fue descargado." });
}

export function Estadisticas() {
  const currentYear = 2026;
  const currentMonth = 3;
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [chartTypePrestados, setChartTypePrestados] = useState<ChartType>("barras");
  const [chartTypeAbonados, setChartTypeAbonados] = useState<ChartType>("barras");
  const [chartTypeUtilidad, setChartTypeUtilidad] = useState<ChartType>("lineas");
  const years = [2025, 2026];

  const filteredDeudas = useMemo(() => {
    if (dateFrom && dateTo) { const from = new Date(dateFrom); const to = new Date(dateTo); return deudasData.filter((d) => { const fecha = new Date(d.fechaInicio); return fecha >= from && fecha <= to; }); }
    return deudasData.filter((d) => { const fecha = new Date(d.fechaInicio); if (fecha.getFullYear() !== selectedYear) return false; if (selectedMonth !== "all" && fecha.getMonth() !== selectedMonth) return false; return true; });
  }, [selectedYear, selectedMonth, dateFrom, dateTo]);

  const filteredAbonos = useMemo(() => deudasData.flatMap((d) => d.abonos.filter((a) => { if (dateFrom && dateTo) { const fecha = new Date(a.fecha); return fecha >= new Date(dateFrom) && fecha <= new Date(dateTo); } const fecha = new Date(a.fecha); if (fecha.getFullYear() !== selectedYear) return false; if (selectedMonth !== "all" && fecha.getMonth() !== selectedMonth) return false; return true; })), [selectedYear, selectedMonth, dateFrom, dateTo]);
  const metrics = useMemo(() => buildMetrics(filteredDeudas, filteredAbonos), [filteredDeudas, filteredAbonos]);
  const monthlyData = useMemo(() => {
    const maxMes = selectedYear === currentYear ? currentMonth : 11;
    return MESES.slice(0, maxMes + 1).map((mes, idx) => {
      const prestados = deudasData.filter((d) => new Date(d.fechaInicio).getFullYear() === selectedYear && new Date(d.fechaInicio).getMonth() === idx).reduce((s, d) => s + d.monto, 0);
      const abonados = deudasData.flatMap((d) => d.abonos).filter((a) => new Date(a.fecha).getFullYear() === selectedYear && new Date(a.fecha).getMonth() === idx).reduce((s, a) => s + a.monto, 0);
      const intereses = deudasData.filter((d) => { const inicio = new Date(d.fechaInicio); return inicio.getFullYear() <= selectedYear && (d.estado === "activa" || new Date(d.fechaVencimiento || "9999").getFullYear() >= selectedYear); }).reduce((s, d) => s + d.monto * (d.interesMensual / 100), 0);
      return { mes, prestados, abonados, intereses, utilidad: intereses };
    });
  }, [selectedYear]);

  const rankings = useMemo(() => {
    const clientStats = clientesData.map((c) => { const deudas = deudasData.filter((d) => d.clienteId === c.id); const totalAbonos = deudas.reduce((s, d) => s + d.abonos.length, 0); const atrasados = deudas.reduce((s, d) => s + d.abonos.filter((a) => a.atrasado).length, 0); const cumplimiento = totalAbonos > 0 ? ((totalAbonos - atrasados) / totalAbonos) * 100 : 100; return { id: c.id, nombre: c.nombre, totalAbonos, atrasados, cumplimiento }; });
    const sorted = [...clientStats].sort((a, b) => b.cumplimiento - a.cumplimiento);
    return { mejores: sorted.slice(0, 5), peores: sorted.filter((c) => c.atrasados > 0).sort((a, b) => b.atrasados - a.atrasados).slice(0, 5) };
  }, []);

  const filterLabel = useMemo(() => { if (dateFrom && dateTo) return `${dateFrom} — ${dateTo}`; if (selectedMonth !== "all") return `${MESES_FULL[selectedMonth as number]} ${selectedYear}`; return `Año ${selectedYear}`; }, [selectedYear, selectedMonth, dateFrom, dateTo]);

  const ChartToggle = ({ type, onChange }: { type: ChartType; onChange: (t: ChartType) => void; }) => (<div className="flex gap-1 flex-wrap" role="group" aria-label="Tipo de gráfico">{(["barras", "lineas", "pastel"] as ChartType[]).map((t) => (<button key={t} onClick={() => { onChange(t); toast.success(`Gráfico: ${t}`); }} className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors ${type === t ? "bg-[#2563EB] text-white" : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"}`} aria-pressed={type === t}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>))}</div>);

  const ChartRenderer = ({ type, data, dataKey, color, label }: { type: ChartType; data: typeof monthlyData; dataKey: string; color: string; label: string; }) => {
    if (type === "pastel") { const pieData = data.filter((d) => (d as any)[dataKey] > 0).map((d) => ({ name: d.mes, value: (d as any)[dataKey] })); return (<ResponsiveContainer width="100%" height={260}><PieChart><Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${fmt(value)}`}>{pieData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}</Pie><RechartTooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0" }} /></PieChart></ResponsiveContainer>); }
    if (type === "lineas") { return (<ResponsiveContainer width="100%" height={260}><LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" /><XAxis dataKey="mes" stroke="#94A3B8" tick={{ fontSize: 11 }} /><YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} tickFormatter={(v) => fmt(v)} width={60} /><RechartTooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0" }} /><Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={{ fill: color, r: 4 }} name={label} /></LineChart></ResponsiveContainer>); }
    return (<ResponsiveContainer width="100%" height={260}><BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" /><XAxis dataKey="mes" stroke="#94A3B8" tick={{ fontSize: 11 }} /><YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} tickFormatter={(v) => fmt(v)} width={60} /><RechartTooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0" }} /><Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} name={label} /></BarChart></ResponsiveContainer>);
  };

  const statCards = [ { title: "Nuevos Préstamos", value: String(metrics.nuevosPrestamos), icon: TrendingUp, color: "#2563EB", sub: "En el período" }, { title: "Total Prestado", value: fmt(metrics.totalPrestado), icon: DollarSign, color: "#2563EB", sub: "Monto acumulado" }, { title: "Préstamo Promedio", value: fmt(metrics.promedioPrestamo), icon: BarChart2, color: "#8B5CF6", sub: "Por préstamo" }, { title: "Abono Total", value: fmt(metrics.abonoTotal), icon: DollarSign, color: "#16A34A", sub: "Recuperado" }, { title: "Abono Promedio", value: fmt(metrics.abonoPromedio), icon: Activity, color: "#16A34A", sub: "Por abono" }, { title: "Deuda Total", value: fmt(metrics.deudaTotal), icon: AlertCircle, color: "#DC2626", sub: "Saldo pendiente" }, { title: "Deudas al Día", value: String(metrics.deudasAlDia), icon: CheckCircle2, color: "#16A34A", sub: "Sin retrasos" }, { title: "Deudas Atrasadas", value: String(metrics.deudasAtrasadas), icon: AlertCircle, color: "#DC2626", sub: "Con retrasos" }, { title: "Deudas Finalizadas", value: String(metrics.deudasFinalizadas), icon: CheckCircle2, color: "#64748B", sub: "Pagadas completo" }, { title: "Préstamo más Alto", value: fmt(metrics.prestamoMasAlto), icon: ArrowUp, color: "#2563EB", sub: "Mayor monto prestado" }, { title: "Préstamo más Bajo", value: fmt(metrics.prestamoMasBajo), icon: ArrowDown, color: "#8B5CF6", sub: "Menor monto prestado" }, { title: "Abono más Grande", value: fmt(metrics.abonoMasGrande), icon: ArrowUp, color: "#16A34A", sub: "Mayor abono registrado" }, { title: "Abono más Pequeño", value: fmt(metrics.abonoMasPequeno), icon: ArrowDown, color: "#F59E0B", sub: "Menor abono registrado" } ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6 lg:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"><div><h1 className="text-[#0F172A] mb-1">Estadísticas</h1><p className="text-[#64748B]">Análisis integral de tu cartera de préstamos</p></div><Tooltip content="Descargar reporte PDF con el filtro actual"><button onClick={() => downloadEstadisticasPDF(metrics, filterLabel, rankings)} className="inline-flex items-center gap-2 bg-[#0F172A] text-white px-4 py-2.5 rounded-xl hover:bg-[#1E293B] transition-colors shadow-sm text-sm shrink-0" aria-label="Descargar estadísticas en PDF"><Download className="w-4 h-4" aria-hidden="true" /><span className="hidden sm:inline">Descargar PDF</span><span className="sm:hidden">PDF</span></button></Tooltip></div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-4 lg:p-5 mb-6"><div className="flex flex-wrap gap-3 items-end"><div className="min-w-0"><label className="block text-[#64748B] text-xs mb-1.5">Año</label><select value={selectedYear} onChange={(e) => { setSelectedYear(Number(e.target.value)); setDateFrom(""); setDateTo(""); }} className="px-3 py-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm bg-white" aria-label="Seleccionar año">{years.map((y) => <option key={y} value={y}>{y}</option>)}</select></div><div className="min-w-0"><label className="block text-[#64748B] text-xs mb-1.5">Mes</label><select value={selectedMonth} onChange={(e) => { setSelectedMonth(e.target.value === "all" ? "all" : Number(e.target.value)); setDateFrom(""); setDateTo(""); }} className="px-3 py-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm bg-white" aria-label="Seleccionar mes"><option value="all">Todos los meses</option>{MESES_FULL.slice(0, selectedYear === currentYear ? currentMonth + 1 : 12).map((m, i) => <option key={i} value={i}>{m}</option>)}</select></div><div className="hidden sm:block w-px h-10 bg-[#E2E8F0]" /><div className="min-w-0"><label className="block text-[#64748B] text-xs mb-1.5">Desde</label><input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm w-full" aria-label="Fecha inicio del rango" /></div><div className="min-w-0"><label className="block text-[#64748B] text-xs mb-1.5">Hasta</label><input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm w-full" aria-label="Fecha fin del rango" /></div>{(dateFrom || dateTo) && <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="px-4 py-2.5 border border-[#E2E8F0] text-[#64748B] rounded-xl hover:bg-[#F8FAFC] transition-colors text-sm self-end">Limpiar</button>}</div></div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4 mb-8">{statCards.map((card, i) => (<motion.div key={card.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-4 hover:shadow-md transition-shadow"><div className="flex items-center gap-2 mb-2"><div className="p-2 rounded-lg" style={{ backgroundColor: `${card.color}15` }}><card.icon className="w-4 h-4" style={{ color: card.color }} aria-hidden="true" /></div></div><div className="text-[#64748B] text-xs mb-0.5 leading-tight">{card.title}</div><div className="text-[#0F172A] font-semibold text-base lg:text-lg truncate">{card.value}</div><div className="text-[#94A3B8] text-xs">{card.sub}</div></motion.div>))}</div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"><div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-5 lg:p-6"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4"><div><h3 className="text-[#0F172A] text-sm font-semibold">Dinero Prestado por Mes</h3><p className="text-[#64748B] text-xs">{selectedYear}</p></div><ChartToggle type={chartTypePrestados} onChange={setChartTypePrestados} /></div><ChartRenderer type={chartTypePrestados} data={monthlyData} dataKey="prestados" color="#2563EB" label="Prestado" /></div><div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-5 lg:p-6"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4"><div><h3 className="text-[#0F172A] text-sm font-semibold">Dinero Abonado por Mes</h3><p className="text-[#64748B] text-xs">{selectedYear}</p></div><ChartToggle type={chartTypeAbonados} onChange={setChartTypeAbonados} /></div><ChartRenderer type={chartTypeAbonados} data={monthlyData} dataKey="abonados" color="#16A34A" label="Abonado" /></div></div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-5 lg:p-6 mb-6"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4"><div><h3 className="text-[#0F172A] text-sm font-semibold">Intereses Generados por Mes</h3><p className="text-[#64748B] text-xs">Análisis de crecimiento de la cartera · {selectedYear}</p></div><ChartToggle type={chartTypeUtilidad} onChange={setChartTypeUtilidad} /></div><ChartRenderer type={chartTypeUtilidad} data={monthlyData} dataKey="intereses" color="#F59E0B" label="Intereses estimados" /></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-5 lg:p-6"><div className="flex items-center gap-2 mb-5"><Trophy className="w-5 h-5 text-[#F59E0B]" aria-hidden="true" /><h3 className="text-[#0F172A] text-sm font-semibold">Clientes más Cumplidos</h3></div><div className="space-y-3">{rankings.mejores.length === 0 ? <p className="text-[#64748B] text-sm">No hay datos suficientes.</p> : rankings.mejores.map((c, i) => (<div key={c.id} className="flex items-center gap-3"><span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? "bg-[#FEF9C3] text-[#CA8A04]" : i === 1 ? "bg-[#F1F5F9] text-[#475569]" : i === 2 ? "bg-[#FEF3C7] text-[#B45309]" : "bg-[#F8FAFC] text-[#64748B]"}`}>{i + 1}</span><div className="flex-1 min-w-0"><div className="flex items-center justify-between mb-1"><span className="text-[#0F172A] text-sm truncate">{c.nombre}</span><span className="text-[#16A34A] text-xs font-medium ml-2">{c.cumplimiento.toFixed(0)}%</span></div><div className="w-full bg-[#E2E8F0] rounded-full h-1.5"><div className="bg-[#16A34A] h-1.5 rounded-full" style={{ width: `${c.cumplimiento}%` }} /></div><div className="text-[#94A3B8] text-xs mt-0.5">{c.totalAbonos - c.atrasados}/{c.totalAbonos} abonos a tiempo</div></div></div>))}</div></div><div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-5 lg:p-6"><div className="flex items-center gap-2 mb-5"><AlertCircle className="w-5 h-5 text-[#DC2626]" aria-hidden="true" /><h3 className="text-[#0F172A] text-sm font-semibold">Clientes con más Retrasos</h3></div><div className="space-y-3">{rankings.peores.length === 0 ? <p className="text-[#16A34A] text-sm">¡Todos los clientes están al día!</p> : rankings.peores.map((c, i) => (<div key={c.id} className="flex items-center gap-3"><span className="w-7 h-7 rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span><div className="flex-1 min-w-0"><div className="flex items-center justify-between mb-1"><span className="text-[#0F172A] text-sm truncate">{c.nombre}</span><span className="text-[#DC2626] text-xs font-medium ml-2">{c.atrasados} tardíos</span></div><div className="w-full bg-[#E2E8F0] rounded-full h-1.5"><div className="bg-[#DC2626] h-1.5 rounded-full" style={{ width: `${c.totalAbonos > 0 ? (c.atrasados / c.totalAbonos) * 100 : 0}%` }} /></div><div className="text-[#94A3B8] text-xs mt-0.5">{c.atrasados}/{c.totalAbonos} abonos tardíos</div></div></div>))}</div></div></div>
    </div>
  );
}
