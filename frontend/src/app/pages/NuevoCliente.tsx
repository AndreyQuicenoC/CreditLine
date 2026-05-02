import { useState } from "react";
import { useNavigate, Link, useParams } from "react-router";
import { ArrowLeft, User, Phone, MapPin, FileText, Save } from "lucide-react";
import { motion } from "motion/react";
import toast from "../../lib/toast";
import { municipiosData, clientesData } from "../data/mockData";

interface ClienteForm {
  nombre: string;
  cedula: string;
  sexo: "M" | "F" | "";
  telefono: string;
  telefonoAlterno: string;
  municipioId: string;
  direccionCasa: string;
  direccionTrabajo: string;
  email: string;
  infoExtra: string;
}

const initialForm: ClienteForm = {
  nombre: "",
  cedula: "",
  sexo: "",
  telefono: "",
  telefonoAlterno: "",
  municipioId: "",
  direccionCasa: "",
  direccionTrabajo: "",
  email: "",
  infoExtra: "",
};

export function NuevoCliente() {
  const navigate = useNavigate();
  const { clienteId } = useParams<{ clienteId?: string }>();
  const isEditing = !!clienteId;
  const existingCliente = isEditing ? clientesData.find((c) => c.id === clienteId) : undefined;

  const [form, setForm] = useState<ClienteForm>(
    existingCliente
      ? {
          nombre: existingCliente.nombre,
          cedula: existingCliente.cedula,
          sexo: existingCliente.sexo,
          telefono: existingCliente.telefono,
          telefonoAlterno: existingCliente.telefonoAlterno ?? "",
          municipioId: existingCliente.municipioId,
          direccionCasa: existingCliente.direccionCasa,
          direccionTrabajo: existingCliente.direccionTrabajo ?? "",
          email: existingCliente.email ?? "",
          infoExtra: existingCliente.infoExtra ?? "",
        }
      : initialForm,
  );
  const [errors, setErrors] = useState<Partial<ClienteForm>>({});
  const [loading, setLoading] = useState(false);

  const municipiosActivos = municipiosData.filter((m) => m.activo);

  const set = (field: keyof ClienteForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<ClienteForm> = {};
    if (!form.nombre.trim()) newErrors.nombre = "El nombre completo es requerido.";
    if (!form.cedula.trim()) newErrors.cedula = "La cédula es requerida.";
    if (!form.sexo) newErrors.sexo = "El sexo es requerido.";
    if (!form.telefono.trim()) newErrors.telefono = "El teléfono es requerido.";
    if (!form.municipioId) newErrors.municipioId = "Selecciona un municipio.";
    if (!form.direccionCasa.trim()) newErrors.direccionCasa = "La dirección de casa es requerida.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Formulario incompleto", { description: "Por favor completa todos los campos requeridos." });
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    if (isEditing) {
      toast.success("Cliente actualizado", { description: `${form.nombre} fue actualizado correctamente.` });
      navigate(`/cartera/${clienteId}`);
    } else {
      toast.success("Cliente creado exitosamente", { description: `${form.nombre} fue agregado a la cartera.` });
      navigate("/cartera");
    }
  };

  const InputField = ({ id, label, required, error, children }: { id: string; label: string; required?: boolean; error?: string; children: React.ReactNode }) => (
    <div>
      <label htmlFor={id} className="block text-[#334155] mb-1.5 text-sm">
        {label} {required && <span className="text-[#DC2626]" aria-label="requerido">*</span>}
      </label>
      {children}
      {error && <p className="text-[#DC2626] text-xs mt-1" role="alert">{error}</p>}
    </div>
  );

  return (
    <div className="max-w-[900px] mx-auto px-4 lg:px-6 py-8">
      <Link to={isEditing ? `/cartera/${clienteId}` : "/cartera"} className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] mb-6 transition-colors" aria-label="Volver">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        {isEditing ? "Volver al detalle del cliente" : "Volver a Cartera"}
      </Link>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="mb-6">
          <h1 className="text-[#0F172A] mb-1">{isEditing ? "Editar Cliente" : "Nuevo Cliente"}</h1>
          <p className="text-[#64748B]">{isEditing ? "Modifica la información del cliente." : "Completa la información del cliente para registrarlo en la cartera."}</p>
        </div>

        <form onSubmit={handleSubmit} noValidate aria-label={isEditing ? "Formulario de edición de cliente" : "Formulario de registro de cliente"}>
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-[#EFF6FF] rounded-lg"><User className="w-4 h-4 text-[#2563EB]" aria-hidden="true" /></div>
              <h3 className="text-[#0F172A]">Datos Personales</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField id="nombre" label="Nombre completo" required error={errors.nombre}>
                <input id="nombre" type="text" value={form.nombre} onChange={set("nombre")} className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all text-sm ${errors.nombre ? "border-[#DC2626]" : "border-[#E2E8F0]"}`} placeholder="Ej: María González" aria-required="true" />
              </InputField>

              <InputField id="cedula" label="Cédula" required error={errors.cedula}>
                <input id="cedula" type="text" value={form.cedula} onChange={set("cedula")} className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all text-sm ${errors.cedula ? "border-[#DC2626]" : "border-[#E2E8F0]"}`} placeholder="Ej: 1234567890" aria-required="true" />
              </InputField>

              <InputField id="sexo" label="Sexo" required error={errors.sexo}>
                <select id="sexo" value={form.sexo} onChange={set("sexo")} className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent bg-white text-sm ${errors.sexo ? "border-[#DC2626]" : "border-[#E2E8F0]"}`} aria-required="true">
                  <option value="">Seleccionar...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </InputField>

              <InputField id="email" label="Correo electrónico">
                <input id="email" type="email" value={form.email} onChange={set("email")} className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-sm" placeholder="correo@ejemplo.com" />
              </InputField>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-[#F0FDF4] rounded-lg"><Phone className="w-4 h-4 text-[#16A34A]" aria-hidden="true" /></div>
              <h3 className="text-[#0F172A]">Contacto</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField id="telefono" label="Teléfono principal" required error={errors.telefono}>
                <input id="telefono" type="tel" value={form.telefono} onChange={set("telefono")} className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-sm ${errors.telefono ? "border-[#DC2626]" : "border-[#E2E8F0]"}`} placeholder="Ej: 312 456 7890" aria-required="true" />
              </InputField>
              <InputField id="telefonoAlterno" label="Teléfono alterno">
                <input id="telefonoAlterno" type="tel" value={form.telefonoAlterno} onChange={set("telefonoAlterno")} className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-sm" placeholder="Número alterno" />
              </InputField>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-[#FFFBEB] rounded-lg"><MapPin className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" /></div>
              <h3 className="text-[#0F172A]">Ubicación</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField id="municipioId" label="Municipio" required error={errors.municipioId}>
                <select id="municipioId" value={form.municipioId} onChange={set("municipioId")} className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent bg-white text-sm ${errors.municipioId ? "border-[#DC2626]" : "border-[#E2E8F0]"}`} aria-required="true">
                  <option value="">Seleccionar municipio...</option>
                  {municipiosActivos.map((m) => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </InputField>
              <InputField id="direccionCasa" label="Dirección de casa" required error={errors.direccionCasa}>
                <input id="direccionCasa" type="text" value={form.direccionCasa} onChange={set("direccionCasa")} className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-sm ${errors.direccionCasa ? "border-[#DC2626]" : "border-[#E2E8F0]"}`} placeholder="Ej: Calle 50 #45-32, Laureles" aria-required="true" />
              </InputField>
              <div className="sm:col-span-2">
                <InputField id="direccionTrabajo" label="Dirección de trabajo">
                  <input id="direccionTrabajo" type="text" value={form.direccionTrabajo} onChange={set("direccionTrabajo")} className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-sm" placeholder="Dirección laboral (opcional)" />
                </InputField>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 mb-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-[#F5F3FF] rounded-lg"><FileText className="w-4 h-4 text-[#8B5CF6]" aria-hidden="true" /></div>
              <div>
                <h3 className="text-[#0F172A]">Inteligencia del Cliente</h3>
                <p className="text-[#64748B] text-xs">Información adicional útil para el manejo del cliente</p>
              </div>
            </div>
            <InputField id="infoExtra" label="Información extra">
              <textarea id="infoExtra" value={form.infoExtra} onChange={set("infoExtra")} rows={4} className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent resize-none text-sm" placeholder="Nombres de familiares, perfil del cliente, observaciones importantes, preferencias de pago..." />
            </InputField>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to={isEditing ? `/cartera/${clienteId}` : "/cartera"} className="flex-1 px-6 py-3 border border-[#E2E8F0] text-[#334155] rounded-xl hover:bg-[#F8FAFC] transition-colors text-center text-sm">Cancelar</Link>
            <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1E3A8A] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 text-sm" aria-label={isEditing ? "Guardar cambios" : "Crear cliente"}>
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" /></svg>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" aria-hidden="true" />
                  {isEditing ? "Guardar Cambios" : "Crear Cliente"}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
export function NuevoCliente() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-10">
      <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Nuevo Cliente</h1>
      <p className="text-[#64748B]">Crear o editar un cliente.</p>
    </div>
  );
}
