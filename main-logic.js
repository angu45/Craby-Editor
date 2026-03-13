/* ==========================================
   1. GLOBAL STORAGE & HISTORY
   ========================================== */
window.saveHistory = function(id, content) {
    localStorage.setItem(`craby_code_${id}`, content);
};

/* ==========================================
   2. SHUTTER & SIDEBAR LOGIC (FIXED)
   ========================================== */
window.toggleLeftSidebar = function() {
    const sb = document.getElementById('leftSidebar');
    const shutter = document.getElementById('shutterBtn');
    
    // Toggle 'open' class for sidebar and 'active' for shutter
    if(sb && shutter) {
        sb.classList.toggle('open');
        shutter.classList.toggle('active');
        
        // Change icon based on state
        const icon = shutter.querySelector('i');
        if(sb.classList.contains('open')) {
            icon.className = 'fas fa-chevron-left';
        } else {
            icon.className = 'fas fa-chevron-right';
        }
    }
};

/* ==========================================
   3. DYNAMIC WINDOW GENERATION (STACKED)
   ========================================== */
window.addFileToUI = function(name, id, content = "") {
    const wrapper = document.getElementById('editor-wrapper');
    const fileList = document.getElementById('file-list');
    
    if(!wrapper || document.getElementById(`box-${id}`)) return;

    // 1. Add to Sidebar (Explorer)
    const item = document.createElement('div');
    item.className = 'file-item';
    item.id = `tab-${id}`;
    item.innerHTML = `<i class="fas fa-file-code"></i> ${name}`;
    item.onclick = () => {
        document.getElementById(`box-${id}`).scrollIntoView({ behavior: 'smooth' });
    };
    fileList.appendChild(item);

    // 2. Add Editor Box to Stack
    const newBox = document.createElement('div');
    newBox.className = 'editor-box';
    newBox.id = `box-${id}`;
    newBox.innerHTML = `
        <div class="label">
            <span>${name.toUpperCase()} <i class="fas fa-code" style="font-size:10px; opacity:0.5;"></i></span>
            <div class="box-controls">
                <button onclick="minimizeBox('${id}')"><i class="fas fa-minus"></i></button>
                <button onclick="toggleFullscreen('${id}')"><i class="fas fa-expand-arrows-alt"></i></button>
                <button onclick="deleteFile('${id}')"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>
        <textarea id="${id}-code" spellcheck="false" oninput="saveHistory('${id}', this.value)">${content}</textarea>
        <button class="exit-full-btn" id="exit-${id}" onclick="toggleFullscreen('${id}')" style="display:none;">EXIT FULLSCREEN</button>
    `;
    
    wrapper.appendChild(newBox);

    // Apply Theme and Font immediately to new window
    if(window.updateThemeAndFont) window.updateThemeAndFont();
};

window.createNewFile = function() {
    const name = prompt("Enter file name (e.g. script.js):");
    if(name) {
        const id = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        window.addFileToUI(name, id, "");
    }
};

/* ==========================================
   4. WINDOW ACTIONS (FIXED)
   ========================================== */
window.minimizeBox = function(id) {
    const area = document.getElementById(`${id}-code`);
    if(area) {
        area.style.display = (area.style.display === 'none') ? 'block' : 'none';
    }
};

window.deleteFile = function(id) {
    if(confirm(`Delete ${id}?`)) {
        const box = document.getElementById(`box-${id}`);
        const tab = document.getElementById(`tab-${id}`);
        if(box) box.remove();
        if(tab) tab.remove();
        localStorage.removeItem(`craby_code_${id}`);
    }
};

window.toggleFullscreen = function(id) {
    const box = document.getElementById(`box-${id}`);
    const exitBtn = document.getElementById(`exit-${id}`);
    if(box) {
        box.classList.toggle('fullscreen-mode');
        exitBtn.style.display = box.classList.contains('fullscreen-mode') ? 'block' : 'none';
    }
};

/* ==========================================
   5. CORE ENGINE (RUN CODE)
   ========================================== */
window.runCode = function() {
    const overlay = document.getElementById('preview-overlay');
    overlay.style.display = 'flex';
    
    // Get values from main 3 editors if they exist
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

window.toggleSettings = function() {
    document.getElementById('settingsPanel').classList.toggle('open');
};

/* ==========================================
   6. INITIALIZATION (DEFAULT SETUP)
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Clear UI Containers
    document.getElementById('editor-wrapper').innerHTML = '';
    document.getElementById('file-list').innerHTML = '';

    // 2. Load Defaults (HTML, CSS, JS)
    const defaultHTML = localStorage.getItem('craby_code_html') || "<h1>Craby Editor Stacked</h1>";
    const defaultCSS = localStorage.getItem('craby_code_css') || "h1 { color: #ffb400; text-align: center; margin-top: 50px; }";
    const defaultJS = localStorage.getItem('craby_code_js') || "console.log('Ready!');";

    window.addFileToUI("index.html", "html", defaultHTML);
    window.addFileToUI("style.css", "css", defaultCSS);
    window.addFileToUI("main.js", "js", defaultJS);

    // 3. Apply Theme
    if(window.updateThemeAndFont) window.updateThemeAndFont();
});
