async function renderCarreras(container) {
  async function draw(q='') {
    container.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text3)">Cargando...</div>`;
    const all = await DB.getAll('carreras');
    const unidades = await DB.getAll('unidades');
    const items = all.filter(c => !q || c.nombre.toLowerCase().includes(q.toLowerCase()) || c.clave.toLowerCase().includes(q.toLowerCase()));
    const getU = id => unidades.find(u => u.id === id);

    const rows = items.map(c => {
      const u = getU(c.unidadId);
      return `<tr>
        <td><strong style="color:var(--text)">${c.nombre}</strong></td>
        <td><span class="badge badge-blue">${c.clave}</span></td>
        <td>${u ? u.siglas : '—'}</td>
        <td>${c.activa ? '<span class="badge badge-green">Activa</span>' : '<span class="badge badge-gray">Inactiva</span>'}</td>
        <td><div class="td-actions">
          <button class="btn btn-ghost btn-sm" onclick="editCarrera(${c.id})">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="deleteCarrera(${c.id})">Eliminar</button>
        </div></td>
      </tr>`;
    }).join('') || `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">◎</div><div class="empty-text">Sin carreras</div></div></td></tr>`;

    container.innerHTML = `
      <div class="page-header">
        <div><div class="page-title">Carreras</div><div class="page-subtitle">${all.length} carreras registradas</div></div>
        <button class="btn btn-primary" onclick="newCarrera()">+ Nueva carrera</button>
      </div>
      <div class="page-body">
        <div class="table-wrapper">
          <div class="table-toolbar">
            <span class="table-count">${all.length} total</span>
            <input class="search-input" placeholder="🔍 Buscar carrera..." value="${q}" oninput="renderCarrerasFilter(this.value)">
          </div>
          <table><thead><tr><th>Nombre</th><th>Clave</th><th>Unidad</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>${rows}</tbody></table>
        </div>
      </div>`;
  }

  window.renderCarrerasFilter = (q) => draw(q);

  async function unidadOptions(selectedId) {
    const uns = await DB.getAll('unidades');
    return uns.map(u => `<option value="${u.id}" ${u.id===selectedId?'selected':''}>${u.nombre}</option>`).join('');
  }

  async function formHTML(c={}) {
    const opts = await unidadOptions(c.unidadId);
    return `
      <div class="form-group"><label class="form-label">Nombre *</label>
        <input id="f-nombre" class="form-input" value="${c.nombre||''}" placeholder="Ej. Ingeniería Civil"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Clave *</label>
          <input id="f-clave" class="form-input" value="${c.clave||''}" placeholder="IC" maxlength="10"></div>
        <div class="form-group"><label class="form-label">Estado</label>
          <select id="f-activa" class="form-select">
            <option value="1" ${c.activa!==false?'selected':''}>Activa</option>
            <option value="0" ${c.activa===false?'selected':''}>Inactiva</option>
          </select></div>
      </div>
      <div class="form-group"><label class="form-label">Unidad académica *</label>
        <select id="f-unidad" class="form-select">${opts}</select></div>
      <div class="form-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" id="modalSaveBtn">Guardar</button>
      </div>`;
  }

  window.newCarrera = async () => {
    openModal('Nueva Carrera', await formHTML());
    document.getElementById('modalSaveBtn').onclick = async () => {
      const nombre = document.getElementById('f-nombre').value.trim();
      const clave  = document.getElementById('f-clave').value.trim();
      if (!nombre || !clave) { showToast('Completa los campos requeridos','error'); return; }
      await DB.insert('carreras', { nombre, clave, unidadId: parseInt(document.getElementById('f-unidad').value), activa: document.getElementById('f-activa').value==='1' });
      closeModal(); await draw(); showToast('Carrera creada','success');
    };
  };

  window.editCarrera = async (id) => {
    const c = await DB.getById('carreras', id);
    openModal('Editar Carrera', await formHTML(c));
    document.getElementById('modalSaveBtn').onclick = async () => {
      const nombre = document.getElementById('f-nombre').value.trim();
      const clave  = document.getElementById('f-clave').value.trim();
      if (!nombre || !clave) { showToast('Completa los campos requeridos','error'); return; }
      await DB.update('carreras', id, { nombre, clave, unidadId: parseInt(document.getElementById('f-unidad').value), activa: document.getElementById('f-activa').value==='1' });
      closeModal(); await draw(); showToast('Carrera actualizada','success');
    };
  };

  window.deleteCarrera = async (id) => {
    const c = await DB.getById('carreras', id);
    confirmDelete(`¿Eliminar la carrera <strong>${c.nombre}</strong>?`, async () => {
      await DB.delete('carreras', id); await draw(); showToast('Carrera eliminada','info');
    });
  };

  await draw();
}
