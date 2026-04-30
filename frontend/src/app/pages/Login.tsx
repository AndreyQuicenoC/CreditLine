import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, Eye, EyeOff, CreditCard, Shield, User } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) errs.email = "El correo es requerido.";
    if (!password) errs.password = "La contraseña es requerida.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = login(email.trim(), password);
    setLoading(false);
    if (result.success) {
      toast.success("Sesión iniciada correctamente", {
        description: "Bienvenido a CreditLine.",
      });
      // Get the user from session storage to check role
      const stored = sessionStorage.getItem("creditline_user");
      const u = stored ? JSON.parse(stored) : null;
      if (u?.rol === "ADMIN") {
        navigate("/administracion");
      } else {
        navigate("/");
      }
    } else {
      toast.error("Credenciales incorrectas", {
        description: result.error,
      });
      setErrors({ password: result.error });
    }
  };

  const fillCredentials = (type: "admin" | "operario") => {
    if (type === "admin") {
      setEmail("admin@creditline.com");
      setPassword("admin123");
    } else {
      setEmail("operario@creditline.com");
      setPassword("operario123");
    }
    setErrors({});
  };

  return (
    <div className="min-h-screen relative flex flex-col" style={{ background: "#EEF2FF" }}>
      {/* Subtle background decoration */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 70% 10%, rgba(37,99,235,0.08) 0%, transparent 60%), radial-gradient(ellipse at 10% 90%, rgba(30,58,138,0.06) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      {/* Top navbar — consistent with in-app navbar */}
      <div className="relative z-10 bg-white border-b border-[#E2E8F0] shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 h-16 flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-[#2563EB]" aria-hidden="true" />
          <span className="text-[#1E3A8A] font-semibold text-xl tracking-tight">CreditLine</span>
          <span className="text-[#64748B] text-sm hidden sm:block">
            · Gestión de Préstamos Personales
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden">
            <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-8 py-7">
              <h1 className="text-white text-2xl font-semibold mb-1">Iniciar Sesión</h1>
              <p className="text-blue-100 text-sm">Ingresa tus credenciales para continuar</p>
            </div>

            <div className="px-8 py-7">
              <form onSubmit={handleLogin} noValidate aria-label="Formulario de inicio de sesión">
                {/* Email */}
                <div className="mb-4">
                  <label htmlFor="login-email" className="block text-[#334155] mb-1.5 text-sm">
                    Correo electrónico <span className="text-[#DC2626]" aria-label="requerido">*</span>
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]"
                      aria-hidden="true"
                    />
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                      }}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-sm transition-all ${
                        errors.email ? "border-[#DC2626]" : "border-[#E2E8F0]"
                      }`}
                      placeholder="correo@ejemplo.com"
                      autoComplete="email"
                      aria-required="true"
                      aria-describedby={errors.email ? "email-error" : undefined}
                    />
                  </div>
                  {errors.email && (
                    <p id="email-error" className="text-[#DC2626] text-xs mt-1" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="mb-6">
                  <label htmlFor="login-password" className="block text-[#334155] mb-1.5 text-sm">
                    Contraseña <span className="text-[#DC2626]" aria-label="requerido">*</span>
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]"
                      aria-hidden="true"
                    />
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                      }}
                      className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-sm transition-all ${
                        errors.password ? "border-[#DC2626]" : "border-[#E2E8F0]"
                      }`}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      aria-required="true"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#64748B] hover:text-[#334155] transition-colors"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <Eye className="w-4 h-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[#DC2626] text-xs mt-1" role="alert">
                      {errors.password}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2563EB] text-white py-3 rounded-xl hover:bg-[#1E3A8A] transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  aria-label="Ingresar al sistema"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
                        />
                      </svg>
                      Verificando...
                    </>
                  ) : (
                    "Ingresar"
                  )}
                </button>
              </form>

              {/* Demo credentials */}
              <div className="mt-6 pt-5 border-t border-[#E2E8F0]">
                <p className="text-[#64748B] text-xs text-center mb-3">
                  Credenciales de demostración
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fillCredentials("admin")}
                    className="flex items-center gap-2 px-3 py-2.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl hover:bg-[#DBEAFE] transition-colors text-left"
                    aria-label="Usar credenciales de administrador"
                  >
                    <Shield className="w-4 h-4 text-[#2563EB] shrink-0" aria-hidden="true" />
                    <div>
                      <div className="text-[#1E3A8A] text-xs font-medium">Administrador</div>
                      <div className="text-[#64748B] text-xs">admin@creditline.com</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials("operario")}
                    className="flex items-center gap-2 px-3 py-2.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl hover:bg-[#DCFCE7] transition-colors text-left"
                    aria-label="Usar credenciales de operario"
                  >
                    <User className="w-4 h-4 text-[#16A34A] shrink-0" aria-hidden="true" />
                    <div>
                      <div className="text-[#15803D] text-xs font-medium">Operario</div>
                      <div className="text-[#64748B] text-xs">operario@creditline.com</div>
                    </div>
                  </button>
                </div>
                <p className="text-[#94A3B8] text-xs text-center mt-2">
                  Haz clic en un rol para llenar las credenciales automáticamente
                </p>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-[#64748B] text-xs mt-5">
            <span className="text-[#2563EB] font-medium">CreditLine</span> · ClustLayer ·{" "}
            <span className="italic">Eureka Solutions Projects</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
