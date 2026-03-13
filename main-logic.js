/* ==========================================
   1. HISTORY & STORAGE
   ========================================== */
window.saveHistory = function(id, content) {
    localStorage.setItem(`craby_code_${id}`, content);
};

/* ==========================================
   2. WINDOW CONTROLS (Minimize, Fullscreen, Delete)
   ========================================== */

// Hides the editor box
window.minimizeBox = function(id) {
    const box = document.getElementById(`box-${id}`);
    if(box) box.style.display = 'none';
};

// Deletes the editor box after confirmation
window.deleteFile = function(id) {
    if(confirm(`Are you sure you want to delete ${id}?`)) {
        const box = document.getElementById(`box-${id}`);
        const tab = document.getElementById(`tab-${id}`);
        if(box) box.remove();
        if(tab) tab.remove();
        localStorage.removeItem(`craby_code_${id}`);
    }
};

// Toggles Fullscreen mode
window.toggleFullscreen = function(id) {
    const box = document.getElementById(`box-${id}`);
    const exitBtn = document.getElementById(`exit-${id}`);
    
    box.classList.toggle('fullscreen-mode');
    exitBtn.style.display = box.classList.contains('fullscreen-mode') ? 'block' : 'none';
};

// Restores box visibility from sidebar
window.restoreBox = function(id) {
    const target = document.getElementById(`box-${id}`);
    if(target) {
        // Optional: Hide other boxes if you want single-tab feel
        document.querySelectorAll('.editor-box').forEach(b => b.style.display = 'none');
        target.style.display = 'flex';
    }
};

/* ==========================================
   3. CORE ENGINE (Run & UI)
   ========================================== */

window.toggleLeftSidebar = function() {
    document.getElementById('leftSidebar').classList.toggle('open');
    document.getElementById('shutterBtn').classList.toggle('active');
};

window.runCode = function() {
    document.getElementById('preview-overlay').style.display = 'flex';
    const h = document.getElementById('html-code')?.value || '';
    const c = `<style>${document.getElementById('css-code')?.value || ''}</style>`;
    const out = document.getElementById('output').contentWindow.document;
    out.open();
    out.write(h + c);
    out.close();
};

window.closePreview = function() {
    document.getElementById('preview-overlay').style.display = 'none';
};

// Initial setup on load
document.addEventListener('DOMContentLoaded', () => {
    // Load saved data if exists
    if(localStorage.getItem('craby_code_html')) {
        document.getElementById('html-code').value = localStorage.getItem('craby_code_html');
    }
    if(localStorage.getItem('craby_code_css')) {
        document.getElementById('css-code').value = localStorage.getItem('craby_code_css');
    }
});
