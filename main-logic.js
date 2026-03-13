// --- 1. DYNAMIC LAYOUT (Divide Screen in 3 Parts) ---
window.updateLayout = () => {
    const wrapper = document.getElementById('editor-wrapper');
    const visibleBoxes = Array.from(wrapper.children).filter(box => box.style.display !== 'none');
    const count = visibleBoxes.length;

    if (count > 0) {
        const height = 100 / count;
        visibleBoxes.forEach(box => {
            box.style.flex = `1 1 ${height}%`;
            box.style.height = `${height}%`;
            box.style.borderBottom = "1px solid var(--border)";
        });
    }
};

// --- 2. IMPROVED CONTROLS WITH GAP ---
window.addFileToUI = (name, id, content = "") => {
    const wrapper = document.getElementById('editor-wrapper');
    const fileList = document.getElementById('file-list');
    
    if(!wrapper || document.getElementById(`box-${id}`)) return;

    // Sidebar Explorer
    const item = document.createElement('div');
    item.className = 'file-item';
    item.id = `tab-${id}`;
    item.innerHTML = `<span><i class="fas fa-file-code"></i> ${name}</span>`;
    item.onclick = () => window.restoreBox(id);
    if(fileList) fileList.appendChild(item);

    // Editor Box Logic
    const newBox = document.createElement('div');
    newBox.className = 'editor-box';
    newBox.id = `box-${id}`;
    newBox.innerHTML = `
        <div class="label" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 15px;">
            <span style="letter-spacing: 1px;">${name.toUpperCase()}</span>
            <div class="box-controls" style="display: flex; gap: 20px; font-size: 14px;">
                <i class="fas fa-minus" onclick="window.minimizeBox('${id}')" style="cursor:pointer; opacity: 0.7;"></i>
                <i class="fas fa-expand-arrows-alt" onclick="window.toggleFullscreen('${id}')" style="cursor:pointer; opacity: 0.7;"></i>
                <i class="fas fa-trash-alt" onclick="window.deleteBox('${id}')" style="cursor:pointer; color:#ff4d4d;"></i>
            </div>
        </div>
        <textarea id="${id}-code" spellcheck="false" oninput="localStorage.setItem('craby_code_${id}', this.value)" style="padding: 15px;">${content}</textarea>
    `;
    
    wrapper.appendChild(newBox);
    window.updateLayout();
};

// --- 3. INITIAL LOAD (फक्त खालचे ३ पेजेस - HTML, CSS, JS) ---
window.onload = () => {
    const wrapper = document.getElementById('editor-wrapper');
    const fileList = document.getElementById('file-list');

    // १. जुने सर्व डबे साफ करा (Remove extra pages)
    if(wrapper) wrapper.innerHTML = '';
    if(fileList) fileList.innerHTML = '';

    // २. नवीन ३ फाईल्स डिफाॅल्ट म्हणून ॲड करा
    const defaultHTML = localStorage.getItem('craby_code_html') || "<h1>Welcome to Craby</h1>";
    const defaultCSS = localStorage.getItem('craby_code_css') || "h1 { color: orange; }";
    const defaultJS = localStorage.getItem('craby_code_js') || "console.log('Craby Editor Live!');";

    window.addFileToUI("index.html", "html", defaultHTML);
    window.addFileToUI("style.css", "css", defaultCSS);
    window.addFileToUI("main.js", "js", defaultJS);

    // ३. लेआउट सेट करा
    if(window.updateThemeAndFont) window.updateThemeAndFont();
    window.updateLayout();
};
