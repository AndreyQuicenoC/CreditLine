export interface Municipio {
  id: string;
  nombre: string;
  activo: boolean;
}

export interface Cliente {
  id: string;
  nombre: string;
  cedula: string;
  sexo: "M" | "F";
  telefono: string;
  telefonoAlterno?: string;
  municipioId: string;
  direccionCasa: string;
  direccionTrabajo?: string;
  email?: string;
  infoExtra?: string;
  fechaRegistro: string;
  activo: boolean;
}

export interface Abono {
  id: string;
  deudaId: string;
  monto: number;
  fecha: string;
  notas?: string;
  atrasado: boolean;
}

export interface Deuda {
  id: string;
  clienteId: string;
  monto: number;
  interesMensual: number;
  descripcion: string;
  fechaInicio: string;
  fechaVencimiento?: string;
  estado: "activa" | "pagada";
  abonos: Abono[];
}

export interface DeudaPersonal {
  id: string;
  concepto: string;
  acreedor: string;
  monto: number;
  interesMensual: number;
  fechaInicio: string;
  fechaVencimiento?: string;
  estado: "activa" | "pagada";
  pagos: AbonoPersonal[];
}

export interface AbonoPersonal {
  id: string;
  deudaId: string;
  monto: number;
  fecha: string;
  notas?: string;
  atrasado: boolean;
}

// ── Municipios ──────────────────────────────────────────────────────────────
export const municipiosData: Municipio[] = [
  { id: "m1", nombre: "Medellín", activo: true },
  { id: "m2", nombre: "Envigado", activo: true },
  { id: "m3", nombre: "Itagüí", activo: true },
  { id: "m4", nombre: "Sabaneta", activo: true },
  { id: "m5", nombre: "Bello", activo: true },
  { id: "m6", nombre: "Rionegro", activo: true },
  { id: "m7", nombre: "La Estrella", activo: false },
];

