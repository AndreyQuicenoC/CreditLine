import type {
  AbonoDTO,
  ClienteDTO,
  DeudaDTO,
  DeudaPersonalDTO,
  MunicipioDTO,
  PagoPersonalDTO,
} from "./types";
import { ensureArray, normalizeDate, toNumber } from "./utils";

export interface MunicipioView {
  id: string;
  nombre: string;
  activo: boolean;
}

export interface AbonoView {
  id: string;
  deudaId: string;
  monto: number;
  fecha: string;
  notas?: string;
  atrasado: boolean;
}

export interface DeudaView {
  id: string;
  clienteId: string;
  monto: number;
  interesMensual: number;
  cuotaPeriodica: number;
  descuentoPeriodico: number;
  descripcion: string;
  fechaInicio: string;
  fechaVencimiento?: string;
  estado: "activa" | "pagada" | "atrasada" | "cancelada";
  abonos: AbonoView[];
  capitalActual: number;
  totalPagado: number;
  interesesAcumulados: number;
  interesesPagados: number;
  interesActual: number;
  saldoPendiente: number;
}

export interface ClienteView {
  id: string;
  nombre: string;
  cedula: string;
  sexo: "M" | "F" | "O";
  telefono: string;
  telefonoAlterno?: string;
  municipioId?: string;
  direccionCasa?: string;
  direccionTrabajo?: string;
  email?: string;
  infoExtra?: string;
  fechaRegistro: string;
  activo: boolean;
  municipioNombre?: string;
  saldoTotal: number;
  deudasAtrasadasCount: number;
}

export interface AbonoPersonalView {
  id: string;
  deudaId: string;
  monto: number;
  fecha: string;
  notas?: string;
  atrasado: boolean;
}

export interface DeudaPersonalView {
  id: string;
  concepto: string;
  acreedor?: string;
  monto: number;
  interesMensual: number;
  fechaInicio: string;
  fechaVencimiento?: string;
  diaVencimiento?: number;
  proximoVencimiento?: string;
  estado: "activa" | "pagada" | "cancelada";
  pagos: AbonoPersonalView[];
}

export function toMunicipioView(municipio: MunicipioDTO): MunicipioView {
  return {
    id: municipio.id,
    nombre: municipio.nombre,
    activo: municipio.activo,
  };
}

export function toClienteView(
  cliente: ClienteDTO,
  municipios: MunicipioDTO[] = [],
  deudas: DeudaDTO[] = [],
): ClienteView {
  const municipioId =
    cliente.municipio_id ??
    (typeof cliente.municipio === "string"
      ? cliente.municipio
      : cliente.municipio?.id);
  const municipioNombre =
    typeof cliente.municipio === "object"
      ? cliente.municipio?.nombre
      : municipios.find((m) => m.id === municipioId)?.nombre;
  const clienteDeudas = deudas.filter(
    (deuda) =>
      deuda.cliente_id === cliente.id ||
      (typeof deuda.cliente === "object" && deuda.cliente?.id === cliente.id),
  );
  const saldoTotal = clienteDeudas
    .filter((deuda) => deuda.estado === "activa")
    .reduce((total, deuda) => total + getSaldoPendiente(deuda), 0);
  const deudasAtrasadasCount = clienteDeudas.filter(
    (deuda) => calcularEstadoDeuda(toDeudaView(deuda)) === "atrasado",
  ).length;

  return {
    id: cliente.id,
    nombre: cliente.nombre,
    cedula: cliente.cedula,
    sexo: cliente.sexo ?? "M",
    telefono: cliente.telefono,
    telefonoAlterno: cliente.telefono_alterno ?? undefined,
    municipioId: municipioId ?? undefined,
    direccionCasa: cliente.direccion_casa ?? undefined,
    direccionTrabajo: cliente.direccion_trabajo ?? undefined,
    email: cliente.email ?? undefined,
    infoExtra: cliente.info_extra ?? undefined,
    fechaRegistro: normalizeDate(cliente.fecha_registro),
    activo: cliente.activo,
    municipioNombre,
    saldoTotal,
    deudasAtrasadasCount,
  };
}

