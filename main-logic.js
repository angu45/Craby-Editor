/* ==========================================
   1. GLOBAL VARIABLES & HISTORY MANAGEMENT
   ========================================== */
let history = {}; 

/**
 * Saves current textarea content to history stack and LocalStorage
 * @param {string} id - The unique ID of the file
 * @param {string} content - Current content of the textarea
 */
window.saveHistory = function(id, content) {
    if (!history[id]) history[id] = { stack: [], pointer: -1 };
    const h = history[id];
    
    // Push to stack only if content is different from the last state
    if (h.stack[h.pointer] !== content) {
        h.stack = h.stack.slice(0, h.pointer + 1);
        h.stack.push(content);
        h.pointer++;
    }
    // Save to LocalStorage for persistence
    localStorage.setItem(`craby_code_${id}`, content);
};

window.undo = function(id) {
    const h = history[id];
    if (h && h.pointer > 0) {
        h.pointer--;
        const area = document.getElementById(`${id}-code`);
        area.value = h.stack[h.pointer];
    }
};

window.redo = function(id) {
    const h = history[id];
    if (h && h.pointer < h.stack.length - 1) {
        h.pointer++;
        const area = document.getElementById(`${id}-code`);
        area.value = h.stack[h.pointer];
    }
};

/* ==========================================
   2. SHUTTER & SIDEBAR SYSTEM
   ========================================== */

window.toggleLeftSidebar = function() {
    const sb = document.getElementById('leftSidebar');
    const shutter = document.getElementById('shutterBtn');
    if(sb && shutter) {
        sb.classList.toggle('open');
        shutter.classList.toggle('active');
        const icon = shutter.querySelector('i');
        // Toggle icon between left and right chevron
        icon.className = sb.classList.contains('open') ? 'fas fa-chevron-left' : 'fas fa-chevron-right';
    }
};

/**
 * Dynamically creates a new file entry in Explorer and Editor wrapper
 */
window.addFileToUI = function(name, id, content = "") {
    const fileList = document.getElementById('file-list');
    const wrapper = document.getElementById('editor-wrapper');
    if(!fileList || !wrapper) return;

    // Create Explorer (Sidebar) Item
    const newTab = document.createElement('div');
    newTab.className = 'file-item';
    newTab.id = `tab-${id}`;
    newTab.innerHTML = `<span><i class="fas fa-file-code"></i> ${name}</span>`;
    newTab.onclick = () => window.restoreBox(id);
    fileList.appendChild(newTab);

    // Create Editor Box with Control Buttons
    const newBox = document.createElement('div');
    newBox.className = 'editor-box';
    newBox.id = `box-${id}`;
    newBox.innerHTML = `
        <div class="label">
            <span>${name.toUpperCase()}</span>
            <div class="box-controls">
                <button onclick="undo('${id}')" title="Undo"><i class="fas fa-undo"></i></button>
                <button onclick="redo('${id}')" title="Redo"><i class="fas fa-redo"></i></button>
                <button onclick="toggleFullscreen('${id}')" title="Fullscreen"><i class="fas fa-expand"></i></button>
                <button onclick="minimizeBox('${id}')" title="Minimize"><i class="fas fa-minus"></i></button>
                <button onclick="deleteFile('${id}')" title="Delete" style="color:#ff4d4d;"><i class="fas fa-trash"></i></button>
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
    const name = prompt("Enter file name (e.g. script.js):");
    if(name) {
        const id = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        if(document.getElementById(`box-${id}`)) {
            alert("File already exists!");
            return;
        }
        window.addFileToUI(name, id, "");
    }
};

/* ==========================================
   3. BOX CONTROLS (Minimize, Fullscreen, Delete)
   ========================================= */

window.minimizeBox = function(id) {
    document.getElementById(`box-${id}`).style.display = 'none';
};

window.restoreBox = function(id) {
    // Show selected box and hide others
    document.querySelectorAll('.editor-box').forEach(b => b.style.display = 'none');
    document.getElementById(`box-${id}`).style.display = 'flex';
};

window.deleteFile = function(id) {
    if(confirm(`Are you sure you want to delete '${id}'?`)) {
        document.getElementById(`box-${id}`).remove();
        document.getElementById(`tab-${id}`).remove();
        localStorage.removeItem(`craby_code_${id}`);
    }
};

window.toggleFullscreen = function(id) {
    const box = document.getElementById(`box-${id}`);
    const exitBtn = document.getElementById(`exit-${id}`);
    box.classList.toggle('fullscreen-mode');
    
    // Toggle Exit Button visibility
    exitBtn.style.display = box.classList.contains('fullscreen-mode') ? 'block' : 'none';
};

/* ==========================================
   4. CORE ENGINE (Run & Tools)
   ========================================== */

window.toggleSettings = function() {
    const panel = document.getElementById('settingsPanel');
    if(panel) panel.classList.toggle('open');
};

window.runCode = function() {
    const overlay = document.getElementById('preview-overlay');
    if(overlay) overlay.style.display = 'flex';
    
    // Consolidate code from all primary textareas
    const h = document.getElementById('html-code')?.value || '';
    const c = `<style>${document.getElementById('css-code')?.value || ''}</style>`;
    const j = `<script>${document.getElementById('js-code')?.value || ''}<\/script>`;
    
    const out = document.getElementById('output').contentWindow.document;
    out.open();
    out.write(h + c + j);
    out.close();
};

window.closePreview = function() { 
    document.getElementById('preview-overlay').style.display = 'none'; 
};

window.beautifyCode = function() {
    document.querySelectorAll('textarea').forEach(tx => {
        let val = tx.value;
        // Simple regex based beautification
        tx.value = val.replace(/>\s+</g, '><').replace(/></g, '>\n<');
    });
};

/* ==========================================
   5. INITIALIZATION
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Clear static entries if any
    document.getElementById('file-list').innerHTML = '';
    document.getElementById('editor-wrapper').innerHTML = '';
    
    // Retrieve data from LocalStorage or use defaults
    const savedHTML = localStorage.getItem('craby_code_html') || "<h1>Welcome to Craby Editor</h1>";
    const savedCSS = localStorage.getItem('craby_code_css') || "h1 { color: #ffb400; text-align: center; }";

    // Load default files
    window.addFileToUI("index.html", "html", savedHTML);
    window.addFileToUI("style.css", "css", savedCSS);

    // Set initial view to HTML
    window.restoreBox('html');

    // Initialize Theme settings
    if(window.updateThemeAndFont) {
        document.getElementById('theme-sel').value = 'dark';
        document.getElementById('font-size-bar').value = 16;
        window.updateThemeAndFont();
    }
});
