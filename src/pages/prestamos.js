function renderPrestamos(container) {
  function draw(filtro = 'todos') {
    let items = DB.getAll('prestamos');
    if (filtro !== 'todos') items = items.filter(p => p.estado === filtro);
    items = [...items].reverse();

    const usuarios = DB.getAll('usuarios');
    const equipos  = DB.getAll('equipos');
    const getU = id => usuarios.find(u => u.id === id);
    const getE = id => equipos.find(e => e.id === id);

    const estadoBadge = {
      activo:    '<span class="badge badge-green">Activo</span>',
      entregado: '<span class="badge badge-gray">Entregado</span>',
      vencido:   '<span class="badge badge-red">Vencido</span>',
    };

    const rows = items.map(p => {
      const u = getU(p.usuarioId);
      const e = getE(p.equipoId);
      return `
        <tr>
          <td><span style="font-family:monospace;font-size:12px;color:var(--accent)">${p.folio}</span></td>
          <td>${u ? `<div style="color:var(--text);font-weight:500">${u.nombre}</div><div style="font-size:11px;color:var(--text3)">${u.matricula}</div>` : '—'}</td>
          <td>${e ? e.nombre : '—'}</td>
          <td>${fmtDate(p.fechaPrestamo)} <span style="color:var(--text3)">${p.horaPrestamo || ''}</span></td>
          <td>${fmtDate(p.fechaDevolucion)} <span style="color:var(--text3)">${p.horaDevolucion || ''}</span></td>
          <td>${estadoBadge[p.estado] || p.estado}</td>
          <td>
            <div class="td-actions">
              ${p.estado === 'activo' ? `<button class="btn btn-primary btn-sm" onclick="entregarPrestamo(${p.id})">Entregar</button>` : ''}
              <button class="btn btn-ghost btn-sm" onclick="verPrestamo(${p.id})">Ver</button>
              <button class="btn btn-danger btn-sm" onclick="deletePrestamo(${p.id})">✕</button>
            </div>
          </td>
        </tr>`;
    }).join('') || `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">⇄</div><div class="empty-text">Sin préstamos en esta categoría</div></div></td></tr>`;

    const tabs = ['todos','activo','entregado','vencido'].map(t => `
      <button class="btn ${filtro === t ? 'btn-primary' : 'btn-ghost'} btn-sm" onclick="renderPrestamosTab('${t}')">
        ${t.charAt(0).toUpperCase() + t.slice(1)}
      </button>`).join('');

    container.innerHTML = `
      <div class="page-header">
        <div>
          <div class="page-title">Préstamos</div>
          <div class="page-subtitle">Registro y control de préstamos de equipo</div>
        </div>
        <button class="btn btn-primary" onclick="newPrestamo()">⇄ Nuevo préstamo</button>
      </div>
      <div class="page-body">
        <div class="table-wrapper">
          <div class="table-toolbar">
            <div class="table-toolbar-left" style="gap:6px">${tabs}</div>
            <span style="font-size:12px;color:var(--text3)">${items.length} registros</span>
          </div>
          <table>
            <thead><tr><th>Folio</th><th>Usuario</th><th>Equipo</th><th>Préstamo</th><th>Devolución</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;
  }

  window.renderPrestamosTab = (t) => draw(t);

  // ── Helpers ────────────────────────────────────
  function usuarioOptions(sel) {
    return DB.getAll('usuarios').map(u =>
      `<option value="${u.id}" ${u.id === sel ? 'selected' : ''}>${u.nombre} (${u.matricula})</option>`
    ).join('');
  }

  function equipoOptions(sel) {
    return DB.getAll('equipos').filter(e => e.disponibles > 0 || e.id === sel).map(e =>
      `<option value="${e.id}" ${e.id === sel ? 'selected' : ''}>${e.nombre} [${e.disponibles} disp.]</option>`
    ).join('');
  }

  // ── New Prestamo ───────────────────────────────
  window.newPrestamo = () => {
    const today = todayISO();
    const html = `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Usuario *</label>
          <select id="f-usuario" class="form-select"><option value="">— Seleccionar —</option>${usuarioOptions()}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Equipo *</label>
          <select id="f-equipo" class="form-select"><option value="">— Seleccionar —</option>${equipoOptions()}</select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Cantidad</label>
        <input id="f-cantidad" class="form-input" type="number" min="1" value="1">
      </div>
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:14px;margin-bottom:14px">
        <div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:12px">Fecha de préstamo</div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Fecha *</label>
            <input id="f-fprestamo" class="form-input" type="date" value="${today}">
          </div>
          <div class="form-group">
            <label class="form-label">Hora</label>
            <input id="f-hprestamo" class="form-input" type="time" value="08:00">
          </div>
        </div>
      </div>
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:14px;margin-bottom:14px">
        <div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:12px">Fecha de devolución esperada</div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Fecha *</label>
            <input id="f-fdevolucion" class="form-input" type="date" value="${today}">
          </div>
          <div class="form-group">
            <label class="form-label">Hora</label>
            <input id="f-hdevolucion" class="form-input" type="time" value="14:00">
          </div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Observaciones</label>
        <textarea id="f-obs" class="form-textarea" placeholder="Notas adicionales..."></textarea>
      </div>
      <div class="form-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" id="modalSaveBtn">Registrar préstamo</button>
      </div>`;

    openModal('Nuevo Préstamo', html);
    document.getElementById('modalSaveBtn').onclick = () => {
      const usuarioId = parseInt(document.getElementById('f-usuario').value);
      const equipoId  = parseInt(document.getElementById('f-equipo').value);
      const fprestamo = document.getElementById('f-fprestamo').value;
      const fdev      = document.getElementById('f-fdevolucion').value;
      if (!usuarioId || !equipoId || !fprestamo || !fdev) { showToast('Completa todos los campos requeridos', 'error'); return; }

      const folio = DB.nextFolio();
      DB.insert('prestamos', {
        folio, usuarioId, equipoId,
        cantidad: parseInt(document.getElementById('f-cantidad').value) || 1,
        fechaPrestamo:    fprestamo,
        horaPrestamo:     document.getElementById('f-hprestamo').value,
        fechaDevolucion:  fdev,
        horaDevolucion:   document.getElementById('f-hdevolucion').value,
        fechaEntrega: null, horaEntrega: null,
        estado: 'activo',
        observaciones: document.getElementById('f-obs').value.trim()
      });

      // Descontar disponible
      const eq = DB.getById('equipos', equipoId);
      if (eq && eq.disponibles > 0) DB.update('equipos', equipoId, { disponibles: eq.disponibles - 1 });

      closeModal(); draw(); showToast(`Préstamo ${folio} registrado`, 'success');
    };
  };

  // ── Entregar ───────────────────────────────────
  window.entregarPrestamo = (id) => {
    const today = todayISO();
    const now   = new Date().toTimeString().slice(0,5);
    const html = `
      <p style="color:var(--text2);margin-bottom:16px">Registra la entrega del equipo.</p>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Fecha de entrega</label>
          <input id="f-fentrega" class="form-input" type="date" value="${today}">
        </div>
        <div class="form-group">
          <label class="form-label">Hora de entrega</label>
          <input id="f-hentrega" class="form-input" type="time" value="${now}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Observaciones de entrega</label>
        <textarea id="f-obs2" class="form-textarea" placeholder="Estado del equipo al entregar..."></textarea>
      </div>
      <div class="form-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" id="modalSaveBtn">Confirmar entrega</button>
      </div>`;

    openModal('Registrar Entrega', html);
    document.getElementById('modalSaveBtn').onclick = () => {
      const p = DB.getById('prestamos', id);
      DB.update('prestamos', id, {
        fechaEntrega: document.getElementById('f-fentrega').value,
        horaEntrega:  document.getElementById('f-hentrega').value,
        estado: 'entregado',
        observaciones: (p.observaciones || '') + ' | Entrega: ' + (document.getElementById('f-obs2').value.trim())
      });
      // Devolver disponibilidad
      const eq = DB.getById('equipos', p.equipoId);
      if (eq) DB.update('equipos', p.equipoId, { disponibles: eq.disponibles + (p.cantidad || 1) });

      closeModal(); draw(); showToast('Entrega registrada exitosamente', 'success');
    };
  };

  // ── Ver detalle ────────────────────────────────
  window.verPrestamo = (id) => {
    const p = DB.getById('prestamos', id);
    const u = DB.getById('usuarios', p.usuarioId);
    const e = DB.getById('equipos', p.equipoId);
    const c = u ? DB.getById('carreras', u.carreraId) : null;
    const html = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        ${field('Folio', `<span style="font-family:monospace;color:var(--accent)">${p.folio}</span>`)}
        ${field('Estado', `<span class="badge ${p.estado==='activo'?'badge-green':p.estado==='vencido'?'badge-red':'badge-gray'}">${p.estado}</span>`)}
        ${field('Usuario', u ? u.nombre : '—')}
        ${field('Matrícula', u ? u.matricula : '—')}
        ${field('Carrera', c ? c.nombre : '—')}
        ${field('Tipo', u ? u.tipo : '—')}
        ${field('Equipo', e ? e.nombre : '—')}
        ${field('Cantidad', p.cantidad || 1)}
        ${field('Préstamo', fmtDate(p.fechaPrestamo) + ' ' + (p.horaPrestamo || ''))}
        ${field('Dev. esperada', fmtDate(p.fechaDevolucion) + ' ' + (p.horaDevolucion || ''))}
        ${field('Entregado', p.fechaEntrega ? fmtDate(p.fechaEntrega) + ' ' + (p.horaEntrega || '') : '—')}
        ${field('Observaciones', p.observaciones || '—')}
      </div>
      <div class="form-footer"><button class="btn btn-ghost" onclick="closeModal()">Cerrar</button></div>`;
    openModal(`Préstamo ${p.folio}`, html);
  };

  function field(label, val) {
    return `<div><div style="font-size:11px;color:var(--text3);margin-bottom:3px;text-transform:uppercase;letter-spacing:.06em">${label}</div><div style="color:var(--text);font-size:13.5px">${val}</div></div>`;
  }

  // ── Delete ─────────────────────────────────────
  window.deletePrestamo = (id) => {
    const p = DB.getById('prestamos', id);
    confirmDelete(`¿Eliminar el préstamo <strong>${p.folio}</strong>?`, () => {
      if (p.estado === 'activo') {
        const eq = DB.getById('equipos', p.equipoId);
        if (eq) DB.update('equipos', p.equipoId, { disponibles: eq.disponibles + (p.cantidad || 1) });
      }
      DB.delete('prestamos', id); draw(); showToast('Préstamo eliminado', 'info');
    });
  };

  draw();
}
