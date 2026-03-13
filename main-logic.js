// --- 1. DYNAMIC LAYOUT ENGINE (Divide Space) ---
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

// --- 2. FILE SYSTEM LOGIC ---
window.addFileToUI = (name, id, content = "") => {
    const wrapper = document.getElementById('editor-wrapper');
    const fileList = document.getElementById('file-list');
    
    // जर आधीच बॉक्स असेल तर परत बनवू नका
    if(!wrapper || document.getElementById(`box-${id}`)) return;

    // Sidebar Explorer Tab
    const item = document.createElement('div');
    item.className = 'file-item';
    item.id = `tab-${id}`;
    item.innerHTML = `<span><i class="fas fa-file-code"></i> ${name}</span> <small id="status-${id}" style="display:none; color:var(--accent)">(min)</small>`;
    item.onclick = () => window.restoreBox(id);
    if(fileList) fileList.appendChild(item);

    // Editor Box
    const newBox = document.createElement('div');
    newBox.className = 'editor-box';
    newBox.id = `box-${id}`;
    newBox.innerHTML = `
        <div class="label">
            <span>${name.toUpperCase()}</span>
            <div class="box-controls" style="display: flex; gap: 15px; align-items: center;"> 
                <i class="fas fa-minus" onclick="window.minimizeBox('${id}')" style="cursor:pointer; padding: 5px;"></i>
                <i class="fas fa-trash-alt" onclick="window.deleteBox('${id}')" style="cursor:pointer; color:#ff4d4d; padding: 5px;"></i>
            </div>
        </div>
        <textarea id="${id}-code" spellcheck="false" oninput="localStorage.setItem('craby_code_${id}', this.value)">${content}</textarea>
    `;
    
    wrapper.appendChild(newBox);
    if(window.updateThemeAndFont) window.updateThemeAndFont();
    window.updateLayout();
};

// --- 3. CONTROLS ---
window.minimizeBox = (id) => {
    document.getElementById(`box-${id}`).style.display = 'none';
    const status = document.getElementById(`status-${id}`);
    if(status) status.style.display = 'inline';
    window.updateLayout();
};

window.restoreBox = (id) => {
    const box = document.getElementById(`box-${id}`);
    if(box) {
        box.style.display = 'flex';
        const status = document.getElementById(`status-${id}`);
        if(status) status.style.display = 'none';
        window.updateLayout();
    }
};

window.deleteBox = (id) => {
    if(confirm(`Delete ${id}?`)) {
        const box = document.getElementById(`box-${id}`);
        const tab = document.getElementById(`tab-${id}`);
        if(box) box.remove();
        if(tab) tab.remove();
        localStorage.removeItem(`craby_code_${id}`);
        window.updateLayout();
    }
};

// --- 4. SHUTTER & SETTINGS ---
window.toggleLeftSidebar = () => {
    const sb = document.getElementById('leftSidebar');
    const shutter = document.getElementById('shutterBtn');
    sb.classList.toggle('open');
    shutter.classList.toggle('active');
};

window.toggleSettings = () => {
    document.getElementById('settingsPanel').classList.toggle('open');
};

// --- 5. INITIAL LOAD (फक्त २ फाईल्स - HTML आणि CSS) ---
window.onload = () => {
    const wrapper = document.getElementById('editor-wrapper');
    const fileList = document.getElementById('file-list');

    // जुना कचरा साफ करणे
    if(wrapper) wrapper.innerHTML = '';
    if(fileList) fileList.innerHTML = '';

    // १. HTML फाईल लोड करा
    const htmlCode = localStorage.getItem('craby_code_html') || "<h1>Craby Editor</h1>";
    window.addFileToUI("index.html", "html", htmlCode);

    // २. CSS फाईल लोड करा
    const cssCode = localStorage.getItem('craby_code_css') || "h1 { color: orange; }";
    window.addFileToUI("style.css", "css", cssCode);

    // ३. थीम आणि लेआउट अपडेट करा
    if(window.updateThemeAndFont) window.updateThemeAndFont();
    window.updateLayout();
};
