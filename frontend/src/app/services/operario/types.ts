export type OperarioRol = "OPERARIO";

export interface OperarioPagination {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface OperarioListResponse<T> {
  success: boolean;
  data: T[];
  count?: number;
  pagination?: OperarioPagination;
  error?: string;
}

export interface OperarioDetailResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface MunicipioDTO {
  id: string;
  nombre: string;
  activo: boolean;
}

export interface ClienteDTO {
  id: string;
  nombre: string;
  cedula: string;
  sexo?: "M" | "F" | "O";
  telefono: string;
  telefono_alterno?: string | null;
  municipio?: string | MunicipioDTO | null;
  municipio_nombre?: string;
  municipio_id?: string | null;
  direccion_casa?: string | null;
  direccion_trabajo?: string | null;
  email?: string | null;
  info_extra?: string | null;
  fecha_registro: string;
  activo: boolean;
  saldo_total?: string;
  deudas_atrasadas_count?: number;
}

export interface AbonoDTO {
  id: string;
  monto: string | number;
  fecha: string;
  notas?: string | null;
  atrasado: boolean;
  interes_pagado?: string | number;
  capital_pagado?: string | number;
  created_at?: string;
}

export interface DeudaDTO {
  id: string;
  cliente?: string | ClienteDTO;
  cliente_id?: string;
  monto: string | number;
  interes_mensual: string | number;
  cuota_periodica?: string | number;
  descuento_periodico?: string | number;
  descripcion?: string | null;
  fecha_inicio: string;
  fecha_vencimiento?: string | null;
  estado: "activa" | "pagada" | "atrasada" | "cancelada";
  saldo_pendiente?: string;
  interes_acumulado?: string;
  intereses_acumulados?: string;
  intereses_pagados?: string;
  interes_actual?: string;
  capital_actual?: string;
  abonos?: AbonoDTO[];
  created_at?: string;
}

export interface PagoPersonalDTO {
  id: string;
  monto: string | number;
  fecha: string;
  notas?: string | null;
  atrasado: boolean;
  created_at?: string;
}

export interface DeudaPersonalDTO {
  id: string;
  concepto: string;
  acreedor?: string | null;
  monto: string | number;
  interes_mensual: string | number;
  fecha_inicio: string;
  fecha_vencimiento?: string | null;
  dia_vencimiento?: number;
  proximo_vencimiento?: string;
  estado: "activa" | "pagada" | "cancelada";
  saldo_pendiente?: string;
  pagos?: PagoPersonalDTO[];
  created_at?: string;
}

export interface DashboardStatsDTO {
  total_clientes: number;
  clientes_activos: number;
  total_capital_prestado: string;
  total_capital_recuperado: string;
  total_saldo_pendiente: string;
  total_intereses_generados: string;
  deudas_activas: number;
  deudas_atrasadas: number;
  deudas_pagadas: number;
  tasa_cumplimiento: string;
  municipios_cubiertos: number;
}

export interface MunicipioStatsDTO {
  municipio_id: string;
  municipio_nombre: string;
  total_clientes: number;
  saldo_total: string;
}

export interface DeudaStatusStatsDTO {
  activas: number;
  pagadas: number;
  atrasadas: number;
  canceladas: number;
  total: number;
}

export interface PersonalFinanceSummaryDTO {
  total_deudas_personales: string;
  total_pagado_personales: string;
  total_saldo_personales: string;
  deudas_personales_activas: number;
  tasa_cumplimiento_personales: string;
}

export interface ClientCreatePayload {
  nombre: string;
  cedula: string;
  sexo: "M" | "F" | "O";
  telefono: string;
  telefono_alterno?: string | null;
  municipio_id?: string | null;
  direccion_casa?: string | null;
  direccion_trabajo?: string | null;
  email?: string | null;
  info_extra?: string | null;
  fecha_registro: string;
  activo?: boolean;
}

export interface ClientUpdatePayload extends Partial<ClientCreatePayload> {}

export interface MunicipioCreatePayload {
  nombre: string;
  activo?: boolean;
}

export interface MunicipioUpdatePayload extends Partial<MunicipioCreatePayload> {}

export interface DeudaCreatePayload {
  cliente_id: string;
  monto: number;
  interes_mensual: number;
  cuota_periodica?: number;
  descuento_periodico?: number;
  descripcion?: string;
  fecha_inicio: string;
  fecha_vencimiento?: string | null;
  estado?: DeudaDTO["estado"];
}

export interface DeudaUpdatePayload extends Partial<DeudaCreatePayload> {}

export interface AbonoCreatePayload {
  monto: number;
  fecha: string;
  notas?: string | null;
  atrasado?: boolean;
}

export interface DeudaPersonalCreatePayload {
  concepto: string;
  acreedor?: string | null;
  monto: number;
  interes_mensual: number;
  fecha_inicio: string;
  fecha_vencimiento?: string | null;
  dia_vencimiento?: number;
  estado?: DeudaPersonalDTO["estado"];
}

export interface PagoPersonalCreatePayload {
  monto: number;
  fecha: string;
  notas?: string | null;
  atrasado?: boolean;
}
