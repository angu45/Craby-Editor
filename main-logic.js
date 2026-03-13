/* --- 1. HELPERS & STORAGE --- */
window.saveHistory = (id, content) => localStorage.setItem(`craby_code_${id}`, content);

/* --- 2. DYNAMIC WINDOWS & FILE MANAGEMENT --- */
window.addFileToUI = function(name, id, content = "") {
    const wrapper = document.getElementById('editor-wrapper');
    const fileList = document.getElementById('file-list');
    if(!wrapper || document.getElementById(`box-${id}`)) return;

    // Sidebar Explorer Item
    const item = document.createElement('div');
    item.className = 'file-item';
    item.id = `tab-${id}`;
    item.innerHTML = `<i class="fas fa-file-code"></i> <span>${name}</span>`;
    item.onclick = () => window.restoreBox(id);
    fileList.appendChild(item);

    // Main Editor Box
    const newBox = document.createElement('div');
    newBox.className = 'editor-box';
    newBox.id = `box-${id}`;
    newBox.innerHTML = `
        <div class="label">
            <span>${name.toUpperCase()}</span>
            <div class="box-controls">
                <button onclick="minimizeBox('${id}')"><i class="fas fa-minus"></i></button>
                <button onclick="toggleFullscreen('${id}')"><i class="fas fa-expand-arrows-alt"></i></button>
                <button onclick="deleteFile('${id}')"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>
        <textarea id="${id}-code" spellcheck="false" oninput="saveHistory('${id}', this.value)">${content}</textarea>
    `;
    wrapper.appendChild(newBox);
    if(window.updateThemeAndFont) window.updateThemeAndFont();
};

window.createNewFile = function() {
    let fileName = prompt("Enter file name (e.g. app.js):");
    if (fileName) {
        let fileId = fileName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        window.addFileToUI(fileName, fileId, "");
        window.restoreBox(fileId);
    }
};

/* --- 3. UI CONTROLS --- */
window.minimizeBox = (id) => {
    // Completely hide the box from screen
    document.getElementById(`box-${id}`).style.display = 'none';
};

window.restoreBox = (id) => {
    const box = document.getElementById(`box-${id}`);
    if(box) {
        box.style.display = 'flex';
        box.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

window.deleteFile = (id) => {
    if(confirm(`Delete ${id}?`)) {
        document.getElementById(`box-${id}`).remove();
        document.getElementById(`tab-${id}`).remove();
        localStorage.removeItem(`craby_code_${id}`);
    }
};

window.toggleFullscreen = (id) => {
    document.getElementById(`box-${id}`).classList.toggle('fullscreen-mode');
};

/* --- 4. SHUTTERS --- */
window.toggleLeftSidebar = () => {
    document.getElementById('leftSidebar').classList.toggle('open');
    document.getElementById('shutterBtn').classList.toggle('active');
};

window.toggleSettings = () => document.getElementById('settingsPanel').classList.toggle('open');

/* --- 5. RUN ENGINE (FULL SCREEN OUTPUT) --- */
window.runCode = () => {
    const overlay = document.getElementById('preview-overlay');
    overlay.style.display = 'flex';

    const h = document.getElementById('html-code')?.value || '';
    const c = `<style>${document.getElementById('css-code')?.value || ''}</style>`;
    const j = `<script>${document.getElementById('js-code')?.value || ''}<\/script>`;

    const out = document.getElementById('output').contentWindow.document;
    out.open();
    out.write(h + c + j);
    out.close();
};

window.closePreview = () => document.getElementById('preview-overlay').style.display = 'none';

window.setDevice = (mode) => {
    const wrap = document.querySelector('.iframe-wrapper');
    mode === 'mobile' ? wrap.classList.add('mobile') : wrap.classList.remove('mobile');
};

/* --- 6. INITIALIZATION --- */
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('editor-wrapper').innerHTML = '';
    document.getElementById('file-list').innerHTML = '';

    // Load Default Stack
    window.addFileToUI("index.html", "html", localStorage.getItem('craby_code_html') || "<h1>Craby Editor</h1>");
    window.addFileToUI("style.css", "css", localStorage.getItem('craby_code_css') || "h1 { color: orange; }");
    window.addFileToUI("main.js", "js", localStorage.getItem('craby_code_js') || "console.log('Ready');");
});
