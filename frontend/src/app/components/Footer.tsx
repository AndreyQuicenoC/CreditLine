import { Link } from "react-router";
import { CreditCard, Home, Users, MapPin, AlertCircle, BarChart2, Wallet, Shield, ExternalLink } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Footer() {
  const { user } = useAuth();
  const year = 2026;

  return (
    <footer className="bg-[#0F172A] text-[#94A3B8] mt-16" role="contentinfo" aria-label="Pie de página">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-[#60A5FA]" aria-hidden="true" />
              <span className="text-white font-semibold text-lg">CreditLine</span>
            </div>
            <p className="text-sm leading-relaxed mb-4 max-w-sm">
              Sistema integral de gestión de préstamos personales. Controla, analiza y haz seguimiento
              a tu cartera de crédito de forma profesional y segura.
            </p>
            <div className="text-xs space-y-1">
              <p className="text-[#60A5FA] font-medium">ClustLayer</p>
              <p>Eureka Solutions Projects</p>
              <p>Línea de productos fintech</p>
            </div>
          </div>

          {/* Site Map */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">
              Mapa del Sitio
            </h3>
            <nav aria-label="Mapa del sitio">
              <ul className="space-y-2">
                {user?.rol !== "ADMIN" && (
                  <>
                    <li>
                      <Link to="/" className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                        <Home className="w-3.5 h-3.5" aria-hidden="true" /> Inicio
                      </Link>
                    </li>
                    <li>
                      <Link to="/cartera" className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                        <Users className="w-3.5 h-3.5" aria-hidden="true" /> Cartera de Clientes
                      </Link>
                    </li>
                    <li>
                      <Link to="/municipios" className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                        <MapPin className="w-3.5 h-3.5" aria-hidden="true" /> Municipios
                      </Link>
                    </li>
                    <li>
                      <Link to="/deudas" className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                        <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" /> Deudas Pendientes
                      </Link>
                    </li>
                    <li>
                      <Link to="/estadisticas" className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                        <BarChart2 className="w-3.5 h-3.5" aria-hidden="true" /> Estadísticas
                      </Link>
                    </li>
                    <li>
                      <Link to="/finanzas-personales" className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                        <Wallet className="w-3.5 h-3.5" aria-hidden="true" /> Finanzas Personales
                      </Link>
                    </li>
                  </>
                )}
                {user?.rol === "ADMIN" && (
                  <li>
                    <Link to="/administracion" className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                      <Shield className="w-3.5 h-3.5" aria-hidden="true" /> Administración
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">
              Información
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-[#60A5FA] font-medium">Versión:</span>
                <span>1.0.0</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#60A5FA] font-medium">Entorno:</span>
                <span>Demo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#60A5FA] font-medium">Soporte:</span>
                <span>soporte@clustlayer.com</span>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-1 text-sm hover:text-white transition-colors"
                  aria-label="Ver términos y condiciones (enlace externo)"
                >
                  Términos y condiciones <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-1 text-sm hover:text-white transition-colors"
                  aria-label="Ver política de privacidad (enlace externo)"
                >
                  Política de privacidad <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#1E293B] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-center sm:text-left">
            &copy; {year} <strong className="text-[#60A5FA]">CreditLine</strong> · ClustLayer ·{" "}
            <span className="italic">Eureka Solutions Projects</span>. Todos los derechos reservados.
          </p>
          <p className="text-xs text-[#475569]">
            Aplicación de uso privado. No distribuir.
          </p>
        </div>
      </div>
    </footer>
  );
}