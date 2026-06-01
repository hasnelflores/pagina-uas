function renderDashboard(container) {
  const s = DB.stats();
  const prestamos = DB.getAll('prestamos');
  const usuarios  = DB.getAll('usuarios');
  const equipos   = DB.getAll('equipos');

  const recientes = [...prestamos].reverse().slice(0, 5).map(p => {
    const u = DB.getById('usuarios', p.usuarioId);
    const e = DB.getById('equipos', p.equipoId);
    const dotClass = p.estado === 'activo' ? 'green' : p.estado === 'vencido' ? 'red' : '';
    return `
      <div class="activity-item">
        <div class="activity-dot ${dotClass}"></div>
        <div class="activity-info">
          <div class="activity-title">${e ? e.nombre : '—'}</div>
          <div class="activity-meta">${u ? u.nombre : '—'} · ${fmtDate(p.fechaPrestamo)} ·
            <span class="badge ${p.estado === 'activo' ? 'badge-green' : p.estado === 'vencido' ? 'badge-red' : 'badge-gray'}">
              ${p.estado}
            </span>
          </div>
        </div>
        <div style="font-size:11px;color:var(--text3);font-weight:600">${p.folio}</div>
      </div>`;
  }).join('') || '<p style="color:var(--text3);font-size:13px;padding:8px 0">Sin préstamos registrados.</p>';

  const countByEquipo = {};
  prestamos.forEach(p => { countByEquipo[p.equipoId] = (countByEquipo[p.equipoId] || 0) + 1; });
  const topEquipos = equipos.map(e => ({ ...e, count: countByEquipo[e.id] || 0 }))
    .sort((a, b) => b.count - a.count).slice(0, 4);

  const topRows = topEquipos.map(e => `
    <div class="activity-item">
      <div style="flex:1">
        <div class="activity-title">${e.nombre}</div>
        <div class="activity-meta">${e.categoria}</div>
      </div>
      <div style="font-family:var(--font-head);font-size:20px;font-weight:800;color:var(--uas-azul)">${e.count}</div>
    </div>`).join('') || '<p style="color:var(--text3);font-size:13px;padding:8px 0">Sin datos.</p>';

  container.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Dashboard</div>
        <div class="page-subtitle">Resumen general del sistema de préstamos — FIM UAS</div>
      </div>
      <div style="font-size:12px;color:var(--text3);font-weight:600">
        ${new Date().toLocaleDateString('es-MX',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
      </div>
    </div>

    <div class="page-body">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🏛️</div>
          <div class="stat-value">${s.totalUnidades}</div>
          <div class="stat-label">Unidades Académicas</div>
        </div>
        <div class="stat-card green">
          <div class="stat-icon">💻</div>
          <div class="stat-value">${s.totalEquipos}</div>
          <div class="stat-label">Equipos registrados</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-value">${s.totalUsuarios}</div>
          <div class="stat-label">Usuarios</div>
        </div>
        <div class="stat-card yellow">
          <div class="stat-icon">📋</div>
          <div class="stat-value">${s.activos}</div>
          <div class="stat-label">Préstamos activos</div>
        </div>
        <div class="stat-card green">
          <div class="stat-icon">✅</div>
          <div class="stat-value">${s.entregados}</div>
          <div class="stat-label">Entregados</div>
        </div>
        <div class="stat-card ${s.vencidos > 0 ? 'red' : ''}">
          <div class="stat-icon">⚠️</div>
          <div class="stat-value">${s.vencidos}</div>
          <div class="stat-label">Vencidos</div>
        </div>
      </div>

      <div class="dash-grid">
        <div class="dash-card">
          <div class="dash-card-title">📋 Actividad reciente</div>
          ${recientes}
        </div>
        <div class="dash-card">
          <div class="dash-card-title">📊 Equipos más prestados</div>
          ${topRows}
        </div>
      </div>

      <div style="margin-top:18px;background:var(--uas-azul);border-radius:8px;padding:20px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;box-shadow:var(--shadow-md)">
        <div>
          <div style="font-family:var(--font-head);font-weight:800;font-size:15px;color:#fff;margin-bottom:3px">Accesos rápidos</div>
          <div style="font-size:12.5px;color:rgba(255,255,255,0.65)">Operaciones frecuentes del sistema</div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn" style="background:var(--uas-dorado);color:var(--uas-azul-dark);border-color:var(--uas-dorado);font-weight:700" onclick="navigate('prestamos')">📋 Nuevo préstamo</button>
          <button class="btn" style="background:rgba(255,255,255,0.12);color:#fff;border-color:rgba(255,255,255,0.25)" onclick="navigate('usuarios')">👤 Agregar usuario</button>
          <button class="btn" style="background:rgba(255,255,255,0.12);color:#fff;border-color:rgba(255,255,255,0.25)" onclick="navigate('reportes')">📊 Ver reportes</button>
        </div>
      </div>
    </div>`;
}