// ── Clientes ─────────────────────────────────────────────────────────────────
export const clientesData: Cliente[] = [
  {
    id: "c1",
    nombre: "María González",
    cedula: "1234567890",
    sexo: "F",
    telefono: "312 456 7890",
    telefonoAlterno: "604 123 4567",
    municipioId: "m1",
    direccionCasa: "Calle 50 #45-32, Laureles",
    direccionTrabajo: "Carrera 70 #44-10, Oficina 302",
    email: "maria.gonzalez@email.com",
    infoExtra: "Cliente confiable. Familiares: Esposo Juan González. Trabaja en empresa de contabilidad.",
    fechaRegistro: "2025-03-15",
    activo: true,
  },
  {
    id: "c2",
    nombre: "Carlos Ramírez",
    cedula: "0987654321",
    sexo: "M",
    telefono: "311 234 5678",
    municipioId: "m2",
    direccionCasa: "Cra 43A #9Sur-100, Envigado",
    direccionTrabajo: "Centro Comercial El Tesoro Local 124",
    email: "carlos.ramirez@email.com",
    infoExtra: "Comerciante. Paga puntuales. Tiene local de ropa.",
    fechaRegistro: "2025-04-10",
    activo: true,
  },
  {
    id: "c3",
    nombre: "Ana Martínez",
    cedula: "1122334455",
    sexo: "F",
    telefono: "300 987 6543",
    telefonoAlterno: "312 789 0123",
    municipioId: "m4",
    direccionCasa: "Calle 75 Sur #33-20, Sabaneta",
    email: "ana.martinez@email.com",
    infoExtra: "Historial irregular. Hermana: Claudia Martínez (312 000 1111). Precaución con montos altos.",
    fechaRegistro: "2025-05-20",
    activo: true,
  },
  {
    id: "c4",
    nombre: "Luis Fernández",
    cedula: "5544332211",
    sexo: "M",
    telefono: "314 567 8901",
    municipioId: "m1",
    direccionCasa: "Carrera 80 #30-15, Estadio",
    email: "luis.fernandez@email.com",
    infoExtra: "Tendencia a atrasos. Avisar con 5 días de anticipación.",
    fechaRegistro: "2025-06-01",
    activo: true,
  },
  {
    id: "c5",
    nombre: "Patricia López",
    cedula: "6677889900",
    sexo: "F",
    telefono: "313 890 1234",
    municipioId: "m3",
    direccionCasa: "Calle 33 #52-18, Itagüí",
    direccionTrabajo: "Zona Industrial Itagüí, Bodega 7",
    email: "patricia.lopez@email.com",
    infoExtra: "Empresaria textil. Prefiere pagos al inicio del mes.",
    fechaRegistro: "2025-06-15",
    activo: true,
  },
  {
    id: "c6",
    nombre: "Jorge Salazar",
    cedula: "7788990011",
    sexo: "M",
    telefono: "315 123 4567",
    municipioId: "m5",
    direccionCasa: "Cra 56 #210-30, Bello",
    email: "jorge.salazar@email.com",
    infoExtra: "Conductor de transporte. Trabaja por turnos.",
    fechaRegistro: "2025-07-08",
    activo: true,
  },
  {
    id: "c7",
    nombre: "Claudia Torres",
    cedula: "8899001122",
    sexo: "F",
    telefono: "316 234 5678",
    municipioId: "m2",
    direccionCasa: "Calle 17 Sur #37A-52, Envigado",
    email: "claudia.torres@email.com",
    infoExtra: "Docente universitaria. Muy cumplida.",
    fechaRegistro: "2025-07-25",
    activo: true,
  },
  {
    id: "c8",
    nombre: "Ricardo Herrera",
    cedula: "9900112233",
    sexo: "M",
    telefono: "317 345 6789",
    municipioId: "m6",
    direccionCasa: "Cl 50 #24-15, Rionegro",
    email: "ricardo.herrera@email.com",
    infoExtra: "Agricultor. Pagos irregulares por temporadas.",
    fechaRegistro: "2025-08-12",
    activo: true,
  },
  {
    id: "c9",
    nombre: "Sandra Vargas",
    cedula: "1023456789",
    sexo: "F",
    telefono: "318 456 7890",
    municipioId: "m1",
    direccionCasa: "Cra 65 #48-20, Laureles",
    email: "sandra.vargas@email.com",
    infoExtra: "Estilista. Atiende en su casa.",
    fechaRegistro: "2025-08-30",
    activo: true,
  },
  {
    id: "c10",
    nombre: "Andrés Mejía",
    cedula: "1112223334",
    sexo: "M",
    telefono: "319 567 8901",
    telefonoAlterno: "310 111 2222",
    municipioId: "m4",
    direccionCasa: "Calle 78B Sur #42-10, Sabaneta",
    email: "andres.mejia@email.com",
    infoExtra: "Ingeniero de sistemas freelance. Muy responsable.",
    fechaRegistro: "2025-09-15",
    activo: true,
  },
  {
    id: "c11",
    nombre: "Natalia Ríos",
    cedula: "2223334445",
    sexo: "F",
    telefono: "320 678 9012",
    municipioId: "m3",
    direccionCasa: "Cra 44 #50A-30, Itagüí",
    email: "natalia.rios@email.com",
    infoExtra: "Vendedora independiente. A veces requiere flexibilidad.",
    fechaRegistro: "2025-10-05",
    activo: true,
  },
  {
    id: "c12",
    nombre: "Felipe Castillo",
    cedula: "3334445556",
    sexo: "M",
    telefono: "321 789 0123",
    municipioId: "m1",
    direccionCasa: "Cl 10A #32-50, El Poblado",
    email: "felipe.castillo@email.com",
    infoExtra: "Abogado. Muy formal y puntual.",
    fechaRegistro: "2025-10-20",
    activo: true,
  },
  {
    id: "c13",
    nombre: "Diana Ospina",
    cedula: "4445556667",
    sexo: "F",
    telefono: "322 890 1234",
    municipioId: "m5",
    direccionCasa: "Cra 48 #190-20, Bello",
    email: "diana.ospina@email.com",
    infoExtra: "Ama de casa. Marido trabaja en construcción.",
    fechaRegistro: "2025-11-10",
    activo: true,
  },
  {
    id: "c14",
    nombre: "Sebastián Cano",
    cedula: "5556667778",
    sexo: "M",
    telefono: "323 901 2345",
    municipioId: "m6",
    direccionCasa: "Cl 30 #11-55, Rionegro",
    email: "sebastian.cano@email.com",
    infoExtra: "Veterinario. Clínica propia.",
    fechaRegistro: "2025-11-28",
    activo: true,
  },
  {
    id: "c15",
    nombre: "Laura Zuluaga",
    cedula: "6667778889",
    sexo: "F",
    telefono: "324 012 3456",
    municipioId: "m2",
    direccionCasa: "Cra 40 #12Sur-80, Envigado",
    email: "laura.zuluaga@email.com",
    infoExtra: "Contadora. Prefiere pagos los viernes.",
    fechaRegistro: "2025-12-05",
    activo: true,
  },
];

