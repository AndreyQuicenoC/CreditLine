import { Link } from "react-router";

export function NotFound() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-10 text-center">
      <h1 className="text-5xl font-bold text-[#0F172A] mb-4">404</h1>
      <p className="text-[#64748B] text-lg mb-6">Página no encontrada</p>
      <Link to="/" className="inline-block px-6 py-3 bg-[#2563EB] text-white rounded-lg hover:bg-[#1E3A8A] transition-colors">
        Volver al inicio
      </Link>
    </div>
  );
}
