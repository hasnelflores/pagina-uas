function renderEquipos(container) {
  const categorias = ['Proyección', 'Cómputo', 'Redes', 'Aula', 'Multimedia', 'Otro'];

  function draw(q = '') {
    const items = DB.getAll('equipos').filter(e =>
      !q || e.nombre.toLowerCase().includes(q.toLowerCase()) || e.clave.toLowerCase().includes(q.toLowerCase())
    );

    const rows = items.map(e => {
      const pct = e.cantidad > 0 ? Math.round((e.disponibles / e.cantidad) * 100) : 0;
      const barColor = pct > 60 ? 'var(--green)' : pct > 30 ? 'var(--yellow)' : 'var(--red)';
      return `
        <tr>
          <td>
            <div style="font-weight:500;color:var(--text)">${e.nombre}</div>
            <div style="font-size:11px;font-family:monospace;color:var(--text3)">${e.clave}</div>
          </td>
          <td><span class="badge badge-blue">${e.categoria}</span></td>
          <td>
            <div style="display:flex;align-items:center;gap:8px">
              <div style="flex:1;max-width:80px;background:var(--bg3);border-radius:20px;height:5px">
                <div style="width:${pct}%;background:${barColor};height:5px;border-radius:20px;transition:width 0.3s"></div>
              </div>
              <span style="font-size:12px;color:var(--text2)">${e.disponibles}/${e.cantidad}</span>
            </div>
          </td>
          <td><span class="badge ${e.estado === 'bueno' ? 'badge-green' : e.estado === 'regular' ? 'badge-yellow' : 'badge-red'}">${e.estado}</span></td>
          <td>
            <div class="td-actions">
              <button class="btn btn-ghost btn-sm" onclick="editEquipo(${e.id})">Editar</button>
              <button class="btn btn-danger btn-sm" onclick="deleteEquipo(${e.id})">Eliminar</button>
            </div>
          </td>
        </tr>`;
    }).join('') || `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">▣</div><div class="empty-text">Sin equipos registrados</div></div></td></tr>`;

    container.innerHTML = `
      <div class="page-header">
        <div>
          <div class="page-title">Equipos</div>
          <div class="page-subtitle">Inventario de equipos disponibles para préstamo</div>
        </div>
        <button class="btn btn-primary" onclick="newEquipo()">+ Nuevo equipo</button>
      </div>
      <div class="page-body">
        <div class="table-wrapper">
          <div class="table-toolbar">
            <div class="table-toolbar-left">
              <span class="table-count">${DB.getAll('equipos').length} equipos</span>
            </div>
            <input class="search-input" placeholder="🔍 Buscar equipo o clave..." value="${q}"
              oninput="renderEquiposFilter(this.value)">
          </div>
          <table>
            <thead><tr><th>Nombre / Clave</th><th>Categoría</th><th>Disponibilidad</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;
  }

  window.renderEquiposFilter = (q) => draw(q);

  function catOptions(sel) {
    return categorias.map(c => `<option value="${c}" ${c === sel ? 'selected' : ''}>${c}</option>`).join('');
  }

  function formHTML(e = {}) {
    return `
      <div class="form-group">
        <label class="form-label">Nombre del equipo *</label>
        <input id="f-nombre" class="form-input" value="${e.nombre || ''}" placeholder="Ej. Proyector BenQ MW550">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Clave / Código *</label>
          <input id="f-clave" class="form-input" value="${e.clave || ''}" placeholder="PROY-001">
        </div>
        <div class="form-group">
          <label class="form-label">Categoría</label>
          <select id="f-categoria" class="form-select">${catOptions(e.categoria)}</select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Cantidad total *</label>
          <input id="f-cantidad" class="form-input" type="number" min="1" value="${e.cantidad || 1}">
        </div>
        <div class="form-group">
          <label class="form-label">Disponibles *</label>
          <input id="f-disponibles" class="form-input" type="number" min="0" value="${e.disponibles !== undefined ? e.disponibles : 1}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Estado del equipo</label>
        <select id="f-estado" class="form-select">
          <option value="bueno"   ${e.estado === 'bueno'   ? 'selected' : ''}>Bueno</option>
          <option value="regular" ${e.estado === 'regular' ? 'selected' : ''}>Regular</option>
          <option value="malo"    ${e.estado === 'malo'    ? 'selected' : ''}>Malo</option>
        </select>
      </div>
      <div class="form-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" id="modalSaveBtn">Guardar</button>
      </div>`;
  }

  function getData() {
    return {
      nombre:      document.getElementById('f-nombre').value.trim(),
      clave:       document.getElementById('f-clave').value.trim(),
      categoria:   document.getElementById('f-categoria').value,
      cantidad:    parseInt(document.getElementById('f-cantidad').value) || 1,
      disponibles: parseInt(document.getElementById('f-disponibles').value) || 0,
      estado:      document.getElementById('f-estado').value,
    };
  }

  window.newEquipo = () => {
    openModal('Nuevo Equipo', formHTML());
    document.getElementById('modalSaveBtn').onclick = () => {
      const d = getData();
      if (!d.nombre || !d.clave) { showToast('Completa los campos requeridos', 'error'); return; }
      DB.insert('equipos', d);
      closeModal(); draw(); showToast('Equipo registrado', 'success');
    };
  };

  window.editEquipo = (id) => {
    const e = DB.getById('equipos', id);
    openModal('Editar Equipo', formHTML(e));
    document.getElementById('modalSaveBtn').onclick = () => {
      const d = getData();
      if (!d.nombre || !d.clave) { showToast('Completa los campos requeridos', 'error'); return; }
      DB.update('equipos', id, d);
      closeModal(); draw(); showToast('Equipo actualizado', 'success');
    };
  };

  window.deleteEquipo = (id) => {
    const e = DB.getById('equipos', id);
    confirmDelete(`¿Eliminar el equipo <strong>${e.nombre}</strong>?`, () => {
      DB.delete('equipos', id); draw(); showToast('Equipo eliminado', 'info');
    });
  };

  draw();
}
