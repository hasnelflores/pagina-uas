async function renderUnidades(container) {
  async function draw() {
    container.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text3)">Cargando...</div>`;
    const items = await DB.getAll('unidades');
    const rows = items.map(u => `
      <tr>
        <td><strong style="color:var(--text)">${u.nombre}</strong></td>
        <td><span class="badge badge-blue">${u.siglas}</span></td>
        <td>${u.ciudad || '—'}</td>
        <td>${u.activa ? '<span class="badge badge-green">Activa</span>' : '<span class="badge badge-gray">Inactiva</span>'}</td>
        <td><div class="td-actions">
          <button class="btn btn-ghost btn-sm" onclick="editUnidad(${u.id})">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="deleteUnidad(${u.id})">Eliminar</button>
        </div></td>
      </tr>`).join('') || `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">⬡</div><div class="empty-text">Sin unidades académicas</div></div></td></tr>`;

    container.innerHTML = `
      <div class="page-header">
        <div><div class="page-title">Unidades Académicas</div><div class="page-subtitle">${items.length} unidades registradas</div></div>
        <button class="btn btn-primary" onclick="newUnidad()">+ Nueva unidad</button>
      </div>
      <div class="page-body">
        <div class="table-wrapper">
          <table><thead><tr><th>Nombre</th><th>Siglas</th><th>Ciudad</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>${rows}</tbody></table>
        </div>
      </div>`;
  }

  function formHTML(u = {}) {
    return `
      <div class="form-group"><label class="form-label">Nombre completo *</label>
        <input id="f-nombre" class="form-input" value="${u.nombre||''}" placeholder="Ej. Facultad de Ingeniería Mochis"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Siglas *</label>
          <input id="f-siglas" class="form-input" value="${u.siglas||''}" placeholder="FIM" maxlength="10"></div>
        <div class="form-group"><label class="form-label">Ciudad</label>
          <input id="f-ciudad" class="form-input" value="${u.ciudad||''}" placeholder="Los Mochis"></div>
      </div>
      <div class="form-group"><label class="form-label">Estado</label>
        <select id="f-activa" class="form-select">
          <option value="1" ${u.activa!==false?'selected':''}>Activa</option>
          <option value="0" ${u.activa===false?'selected':''}>Inactiva</option>
        </select></div>
      <div class="form-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" id="modalSaveBtn">Guardar</button>
      </div>`;
  }

  window.newUnidad = () => {
    openModal('Nueva Unidad Académica', formHTML());
    document.getElementById('modalSaveBtn').onclick = async () => {
      const nombre = document.getElementById('f-nombre').value.trim();
      const siglas = document.getElementById('f-siglas').value.trim();
      if (!nombre || !siglas) { showToast('Completa los campos requeridos', 'error'); return; }
      await DB.insert('unidades', { nombre, siglas, ciudad: document.getElementById('f-ciudad').value.trim(), activa: document.getElementById('f-activa').value==='1' });
      closeModal(); await draw(); showToast('Unidad creada correctamente', 'success');
    };
  };

  window.editUnidad = async (id) => {
    const u = await DB.getById('unidades', id);
    openModal('Editar Unidad Académica', formHTML(u));
    document.getElementById('modalSaveBtn').onclick = async () => {
      const nombre = document.getElementById('f-nombre').value.trim();
      const siglas = document.getElementById('f-siglas').value.trim();
      if (!nombre || !siglas) { showToast('Completa los campos requeridos', 'error'); return; }
      await DB.update('unidades', id, { nombre, siglas, ciudad: document.getElementById('f-ciudad').value.trim(), activa: document.getElementById('f-activa').value==='1' });
      closeModal(); await draw(); showToast('Unidad actualizada', 'success');
    };
  };

  window.deleteUnidad = async (id) => {
    const u = await DB.getById('unidades', id);
    confirmDelete(`¿Eliminar la unidad <strong>${u.nombre}</strong>?`, async () => {
      await DB.delete('unidades', id); await draw(); showToast('Unidad eliminada', 'info');
    });
  };

  await draw();
}
