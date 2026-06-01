function renderCarreras(container) {
  function draw(q = '') {
    const items = DB.getAll('carreras').filter(c =>
      !q || c.nombre.toLowerCase().includes(q.toLowerCase()) || c.clave.toLowerCase().includes(q.toLowerCase())
    );
    const unidades = DB.getAll('unidades');
    const getUnidad = id => unidades.find(u => u.id === id);

    const rows = items.map(c => {
      const u = getUnidad(c.unidadId);
      return `
        <tr>
          <td><strong style="color:var(--text)">${c.nombre}</strong></td>
          <td><span class="badge badge-blue">${c.clave}</span></td>
          <td>${u ? u.siglas : '—'}</td>
          <td>${c.activa ? '<span class="badge badge-green">Activa</span>' : '<span class="badge badge-gray">Inactiva</span>'}</td>
          <td>
            <div class="td-actions">
              <button class="btn btn-ghost btn-sm" onclick="editCarrera(${c.id})">Editar</button>
              <button class="btn btn-danger btn-sm" onclick="deleteCarrera(${c.id})">Eliminar</button>
            </div>
          </td>
        </tr>`;
    }).join('') || `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">◎</div><div class="empty-text">Sin carreras registradas</div></div></td></tr>`;

    container.innerHTML = `
      <div class="page-header">
        <div>
          <div class="page-title">Carreras</div>
          <div class="page-subtitle">${items.length} carrera${items.length !== 1 ? 's' : ''}</div>
        </div>
        <button class="btn btn-primary" onclick="newCarrera()">+ Nueva carrera</button>
      </div>
      <div class="page-body">
        <div class="table-wrapper">
          <div class="table-toolbar">
            <div class="table-toolbar-left">
              <span class="table-count">${DB.getAll('carreras').length} total</span>
            </div>
            <input class="search-input" placeholder="🔍 Buscar carrera..." value="${q}"
              oninput="renderCarrerasFilter(this.value)">
          </div>
          <table>
            <thead><tr><th>Nombre</th><th>Clave</th><th>Unidad</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;
  }

  window.renderCarrerasFilter = (q) => draw(q);

  function unidadOptions(selectedId) {
    return DB.getAll('unidades').map(u =>
      `<option value="${u.id}" ${u.id === selectedId ? 'selected' : ''}>${u.nombre}</option>`
    ).join('');
  }

  function formHTML(c = {}) {
    return `
      <div class="form-group">
        <label class="form-label">Nombre de la carrera *</label>
        <input id="f-nombre" class="form-input" value="${c.nombre || ''}" placeholder="Ej. Ingeniería Civil">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Clave *</label>
          <input id="f-clave" class="form-input" value="${c.clave || ''}" placeholder="IC" maxlength="10">
        </div>
        <div class="form-group">
          <label class="form-label">Estado</label>
          <select id="f-activa" class="form-select">
            <option value="1" ${c.activa !== false ? 'selected' : ''}>Activa</option>
            <option value="0" ${c.activa === false ? 'selected' : ''}>Inactiva</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Unidad académica *</label>
        <select id="f-unidad" class="form-select">${unidadOptions(c.unidadId)}</select>
      </div>
      <div class="form-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" id="modalSaveBtn">Guardar</button>
      </div>`;
  }

  window.newCarrera = () => {
    openModal('Nueva Carrera', formHTML());
    document.getElementById('modalSaveBtn').onclick = () => {
      const nombre = document.getElementById('f-nombre').value.trim();
      const clave  = document.getElementById('f-clave').value.trim();
      if (!nombre || !clave) { showToast('Completa los campos requeridos', 'error'); return; }
      DB.insert('carreras', {
        nombre, clave,
        unidadId: parseInt(document.getElementById('f-unidad').value),
        activa: document.getElementById('f-activa').value === '1'
      });
      closeModal(); draw(); showToast('Carrera creada', 'success');
    };
  };

  window.editCarrera = (id) => {
    const c = DB.getById('carreras', id);
    openModal('Editar Carrera', formHTML(c));
    document.getElementById('modalSaveBtn').onclick = () => {
      const nombre = document.getElementById('f-nombre').value.trim();
      const clave  = document.getElementById('f-clave').value.trim();
      if (!nombre || !clave) { showToast('Completa los campos requeridos', 'error'); return; }
      DB.update('carreras', id, {
        nombre, clave,
        unidadId: parseInt(document.getElementById('f-unidad').value),
        activa: document.getElementById('f-activa').value === '1'
      });
      closeModal(); draw(); showToast('Carrera actualizada', 'success');
    };
  };

  window.deleteCarrera = (id) => {
    const c = DB.getById('carreras', id);
    confirmDelete(`¿Eliminar la carrera <strong>${c.nombre}</strong>?`, () => {
      DB.delete('carreras', id); draw(); showToast('Carrera eliminada', 'info');
    });
  };

  draw();
}
