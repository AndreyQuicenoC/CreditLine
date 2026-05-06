import {
  clientesAPI,
  deudasAPI,
  finanzasPersonalesAPI,
  municipiosAPI,
  calcularEstadoDeuda as calcularEstadoDeudaBase,
  calcularInteresesGenerados as calcularInteresesGeneradosBase,
  calcularTotalPagado as calcularTotalPagadoBase,
  toClienteView,
  toDeudaPersonalView,
  toDeudaView,
  toMunicipioView,
  type AbonoPersonalView,
  type ClienteView,
  type DeudaPersonalView,
  type DeudaView,
  type MunicipioView,
} from "../services/operario";

const [municipiosRes, clientesRes, deudasRes, deudasPersonalesRes] =
  await Promise.all([
    municipiosAPI.list(false),
    clientesAPI.list({ pageSize: 5000, activo: true }),
    deudasAPI.list({ pageSize: 5000 }),
    finanzasPersonalesAPI.list({ pageSize: 5000 }),
  ]);

const rawMunicipios = municipiosRes.data?.data ?? [];
const rawClientes = clientesRes.data?.data ?? [];
const rawDeudas = deudasRes.data?.data ?? [];
const rawDeudasPersonales = deudasPersonalesRes.data?.data ?? [];

export const municipiosData: MunicipioView[] =
  rawMunicipios.map(toMunicipioView);
export const clientesData: ClienteView[] = rawClientes.map((cliente) =>
  toClienteView(cliente, rawMunicipios, rawDeudas),
);
export const deudasData: DeudaView[] = rawDeudas.map(toDeudaView);
export const deudasPersonalesData: DeudaPersonalView[] =
  rawDeudasPersonales.map(toDeudaPersonalView);

export type Municipio = MunicipioView;
export type Cliente = ClienteView;
export type Deuda = DeudaView;
export type DeudaPersonal = DeudaPersonalView;
export type AbonoPersonal = AbonoPersonalView;
export type Abono = import("../services/operario").AbonoView;

export function calcularTotalPagado(deuda: {
  abonos?: Array<{ monto: number }>;
}) {
  return calcularTotalPagadoBase(deuda);
}

export function calcularInteresesGenerados(deuda: {
  monto: number;
  interesMensual: number;
  fechaInicio?: string;
  fechaInicioDate?: string;
  fecha_inicio?: string;
  fechaVencimiento?: string | null;
  fecha_vencimiento?: string | null;
}) {
  return calcularInteresesGeneradosBase(deuda);
}

export function calcularEstadoDeuda(deuda: DeudaView) {
  return calcularEstadoDeudaBase(deuda);
}

export function calcularEstadoCliente(clienteId: string) {
  const cliente = clientesData.find((item) => item.id === clienteId);
  if (!cliente) return "al-dia";
  return calcularEstadoClienteBase(cliente, deudasData);
}

function calcularEstadoClienteBase(cliente: ClienteView, deudas: DeudaView[]) {
  const clientDebts = deudas.filter(
    (deuda) => deuda.clienteId === cliente.id && deuda.estado === "activa",
  );
  if (
    clientDebts.some((deuda) => calcularEstadoDeudaBase(deuda) === "atrasado")
  )
    return "atrasado";
  if (clientDebts.some((deuda) => calcularEstadoDeudaBase(deuda) === "riesgo"))
    return "riesgo";
  return "al-dia";
}

export function getMunicipioNombre(municipioId?: string | null) {
  return (
    municipiosData.find((municipio) => municipio.id === municipioId)?.nombre ??
    "—"
  );
}
