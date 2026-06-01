// ─── UTILITIES ────────────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3000);
}

function openModal(title, bodyHTML, { onSave } = {}) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHTML;
  document.getElementById('modalOverlay').classList.add('open');
  if (onSave) {
    const saveBtn = document.getElementById('modalSaveBtn');
    if (saveBtn) saveBtn.onclick = onSave;
  }
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

function confirmDelete(msg, onConfirm) {
  const html = `
    <p style="color:var(--text2);margin-bottom:20px;">${msg}</p>
    <div class="form-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-danger" id="confirmDeleteBtn">Eliminar</button>
    </div>`;
  openModal('Confirmar eliminación', html);
  document.getElementById('confirmDeleteBtn').onclick = () => {
    onConfirm();
    closeModal();
  };
}

function fmtDate(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

// ─── ROUTER ───────────────────────────────────────────────────────────────
const pages = {
  dashboard: renderDashboard,
  unidades:  renderUnidades,
  carreras:  renderCarreras,
  usuarios:  renderUsuarios,
  equipos:   renderEquipos,
  prestamos: renderPrestamos,
  reportes:  renderReportes,
};

function navigate(page) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const link = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (link) link.classList.add('active');

  const container = document.getElementById('page-container');
  container.innerHTML = '';
  if (pages[page]) pages[page](container);
}

// ─── INIT ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Nav click
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      navigate(el.dataset.page);
    });
  });

  // Sidebar toggle
  document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
  });

  // Modal close
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });

  // Start on dashboard
  navigate('dashboard');
});
