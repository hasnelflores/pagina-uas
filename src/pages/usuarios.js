function renderUsuarios(container) {
  function draw(q = '') {
    const items = DB.getAll('usuarios').filter(u =>
      !q || u.nombre.toLowerCase().includes(q.toLowerCase()) || u.matricula.toLowerCase().includes(q.toLowerCase())
    );
    const carreras = DB.getAll('carreras');
    const getCarrera = id => carreras.find(c => c.id === id);

    const rows = items.map(u => {
      const c = getCarrera(u.carreraId);
      return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:32px;height:32px;border-radius:50%;background:var(--bg3);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--accent);flex-shrink:0">
                ${u.nombre.charAt(0)}
              </div>
              <div>
                <div style="font-weight:500;color:var(--text)">${u.nombre}</div>
                <div style="font-size:11.5px;color:var(--text3)">${u.email}</div>
              </div>
            </div>
          </td>
          <td><span style="font-family:monospace;font-size:12px">${u.matricula}</span></td>
          <td><span class="badge ${u.tipo === 'profesor' ? 'badge-yellow' : 'badge-blue'}">${u.tipo}</span></td>
          <td>${c ? c.nombre : '—'}</td>
          <td>${u.activo ? '<span class="badge badge-green">Activo</span>' : '<span class="badge badge-gray">Inactivo</span>'}</td>
          <td>
            <div class="td-actions">
              <button class="btn btn-ghost btn-sm" onclick="editUsuario(${u.id})">Editar</button>
              <button class="btn btn-danger btn-sm" onclick="deleteUsuario(${u.id})">Eliminar</button>
            </div>
          </td>
        </tr>`;
    }).join('') || `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">◉</div><div class="empty-text">Sin usuarios registrados</div></div></td></tr>`;

    container.innerHTML = `
      <div class="page-header">
        <div>
          <div class="page-title">Usuarios</div>
          <div class="page-subtitle">Alumnos y profesores registrados</div>
        </div>
        <button class="btn btn-primary" onclick="newUsuario()">+ Nuevo usuario</button>
      </div>
      <div class="page-body">
        <div class="table-wrapper">
          <div class="table-toolbar">
            <div class="table-toolbar-left">
              <span class="table-count">${DB.getAll('usuarios').length} usuarios</span>
            </div>
            <input class="search-input" placeholder="🔍 Buscar usuario o matrícula..." value="${q}"
              oninput="renderUsuariosFilter(this.value)">
          </div>
          <table>
            <thead><tr><th>Nombre</th><th>Matrícula</th><th>Tipo</th><th>Carrera</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;
  }

  window.renderUsuariosFilter = (q) => draw(q);

  function carreraOptions(selectedId) {
    return DB.getAll('carreras').map(c =>
      `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${c.nombre}</option>`
    ).join('');
  }

  function formHTML(u = {}) {
    return `
      <div class="form-group">
        <label class="form-label">Nombre completo *</label>
        <input id="f-nombre" class="form-input" value="${u.nombre || ''}" placeholder="Nombre Apellido Apellido">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Matrícula / Num. empleado *</label>
          <input id="f-matricula" class="form-input" value="${u.matricula || ''}" placeholder="2021110001">
        </div>
        <div class="form-group">
          <label class="form-label">Tipo *</label>
          <select id="f-tipo" class="form-select">
            <option value="alumno" ${u.tipo === 'alumno' ? 'selected' : ''}>Alumno</option>
            <option value="profesor" ${u.tipo === 'profesor' ? 'selected' : ''}>Profesor</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Email</label>
        <input id="f-email" class="form-input" type="email" value="${u.email || ''}" placeholder="usuario@uas.edu.mx">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Carrera</label>
          <select id="f-carrera" class="form-select">${carreraOptions(u.carreraId)}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Estado</label>
          <select id="f-activo" class="form-select">
            <option value="1" ${u.activo !== false ? 'selected' : ''}>Activo</option>
            <option value="0" ${u.activo === false ? 'selected' : ''}>Inactivo</option>
          </select>
        </div>
      </div>
      <div class="form-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" id="modalSaveBtn">Guardar</button>
      </div>`;
  }

  window.newUsuario = () => {
    openModal('Nuevo Usuario', formHTML());
    document.getElementById('modalSaveBtn').onclick = () => {
      const nombre = document.getElementById('f-nombre').value.trim();
      const matricula = document.getElementById('f-matricula').value.trim();
      if (!nombre || !matricula) { showToast('Completa los campos requeridos', 'error'); return; }
      DB.insert('usuarios', {
        nombre, matricula,
        tipo: document.getElementById('f-tipo').value,
        email: document.getElementById('f-email').value.trim(),
        carreraId: parseInt(document.getElementById('f-carrera').value),
        activo: document.getElementById('f-activo').value === '1'
      });
      closeModal(); draw(); showToast('Usuario creado', 'success');
    };
  };

  window.editUsuario = (id) => {
    const u = DB.getById('usuarios', id);
    openModal('Editar Usuario', formHTML(u));
    document.getElementById('modalSaveBtn').onclick = () => {
      const nombre = document.getElementById('f-nombre').value.trim();
      const matricula = document.getElementById('f-matricula').value.trim();
      if (!nombre || !matricula) { showToast('Completa los campos requeridos', 'error'); return; }
      DB.update('usuarios', id, {
        nombre, matricula,
        tipo: document.getElementById('f-tipo').value,
        email: document.getElementById('f-email').value.trim(),
        carreraId: parseInt(document.getElementById('f-carrera').value),
        activo: document.getElementById('f-activo').value === '1'
      });
      closeModal(); draw(); showToast('Usuario actualizado', 'success');
    };
  };

  window.deleteUsuario = (id) => {
    const u = DB.getById('usuarios', id);
    confirmDelete(`¿Eliminar al usuario <strong>${u.nombre}</strong>?`, () => {
      DB.delete('usuarios', id); draw(); showToast('Usuario eliminado', 'info');
    });
  };

  draw();
}
