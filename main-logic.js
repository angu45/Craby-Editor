/* --- 1. CORE VARIABLES --- */
window.saveHistory = (id, content) => localStorage.setItem(`craby_code_${id}`, content);

/* --- 2. SHUTTERS --- */
window.toggleLeftSidebar = () => {
    const sb = document.getElementById('leftSidebar');
    const shutter = document.getElementById('shutterBtn');
    sb.classList.toggle('open');
    shutter.classList.toggle('active');
    shutter.querySelector('i').className = sb.classList.contains('open') ? 'fas fa-chevron-left' : 'fas fa-chevron-right';
};

window.toggleSettings = () => document.getElementById('settingsPanel').classList.toggle('open');

/* --- 3. DYNAMIC WINDOWS & AUTO-HEIGHT --- */
window.addFileToUI = function(name, id, content = "") {
    const wrapper = document.getElementById('editor-wrapper');
    const fileList = document.getElementById('file-list');
    if(!wrapper || document.getElementById(`box-${id}`)) return;

    // Pro Look Sidebar Item
    const item = document.createElement('div');
    item.className = 'file-item';
    item.id = `tab-${id}`;
    item.innerHTML = `<i class="fas fa-file-code"></i> <span>${name}</span>`;
    item.onclick = () => window.restoreBox(id); // Clicking here restores the file
    fileList.appendChild(item);

    // Editor Box
    const newBox = document.createElement('div');
    newBox.className = 'editor-box';
    newBox.id = `box-${id}`;
    newBox.innerHTML = `
        <div class="label">
            <span>${name.toUpperCase()}</span>
            <div class="box-controls">
                <button onclick="minimizeBox('${id}')" title="Minimize"><i class="fas fa-minus"></i></button>
                <button onclick="toggleFullscreen('${id}')" title="Fullscreen"><i class="fas fa-expand-arrows-alt"></i></button>
                <button onclick="deleteFile('${id}')" title="Delete"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>
        <textarea id="${id}-code" spellcheck="false" oninput="saveHistory('${id}', this.value)">${content}</textarea>
        <button class="exit-full-btn" id="exit-${id}" onclick="toggleFullscreen('${id}')" style="display:none;">EXIT</button>
    `;
    wrapper.appendChild(newBox);
    if(window.updateThemeAndFont) window.updateThemeAndFont();
};

/* --- 4. SMART CONTROLS --- */

// Minimize: Totally hide from screen
window.minimizeBox = (id) => {
    const box = document.getElementById(`box-${id}`);
    if(box) box.style.display = 'none';
};

// Restore: Bring back to screen from Shutter
window.restoreBox = (id) => {
    const box = document.getElementById(`box-${id}`);
    if(box) {
        box.style.display = 'flex'; // Bring back
        box.scrollIntoView({ behavior: 'smooth' });
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
    const box = document.getElementById(`box-${id}`);
    box.classList.toggle('fullscreen-mode');
    document.getElementById(`exit-${id}`).style.display = box.classList.contains('fullscreen-mode') ? 'block' : 'none';
};

/* --- 5. RUN & INIT --- */
window.runCode = () => {
    document.getElementById('preview-overlay').style.display = 'flex';
    const h = document.getElementById('html-code')?.value || '';
    const c = `<style>${document.getElementById('css-code')?.value || ''}</style>`;
    const j = `<script>${document.getElementById('js-code')?.value || ''}<\/script>`;
    const out = document.getElementById('output').contentWindow.document;
    out.open(); out.write(h + c + j); out.close();
};

window.closePreview = () => document.getElementById('preview-overlay').style.display = 'none';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('editor-wrapper').innerHTML = '';
    document.getElementById('file-list').innerHTML = '';
    const getCode = (k, def) => localStorage.getItem(`craby_code_${k}`) || def;

    window.addFileToUI("index.html", "html", getCode('html', "<h1>Craby Smart Layout</h1>"));
    window.addFileToUI("style.css", "css", getCode('css', "h1 { color: #ffb400; }"));
    window.addFileToUI("main.js", "js", getCode('js', "console.log('Smart Height Active');"));
});