// ── Deudas + Abonos ──────────────────────────────────────────────────────────
export const deudasData: Deuda[] = [
  // María González — c1
  {
    id: "d1",
    clienteId: "c1",
    monto: 500000,
    interesMensual: 10,
    descripcion: "Gastos médicos urgentes",
    fechaInicio: "2026-01-05",
    fechaVencimiento: "2026-07-05",
    estado: "activa",
    abonos: [
      { id: "a1", deudaId: "d1", monto: 100000, fecha: "2026-02-05", notas: "Abono quincenal", atrasado: false },
      { id: "a2", deudaId: "d1", monto: 100000, fecha: "2026-03-05", notas: "Pago puntual", atrasado: false },
      { id: "a3", deudaId: "d1", monto: 80000, fecha: "2026-04-10", notas: "Abono parcial", atrasado: false },
    ],
  },
  {
    id: "d2",
    clienteId: "c1",
    monto: 300000,
    interesMensual: 8,
    descripcion: "Compra de electrodomésticos",
    fechaInicio: "2025-09-01",
    fechaVencimiento: "2025-12-01",
    estado: "pagada",
    abonos: [
      { id: "a4", deudaId: "d2", monto: 100000, fecha: "2025-10-01", notas: "Abono 1", atrasado: false },
      { id: "a5", deudaId: "d2", monto: 100000, fecha: "2025-11-01", notas: "Abono 2", atrasado: false },
      { id: "a6", deudaId: "d2", monto: 124000, fecha: "2025-12-01", notas: "Saldo + intereses", atrasado: false },
    ],
  },
  // Carlos Ramírez — c2
  {
    id: "d3",
    clienteId: "c2",
    monto: 800000,
    interesMensual: 12,
    descripcion: "Capital para inventario de tienda",
    fechaInicio: "2026-02-10",
    fechaVencimiento: "2026-08-10",
    estado: "activa",
    abonos: [
      { id: "a7", deudaId: "d3", monto: 150000, fecha: "2026-03-10", notas: "Primer abono", atrasado: false },
      { id: "a8", deudaId: "d3", monto: 150000, fecha: "2026-04-10", notas: "Segundo abono", atrasado: false },
    ],
  },
  // Ana Martínez — c3
  {
    id: "d4",
    clienteId: "c3",
    monto: 600000,
    interesMensual: 15,
    descripcion: "Remodelación del hogar",
    fechaInicio: "2025-11-01",
    fechaVencimiento: "2026-05-01",
    estado: "activa",
    abonos: [
      { id: "a9", deudaId: "d4", monto: 80000, fecha: "2025-12-15", notas: "Primer abono", atrasado: true },
      { id: "a10", deudaId: "d4", monto: 80000, fecha: "2026-02-10", notas: "Atrasado 40 días", atrasado: true },
    ],
  },
  {
    id: "d5",
    clienteId: "c3",
    monto: 400000,
    interesMensual: 10,
    descripcion: "Pago de servicios acumulados",
    fechaInicio: "2026-03-20",
    estado: "activa",
    abonos: [
      { id: "a11", deudaId: "d5", monto: 50000, fecha: "2026-04-25", notas: "", atrasado: true },
    ],
  },
  // Luis Fernández — c4
  {
    id: "d6",
    clienteId: "c4",
    monto: 700000,
    interesMensual: 12,
    descripcion: "Reparación de vehículo",
    fechaInicio: "2025-12-01",
    fechaVencimiento: "2026-06-01",
    estado: "activa",
    abonos: [
      { id: "a12", deudaId: "d6", monto: 100000, fecha: "2026-01-15", notas: "Abono tardío", atrasado: true },
      { id: "a13", deudaId: "d6", monto: 80000, fecha: "2026-03-20", notas: "Abono muy tarde", atrasado: true },
    ],
  },
  // Patricia López — c5
  {
    id: "d7",
    clienteId: "c5",
    monto: 1200000,
    interesMensual: 8,
    descripcion: "Compra de maquinaria textil",
    fechaInicio: "2025-10-01",
    fechaVencimiento: "2026-10-01",
    estado: "activa",
    abonos: [
      { id: "a14", deudaId: "d7", monto: 130000, fecha: "2025-11-01", notas: "", atrasado: false },
      { id: "a15", deudaId: "d7", monto: 130000, fecha: "2025-12-01", notas: "", atrasado: false },
      { id: "a16", deudaId: "d7", monto: 130000, fecha: "2026-01-01", notas: "", atrasado: false },
      { id: "a17", deudaId: "d7", monto: 130000, fecha: "2026-02-01", notas: "", atrasado: false },
      { id: "a18", deudaId: "d7", monto: 130000, fecha: "2026-03-01", notas: "", atrasado: false },
      { id: "a19", deudaId: "d7", monto: 130000, fecha: "2026-04-01", notas: "", atrasado: false },
    ],
  },
  {
    id: "d8",
    clienteId: "c5",
    monto: 350000,
    interesMensual: 10,
    descripcion: "Gastos de transporte",
    fechaInicio: "2026-03-05",
    estado: "activa",
    abonos: [
      { id: "a20", deudaId: "d8", monto: 60000, fecha: "2026-04-05", notas: "", atrasado: false },
    ],
  },
  // Jorge Salazar — c6
  {
    id: "d9",
    clienteId: "c6",
    monto: 450000,
    interesMensual: 12,
    descripcion: "Gastos familiares urgentes",
    fechaInicio: "2026-01-20",
    fechaVencimiento: "2026-07-20",
    estado: "activa",
    abonos: [
      { id: "a21", deudaId: "d9", monto: 75000, fecha: "2026-02-20", notas: "", atrasado: false },
      { id: "a22", deudaId: "d9", monto: 75000, fecha: "2026-03-20", notas: "", atrasado: false },
      { id: "a23", deudaId: "d9", monto: 75000, fecha: "2026-04-20", notas: "", atrasado: false },
    ],
  },
  // Claudia Torres — c7
  {
    id: "d10",
    clienteId: "c7",
    monto: 900000,
    interesMensual: 8,
    descripcion: "Posgrado universitario",
    fechaInicio: "2025-08-01",
    fechaVencimiento: "2026-08-01",
    estado: "activa",
    abonos: [
      { id: "a24", deudaId: "d10", monto: 90000, fecha: "2025-09-01", notas: "", atrasado: false },
      { id: "a25", deudaId: "d10", monto: 90000, fecha: "2025-10-01", notas: "", atrasado: false },
      { id: "a26", deudaId: "d10", monto: 90000, fecha: "2025-11-01", notas: "", atrasado: false },
      { id: "a27", deudaId: "d10", monto: 90000, fecha: "2025-12-01", notas: "", atrasado: false },
      { id: "a28", deudaId: "d10", monto: 90000, fecha: "2026-01-01", notas: "", atrasado: false },
      { id: "a29", deudaId: "d10", monto: 90000, fecha: "2026-02-01", notas: "", atrasado: false },
      { id: "a30", deudaId: "d10", monto: 90000, fecha: "2026-03-01", notas: "", atrasado: false },
      { id: "a31", deudaId: "d10", monto: 90000, fecha: "2026-04-01", notas: "", atrasado: false },
    ],
  },
  // Ricardo Herrera — c8
  {
    id: "d11",
    clienteId: "c8",
    monto: 500000,
    interesMensual: 15,
    descripcion: "Insumos para cosecha",
    fechaInicio: "2026-02-15",
    estado: "activa",
    abonos: [
      { id: "a32", deudaId: "d11", monto: 60000, fecha: "2026-04-01", notas: "Llegó tarde", atrasado: true },
    ],
  },
  // Sandra Vargas — c9
  {
    id: "d12",
    clienteId: "c9",
    monto: 280000,
    interesMensual: 10,
    descripcion: "Compra de utensilios de trabajo",
    fechaInicio: "2026-02-01",
    fechaVencimiento: "2026-08-01",
    estado: "activa",
    abonos: [
      { id: "a33", deudaId: "d12", monto: 50000, fecha: "2026-03-01", notas: "", atrasado: false },
      { id: "a34", deudaId: "d12", monto: 50000, fecha: "2026-04-01", notas: "", atrasado: false },
    ],
  },
  // Andrés Mejía — c10
  {
    id: "d13",
    clienteId: "c10",
    monto: 1500000,
    interesMensual: 6,
    descripcion: "Equipo de trabajo (computador + accesorios)",
    fechaInicio: "2025-07-01",
    fechaVencimiento: "2026-07-01",
    estado: "activa",
    abonos: [
      { id: "a35", deudaId: "d13", monto: 140000, fecha: "2025-08-01", notas: "", atrasado: false },
      { id: "a36", deudaId: "d13", monto: 140000, fecha: "2025-09-01", notas: "", atrasado: false },
      { id: "a37", deudaId: "d13", monto: 140000, fecha: "2025-10-01", notas: "", atrasado: false },
      { id: "a38", deudaId: "d13", monto: 140000, fecha: "2025-11-01", notas: "", atrasado: false },
      { id: "a39", deudaId: "d13", monto: 140000, fecha: "2025-12-01", notas: "", atrasado: false },
      { id: "a40", deudaId: "d13", monto: 140000, fecha: "2026-01-01", notas: "", atrasado: false },
      { id: "a41", deudaId: "d13", monto: 140000, fecha: "2026-02-01", notas: "", atrasado: false },
      { id: "a42", deudaId: "d13", monto: 140000, fecha: "2026-03-01", notas: "", atrasado: false },
      { id: "a43", deudaId: "d13", monto: 140000, fecha: "2026-04-01", notas: "", atrasado: false },
    ],
  },
  // Natalia Ríos — c11
  {
    id: "d14",
    clienteId: "c11",
    monto: 420000,
    interesMensual: 12,
    descripcion: "Gastos de salud",
    fechaInicio: "2026-01-10",
    fechaVencimiento: "2026-07-10",
    estado: "activa",
    abonos: [
      { id: "a44", deudaId: "d14", monto: 70000, fecha: "2026-02-15", notas: "Tardío", atrasado: true },
      { id: "a45", deudaId: "d14", monto: 70000, fecha: "2026-03-20", notas: "Tardío", atrasado: true },
    ],
  },
  // Felipe Castillo — c12
  {
    id: "d15",
    clienteId: "c12",
    monto: 2000000,
    interesMensual: 5,
    descripcion: "Capital de trabajo para firma",
    fechaInicio: "2025-06-01",
    fechaVencimiento: "2026-06-01",
    estado: "activa",
    abonos: [
      { id: "a46", deudaId: "d15", monto: 200000, fecha: "2025-07-01", notas: "", atrasado: false },
      { id: "a47", deudaId: "d15", monto: 200000, fecha: "2025-08-01", notas: "", atrasado: false },
      { id: "a48", deudaId: "d15", monto: 200000, fecha: "2025-09-01", notas: "", atrasado: false },
      { id: "a49", deudaId: "d15", monto: 200000, fecha: "2025-10-01", notas: "", atrasado: false },
      { id: "a50", deudaId: "d15", monto: 200000, fecha: "2025-11-01", notas: "", atrasado: false },
      { id: "a51", deudaId: "d15", monto: 200000, fecha: "2025-12-01", notas: "", atrasado: false },
      { id: "a52", deudaId: "d15", monto: 200000, fecha: "2026-01-01", notas: "", atrasado: false },
      { id: "a53", deudaId: "d15", monto: 200000, fecha: "2026-02-01", notas: "", atrasado: false },
      { id: "a54", deudaId: "d15", monto: 200000, fecha: "2026-03-01", notas: "", atrasado: false },
      { id: "a55", deudaId: "d15", monto: 200000, fecha: "2026-04-01", notas: "", atrasado: false },
    ],
  },
  // Diana Ospina — c13
  {
    id: "d16",
    clienteId: "c13",
    monto: 350000,
    interesMensual: 10,
    descripcion: "Útiles escolares hijos",
    fechaInicio: "2026-02-20",
    fechaVencimiento: "2026-08-20",
    estado: "activa",
    abonos: [
      { id: "a56", deudaId: "d16", monto: 60000, fecha: "2026-03-20", notas: "", atrasado: false },
      { id: "a57", deudaId: "d16", monto: 60000, fecha: "2026-04-20", notas: "", atrasado: false },
    ],
  },
  // Sebastián Cano — c14
  {
    id: "d17",
    clienteId: "c14",
    monto: 800000,
    interesMensual: 7,
    descripcion: "Equipos veterinarios",
    fechaInicio: "2025-12-15",
    fechaVencimiento: "2026-06-15",
    estado: "activa",
    abonos: [
      { id: "a58", deudaId: "d17", monto: 140000, fecha: "2026-01-15", notas: "", atrasado: false },
      { id: "a59", deudaId: "d17", monto: 140000, fecha: "2026-02-15", notas: "", atrasado: false },
      { id: "a60", deudaId: "d17", monto: 140000, fecha: "2026-03-15", notas: "", atrasado: false },
      { id: "a61", deudaId: "d17", monto: 140000, fecha: "2026-04-15", notas: "", atrasado: false },
    ],
  },
  // Laura Zuluaga — c15
  {
    id: "d18",
    clienteId: "c15",
    monto: 600000,
    interesMensual: 9,
    descripcion: "Actualización de software contable",
    fechaInicio: "2026-01-25",
    fechaVencimiento: "2026-07-25",
    estado: "activa",
    abonos: [
      { id: "a62", deudaId: "d18", monto: 100000, fecha: "2026-02-25", notas: "", atrasado: false },
      { id: "a63", deudaId: "d18", monto: 100000, fecha: "2026-03-25", notas: "", atrasado: false },
      { id: "a64", deudaId: "d18", monto: 100000, fecha: "2026-04-25", notas: "", atrasado: false },
    ],
  },
  // Deuda finalizada adicional — Jorge Salazar c6
  {
    id: "d19",
    clienteId: "c6",
    monto: 200000,
    interesMensual: 10,
    descripcion: "Préstamo personal menor",
    fechaInicio: "2025-05-01",
    fechaVencimiento: "2025-08-01",
    estado: "pagada",
    abonos: [
      { id: "a65", deudaId: "d19", monto: 70000, fecha: "2025-06-01", notas: "", atrasado: false },
      { id: "a66", deudaId: "d19", monto: 70000, fecha: "2025-07-01", notas: "", atrasado: false },
      { id: "a67", deudaId: "d19", monto: 80000, fecha: "2025-08-01", notas: "Saldo final", atrasado: false },
    ],
  },
  // Deuda finalizada — Felipe Castillo c12
  {
    id: "d20",
    clienteId: "c12",
    monto: 500000,
    interesMensual: 5,
    descripcion: "Gastos de viaje profesional",
    fechaInicio: "2025-01-10",
    fechaVencimiento: "2025-04-10",
    estado: "pagada",
    abonos: [
      { id: "a68", deudaId: "d20", monto: 180000, fecha: "2025-02-10", notas: "", atrasado: false },
      { id: "a69", deudaId: "d20", monto: 180000, fecha: "2025-03-10", notas: "", atrasado: false },
      { id: "a70", deudaId: "d20", monto: 190000, fecha: "2025-04-10", notas: "Saldo con intereses", atrasado: false },
    ],
  },
];

