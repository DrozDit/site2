document.addEventListener('DOMContentLoaded', () => {
  window.app.ui.loadSavedCards();
  window.app.auth.init();
  window.app.search.init();

  document.getElementById('addTrackBtn')?.addEventListener('click', () => {
    window.app.search.openAddModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.app.ui.closeModal();
      window.app.search.closeAddModal();
      window.app.auth.closeLoginModal();
      window.app.auth.closeRegisterModal();
    }
  });
});