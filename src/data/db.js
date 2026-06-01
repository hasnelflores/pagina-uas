// ─── LOCAL DATABASE (localStorage) ────────────────────────────────────────
const DB_KEY = 'sipe_db';

const defaultData = {
  unidades: [
    { id: 1, nombre: 'Facultad de Ingeniería Mochis', siglas: 'FIM', ciudad: 'Los Mochis', activa: true },
    { id: 2, nombre: 'Facultad de Enfermería Mochis', siglas: 'FEM', ciudad: 'Los Mochis', activa: true },
    { id: 3, nombre: 'Facultad de Ciencias Económicas', siglas: 'FCE', ciudad: 'Los Mochis', activa: true },
  ],
  carreras: [
    { id: 1, nombre: 'Ingeniería Civil', clave: 'IC', unidadId: 1, activa: true },
    { id: 2, nombre: 'Ingeniería Geodésica', clave: 'IG', unidadId: 1, activa: true },
    { id: 3, nombre: 'Ingeniería de Software', clave: 'IS', unidadId: 1, activa: true },
    { id: 4, nombre: 'Ingeniería Industrial', clave: 'II', unidadId: 1, activa: true },
    { id: 5, nombre: 'Enfermería General', clave: 'ENF', unidadId: 2, activa: true },
  ],
  usuarios: [
    { id: 1, nombre: 'Carlos Ramírez López', matricula: '2021110001', tipo: 'alumno', carreraId: 3, email: 'c.ramirez@uas.edu.mx', activo: true },
    { id: 2, nombre: 'María González Soto', matricula: '2020110043', tipo: 'alumno', carreraId: 1, email: 'm.gonzalez@uas.edu.mx', activo: true },
    { id: 3, nombre: 'Dr. José Luis Pérez', matricula: 'P001', tipo: 'profesor', carreraId: 3, email: 'jl.perez@uas.edu.mx', activo: true },
    { id: 4, nombre: 'Ing. Ana Torres Medina', matricula: 'P002', tipo: 'profesor', carreraId: 2, email: 'a.torres@uas.edu.mx', activo: true },
  ],
  equipos: [
    { id: 1, nombre: 'Proyector BenQ MW550', clave: 'PROY-001', categoria: 'Proyección', cantidad: 5, disponibles: 4, estado: 'bueno' },
    { id: 2, nombre: 'Laptop Dell Inspiron', clave: 'LAP-001', categoria: 'Cómputo', cantidad: 10, disponibles: 8, estado: 'bueno' },
    { id: 3, nombre: 'Router Inalámbrico TP-Link', clave: 'NET-001', categoria: 'Redes', cantidad: 3, disponibles: 3, estado: 'bueno' },
    { id: 4, nombre: 'Centro de Cómputo Aula 3', clave: 'CC-003', categoria: 'Aula', cantidad: 1, disponibles: 1, estado: 'bueno' },
    { id: 5, nombre: 'Cámara Canon EOS', clave: 'CAM-001', categoria: 'Multimedia', cantidad: 2, disponibles: 2, estado: 'regular' },
  ],
  prestamos: [
    {
      id: 1, folio: 'PRES-0001',
      usuarioId: 1, equipoId: 2, cantidad: 1,
      fechaPrestamo: '2025-03-10', horaPrestamo: '09:00',
      fechaDevolucion: '2025-03-10', horaDevolucion: '13:00',
      fechaEntrega: '2025-03-10', horaEntrega: '12:45',
      estado: 'entregado', observaciones: 'Sin novedad'
    },
    {
      id: 2, folio: 'PRES-0002',
      usuarioId: 3, equipoId: 1, cantidad: 1,
      fechaPrestamo: '2025-03-11', horaPrestamo: '08:00',
      fechaDevolucion: '2025-03-11', horaDevolucion: '11:00',
      fechaEntrega: null, horaEntrega: null,
      estado: 'activo', observaciones: 'Clase magistral'
    },
  ],
  _nextId: { unidades: 4, carreras: 6, usuarios: 5, equipos: 6, prestamos: 3 }
};

// ─── DB API ────────────────────────────────────────────────────────────────
const DB = {
  _data: null,

  load() {
    try {
      const raw = localStorage.getItem(DB_KEY);
      this._data = raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(defaultData));
    } catch {
      this._data = JSON.parse(JSON.stringify(defaultData));
    }
    return this;
  },

  save() {
    localStorage.setItem(DB_KEY, JSON.stringify(this._data));
    return this;
  },

  reset() {
    this._data = JSON.parse(JSON.stringify(defaultData));
    this.save();
  },

  // ── Generic CRUD ────────────────────────────────
  getAll(table) {
    return [...(this._data[table] || [])];
  },

  getById(table, id) {
    return (this._data[table] || []).find(r => r.id === id) || null;
  },

  insert(table, record) {
    const id = this._data._nextId[table]++;
    const newRecord = { ...record, id };
    this._data[table].push(newRecord);
    this.save();
    return newRecord;
  },

  update(table, id, changes) {
    const idx = this._data[table].findIndex(r => r.id === id);
    if (idx < 0) return null;
    this._data[table][idx] = { ...this._data[table][idx], ...changes };
    this.save();
    return this._data[table][idx];
  },

  delete(table, id) {
    const idx = this._data[table].findIndex(r => r.id === id);
    if (idx < 0) return false;
    this._data[table].splice(idx, 1);
    this.save();
    return true;
  },

  // ── Helpers ─────────────────────────────────────
  nextFolio() {
    const n = this._data._nextId.prestamos;
    return 'PRES-' + String(n).padStart(4, '0');
  },

  stats() {
    const prestamos = this._data.prestamos;
    return {
      totalUnidades: this._data.unidades.length,
      totalUsuarios: this._data.usuarios.length,
      totalEquipos:  this._data.equipos.length,
      totalPrestamos: prestamos.length,
      activos: prestamos.filter(p => p.estado === 'activo').length,
      entregados: prestamos.filter(p => p.estado === 'entregado').length,
      vencidos: prestamos.filter(p => p.estado === 'vencido').length,
    };
  }
};

DB.load();
