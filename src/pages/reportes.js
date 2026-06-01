function renderReportes(container) {
  function draw(filtros = {}) {
    const { porCarrera = '', porEquipo = '', porUsuario = '', porEstado = '', desde = '', hasta = '' } = filtros;

    let prestamos = DB.getAll('prestamos');
    const usuarios = DB.getAll('usuarios');
    const equipos  = DB.getAll('equipos');
    const carreras = DB.getAll('carreras');

    // Filtros
    if (porEstado)   prestamos = prestamos.filter(p => p.estado === porEstado);
    if (porEquipo)   prestamos = prestamos.filter(p => p.equipoId === parseInt(porEquipo));
    if (porUsuario)  prestamos = prestamos.filter(p => p.usuarioId === parseInt(porUsuario));
    if (porCarrera) {
      const uids = usuarios.filter(u => u.carreraId === parseInt(porCarrera)).map(u => u.id);
      prestamos = prestamos.filter(p => uids.includes(p.usuarioId));
    }
    if (desde) prestamos = prestamos.filter(p => p.fechaPrestamo >= desde);
    if (hasta) prestamos = prestamos.filter(p => p.fechaPrestamo <= hasta);

    const getU = id => usuarios.find(u => u.id === id);
    const getE = id => equipos.find(e => e.id === id);
    const getC = id => { const u = getU(id); return u ? carreras.find(c => c.id === u.carreraId) : null; };

    const estadoBadge = {
      activo:    '<span class="badge badge-green">Activo</span>',
      entregado: '<span class="badge badge-gray">Entregado</span>',
      vencido:   '<span class="badge badge-red">Vencido</span>',
    };

    const rows = [...prestamos].reverse().map(p => {
      const u = getU(p.usuarioId);
      const e = getE(p.equipoId);
      const c = getC(p.usuarioId);
      return `
        <tr>
          <td><span style="font-family:monospace;font-size:11.5px;color:var(--accent)">${p.folio}</span></td>
          <td>${u ? u.nombre : '—'}</td>
          <td>${u ? `<span class="badge ${u.tipo==='profesor'?'badge-yellow':'badge-blue'}">${u.tipo}</span>` : '—'}</td>
          <td>${c ? c.nombre : '—'}</td>
          <td>${e ? e.nombre : '—'}</td>
          <td>${fmtDate(p.fechaPrestamo)}</td>
          <td>${fmtDate(p.fechaDevolucion)}</td>
          <td>${p.fechaEntrega ? fmtDate(p.fechaEntrega) : '—'}</td>
          <td>${estadoBadge[p.estado] || p.estado}</td>
        </tr>`;
    }).join('') || `<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">≋</div><div class="empty-text">Sin resultados con los filtros seleccionados</div></div></td></tr>`;

    // Summary cards
    const activos    = prestamos.filter(p => p.estado === 'activo').length;
    const entregados = prestamos.filter(p => p.estado === 'entregado').length;
    const vencidos   = prestamos.filter(p => p.estado === 'vencido').length;

    const carreraOpts = carreras.map(c => `<option value="${c.id}" ${porCarrera == c.id ? 'selected' : ''}>${c.nombre}</option>`).join('');
    const equipoOpts  = equipos.map(e => `<option value="${e.id}" ${porEquipo == e.id ? 'selected' : ''}>${e.nombre}</option>`).join('');
    const usuarioOpts = usuarios.map(u => `<option value="${u.id}" ${porUsuario == u.id ? 'selected' : ''}>${u.nombre}</option>`).join('');

    container.innerHTML = `
      <div class="page-header">
        <div>
          <div class="page-title">Reportes</div>
          <div class="page-subtitle">Consulta y exporta el historial de préstamos</div>
        </div>
        <button class="btn btn-ghost" onclick="imprimirReporte()">⎙ Imprimir</button>
      </div>

      <div class="page-body">
        <!-- Filtros -->
        <div class="filter-bar">
          <div class="filter-group">
            <span class="filter-label">Por carrera</span>
            <select class="form-select" id="fr-carrera" style="min-width:160px">
              <option value="">Todas</option>${carreraOpts}
            </select>
          </div>
          <div class="filter-group">
            <span class="filter-label">Por equipo</span>
            <select class="form-select" id="fr-equipo" style="min-width:160px">
              <option value="">Todos</option>${equipoOpts}
            </select>
          </div>
          <div class="filter-group">
            <span class="filter-label">Por usuario</span>
            <select class="form-select" id="fr-usuario" style="min-width:160px">
              <option value="">Todos</option>${usuarioOpts}
            </select>
          </div>
          <div class="filter-group">
            <span class="filter-label">Estado</span>
            <select class="form-select" id="fr-estado">
              <option value="" ${!porEstado?'selected':''}>Todos</option>
              <option value="activo" ${porEstado==='activo'?'selected':''}>Activo</option>
              <option value="entregado" ${porEstado==='entregado'?'selected':''}>Entregado</option>
              <option value="vencido" ${porEstado==='vencido'?'selected':''}>Vencido</option>
            </select>
          </div>
          <div class="filter-group">
            <span class="filter-label">Desde</span>
            <input class="form-input" type="date" id="fr-desde" value="${desde}" style="min-width:130px">
          </div>
          <div class="filter-group">
            <span class="filter-label">Hasta</span>
            <input class="form-input" type="date" id="fr-hasta" value="${hasta}" style="min-width:130px">
          </div>
          <div class="filter-group" style="justify-content:flex-end">
            <button class="btn btn-primary" onclick="aplicarFiltros()">Filtrar</button>
            <button class="btn btn-ghost" onclick="renderReportes(document.getElementById('page-container'))">Limpiar</button>
          </div>
        </div>

        <!-- Summary -->
        <div class="stats-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:18px">
          <div class="stat-card">
            <div class="stat-value">${prestamos.length}</div>
            <div class="stat-label">Total filtrado</div>
          </div>
          <div class="stat-card green">
            <div class="stat-value">${activos}</div>
            <div class="stat-label">Activos</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${entregados}</div>
            <div class="stat-label">Entregados</div>
          </div>
          <div class="stat-card ${vencidos > 0 ? 'red' : ''}">
            <div class="stat-value">${vencidos}</div>
            <div class="stat-label">Vencidos</div>
          </div>
        </div>

        <!-- Table -->
        <div class="table-wrapper" id="reporte-tabla">
          <div class="table-toolbar">
            <span class="table-count">${prestamos.length} registros encontrados</span>
            <button class="btn btn-ghost btn-sm" onclick="exportCSV()">⬇ Exportar CSV</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Folio</th><th>Usuario</th><th>Tipo</th><th>Carrera</th>
                <th>Equipo</th><th>Préstamo</th><th>Dev. esperada</th><th>Entregado</th><th>Estado</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;

    // Set current filter values
    if (porCarrera) document.getElementById('fr-carrera').value = porCarrera;
    if (porEquipo)  document.getElementById('fr-equipo').value  = porEquipo;
    if (porUsuario) document.getElementById('fr-usuario').value = porUsuario;
  }

  window.aplicarFiltros = () => {
    draw({
      porCarrera: document.getElementById('fr-carrera').value,
      porEquipo:  document.getElementById('fr-equipo').value,
      porUsuario: document.getElementById('fr-usuario').value,
      porEstado:  document.getElementById('fr-estado').value,
      desde:      document.getElementById('fr-desde').value,
      hasta:      document.getElementById('fr-hasta').value,
    });
  };

  window.exportCSV = () => {
    const rows = document.querySelectorAll('#reporte-tabla table tr');
    const lines = [];
    rows.forEach(row => {
      const cols = [...row.querySelectorAll('th,td')].map(c => `"${c.innerText.replace(/"/g,'""')}"`);
      lines.push(cols.join(','));
    });
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `reporte_prestamos_${todayISO()}.csv`;
    a.click();
    showToast('CSV exportado correctamente', 'success');
  };

  window.imprimirReporte = () => {
    const tabla = document.getElementById('reporte-tabla');
    if (!tabla) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Reporte de Préstamos - SIPE UAS</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #111; }
        h2 { margin-bottom: 4px; }
        p { color: #666; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
        th { background: #f5f5f5; font-size: 11px; text-transform: uppercase; }
        .badge { background: #eee; padding: 2px 6px; border-radius: 10px; font-size: 10px; }
      </style></head>
      <body>
        <h2>SIPE — Reporte de Préstamos</h2>
        <p>Facultad de Ingeniería Mochis, UAS · Generado: ${new Date().toLocaleString('es-MX')}</p>
        ${tabla.querySelector('table').outerHTML}
      </body></html>`);
    win.document.close();
    win.print();
  };

  draw();
}
