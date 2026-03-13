// --- 1. SHUTTER & FILE SYSTEM ---
window.toggleLeftSidebar = function() {
    const sb = document.getElementById('leftSidebar');
    const shutter = document.getElementById('shutterBtn');
    if(sb && shutter) {
        sb.classList.toggle('open');
        shutter.classList.toggle('active');
        const icon = shutter.querySelector('i');
        icon.className = sb.classList.contains('open') ? 'fas fa-chevron-left' : 'fas fa-chevron-right';
    }
};

window.addFileToUI = function(name, id, content = "") {
    const fileList = document.getElementById('file-list');
    const wrapper = document.getElementById('editor-wrapper');
    if(!fileList || !wrapper) return;

    const newTab = document.createElement('div');
    newTab.className = 'file-item';
    newTab.id = `tab-${id}`;
    newTab.innerHTML = `<span><i class="fas fa-file-code"></i> ${name}</span>`;
    newTab.onclick = () => {
        document.querySelectorAll('.editor-box').forEach(b => b.style.display = 'none');
        document.getElementById(`box-${id}`).style.display = 'flex';
    };
    fileList.appendChild(newTab);

    const newBox = document.createElement('div');
    newBox.className = 'editor-box';
    newBox.id = `box-${id}`;
    newBox.innerHTML = `
        <div class="label"><span>${name.toUpperCase()} <i class="fas fa-code"></i></span></div>
        <textarea id="${id}-code" spellcheck="false">${content}</textarea>
    `;
    wrapper.appendChild(newBox);
    if(window.updateThemeAndFont) window.updateThemeAndFont();
};

// --- 2. REGULAR FUNCTIONS (Run, Settings, Tools) ---
window.toggleSettings = function() {
    const panel = document.getElementById('settingsPanel');
    if(panel) panel.classList.toggle('open');
};

window.runCode = function() {
    const overlay = document.getElementById('preview-overlay');
    if(overlay) overlay.style.display = 'flex';
    
    const h = document.getElementById('html-code')?.value || '';
    const c = `<style>${document.getElementById('css-code')?.value || ''}</style>`;
    const j = `<script>${document.getElementById('js-code')?.value || ''}<\/script>`;
    
    const out = document.getElementById('output').contentWindow.document;
    out.open();
    out.write(h + c + j);
    out.close();
};

window.closePreview = function() { document.getElementById('preview-overlay').style.display = 'none'; };

window.setDevice = function(mode) {
    const wrapper = document.getElementById('wrapper');
    if(mode === 'mobile') wrapper.classList.add('mobile');
    else wrapper.classList.remove('mobile');
};

window.beautifyCode = function() {
    document.querySelectorAll('textarea').forEach(tx => {
        tx.value = tx.value.replace(/>\s+</g, '><').replace(/></g, '>\n<');
    });
};

// --- 3. INITIALIZATION ON LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('file-list').innerHTML = '';
    document.getElementById('editor-wrapper').innerHTML = '';

    if(window.addFileToUI) {
        window.addFileToUI("index.html", "html", "<!DOCTYPE html>\n<html>\n<body>\n  <h1>Craby Editor</h1>\n</body>\n</html>");
        window.addFileToUI("style.css", "css", "h1 { color: #ffb400; text-align: center; }");
    }

    document.getElementById('theme-sel').value = 'dark';
    document.getElementById('font-size-bar').value = 16;
    window.updateThemeAndFont();
});