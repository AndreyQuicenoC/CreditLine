import { Link } from "react-router";
import { Home } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-[#0F172A] mb-4">404</h1>
        <p className="text-[#64748B] mb-8">Página no encontrada</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-[#2563EB] text-white px-6 py-3 rounded-xl hover:bg-[#1E3A8A] transition-colors">
          <Home className="w-5 h-5" />
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
