async function renderPrestamos(container) {
  async function draw(filtro='todos') {
    container.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text3)">Cargando...</div>`;
    let all = await DB.getAll('prestamos');
    let items = filtro==='todos' ? all : all.filter(p=>p.estado===filtro);
    items = [...items].reverse();
    const usuarios = await DB.getAll('usuarios');
    const equipos  = await DB.getAll('equipos');
    const getU = id => usuarios.find(u=>u.id===id);
    const getE = id => equipos.find(e=>e.id===id);

    const badge = { activo:'badge-green', entregado:'badge-gray', vencido:'badge-red' };
    const rows = items.map(p => {
      const u=getU(p.usuarioId), e=getE(p.equipoId);
      return `<tr>
        <td><span style="font-family:monospace;font-size:12px;color:var(--uas-azul);font-weight:700">${p.folio}</span></td>
        <td>${u?`<div style="color:var(--text);font-weight:500">${u.nombre}</div><div style="font-size:11px;color:var(--text3)">${u.matricula}</div>`:'—'}</td>
        <td>${e?e.nombre:'—'}</td>
        <td>${fmtDate(p.fechaPrestamo)} <span style="color:var(--text3)">${p.horaPrestamo||''}</span></td>
        <td>${fmtDate(p.fechaDevolucion)}</td>
        <td><span class="badge ${badge[p.estado]||'badge-gray'}">${p.estado}</span></td>
        <td><div class="td-actions">
          ${p.estado==='activo'?`<button class="btn btn-primary btn-sm" onclick="entregarPrestamo(${p.id})">Entregar</button>`:''}
          <button class="btn btn-ghost btn-sm" onclick="verPrestamo(${p.id})">Ver</button>
          <button class="btn btn-danger btn-sm" onclick="deletePrestamo(${p.id})">✕</button>
        </div></td>
      </tr>`;
    }).join('') || `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">⇄</div><div class="empty-text">Sin préstamos</div></div></td></tr>`;

    const tabs = ['todos','activo','entregado','vencido'].map(t=>`
      <button class="btn ${filtro===t?'btn-primary':'btn-ghost'} btn-sm" onclick="renderPrestamosTab('${t}')">${t.charAt(0).toUpperCase()+t.slice(1)}</button>`).join('');

    container.innerHTML = `
      <div class="page-header">
        <div><div class="page-title">Préstamos</div><div class="page-subtitle">Registro y control de préstamos</div></div>
        <button class="btn btn-primary" onclick="newPrestamo()">⇄ Nuevo préstamo</button>
      </div>
      <div class="page-body">
        <div class="table-wrapper">
          <div class="table-toolbar">
            <div class="table-toolbar-left" style="gap:6px">${tabs}</div>
            <span style="font-size:12px;color:var(--text3)">${items.length} registros</span>
          </div>
          <table><thead><tr><th>Folio</th><th>Usuario</th><th>Equipo</th><th>Préstamo</th><th>Devolución</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>${rows}</tbody></table>
        </div>
      </div>`;
  }

  window.renderPrestamosTab = (t) => draw(t);

  async function usuarioOptions() {
    const us = await DB.getAll('usuarios');
    return us.map(u=>`<option value="${u.id}">${u.nombre} (${u.matricula})</option>`).join('');
  }
  async function equipoOptions() {
    const es = await DB.getAll('equipos');
    return es.filter(e=>e.disponibles>0).map(e=>`<option value="${e.id}">${e.nombre} [${e.disponibles} disp.]</option>`).join('');
  }

  window.newPrestamo = async () => {
    const today = todayISO();
    const uOpts = await usuarioOptions();
    const eOpts = await equipoOptions();
    const html = `
      <div class="form-row">
        <div class="form-group"><label class="form-label">Usuario *</label>
          <select id="f-usuario" class="form-select"><option value="">— Seleccionar —</option>${uOpts}</select></div>
        <div class="form-group"><label class="form-label">Equipo *</label>
          <select id="f-equipo" class="form-select"><option value="">— Seleccionar —</option>${eOpts}</select></div>
      </div>
      <div class="form-group"><label class="form-label">Cantidad</label>
        <input id="f-cantidad" class="form-input" type="number" min="1" value="1"></div>
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:14px;margin-bottom:14px">
        <div style="font-size:11px;font-weight:700;color:var(--uas-azul);text-transform:uppercase;letter-spacing:.07em;margin-bottom:12px">Fecha de préstamo</div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Fecha *</label>
            <input id="f-fprestamo" class="form-input" type="date" value="${today}"></div>
          <div class="form-group"><label class="form-label">Hora</label>
            <input id="f-hprestamo" class="form-input" type="time" value="08:00"></div>
        </div>
      </div>
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:14px;margin-bottom:14px">
        <div style="font-size:11px;font-weight:700;color:var(--uas-azul);text-transform:uppercase;letter-spacing:.07em;margin-bottom:12px">Devolución esperada</div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Fecha *</label>
            <input id="f-fdevolucion" class="form-input" type="date" value="${today}"></div>
          <div class="form-group"><label class="form-label">Hora</label>
            <input id="f-hdevolucion" class="form-input" type="time" value="14:00"></div>
        </div>
      </div>
      <div class="form-group"><label class="form-label">Observaciones</label>
        <textarea id="f-obs" class="form-textarea" placeholder="Notas adicionales..."></textarea></div>
      <div class="form-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" id="modalSaveBtn">Registrar préstamo</button>
      </div>`;
    openModal('Nuevo Préstamo', html);
    document.getElementById('modalSaveBtn').onclick = async () => {
      const usuarioId = parseInt(document.getElementById('f-usuario').value);
      const equipoId  = parseInt(document.getElementById('f-equipo').value);
      const fprestamo = document.getElementById('f-fprestamo').value;
      const fdev      = document.getElementById('f-fdevolucion').value;
      if (!usuarioId||!equipoId||!fprestamo||!fdev) { showToast('Completa todos los campos','error'); return; }
      const folio = await DB.nextFolio();
      await DB.insert('prestamos', { folio, usuarioId, equipoId, cantidad: parseInt(document.getElementById('f-cantidad').value)||1, fechaPrestamo: fprestamo, horaPrestamo: document.getElementById('f-hprestamo').value, fechaDevolucion: fdev, horaDevolucion: document.getElementById('f-hdevolucion').value, fechaEntrega: null, horaEntrega: null, estado: 'activo', observaciones: document.getElementById('f-obs').value.trim() });
      const eq = await DB.getById('equipos', equipoId);
      if (eq && eq.disponibles>0) await DB.update('equipos', equipoId, { disponibles: eq.disponibles-1 });
      closeModal(); await draw(); showToast(`Préstamo ${folio} registrado`,'success');
    };
  };

  window.entregarPrestamo = async (id) => {
    const today = todayISO();
    const now = new Date().toTimeString().slice(0,5);
    const html = `
      <p style="color:var(--text2);margin-bottom:16px">Registra la entrega del equipo.</p>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Fecha de entrega</label>
          <input id="f-fentrega" class="form-input" type="date" value="${today}"></div>
        <div class="form-group"><label class="form-label">Hora de entrega</label>
          <input id="f-hentrega" class="form-input" type="time" value="${now}"></div>
      </div>
      <div class="form-group"><label class="form-label">Observaciones</label>
        <textarea id="f-obs2" class="form-textarea" placeholder="Estado del equipo al entregar..."></textarea></div>
      <div class="form-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" id="modalSaveBtn">Confirmar entrega</button>
      </div>`;
    openModal('Registrar Entrega', html);
    document.getElementById('modalSaveBtn').onclick = async () => {
      const p = await DB.getById('prestamos', id);
      await DB.update('prestamos', id, { fechaEntrega: document.getElementById('f-fentrega').value, horaEntrega: document.getElementById('f-hentrega').value, estado: 'entregado', observaciones: (p.observaciones||'') + ' | Entrega: ' + document.getElementById('f-obs2').value.trim() });
      const eq = await DB.getById('equipos', p.equipoId);
      if (eq) await DB.update('equipos', p.equipoId, { disponibles: eq.disponibles+(p.cantidad||1) });
      closeModal(); await draw(); showToast('Entrega registrada','success');
    };
  };

  window.verPrestamo = async (id) => {
    const p = await DB.getById('prestamos', id);
    const u = await DB.getById('usuarios', p.usuarioId);
    const e = await DB.getById('equipos', p.equipoId);
    const c = u ? await DB.getById('carreras', u.carreraId) : null;
    const f = (l,v) => `<div><div style="font-size:11px;color:var(--text3);margin-bottom:3px;text-transform:uppercase;letter-spacing:.06em">${l}</div><div style="color:var(--text);font-size:13.5px">${v}</div></div>`;
    const html = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        ${f('Folio',`<span style="font-family:monospace;color:var(--uas-azul);font-weight:700">${p.folio}</span>`)}
        ${f('Estado',`<span class="badge ${p.estado==='activo'?'badge-green':p.estado==='vencido'?'badge-red':'badge-gray'}">${p.estado}</span>`)}
        ${f('Usuario', u?u.nombre:'—')}${f('Matrícula', u?u.matricula:'—')}
        ${f('Carrera', c?c.nombre:'—')}${f('Tipo', u?u.tipo:'—')}
        ${f('Equipo', e?e.nombre:'—')}${f('Cantidad', p.cantidad||1)}
        ${f('Préstamo', fmtDate(p.fechaPrestamo)+' '+(p.horaPrestamo||''))}
        ${f('Dev. esperada', fmtDate(p.fechaDevolucion))}
        ${f('Entregado', p.fechaEntrega?fmtDate(p.fechaEntrega)+' '+(p.horaEntrega||''):'—')}
        ${f('Observaciones', p.observaciones||'—')}
      </div>
      <div class="form-footer"><button class="btn btn-ghost" onclick="closeModal()">Cerrar</button></div>`;
    openModal(`Préstamo ${p.folio}`, html);
  };

  window.deletePrestamo = async (id) => {
    const p = await DB.getById('prestamos', id);
    confirmDelete(`¿Eliminar el préstamo <strong>${p.folio}</strong>?`, async () => {
      if (p.estado==='activo') {
        const eq = await DB.getById('equipos', p.equipoId);
        if (eq) await DB.update('equipos', p.equipoId, { disponibles: eq.disponibles+(p.cantidad||1) });
      }
      await DB.delete('prestamos', id); await draw(); showToast('Préstamo eliminado','info');
    });
  };

  await draw();
}