export function toAbonoView(abono: AbonoDTO, deudaId: string): AbonoView {
  return {
    id: abono.id,
    deudaId,
    monto: toNumber(abono.monto),
    fecha: normalizeDate(abono.fecha),
    notas: abono.notas ?? undefined,
    atrasado: abono.atrasado,
  };
}

export function toDeudaView(deuda: DeudaDTO): DeudaView {
  const abonos = ensureArray(deuda.abonos).map((abono) =>
    toAbonoView(abono, deuda.id),
  );
  return {
    id: deuda.id,
    clienteId:
      deuda.cliente_id ??
      (typeof deuda.cliente === "object"
        ? (deuda.cliente?.id ?? "")
        : String(deuda.cliente ?? "")),
    monto: toNumber(deuda.monto),
    interesMensual: toNumber(deuda.interes_mensual),
    cuotaPeriodica: toNumber(deuda.cuota_periodica),
    descuentoPeriodico: toNumber(deuda.descuento_periodico),
    descripcion: deuda.descripcion ?? "",
    fechaInicio: normalizeDate(deuda.fecha_inicio),
    fechaVencimiento: deuda.fecha_vencimiento
      ? normalizeDate(deuda.fecha_vencimiento)
      : undefined,
    estado: deuda.estado,
    abonos,
    capitalActual: toNumber(deuda.capital_actual),
    totalPagado: toNumber(deuda.total_pagado),
    interesesAcumulados: toNumber(
      deuda.intereses_acumulados ?? deuda.interes_acumulado,
    ),
    interesesPagados: toNumber(deuda.intereses_pagados),
    interesActual: toNumber(deuda.interes_actual),
    saldoPendiente: toNumber(deuda.saldo_pendiente),
  };
}

export function toPagoPersonalView(
  pago: PagoPersonalDTO,
  deudaId: string,
): AbonoPersonalView {
  return {
    id: pago.id,
    deudaId,
    monto: toNumber(pago.monto),
    fecha: normalizeDate(pago.fecha),
    notas: pago.notas ?? undefined,
    atrasado: pago.atrasado,
  };
}

export function toDeudaPersonalView(
  deuda: DeudaPersonalDTO,
): DeudaPersonalView {
  return {
    id: deuda.id,
    concepto: deuda.concepto,
    acreedor: deuda.acreedor ?? undefined,
    monto: toNumber(deuda.monto),
    interesMensual: toNumber(deuda.interes_mensual),
    fechaInicio: normalizeDate(deuda.fecha_inicio),
    fechaVencimiento: deuda.fecha_vencimiento
      ? normalizeDate(deuda.fecha_vencimiento)
      : undefined,
    diaVencimiento: deuda.dia_vencimiento,
    proximoVencimiento: deuda.proximo_vencimiento
      ? normalizeDate(deuda.proximo_vencimiento)
      : undefined,
    estado: deuda.estado,
    pagos: ensureArray(deuda.pagos).map((pago) =>
      toPagoPersonalView(pago, deuda.id),
    ),
  };
}

export function calcularTotalPagado(deuda: {
  abonos: Array<{ monto: number }> | undefined;
}): number {
  return ensureArray(deuda.abonos).reduce(
    (total, abono) => total + toNumber(abono.monto),
    0,
  );
}

export function calcularPagadoPersonal(deuda: {
  pagos: Array<{ monto: number }> | undefined;
}): number {
  return ensureArray(deuda.pagos).reduce(
    (total, pago) => total + toNumber(pago.monto),
    0,
  );
}

