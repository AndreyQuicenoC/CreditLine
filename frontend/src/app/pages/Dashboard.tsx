import { useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  Users,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard as CreditIcon,
  Download,
} from "lucide-react";
import { Link } from "react-router";
import { motion } from "motion/react";
import toast from "../../lib/toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  deudasData,
  clientesData,
  calcularInteresesGenerados,
  calcularEstadoDeuda,
} from "../data/mockData";

const MESES_LABELS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function formatCOP(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`;
  return `$${val.toLocaleString("es-CO")}`;
}

function formatDate(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// ── PDF Report ─────────────────────────────────────────────────────────────
async function generarReporteGeneralPDF(params: {
  totalPrestado: number;
  totalRecuperado: number;
  totalIntereses: number;
  saldoTotal: number;
  clientesActivos: number;
  deudasActivas: number;
  deudasAtrasadas: number;
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
  doc.rect(0, 0, pageWidth, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("CreditLine — Reporte General de Cartera", margin, 13);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Gestión de Préstamos Personales · ClustLayer", margin, 20);
  doc.text(
    `Generado: ${new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}`,
    pageWidth - margin,
    20,
    { align: "right" },
  );

  let y = 42;

  // Summary section
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Resumen del Portafolio", margin, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Métrica", "Valor", "Métrica", "Valor"]],
    body: [
      [
        "Total Prestado",
        `$${params.totalPrestado.toLocaleString("es-CO")}`,
        "Total Recuperado",
        `$${params.totalRecuperado.toLocaleString("es-CO")}`,
      ],
      [
        "Intereses Generados",
        `$${params.totalIntereses.toLocaleString("es-CO")}`,
        "Saldo por Cobrar",
        `$${params.saldoTotal.toLocaleString("es-CO")}`,
      ],
      [
        "Clientes Activos",
        String(params.clientesActivos),
        "Deudas Activas",
        String(params.deudasActivas),
      ],
      [
        "Deudas Atrasadas",
        String(params.deudasAtrasadas),
        "Deudas Finalizadas",
        String(deudasData.filter((d) => d.estado === "pagada").length),
      ],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontSize: 8,
      fontStyle: "bold",
    },
    bodyStyles: { fontSize: 8.5, textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 47, fontStyle: "bold", textColor: [100, 116, 139] },
      1: { cellWidth: 40 },
      2: { cellWidth: 47, fontStyle: "bold", textColor: [100, 116, 139] },
      3: { cellWidth: 40 },
    },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Active debts table
  const activeDebts = deudasData.filter((d) => d.estado === "activa");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Detalle de Deudas Activas", margin, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Cliente", "Descripción", "Monto", "Saldo", "Tasa", "Abonos", "Estado"]],
    body: activeDebts.map((d) => {
      const cliente = clientesData.find((c) => c.id === d.clienteId);
      const pagado = d.abonos.reduce((s, a) => s + a.monto, 0);
      const intereses = calcularInteresesGenerados(d);
      const saldo = Math.max(0, d.monto + intereses - pagado);
      const estado = calcularEstadoDeuda(d);
      return [
        cliente?.nombre ?? "—",
        d.descripcion.length > 28 ? d.descripcion.substring(0, 28) + "…" : d.descripcion,
        `$${d.monto.toLocaleString("es-CO")}`,
        `$${saldo.toLocaleString("es-CO")}`,
        `${d.interesMensual}%`,
        String(d.abonos.length),
        estado === "al-dia" ? "Al día" : estado === "riesgo" ? "En riesgo" : "Atrasado",
      ];
    }),
    theme: "striped",
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 33 },
      1: { cellWidth: 48 },
      2: { cellWidth: 25, halign: "right" },
      3: { cellWidth: 25, halign: "right" },
      4: { cellWidth: 12, halign: "center" },
      5: { cellWidth: 12, halign: "center" },
      6: { cellWidth: 19, halign: "center" },
    },
    didParseCell: (data: any) => {
      if (data.section === "body" && data.column.index === 6) {
        const v = data.cell.raw as string;
        if (v === "Atrasado") data.cell.styles.textColor = [220, 38, 38];
        else if (v === "En riesgo") data.cell.styles.textColor = [245, 158, 11];
        else if (v === "Al día") data.cell.styles.textColor = [22, 163, 74];
      }
    },
    margin: { left: margin, right: margin },
  });

  // Footer
  const totalPagesN = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPagesN; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`CreditLine · ClustLayer · Página ${i} de ${totalPagesN}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 6, { align: "center" });
  }

  doc.save(`reporte_general_creditline_${new Date().toISOString().slice(0, 10)}.pdf`);
  toast.success("Reporte generado", {
    description: "El reporte general de cartera fue descargado.",
  });
}

