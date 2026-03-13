/* --- 1. CORE VARIABLES & STORAGE --- */
window.saveHistory = (id, content) => localStorage.setItem(`craby_code_${id}`, content);

/* --- 2. SHUTTERS (LEFT & RIGHT) --- */
window.toggleLeftSidebar = () => {
    const sb = document.getElementById('leftSidebar');
    const shutter = document.getElementById('shutterBtn');
    sb.classList.toggle('open');
    shutter.classList.toggle('active');
    shutter.querySelector('i').className = sb.classList.contains('open') ? 'fas fa-chevron-left' : 'fas fa-chevron-right';
};

window.toggleSettings = () => {
    const panel = document.getElementById('settingsPanel');
    panel.classList.toggle('open');
};

/* --- 3. DYNAMIC STACKED WINDOWS --- */
window.addFileToUI = function(name, id, content = "") {
    const wrapper = document.getElementById('editor-wrapper');
    const fileList = document.getElementById('file-list');
    if(!wrapper || document.getElementById(`box-${id}`)) return;

    // Sidebar Item
    const item = document.createElement('div');
    item.className = 'file-item';
    item.id = `tab-${id}`;
    item.innerHTML = `<i class="fas fa-file-code"></i> ${name}`;
    item.onclick = () => document.getElementById(`box-${id}`).scrollIntoView({ behavior: 'smooth' });
    fileList.appendChild(item);

    // Stacked Editor Box
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
        <button class="exit-full-btn" id="exit-${id}" onclick="toggleFullscreen('${id}')" style="display:none;">EXIT</button>
    `;
    wrapper.appendChild(newBox);
    if(window.updateThemeAndFont) window.updateThemeAndFont();
};

window.createNewFile = () => {
    const name = prompt("File Name:");
    if(name) window.addFileToUI(name, name.replace(/[^a-z0-9]/gi, '-').toLowerCase(), "");
};

/* --- 4. WINDOW CONTROLS --- */
window.minimizeBox = (id) => {
    const el = document.getElementById(`${id}-code`);
    el.style.display = (el.style.display === 'none') ? 'block' : 'none';
};

window.deleteFile = (id) => {
    if(confirm(`Delete ${id}?`)) {
        document.getElementById(`box-${id}`).remove();
        document.getElementById(`tab-${id}`).remove();
        localStorage.removeItem(`craby_code_${id}`);
    }
};

window.toggleFullscreen = (id) => {
    const box = document.getElementById(`box-${id}`);
    box.classList.toggle('fullscreen-mode');
    document.getElementById(`exit-${id}`).style.display = box.classList.contains('fullscreen-mode') ? 'block' : 'none';
};

/* --- 5. RUN ENGINE --- */
window.runCode = () => {
    document.getElementById('preview-overlay').style.display = 'flex';
    const h = document.getElementById('html-code')?.value || '';
    const c = `<style>${document.getElementById('css-code')?.value || ''}</style>`;
    const j = `<script>${document.getElementById('js-code')?.value || ''}<\/script>`;
    const out = document.getElementById('output').contentWindow.document;
    out.open(); out.write(h + c + j); out.close();
};

window.closePreview = () => document.getElementById('preview-overlay').style.display = 'none';
window.setDevice = (m) => document.getElementById('wrapper').className = (m === 'mobile' ? 'iframe-wrapper mobile' : 'iframe-wrapper');

/* --- 6. INITIAL LOAD --- */
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('editor-wrapper').innerHTML = '';
    document.getElementById('file-list').innerHTML = '';

    const getCode = (k, def) => localStorage.getItem(`craby_code_${k}`) || def;

    window.addFileToUI("index.html", "html", getCode('html', "<h1>Craby Stack</h1>"));
    window.addFileToUI("style.css", "css", getCode('css', "h1 { color: orange; }"));
    window.addFileToUI("main.js", "js", getCode('js', "console.log('Started');"));
});
