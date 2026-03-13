/* ==========================================
   1. GLOBAL VARIABLES & HISTORY
   ========================================== */
let history = {}; 

window.saveHistory = function(id, content) {
    if (!history[id]) history[id] = { stack: [], pointer: -1 };
    const h = history[id];
    if (h.stack[h.pointer] !== content) {
        h.stack = h.stack.slice(0, h.pointer + 1);
        h.stack.push(content);
        h.pointer++;
    }
    localStorage.setItem(`craby_code_${id}`, content);
};

/* ==========================================
   2. FILE & SIDEBAR SYSTEM
   ========================================== */

window.toggleLeftSidebar = function() {
    const sb = document.getElementById('leftSidebar');
    const shutter = document.getElementById('shutterBtn');
    if(sb && shutter) {
        sb.classList.toggle('open');
        shutter.classList.toggle('active');
        const icon = shutter.querySelector('i');
        icon.className = sb.classList.contains('open') ? 'fas fa-chevron-left' : 'fas fa-chevron-right';
    }
};

window.addFileToUI = function(name, id, content = "") {
    const fileList = document.getElementById('file-list');
    const wrapper = document.getElementById('editor-wrapper');
    if(!fileList || !wrapper) return;

    // Sidebar Item
    const newTab = document.createElement('div');
    newTab.className = 'file-item';
    newTab.id = `tab-${id}`;
    newTab.innerHTML = `<span><i class="fas fa-file-code"></i> ${name}</span>`;
    newTab.onclick = () => window.restoreBox(id);
    fileList.appendChild(newTab);

    // Editor Box
    const newBox = document.createElement('div');
    newBox.className = 'editor-box';
    newBox.id = `box-${id}`;
    newBox.innerHTML = `
        <div class="label">
            <span>${name.toUpperCase()}</span>
            <div class="box-controls">
                <button onclick="minimizeBox('${id}')" title="Minimize"><i class="fas fa-minus"></i></button>
                <button onclick="toggleFullscreen('${id}')" title="Fullscreen"><i class="fas fa-expand"></i></button>
                <button onclick="deleteFile('${id}')" title="Delete" style="color:#ff4d4d;"><i class="fas fa-trash-can"></i></button>
            </div>
        </div>
        <textarea id="${id}-code" spellcheck="false" oninput="saveHistory('${id}', this.value)">${content}</textarea>
        <button class="exit-full-btn" id="exit-${id}" onclick="toggleFullscreen('${id}')">Exit Fullscreen</button>
    `;
    wrapper.appendChild(newBox);
    
    saveHistory(id, content);
    if(window.updateThemeAndFont) window.updateThemeAndFont();
};

window.createNewFile = function() {
    const name = prompt("Enter New File Name:");
    if(name) {
        const id = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        if(document.getElementById(`box-${id}`)) {
            alert("File already exists!");
            return;
        }
        window.addFileToUI(name, id, "");
        window.restoreBox(id); // Switch to new file immediately
    }
};

/* ==========================================
   3. WINDOW CONTROLS
   ========================================== */

window.minimizeBox = function(id) {
    document.getElementById(`box-${id}`).style.display = 'none';
};

window.restoreBox = function(id) {
    // Basic logic: Hide others, show this one
    document.querySelectorAll('.editor-box').forEach(b => {
        if(!b.classList.contains('fullscreen-mode')) b.style.display = 'none';
    });
    const target = document.getElementById(`box-${id}`);
    target.style.display = 'flex';
};

window.deleteFile = function(id) {
    if(confirm(`Delete ${id}?`)) {
        document.getElementById(`box-${id}`).remove();
        document.getElementById(`tab-${id}`).remove();
        localStorage.removeItem(`craby_code_${id}`);
    }
};

window.toggleFullscreen = function(id) {
    const box = document.getElementById(`box-${id}`);
    const exitBtn = document.getElementById(`exit-${id}`);
    
    // Explicitly toggle class only on button click
    box.classList.toggle('fullscreen-mode');
    exitBtn.style.display = box.classList.contains('fullscreen-mode') ? 'block' : 'none';
};

/* ==========================================
   4. CORE FUNCTIONS
   ========================================== */

window.runCode = function() {
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

window.closePreview = function() { document.getElementById('preview-overlay').style.display = 'none'; };

/* ==========================================
   5. INITIALIZATION
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('file-list').innerHTML = '';
    document.getElementById('editor-wrapper').innerHTML = '';
    
    const savedHTML = localStorage.getItem('craby_code_html') || "<h1>Craby Editor</h1>";
    const savedCSS = localStorage.getItem('craby_code_css') || "h1 { color: #ffb400; }";

    window.addFileToUI("index.html", "html", savedHTML);
    window.addFileToUI("style.css", "css", savedCSS);

    window.restoreBox('html'); // Show index by default

    if(window.updateThemeAndFont) window.updateThemeAndFont();
});
