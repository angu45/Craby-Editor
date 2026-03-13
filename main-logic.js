// --- 1. GLOBALS & DICTIONARY ---
const dictionary = {
    html: ['div', 'span', 'h1', 'p', 'a', 'img', 'button', 'ul', 'li', 'section', 'input', 'class', 'id'],
    css: ['color', 'background', 'font-size', 'margin', 'padding', 'display', 'flex', 'width', 'height'],
    js: ['console.log', 'function', 'const', 'let', 'document.getElementById', 'addEventListener']
};

// --- 2. DYNAMIC LAYOUT ENGINE ---
window.updateLayout = () => {
    const wrapper = document.getElementById('editor-wrapper');
    const visibleBoxes = Array.from(wrapper.children).filter(box => box.style.display !== 'none');
    const count = visibleBoxes.length;

    if (count > 0) {
        const height = 100 / count;
        visibleBoxes.forEach(box => {
            box.style.flex = `1 1 ${height}%`;
            box.style.height = `${height}%`;
        });
    }
};

// --- 3. FILE SYSTEM ACTIONS ---

// नवीन फाईल तयार करणे (Fix for New File Button)
window.createNewFile = () => {
    const fileName = prompt("Enter file name (e.g. script.js):");
    if (fileName) {
        const id = fileName.split('.')[0].toLowerCase() + "_" + Date.now();
        window.addFileToUI(fileName, id, "");
        if(document.getElementById('leftSidebar').classList.contains('open')) {
            window.toggleLeftSidebar();
        }
    }
};

window.addFileToUI = (name, id, content = "") => {
    const wrapper = document.getElementById('editor-wrapper');
    const fileList = document.getElementById('file-list');
    
    if(!wrapper || document.getElementById(`box-${id}`)) return;

    // Sidebar Tab
    const item = document.createElement('div');
    item.className = 'file-item';
    item.id = `tab-${id}`;
    item.innerHTML = `<span><i class="fas fa-file-code"></i> ${name}</span> <small id="status-${id}" style="display:none; color:var(--accent)">(min)</small>`;
    item.onclick = () => window.restoreBox(id);
    if(fileList) fileList.appendChild(item);

    // Editor Box with Gap in Controls
    const newBox = document.createElement('div');
    newBox.className = 'editor-box';
    newBox.id = `box-${id}`;
    newBox.innerHTML = `
        <div class="label" style="display:flex; justify-content:space-between; align-items:center; padding:8px 15px;">
            <span>${name.toUpperCase()}</span>
            <div class="box-controls" style="display:flex; gap:20px;"> 
                <i class="fas fa-minus" onclick="window.minimizeBox('${id}')" style="cursor:pointer;"></i>
                <i class="fas fa-trash-alt" onclick="window.deleteBox('${id}')" style="cursor:pointer; color:#ff4d4d;"></i>
            </div>
        </div>
        <textarea id="${id}-code" spellcheck="false" oninput="localStorage.setItem('craby_save_${id}', this.value)">${content}</textarea>
    `;
    
    wrapper.appendChild(newBox);
    if(window.updateThemeAndFont) window.updateThemeAndFont();
    window.updateLayout();
};

window.minimizeBox = (id) => {
    document.getElementById(`box-${id}`).style.display = 'none';
    document.getElementById(`status-${id}`).style.display = 'inline';
    window.updateLayout();
};

window.restoreBox = (id) => {
    document.getElementById(`box-${id}`).style.display = 'flex';
    document.getElementById(`status-${id}`).style.display = 'none';
    window.updateLayout();
};

window.deleteBox = (id) => {
    if(confirm(`Delete ${id}?`)) {
        document.getElementById(`box-${id}`).remove();
        document.getElementById(`tab-${id}`).remove();
        localStorage.removeItem(`craby_save_${id}`);
        window.updateLayout();
    }
};

// --- 4. TOOLBAR LOGIC (Run & Download) ---

window.runCode = () => {
    const overlay = document.getElementById('preview-overlay');
    if(overlay) overlay.style.display = 'flex';
    
    const h = document.querySelector('[id*="html-code"]')?.value || '';
    const c = `<style>${document.querySelector('[id*="css-code"]')?.value || ''}</style>`;
    const j = `<script>${document.querySelector('[id*="js-code"]')?.value || ''}<\/script>`;
    
    const out = document.getElementById('output').contentWindow.document;
    out.open();
    out.write(h + c + j);
    out.close();
};

window.exportCode = () => {
    const h = document.querySelector('[id*="html-code"]')?.value || '';
    const blob = new Blob([h], {type: "text/html"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "index.html";
    a.click();
};

// --- 5. SIDEBAR SLIDE LOGIC ---
window.toggleLeftSidebar = () => {
    const sb = document.getElementById('leftSidebar');
    sb.classList.toggle('open');
    const icon = document.querySelector('#shutterBtn i');
    icon.className = sb.classList.contains('open') ? 'fas fa-chevron-left' : 'fas fa-chevron-right';
};

window.toggleSettings = () => {
    document.getElementById('settingsPanel').classList.toggle('open');
};

// --- 6. INITIAL LOAD (Default 2 Files Only) ---
window.onload = () => {
    const wrapper = document.getElementById('editor-wrapper');
    const fileList = document.getElementById('file-list');
    if(wrapper) wrapper.innerHTML = '';
    if(fileList) fileList.innerHTML = '';

    // १. HTML Default
    window.addFileToUI("index.html", "html", "<h1>Welcome to Craby</h1>");
    
    // २. CSS Default
    window.addFileToUI("style.css", "css", "h1 { color: orange; text-align: center; }");

    if(window.updateThemeAndFont) window.updateThemeAndFont();
    window.updateLayout();
};