// ── Component ────────────────────────────────────────────────────────────────
export function Dashboard() {
  const totalPrestado = deudasData.reduce((s, d) => s + d.monto, 0);
  const totalRecuperado = deudasData.reduce((s, d) => s + d.abonos.reduce((a, b) => a + b.monto, 0), 0);
  const totalIntereses = deudasData.filter((d) => d.estado === "activa").reduce((s, d) => s + calcularInteresesGenerados(d), 0);
  const deudasActivas = deudasData.filter((d) => d.estado === "activa").length;
  const deudasAtrasadas = deudasData.filter((d) => calcularEstadoDeuda(d) === "atrasado").length;
  const clientesActivos = clientesData.filter((c) => c.activo).length;

  // Total outstanding balance (capital + interest – payments)
  const saldoTotal = deudasData.filter((d) => d.estado === "activa").reduce((s, d) => {
    const intereses = calcularInteresesGenerados(d);
    const pagado = d.abonos.reduce((a, b) => a + b.monto, 0);
    return s + Math.max(0, d.monto + intereses - pagado);
  }, 0);

  // Last 6 months cashflow data
  const last6MonthsData = useMemo(() => {
    const currentDate = new Date("2026-04-29");
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(currentDate);
      d.setMonth(d.getMonth() - (5 - i));
      const year = d.getFullYear();
      const month = d.getMonth();

      const prestado = deudasData.filter((debt) => {
        const f = new Date(debt.fechaInicio);
        return f.getFullYear() === year && f.getMonth() === month;
      }).reduce((s, debt) => s + debt.monto, 0);

      const abonado = deudasData.flatMap((debt) => debt.abonos).filter((abono) => {
        const f = new Date(abono.fecha);
        return f.getFullYear() === year && f.getMonth() === month;
      }).reduce((s, abono) => s + abono.monto, 0);

      const mesLabel = year < 2026 ? `${MESES_LABELS[month]}'25` : MESES_LABELS[month];
      return { mes: mesLabel, prestado, abonado };
    });
  }, []);

  const trendData = useMemo(() => {
    let prestadoAcumulado = 0;
    let abonadoAcumulado = 0;
    return last6MonthsData.map((item) => {
      prestadoAcumulado += item.prestado;
      abonadoAcumulado += item.abonado;
      return {
        mes: item.mes,
        prestado: prestadoAcumulado,
        abonado: abonadoAcumulado,
      };
    });
  }, [last6MonthsData]);

  const metrics = [
    { title: "Total Prestado", value: formatCOP(totalPrestado), subtitle: `${deudasData.length} préstamos registrados`, icon: DollarSign, color: "#2563EB" },
    { title: "Total Recuperado", value: formatCOP(totalRecuperado), subtitle: `${((totalRecuperado / totalPrestado) * 100).toFixed(1)}% del capital`, icon: TrendingUp, color: "#16A34A" },
    { title: "Intereses Activos", value: formatCOP(totalIntereses), subtitle: "Intereses acumulados", icon: Banknote, color: "#F59E0B" },
    { title: "Saldo por Cobrar", value: formatCOP(saldoTotal), subtitle: "Capital + intereses pendientes", icon: CreditIcon, color: "#1E3A8A" },
    { title: "Clientes Activos", value: String(clientesActivos), subtitle: `${deudasActivas} deudas activas`, icon: Users, color: "#8B5CF6" },
    { title: "Deudas Atrasadas", value: String(deudasAtrasadas), subtitle: "Requieren seguimiento", icon: AlertCircle, color: "#DC2626" },
  ];

  // Recent movements
  const recentAbonos = deudasData.flatMap((d) => d.abonos.map((a) => ({ ...a, clienteId: d.clienteId, deudaId: d.id, deudaDesc: d.descripcion }))).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).slice(0, 8);

  const getClienteName = (clienteId: string) => clientesData.find((c) => c.id === clienteId)?.nombre ?? "—";

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[#0F172A] mb-1">Dashboard</h1>
          <p className="text-[#64748B]">Resumen general de tu cartera de préstamos</p>
        </div>
        <button onClick={() => generarReporteGeneralPDF({ totalPrestado, totalRecuperado, totalIntereses, saldoTotal, clientesActivos, deudasActivas, deudasAtrasadas })} className="inline-flex items-center gap-2 bg-[#0F172A] text-white px-4 py-2.5 rounded-xl hover:bg-[#1E293B] transition-colors shadow-sm text-sm shrink-0" aria-label="Descargar reporte general en PDF">
          <Download className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Reporte PDF</span>
          <span className="sm:hidden">PDF</span>
        </button>
      </div>

      {/* Metrics — 6 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {metrics.map((m, i) => (
          <motion.div key={m.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, duration: 0.35 }} className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-xl" style={{ backgroundColor: `${m.color}18` }} aria-hidden="true">
                <m.icon className="w-4 h-4" style={{ color: m.color }} />
              </div>
            </div>
            <div className="text-[#64748B] text-xs mb-0.5 leading-tight">{m.title}</div>
            <div className="text-[#0F172A] font-semibold truncate">{m.value}</div>
            <div className="text-[#94A3B8] text-xs">{m.subtitle}</div>
          </motion.div>
        ))}
      </div>

      {/* Monthly cashflow chart */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44, duration: 0.35 }} className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-5 lg:p-6 mb-8">
        <div className="mb-4">
          <h3 className="text-[#0F172A]">Flujo Mensual — Últimos 6 Meses</h3>
          <p className="text-[#64748B] text-sm">Dinero prestado vs. dinero abonado por mes</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={last6MonthsData} barGap={4} barSize={18}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="mes" stroke="#94A3B8" tick={{ fontSize: 11 }} />
            <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} tickFormatter={(v) => formatCOP(v)} width={65} />
            <RechartTooltip formatter={(value: number, name: string) => [`$${value.toLocaleString("es-CO")}`, name === "prestado" ? "Prestado" : "Abonado"]} contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} formatter={(value) => (value === "prestado" ? "Prestado" : "Abonado")} />
            <Bar dataKey="prestado" fill="#2563EB" name="prestado" radius={[4, 4, 0, 0]} />
            <Bar dataKey="abonado" fill="#16A34A" name="abonado" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Added cumulative trend graph below original layout */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.35 }} className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-5 lg:p-6 mb-8">
        <div className="mb-4">
          <h3 className="text-[#0F172A]">Tendencia acumulada</h3>
          <p className="text-[#64748B] text-sm">Prestado vs abonado</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="mes" stroke="#94A3B8" tick={{ fontSize: 11 }} />
            <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} tickFormatter={(v) => formatCOP(v)} width={65} />
            <RechartTooltip formatter={(value: number, name: string) => [`$${value.toLocaleString("es-CO")}`, name === "prestado" ? "Prestado acumulado" : "Abonado acumulado"]} contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} formatter={(value) => (value === "prestado" ? "Prestado acumulado" : "Abonado acumulado")} />
            <Line type="monotone" dataKey="prestado" stroke="#2563EB" strokeWidth={3} dot={{ r: 3 }} name="prestado" />
            <Line type="monotone" dataKey="abonado" stroke="#16A34A" strokeWidth={3} dot={{ r: 3 }} name="abonado" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Recent movements */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52, duration: 0.35 }} className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[#0F172A]">Últimos Movimientos</h3>
          <Link to="/deudas" className="text-[#2563EB] text-sm hover:text-[#1E3A8A] transition-colors flex items-center gap-1">
            Ver todas <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentAbonos.length === 0 ? (
          <p className="text-[#64748B] text-sm text-center py-8">No hay movimientos registrados aún.</p>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <div className="min-w-full px-6">
              <table className="w-full" role="table" aria-label="Últimos movimientos">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    <th className="text-left py-3 px-3 text-[#64748B] text-xs font-medium">Cliente</th>
                    <th className="text-left py-3 px-3 text-[#64748B] text-xs font-medium hidden sm:table-cell">Concepto</th>
                    <th className="text-left py-3 px-3 text-[#64748B] text-xs font-medium">Tipo</th>
                    <th className="text-right py-3 px-3 text-[#64748B] text-xs font-medium">Monto</th>
                    <th className="text-right py-3 px-3 text-[#64748B] text-xs font-medium hidden md:table-cell">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAbonos.map((mov) => (
                    <tr key={mov.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3 px-3">
                        <Link to={`/cartera/${mov.clienteId}`} className="text-[#0F172A] text-sm hover:text-[#2563EB] transition-colors">
                          {getClienteName(mov.clienteId)}
                        </Link>
                      </td>
                      <td className="py-3 px-3 text-[#64748B] text-sm truncate max-w-[140px] hidden sm:table-cell">{mov.deudaDesc}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${mov.atrasado ? "bg-[#FEF2F2] text-[#DC2626]" : "bg-[#F0FDF4] text-[#16A34A]"}`}>
                          <ArrowDownRight className="w-3 h-3" aria-hidden="true" />
                          <span className="hidden sm:inline">{mov.atrasado ? "Abono atrasado" : "Abono"}</span>
                          <span className="sm:hidden">{mov.atrasado ? "Atrasado" : "Abono"}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-[#0F172A] text-sm font-medium whitespace-nowrap">${mov.monto.toLocaleString("es-CO")}</td>
                      <td className="py-3 px-3 text-right text-[#64748B] text-sm hidden md:table-cell whitespace-nowrap">{formatDate(mov.fecha)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
