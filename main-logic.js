/* CRABY EDITOR - MAIN LOGIC
   Features: Dynamic Layout, Shutter Management, File System, Fullscreen & Preview
*/

// --- 1. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // सुरुवातीला जुना डेटा साफ करून फक्त २ डिफॉल्ट फाईल्स लोड करणे
    const wrapper = document.getElementById('editor-wrapper');
    const fileList = document.getElementById('file-list');
    if(wrapper) wrapper.innerHTML = '';
    if(fileList) fileList.innerHTML = '';

    // डिफॉल्ट फाईल्स: index.html आणि style.css
    window.addFileToUI("index.html", "html", localStorage.getItem('craby_code_html') || "<h1>Welcome to Craby</h1>");
    window.addFileToUI("style.css", "css", localStorage.getItem('craby_code_css') || "h1 { color: orange; text-align: center; }");

    // थीम अप्लाय करणे (तुमच्या theme-settings.js मधील फंक्शन)
    if(window.updateThemeAndFont) window.updateThemeAndFont();
});

// --- 2. DYNAMIC LAYOUT ENGINE (Equal Space Occupancy) ---
window.updateLayout = () => {
    const wrapper = document.getElementById('editor-wrapper');
    const visibleBoxes = Array.from(wrapper.children).filter(box => box.style.display !== 'none' && !box.classList.contains('fullscreen-mode'));
    const count = visibleBoxes.length;

    if (count > 0) {
        const height = 100 / count;
        visibleBoxes.forEach(box => {
            box.style.flex = `1 1 ${height}%`;
            box.style.height = `${height}%`;
        });
    }
};

// --- 3. FILE SYSTEM (Add, New, Minimize, Delete) ---
window.createNewFile = () => {
    const fileName = prompt("Enter file name (e.g. script.js, about.html):");
    if (fileName && fileName.trim() !== "") {
        const id = fileName.replace('.', '-').toLowerCase() + "_" + Date.now();
        window.addFileToUI(fileName, id, "");
        window.toggleLeftSidebar(); // फाईल बनवल्यावर शटर बंद
    }
};

window.addFileToUI = (name, id, content = "") => {
    const wrapper = document.getElementById('editor-wrapper');
    const fileList = document.getElementById('file-list');
    
    if(!wrapper || document.getElementById(`box-${id}`)) return;

    // A. Shutter Explorer Tab
    const item = document.createElement('div');
    item.className = 'file-item';
    item.id = `tab-${id}`;
    item.innerHTML = `<span><i class="fas fa-file-code"></i> ${name}</span> <small id="status-${id}" style="display:none; color:var(--accent); font-size:10px;">(Hidden)</small>`;
    item.onclick = () => window.restoreBox(id);
    if(fileList) fileList.appendChild(item);

    // B. Editor Box Creation
    const newBox = document.createElement('div');
    newBox.className = 'editor-box';
    newBox.id = `box-${id}`;
    newBox.innerHTML = `
        <div class="label" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 15px;">
            <span style="letter-spacing: 1px;">${name.toUpperCase()}</span>
            <div class="box-controls" style="display: flex; gap: 18px; font-size: 14px;">
                <i class="fas fa-minus" onclick="window.minimizeBox('${id}')" title="Minimize" style="cursor:pointer;"></i>
                <i class="fas fa-expand" onclick="window.toggleFullscreen('${id}')" title="Fullscreen" style="cursor:pointer;"></i>
                <i class="fas fa-trash-alt" onclick="window.deleteFile('${id}')" title="Delete" style="cursor:pointer; color:#ff4d4d;"></i>
            </div>
        </div>
        <textarea id="${id}-code" spellcheck="false" oninput="window.saveHistory('${id}', this.value)">${content}</textarea>
        <button class="exit-full-btn" id="exit-${id}" onclick="window.toggleFullscreen('${id}')" style="display:none;">Exit Fullscreen</button>
    `;
    
    wrapper.appendChild(newBox);
    window.updateLayout();
};

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

window.deleteFile = (id) => {
    if(confirm(`⚠️ Warning: Are you sure you want to delete this file permanently?`)) {
        const box = document.getElementById(`box-${id}`);
        const tab = document.getElementById(`tab-${id}`);
        if(box) box.remove();
        if(tab) tab.remove();
        localStorage.removeItem(`craby_code_${id}`);
        window.updateLayout();
    }
};

// --- 4. FULLSCREEN LOGIC ---
window.toggleFullscreen = (id) => {
    const box = document.getElementById(`box-${id}`);
    const exitBtn = document.getElementById(`exit-${id}`);
    
    if (!box.classList.contains('fullscreen-mode')) {
        box.classList.add('fullscreen-mode');
        if(exitBtn) exitBtn.style.display = 'block';
    } else {
        box.classList.remove('fullscreen-mode');
        if(exitBtn) exitBtn.style.display = 'none';
    }
    window.updateLayout();
};

// --- 5. RUN, PREVIEW & DOWNLOAD ---
window.runCode = () => {
    const overlay = document.getElementById('preview-overlay');
    const iframe = document.getElementById('output');
    overlay.style.display = 'flex';

    // सर्व टेक्स्टएरिया मधून कोड गोळा करणे (Professional Bundle)
    const textareas = document.querySelectorAll('textarea');
    let html = "", css = "", js = "";

    textareas.forEach(tx => {
        if(tx.id.includes('html')) html += tx.value;
        else if(tx.id.includes('css')) css += tx.value;
        else if(tx.id.includes('js') || tx.id.includes('script')) js += tx.value;
    });

    const fullCode = `
        <!DOCTYPE html>
        <html>
        <head><style>${css}</style></head>
        <body>
            ${html}
            <script>${js}<\/script>
        </body>
        </html>`;

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(fullCode);
    doc.close();
};

window.closePreview = () => {
    document.getElementById('preview-overlay').style.display = 'none';
};

window.setDevice = (mode) => {
    const wrapper = document.querySelector('.iframe-wrapper');
    if(mode === 'mobile') {
        wrapper.style.width = '375px'; // Standard Mobile Width
        wrapper.style.height = '667px';
    } else {
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
    }
};

window.exportCode = () => {
    // सध्या उघडलेल्या HTML कोडला डाऊनलोड करणे
    const htmlCode = document.querySelector('textarea[id*="html"]')?.value || "";
    const blob = new Blob([htmlCode], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "index.html";
    a.click();
};

// --- 6. SHUTTER & UTILS ---
window.toggleLeftSidebar = () => {
    const sb = document.getElementById('leftSidebar');
    const shutter = document.getElementById('shutterBtn');
    sb.classList.toggle('open');
    shutter.classList.toggle('active');
};

window.toggleSettings = () => {
    document.getElementById('settingsPanel').classList.toggle('open');
};

window.saveHistory = (id, val) => {
    localStorage.setItem(`craby_code_${id}`, val);
};

window.resetAllSettings = () => {
    if(confirm("Reset all code and settings?")) {
        localStorage.clear();
        location.reload();
    }
};