// ── Finanzas Personales ──────────────────────────────────────────────────────
export const deudasPersonalesData: DeudaPersonal[] = [
  {
    id: "dp1",
    concepto: "Tarjeta de Crédito Bancolombia",
    acreedor: "Bancolombia",
    monto: 3500000,
    interesMensual: 2,
    fechaInicio: "2025-06-01",
    fechaVencimiento: "2026-06-01",
    estado: "activa",
    pagos: [
      { id: "pp1", deudaId: "dp1", monto: 350000, fecha: "2025-07-01", notas: "", atrasado: false },
      { id: "pp2", deudaId: "dp1", monto: 350000, fecha: "2025-08-01", notas: "", atrasado: false },
      { id: "pp3", deudaId: "dp1", monto: 350000, fecha: "2025-09-01", notas: "", atrasado: false },
      { id: "pp4", deudaId: "dp1", monto: 350000, fecha: "2025-10-01", notas: "", atrasado: false },
      { id: "pp5", deudaId: "dp1", monto: 350000, fecha: "2025-11-01", notas: "", atrasado: false },
      { id: "pp6", deudaId: "dp1", monto: 200000, fecha: "2026-01-15", notas: "Pago tardío enero", atrasado: true },
    ],
  },
  {
    id: "dp2",
    concepto: "Préstamo Vehículo",
    acreedor: "Banco Davivienda",
    monto: 15000000,
    interesMensual: 1.5,
    fechaInicio: "2024-01-01",
    fechaVencimiento: "2027-12-30",
    estado: "activa",
    pagos: [
      { id: "pp7", deudaId: "dp2", monto: 500000, fecha: "2024-02-01", notas: "", atrasado: false },
      { id: "pp8", deudaId: "dp2", monto: 500000, fecha: "2024-03-01", notas: "", atrasado: false },
      { id: "pp9", deudaId: "dp2", monto: 500000, fecha: "2024-04-01", notas: "", atrasado: false },
      { id: "pp10", deudaId: "dp2", monto: 500000, fecha: "2024-05-01", notas: "", atrasado: false },
      { id: "pp11", deudaId: "dp2", monto: 500000, fecha: "2024-06-01", notas: "", atrasado: false },
      { id: "pp12", deudaId: "dp2", monto: 500000, fecha: "2024-07-01", notas: "", atrasado: false },
      { id: "pp13", deudaId: "dp2", monto: 500000, fecha: "2024-08-01", notas: "", atrasado: false },
      { id: "pp14", deudaId: "dp2", monto: 500000, fecha: "2024-09-01", notas: "", atrasado: false },
      { id: "pp15", deudaId: "dp2", monto: 500000, fecha: "2024-10-01", notas: "", atrasado: false },
      { id: "pp16", deudaId: "dp2", monto: 500000, fecha: "2024-11-01", notas: "", atrasado: false },
      { id: "pp17", deudaId: "dp2", monto: 500000, fecha: "2024-12-01", notas: "", atrasado: false },
      { id: "pp18", deudaId: "dp2", monto: 500000, fecha: "2025-01-01", notas: "", atrasado: false },
      { id: "pp19", deudaId: "dp2", monto: 500000, fecha: "2025-02-01", notas: "", atrasado: false },
      { id: "pp20", deudaId: "dp2", monto: 500000, fecha: "2025-03-01", notas: "", atrasado: false },
      { id: "pp21", deudaId: "dp2", monto: 500000, fecha: "2025-04-01", notas: "", atrasado: false },
      { id: "pp22", deudaId: "dp2", monto: 500000, fecha: "2025-05-01", notas: "", atrasado: false },
    ],
  },
];

