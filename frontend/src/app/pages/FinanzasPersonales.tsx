import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer } from "recharts";
import { mockFinanzas } from "../data/mockData";

export function FinanzasPersonales() {
  const data = useMemo(() => {
    return mockFinanzas.map((d) => ({ ...d }));
  }, []);

  return (
    <div className="max-w-[1100px] mx-auto px-4 lg:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-[#0F172A]">Finanzas Personales</h1>
        <p className="text-[#64748B] text-sm">Resumen y evolución de las finanzas personales del operario</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="mes" />
              <YAxis />
              <ReTooltip />
              <Line type="monotone" dataKey="saldo" stroke="#2563EB" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
export function FinanzasPersonales() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-10">
      <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
        Finanzas Personales
      </h1>
      <p className="text-[#64748B]">Gestiona tus finanzas personales.</p>
    </div>
  );
}
