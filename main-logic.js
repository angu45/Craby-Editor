/* CRABY EDITOR - MASTER LOGIC 
   Features: Shutter, Settings, Dynamic Layout, Download & Persistence
*/

// --- 1. CORE SETTINGS & THEMES ---
window.applySettings = () => {
    const font = localStorage.getItem('craby_font') || "'Plus Jakarta Sans', sans-serif";
    const theme = localStorage.getItem('craby_theme') || "dark";
    const fontSize = localStorage.getItem('craby_font_size') || "14px";

    document.documentElement.style.setProperty('--current-font', font);
    document.body.className = `theme-${theme}`;
    document.querySelectorAll('textarea').forEach(tx => tx.style.fontSize = fontSize);

    // Sync UI elements
    const fontEl = document.getElementById('font-select');
    const themeEl = document.getElementById('theme-select');
    const sizeEl = document.getElementById('size-select');
    if(fontEl) fontEl.value = font;
    if(themeEl) themeEl.value = theme;
    if(sizeEl) sizeEl.value = fontSize;
};

// --- 2. DYNAMIC LAYOUT ENGINE (Divide Screen) ---
window.updateLayout = () => {
    const wrapper = document.getElementById('editor-wrapper');
    if (!wrapper) return;
    
    const visibleBoxes = Array.from(wrapper.children).filter(box => box.style.display !== 'none');
    const count = visibleBoxes.length;

    if (count > 0) {
        const heightPercentage = 100 / count;
        visibleBoxes.forEach(box => {
            box.style.flex = `1 1 ${heightPercentage}%`;
            box.style.height = `${heightPercentage}%`;
        });
    }
};

// --- 3. WINDOW CONTROLS (Add, Minimize, Delete) ---
window.addFileToUI = (name, id, content = "") => {
    const wrapper = document.getElementById('editor-wrapper');
    const fileList = document.getElementById('file-list');
    if(!wrapper || document.getElementById(`box-${id}`)) return;

    // Sidebar Tab
    const item = document.createElement('div');
    item.className = 'file-item';
    item.id = `tab-${id}`;
    item.innerHTML = `<i class="fas fa-file-code"></i> <span>${name}</span>`;
    item.onclick = () => window.restoreBox(id);
    if(fileList) fileList.appendChild(item);

    // Editor Box
    const newBox = document.createElement('div');
    newBox.className = 'editor-box';
    newBox.id = `box-${id}`;
    newBox.innerHTML = `
        <div class="label">
            <span>${name.toUpperCase()}</span>
            <div class="box-controls">
                <button onclick="window.minimizeBox('${id}')"><i class="fas fa-minus"></i></button>
                <button onclick="window.deleteFile('${id}')"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>
        <textarea id="${id}-code" spellcheck="false" oninput="localStorage.setItem('craby_code_${id}', this.value)">${content}</textarea>`;
    
    wrapper.appendChild(newBox);
    window.applySettings();
    window.updateLayout();
};

window.minimizeBox = (id) => {
    const box = document.getElementById(`box-${id}`);
    if(box) box.style.display = 'none';
    window.updateLayout();
};

window.restoreBox = (id) => {
    const box = document.getElementById(`box-${id}`);
    if(box) {
        box.style.display = 'flex';
        window.updateLayout();
    }
};

window.deleteFile = (id) => {
    if(confirm(`Are you sure you want to delete ${id}?`)) {
        const box = document.getElementById(`box-${id}`);
        const tab = document.getElementById(`tab-${id}`);
        if(box) box.remove();
        if(tab) tab.remove();
        localStorage.removeItem(`craby_code_${id}`);
        window.updateLayout();
    }
};

// --- 4. SHUTTER & MENU LOGIC (As requested) ---
window.toggleLeftSidebar = () => {
    const sidebar = document.getElementById('leftSidebar');
    const shutter = document.getElementById('shutterBtn');
    if (sidebar && shutter) {
        sidebar.classList.toggle('open');
        shutter.classList.toggle('active');
    }
};

window.toggleSettings = () => {
    const settings = document.getElementById('settingsPanel');
    if (settings) settings.classList.toggle('open');
};

// Outside click to close
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('leftSidebar');
    const settings = document.getElementById('settingsPanel');
    const shutter = document.getElementById('shutterBtn');

    if (sidebar?.classList.contains('open') && !sidebar.contains(e.target) && !shutter.contains(e.target)) {
        window.toggleLeftSidebar();
    }
    if (settings?.classList.contains('open') && !settings.contains(e.target) && !e.target.closest('.icon-btn')) {
        window.toggleSettings();
    }
});

// --- 5. PREVIEW & DEVICE TOGGLE ---
window.runCode = () => {
    document.getElementById('preview-overlay').style.display = 'flex';
    const h = document.getElementById('html-code')?.value || '';
    const c = `<style>${document.getElementById('css-code')?.value || ''}</style>`;
    const j = `<script>${document.getElementById('js-code')?.value || ''}<\/script>`;
    
    const out = document.getElementById('output').contentWindow.document;
    out.open();
    out.write(h + c + j);
    out.close();
};

window.closePreview = () => document.getElementById('preview-overlay').style.display = 'none';

window.setPreviewMode = (mode) => {
    const iframe = document.getElementById('output');
    if(!iframe) return;
    iframe.style.width = (mode === 'mobile') ? '375px' : '100%';
    iframe.style.margin = 'auto';
};

// --- 6. DOWNLOAD FIX ---
window.downloadCode = () => {
    const h = document.getElementById('html-code')?.value || '';
    const c = document.getElementById('css-code')?.value || '';
    const j = document.getElementById('js-code')?.value || '';
    
    const full = `<!DOCTYPE html><html><head><style>${c}</style></head><body>${h}<script>${j}<\/script></body></html>`;
    const blob = new Blob([full], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "index.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

// --- 7. INITIALIZE ---
document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.getElementById('editor-wrapper');
    if(wrapper) wrapper.innerHTML = '';
    
    window.addFileToUI("index.html", "html", localStorage.getItem('craby_code_html') || "<h1>Ready</h1>");
    window.addFileToUI("style.css", "css", localStorage.getItem('craby_code_css') || "h1 { color: orange; }");
    window.addFileToUI("main.js", "js", localStorage.getItem('craby_code_js') || "");
    
    window.applySettings();
});