// ── Helper functions ──────────────────────────────────────────────────────────
export function getMunicipioNombre(id: string): string {
  return municipiosData.find((m) => m.id === id)?.nombre ?? "—";
}

export function getClienteById(id: string): Cliente | undefined {
  return clientesData.find((c) => c.id === id);
}

export function getDeudasByCliente(clienteId: string): Deuda[] {
  return deudasData.filter((d) => d.clienteId === clienteId);
}

export function calcularTotalPagado(deuda: Deuda): number {
  return deuda.abonos.reduce((s, a) => s + a.monto, 0);
}

export function calcularInteresesGenerados(deuda: Deuda): number {
  const inicio = new Date(deuda.fechaInicio);
  const ahora = new Date("2026-04-29");
  const meses = Math.max(
    0,
    (ahora.getFullYear() - inicio.getFullYear()) * 12 +
      (ahora.getMonth() - inicio.getMonth())
  );
  return deuda.monto * (deuda.interesMensual / 100) * meses;
}

export function calcularEstadoDeuda(deuda: Deuda): "al-dia" | "riesgo" | "atrasado" | "pagada" {
  if (deuda.estado === "pagada") return "pagada";
  if (!deuda.fechaVencimiento) return "al-dia";
  const vencimiento = new Date(deuda.fechaVencimiento);
  const ahora = new Date("2026-04-29");
  const diasDiff = Math.ceil((vencimiento.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
  if (diasDiff < 0) return "atrasado";
  if (diasDiff <= 14) return "riesgo";
  return "al-dia";
}

export function calcularEstadoCliente(clienteId: string): "al-dia" | "riesgo" | "atrasado" {
  const deudas = getDeudasByCliente(clienteId).filter((d) => d.estado === "activa");
  if (deudas.some((d) => calcularEstadoDeuda(d) === "atrasado")) return "atrasado";
  if (deudas.some((d) => calcularEstadoDeuda(d) === "riesgo")) return "riesgo";
  return "al-dia";
}
