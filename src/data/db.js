// ─── SUPABASE CONFIG ───────────────────────────────────────────────────────
const SUPABASE_URL = 'https://luutrsnvrsenoiytdpby.supabase.co';
const SUPABASE_KEY = 'sb_publishable_6JtJD6CYxyKNI8We3DxIog_LpD71r1r';

const _headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Prefer': 'return=representation'
};

// ─── DB API ────────────────────────────────────────────────────────────────
const DB = {

  async getAll(table) {
    const map = { unidades:'unidades', carreras:'carreras', usuarios:'usuarios', equipos:'equipos', prestamos:'prestamos' };
    const t = map[table];
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${t}?order=id.asc`, { headers: _headers });
    const data = await res.json();
    return (data || []).map(r => this._toCamel(table, r));
  },

  async getById(table, id) {
    const map = { unidades:'unidades', carreras:'carreras', usuarios:'usuarios', equipos:'equipos', prestamos:'prestamos' };
    const t = map[table];
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${t}?id=eq.${id}`, { headers: _headers });
    const data = await res.json();
    return data && data[0] ? this._toCamel(table, data[0]) : null;
  },

  async insert(table, record) {
    const map = { unidades:'unidades', carreras:'carreras', usuarios:'usuarios', equipos:'equipos', prestamos:'prestamos' };
    const t = map[table];
    const body = this._toSnake(table, record);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${t}`, {
      method: 'POST', headers: _headers, body: JSON.stringify(body)
    });
    const data = await res.json();
    return data && data[0] ? this._toCamel(table, data[0]) : null;
  },

  async update(table, id, changes) {
    const map = { unidades:'unidades', carreras:'carreras', usuarios:'usuarios', equipos:'equipos', prestamos:'prestamos' };
    const t = map[table];
    const body = this._toSnake(table, changes);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${t}?id=eq.${id}`, {
      method: 'PATCH', headers: _headers, body: JSON.stringify(body)
    });
    const data = await res.json();
    return data && data[0] ? this._toCamel(table, data[0]) : null;
  },

  async delete(table, id) {
    const map = { unidades:'unidades', carreras:'carreras', usuarios:'usuarios', equipos:'equipos', prestamos:'prestamos' };
    const t = map[table];
    await fetch(`${SUPABASE_URL}/rest/v1/${t}?id=eq.${id}`, {
      method: 'DELETE', headers: _headers
    });
    return true;
  },

  async stats() {
    const [unidades, usuarios, equipos, prestamos] = await Promise.all([
      this.getAll('unidades'), this.getAll('usuarios'),
      this.getAll('equipos'), this.getAll('prestamos')
    ]);
    return {
      totalUnidades:  unidades.length,
      totalUsuarios:  usuarios.length,
      totalEquipos:   equipos.length,
      totalPrestamos: prestamos.length,
      activos:    prestamos.filter(p => p.estado === 'activo').length,
      entregados: prestamos.filter(p => p.estado === 'entregado').length,
      vencidos:   prestamos.filter(p => p.estado === 'vencido').length,
    };
  },

  async nextFolio() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/prestamos?select=id&order=id.desc&limit=1`, { headers: _headers });
    const data = await res.json();
    const n = data && data[0] ? data[0].id + 1 : 1;
    return 'PRES-' + String(n).padStart(4, '0');
  },

  // ── Mapeo snake_case ↔ camelCase ────────────────
  _toCamel(table, r) {
    if (!r) return r;
    const maps = {
      carreras:  { unidad_id: 'unidadId' },
      usuarios:  { carrera_id: 'carreraId' },
      prestamos: {
        usuario_id: 'usuarioId', equipo_id: 'equipoId',
        fecha_prestamo: 'fechaPrestamo', hora_prestamo: 'horaPrestamo',
        fecha_devolucion: 'fechaDevolucion', hora_devolucion: 'horaDevolucion',
        fecha_entrega: 'fechaEntrega', hora_entrega: 'horaEntrega',
      }
    };
    const m = maps[table] || {};
    const out = {};
    for (const [k, v] of Object.entries(r)) {
      out[m[k] || k] = v;
    }
    return out;
  },

  _toSnake(table, r) {
    if (!r) return r;
    const maps = {
      carreras:  { unidadId: 'unidad_id' },
      usuarios:  { carreraId: 'carrera_id' },
      prestamos: {
        usuarioId: 'usuario_id', equipoId: 'equipo_id',
        fechaPrestamo: 'fecha_prestamo', horaPrestamo: 'hora_prestamo',
        fechaDevolucion: 'fecha_devolucion', horaDevolucion: 'hora_devolucion',
        fechaEntrega: 'fecha_entrega', horaEntrega: 'hora_entrega',
      }
    };
    const m = maps[table] || {};
    const out = {};
    for (const [k, v] of Object.entries(r)) {
      out[m[k] || k] = v;
    }
    return out;
  }
};
