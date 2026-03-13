/* --- 1. SETTINGS MANAGEMENT (Persistent) --- */
window.applySettings = () => {
    // 1. Get from LocalStorage or use Defaults
    const font = localStorage.getItem('craby_font') || "'Plus Jakarta Sans', sans-serif";
    const theme = localStorage.getItem('craby_theme') || "dark";
    const fontSize = localStorage.getItem('craby_font_size') || "14px";

    // 2. Apply Font & Theme to Body
    document.documentElement.style.setProperty('--current-font', font);
    document.body.className = `theme-${theme}`;

    // 3. Apply Font Size to all Textareas
    document.querySelectorAll('textarea').forEach(tx => {
        tx.style.fontSize = fontSize;
    });

    // 4. Update Settings Panel Inputs to match current values
    if(document.getElementById('font-select')) document.getElementById('font-select').value = font;
    if(document.getElementById('theme-select')) document.getElementById('theme-select').value = theme;
    if(document.getElementById('size-select')) document.getElementById('size-select').value = fontSize;
};

// Functions to change and save settings
window.changeFont = (font) => { localStorage.setItem('craby_font', font); window.applySettings(); };
window.changeTheme = (theme) => { localStorage.setItem('craby_theme', theme); window.applySettings(); };
window.changeFontSize = (size) => { localStorage.setItem('craby_font_size', size); window.applySettings(); };

// RESET ALL SETTINGS FUNCTION
window.resetAllSettings = () => {
    if(confirm("Are you sure you want to reset all settings to default?")) {
        localStorage.removeItem('craby_font');
        localStorage.removeItem('craby_theme');
        localStorage.removeItem('craby_font_size');
        window.applySettings(); // Re-apply defaults
        alert("Settings Reset Successfully!");
    }
};

/* --- 2. CORE LOGIC (Modified to call applySettings) --- */
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

    // Editor Window
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
        <textarea id="${id}-code" spellcheck="false" oninput="saveHistory('${id}', this.value)">${content}</textarea>
    `;
    wrapper.appendChild(newBox);
    window.applySettings(); // Ensure new textarea gets current font size
};

/* --- 3. REFRESH & INIT --- */
window.addEventListener('beforeunload', (e) => { e.preventDefault(); e.returnValue = ''; });

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('editor-wrapper').innerHTML = '';
    document.getElementById('file-list').innerHTML = '';

    // Load Default Files
    window.addFileToUI("index.html", "html", localStorage.getItem('craby_code_html') || "<h1>Ready</h1>");
    window.addFileToUI("style.css", "css", localStorage.getItem('craby_code_css') || "h1 { color: orange; }");
    window.addFileToUI("main.js", "js", localStorage.getItem('craby_code_js') || "console.log('Live');");
    
    window.applySettings(); // Load user preferences on startup
});

/* --- Rest of functions (Run, Download, Shutter, etc.) --- */
window.toggleSettings = () => document.getElementById('settingsPanel').classList.toggle('open');
window.toggleLeftSidebar = () => {
    document.getElementById('leftSidebar').classList.toggle('open');
    document.getElementById('shutterBtn').classList.toggle('active');
};
window.runCode = () => { /* Same logic as before */ };