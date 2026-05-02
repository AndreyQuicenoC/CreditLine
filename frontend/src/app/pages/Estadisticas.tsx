import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer } from "recharts";
import { estadisticasData } from "../data/mockData";

export function Estadisticas() {
  const data = useMemo(() => estadisticasData, []);

  return (
    <div className="max-w-[1100px] mx-auto px-4 lg:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-[#0F172A]">Estadísticas</h1>
        <p className="text-[#64748B] text-sm">Indicadores del sistema</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="categoria" />
              <YAxis />
              <ReTooltip />
              <Bar dataKey="valor" fill="#2563EB" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
export function Estadisticas() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-10">
      <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Estadísticas</h1>
      <p className="text-[#64748B]">Análisis y estadísticas de tu cartera.</p>
    </div>
  );
}
