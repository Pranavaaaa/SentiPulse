
// Open method selector
document.getElementById('start-btn').addEventListener('click', () => {
  document.getElementById('method-selection').classList.remove('hidden');
});

// When a method is picked...
document.querySelectorAll('.method-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const method = btn.getAttribute('data-method');
    document.getElementById('model-input').value = method;

    // Hide method chooser
    document.getElementById('method-selection').classList.add('hidden');

    // Show upload modal
    const uploadModal = document.getElementById('upload-modal');
    uploadModal.classList.remove('hidden');

    // Clicking outside the modal closes it
    uploadModal.addEventListener('click', e => {
      if (e.target === uploadModal) {
        uploadModal.classList.add('hidden');
      }
    });
  });
});

// Dark mode toggle remains unchanged
const toggle = document.getElementById('theme-toggle');
toggle.addEventListener('change', () => {
  document.body.classList.toggle('dark', toggle.checked);
});
