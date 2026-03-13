/* --- 1. SETTINGS SYNC (Theme & Font) --- */
window.updateThemeAndFont = () => {
    const selectedFont = localStorage.getItem('craby_font') || "'Plus Jakarta Sans', sans-serif";
    const selectedTheme = localStorage.getItem('craby_theme') || "dark";

    // Apply Font to whole Body & UI elements
    document.documentElement.style.setProperty('--current-font', selectedFont);
    
    // Apply Theme Class
    document.body.className = `theme-${selectedTheme}`;
    
    // Specifically update sidebar items (shutter content)
    document.querySelectorAll('.file-item, .label, .settings-panel').forEach(el => {
        el.style.fontFamily = selectedFont;
    });
};

/* --- 2. FILE & WINDOW LOGIC (With Settings Sync) --- */
window.addFileToUI = function(name, id, content = "") {
    const wrapper = document.getElementById('editor-wrapper');
    const fileList = document.getElementById('file-list');
    if(!wrapper || document.getElementById(`box-${id}`)) return;

    const item = document.createElement('div');
    item.className = 'file-item';
    item.id = `tab-${id}`;
    item.innerHTML = `<i class="fas fa-file-code"></i> <span>${name}</span>`;
    item.onclick = () => window.restoreBox(id);
    fileList.appendChild(item);

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
    
    // CRITICAL: Update theme/font for newly added elements
    window.updateThemeAndFont();
};

/* --- 3. SETTINGS UPDATERS (Inside your Settings Panel) --- */
window.changeFont = (fontName) => {
    localStorage.setItem('craby_font', fontName);
    window.updateThemeAndFont();
};

window.changeTheme = (themeName) => {
    localStorage.setItem('craby_theme', themeName);
    window.updateThemeAndFont();
};

/* --- 4. INITIAL LOAD --- */
document.addEventListener('DOMContentLoaded', () => {
    // Other init code...
    window.updateThemeAndFont(); // Run on startup
});

/* --- Rest of your functions (Run, Download, Shutter Toggle) --- */
window.toggleLeftSidebar = () => {
    document.getElementById('leftSidebar').classList.toggle('open');
    document.getElementById('shutterBtn').classList.toggle('active');
};
window.toggleSettings = () => document.getElementById('settingsPanel').classList.toggle('open');
