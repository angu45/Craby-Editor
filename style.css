/* --- 1. SETTINGS & PERSISTENCE --- */
window.applySettings = () => {
    const font = localStorage.getItem('craby_font') || "'Plus Jakarta Sans', sans-serif";
    const theme = localStorage.getItem('craby_theme') || "dark";
    const fontSize = localStorage.getItem('craby_font_size') || "14px";

    document.documentElement.style.setProperty('--current-font', font);
    document.body.className = `theme-${theme}`;

    document.querySelectorAll('textarea').forEach(tx => {
        tx.style.fontSize = fontSize;
    });

    // Update Dropdowns
    if(document.getElementById('theme-select')) document.getElementById('theme-select').value = theme;
    if(document.getElementById('font-select')) document.getElementById('font-select').value = font;
    if(document.getElementById('size-select')) document.getElementById('size-select').value = fontSize;
};

window.changeSetting = (key, value) => {
    localStorage.setItem(key, value);
    window.applySettings();
};

window.resetAllSettings = () => {
    if(confirm("Reset all settings to default?")) {
        localStorage.clear(); // Clear all
        location.reload();    // Refresh to apply defaults
    }
};

/* --- 2. FILE MANAGEMENT --- */
window.addFileToUI = function(name, id, content = "") {
    const wrapper = document.getElementById('editor-wrapper');
    const fileList = document.getElementById('file-list');
    if(!wrapper || document.getElementById(`box-${id}`)) return;

    // Sidebar Tab
    const item = document.createElement('div');
    item.className = 'file-item';
    item.id = `tab-${id}`;
    item.innerHTML = `<i class="fas fa-file-code"></i> <span>${name}</span>`;
    item.onclick = () => window.restoreBox(id);
    fileList.appendChild(item);

    // Editor Box
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
        <textarea id="${id}-code" spellcheck="false" oninput="localStorage.setItem('craby_code_${id}', this.value)">${content}</textarea>
    `;
    wrapper.appendChild(newBox);
    window.applySettings();
};

window.restoreBox = (id) => {
    const box = document.getElementById(`box-${id}`);
    if(box) {
        box.style.display = 'flex';
        box.scrollIntoView({ behavior: 'smooth' });
    }
};

window.minimizeBox = (id) => document.getElementById(`box-${id}`).style.display = 'none';

window.deleteFile = (id) => {
    if(confirm(`Delete ${id}?`)) {
        document.getElementById(`box-${id}`).remove();
        document.getElementById(`tab-${id}`).remove();
        localStorage.removeItem(`craby_code_${id}`);
    }
};

/* --- 3. SHUTTERS & DOWNLOAD --- */
window.toggleLeftSidebar = () => {
    document.getElementById('leftSidebar').classList.toggle('open');
    document.getElementById('shutterBtn').classList.toggle('active');
};

window.toggleSettings = () => document.getElementById('settingsPanel').classList.toggle('open');

window.downloadCode = () => {
    const h = document.getElementById('html-code')?.value || '';
    const c = `<style>${document.getElementById('css-code')?.value || ''}</style>`;
    const j = `<script>${document.getElementById('js-code')?.value || ''}<\/script>`;
    const blob = new Blob([`<!DOCTYPE html><html><head>${c}</head><body>${h}${j}</body></html>`], {type: 'text/html'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'project.html'; a.click();
};

/* --- 4. INIT --- */
window.addEventListener('beforeunload', (e) => { e.preventDefault(); e.returnValue = ''; });

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('editor-wrapper').innerHTML = '';
    document.getElementById('file-list').innerHTML = '';

    window.addFileToUI("index.html", "html", localStorage.getItem('craby_code_html') || "<h1>Craby Stack</h1>");
    window.addFileToUI("style.css", "css", localStorage.getItem('craby_code_css') || "h1 { color: #ffb400; }");
    window.addFileToUI("main.js", "js", localStorage.getItem('craby_code_js') || "console.log('Ready');");
    
    window.applySettings();
});