export function calcularInteresesGenerados(deuda: {
  monto: number;
  interesMensual: number;
  fechaInicio?: string;
  fechaInicioDate?: string;
  fecha_inicio?: string;
  fechaVencimiento?: string | null;
  fecha_vencimiento?: string | null;
}): number {
  const backendIntereses =
    (deuda as { interes_acumulado?: unknown; interesesAcumulados?: unknown })
      .interes_acumulado ??
    (deuda as { interes_acumulado?: unknown; interesesAcumulados?: unknown })
      .interesesAcumulados;
  if (typeof backendIntereses !== "undefined") {
    return toNumber(backendIntereses);
  }
  const inicio = new Date(
    deuda.fechaInicio ??
      deuda.fechaInicioDate ??
      deuda.fecha_inicio ??
      new Date().toISOString().slice(0, 10),
  );
  const baseDateStr = deuda.fechaVencimiento ?? deuda.fecha_vencimiento;
  const fin = new Date(baseDateStr ?? new Date().toISOString().slice(0, 10));
  const months = Math.max(
    1,
    (fin.getFullYear() - inicio.getFullYear()) * 12 +
      (fin.getMonth() - inicio.getMonth()) +
      1,
  );
  return Math.round(
    toNumber(deuda.monto) * (toNumber(deuda.interesMensual) / 100) * months,
  );
}

export function calcularEstadoDeuda(deuda: {
  estado: string;
  fechaVencimiento?: string;
  fechaVencimientoDate?: string;
  fecha_vencimiento?: string;
  abonos?: Array<{ atrasado: boolean }>;
}): "al-dia" | "riesgo" | "atrasado" | "pagada" | "cancelada" {
  if (deuda.estado === "pagada" || deuda.estado === "cancelada")
    return deuda.estado;
  const overduePayment = ensureArray(deuda.abonos).some(
    (abono) => abono.atrasado,
  );
  const dueDate = new Date(
    deuda.fechaVencimiento ??
      deuda.fechaVencimientoDate ??
      deuda.fecha_vencimiento ??
      "2099-12-31",
  );
  const today = new Date();
  const diffDays = Math.ceil(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (overduePayment || diffDays < 0) return "atrasado";
  if (diffDays <= 15) return "riesgo";
  return "al-dia";
}

export function calcularEstadoCliente(
  cliente: ClienteView,
  deudas: DeudaView[],
): "al-dia" | "riesgo" | "atrasado" {
  const clientDebts = deudas.filter(
    (deuda) => deuda.clienteId === cliente.id && deuda.estado === "activa",
  );
  if (clientDebts.some((deuda) => calcularEstadoDeuda(deuda) === "atrasado"))
    return "atrasado";
  if (clientDebts.some((deuda) => calcularEstadoDeuda(deuda) === "riesgo"))
    return "riesgo";
  return "al-dia";
}

export function getMunicipioNombre(
  municipioId: string,
  municipios: MunicipioView[],
): string {
  return (
    municipios.find((municipio) => municipio.id === municipioId)?.nombre ?? "—"
  );
}

export function getSaldoPendiente(deuda: DeudaView | DeudaDTO): number {
  const backendSaldo =
    (deuda as { saldo_pendiente?: unknown; saldoPendiente?: unknown })
      .saldo_pendiente ??
    (deuda as { saldo_pendiente?: unknown; saldoPendiente?: unknown })
      .saldoPendiente;
  if (typeof backendSaldo !== "undefined") {
    return Math.max(0, toNumber(backendSaldo));
  }
  const monto = toNumber(deuda.monto);
  const pagado = calcularTotalPagado(
    deuda as { abonos: Array<{ monto: number }> | undefined },
  );
  const intereses = calcularInteresesGenerados(
    deuda as {
      monto: number;
      interesMensual: number;
      fechaInicio?: string;
      fecha_vencimiento?: string;
      fechaVencimiento?: string;
      abonos?: Array<{ atrasado: boolean }>;
    },
  );
  return Math.max(0, monto + intereses - pagado);
}
