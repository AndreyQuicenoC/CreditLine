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
import { toast } from "../../lib/toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  deudasData,
  clientesData,
  calcularInteresesGenerados,
  calcularEstadoDeuda,
} from "../data/mockData";

export function Dashboard() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-10">
      <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Dashboard</h1>
      <p className="text-[#64748B]">
        Bienvenido al sistema de gestión de créditos.
      </p>
    </div>
  );
}
