// --- 1. SETTINGS & GLOBALS ---
window.onload = () => {
    const wrapper = document.getElementById('editor-wrapper');
    const fileList = document.getElementById('file-list');
    if(wrapper) wrapper.innerHTML = '';
    if(fileList) fileList.innerHTML = '';

    // Default 2 Files: HTML and CSS
    addFileToUI("index.html", "html", "<h1>Welcome to Craby</h1>");
    addFileToUI("style.css", "css", "h1 { color: orange; text-align: center; }");

    if(window.updateThemeAndFont) window.updateThemeAndFont();
    updateLayout();
};

// --- 2. DYNAMIC LAYOUT (Space Management) ---
function updateLayout() {
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
}

// --- 3. FILE SYSTEM (Add, New, Minimize, Delete) ---
function addFileToUI(name, id, content = "") {
    const wrapper = document.getElementById('editor-wrapper');
    const fileList = document.getElementById('file-list');
    if(!wrapper || document.getElementById(`box-${id}`)) return;

    // Sidebar Explorer Tab
    const item = document.createElement('div');
    item.className = 'file-item';
    item.id = `tab-${id}`;
    item.innerHTML = `<span><i class="fas fa-file-code"></i> ${name}</span>`;
    item.onclick = () => restoreBox(id);
    fileList.appendChild(item);

    // Editor Box Logic
    const newBox = document.createElement('div');
    newBox.className = 'editor-box';
    newBox.id = `box-${id}`;
    newBox.innerHTML = `
        <div class="label" style="display:flex; justify-content:space-between; align-items:center; padding:8px 15px;">
            <span>${name.toUpperCase()}</span>
            <div class="box-controls" style="display:flex; gap:18px; align-items:center;">
                <i class="fas fa-minus" onclick="minimizeBox('${id}')" title="Minimize" style="cursor:pointer;"></i>
                <i class="fas fa-expand" onclick="toggleFullscreen('${id}')" title="Fullscreen" style="cursor:pointer;"></i>
                <i class="fas fa-trash-alt" onclick="deleteBox('${id}')" title="Delete" style="cursor:pointer; color:#ff4d4d;"></i>
            </div>
        </div>
        <textarea id="${id}-code" spellcheck="false" oninput="localStorage.setItem('craby_save_${id}', this.value)">${content}</textarea>
    `;
    wrapper.appendChild(newBox);
    updateLayout();
}

// नवीन फाईल तयार करणे
function createNewFile() {
    const fileName = prompt("Enter file name (e.g. script.js):");
    if (fileName) {
        const id = fileName.split('.')[0].toLowerCase() + "_" + Date.now();
        addFileToUI(fileName, id, "");
        if(document.getElementById('leftSidebar').classList.contains('open')) toggleLeftSidebar();
    }
}

function minimizeBox(id) {
    document.getElementById(`box-${id}`).style.display = 'none';
    updateLayout();
}

function restoreBox(id) {
    const box = document.getElementById(`box-${id}`);
    if(box) {
        box.style.display = 'flex';
        updateLayout();
    }
}

function deleteBox(id) {
    const result = confirm(`तुम्हाला '${id}' फाईल कायमची (Permanently) डिलीट करायची आहे का?`);
    if(result) {
        document.getElementById(`box-${id}`).remove();
        document.getElementById(`tab-${id}`).remove();
        localStorage.removeItem(`craby_save_${id}`);
        updateLayout();
    }
}

// Fullscreen Logic
function toggleFullscreen(id) {
    const box = document.getElementById(`box-${id}`);
    box.classList.toggle('fullscreen-active');
    // CSS मध्ये .fullscreen-active साठी position: fixed; top:0; left:0; width:100%; height:100%; z-index:9999; असावा.
}

// --- 4. PREVIEW LOGIC (Desktop/Mobile) ---
function runCode() {
    document.getElementById('preview-overlay').style.display = 'flex';
    const h = document.querySelector('[id*="html-code"]')?.value || '';
    const c = `<style>${document.querySelector('[id*="css-code"]')?.value || ''}</style>`;
    const j = `<script>${document.querySelector('[id*="js-code"]')?.value || ''}<\/script>`;
    
    const out = document.getElementById('output').contentWindow.document;
    out.open();
    out.write(h + c + j);
    out.close();
}

function closePreview() {
    document.getElementById('preview-overlay').style.display = 'none';
}

function setDevice(mode) {
    const iframe = document.getElementById('output');
    if(mode === 'mobile') {
        iframe.style.width = '375px';
        iframe.style.margin = '20px auto';
        iframe.style.border = '10px solid #333';
        iframe.style.borderRadius = '20px';
    } else {
        iframe.style.width = '100%';
        iframe.style.margin = '0';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '0';
    }
}

// --- 5. SIDEBAR & DOWNLOAD ---
function toggleLeftSidebar() {
    const sb = document.getElementById('leftSidebar');
    const shutter = document.getElementById('shutterBtn');
    sb.classList.toggle('open');
    shutter.classList.toggle('active');
}

function toggleSettings() {
    document.getElementById('settingsPanel').classList.toggle('open');
}

function exportCode() {
    const h = document.querySelector('[id*="html-code"]')?.value || '';
    const blob = new Blob([h], {type: "text/html"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "index.html";
    a.click();
}
