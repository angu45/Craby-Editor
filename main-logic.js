// --- 1. GLOBAL CONFIGURATION & THEMES ---
window.themes = {
    dark: { bg: '#0d1117', panel: '#161b22', accent: '#ffb400', text: '#9cdcfe', border: '#30363d' }, 
    light: { bg: '#ffffff', panel: '#f8fafc', accent: '#1e40af', text: '#0f172a', border: '#cbd5e1' },
    monokai: { bg: '#272822', panel: '#3e3d32', accent: '#f92672', text: '#f8f8f2', border: '#49483e' },
    dracula: { bg: '#282a36', panel: '#44475a', accent: '#bd93f9', text: '#f8f8f2', border: '#6272a4' },
    matrix: { bg: '#000000', panel: '#001a00', accent: '#00ff00', text: '#00ff00', border: '#003300' },
    nord: { bg: '#2e3440', panel: '#3b4252', accent: '#88c0d0', text: '#d8dee9', border: '#4c566a' },
    cyberpunk: { bg: '#0b0e14', panel: '#1a1f29', accent: '#00ff41', text: '#f3f3f3', border: '#00ff41' }
};

// --- 2. WINDOW CONTROLS (MINIMIZE, FULLSCREEN, DELETE) ---
window.initWindowControls = () => {
    document.querySelectorAll('.editor-box').forEach(box => {
        const label = box.querySelector('.label');
        if (label && !label.querySelector('.window-controls')) {
            const controls = document.createElement('div');
            controls.className = 'window-controls';
            controls.style.display = 'flex';
            controls.style.gap = '10px';
            
            controls.innerHTML = `
                <i class="fas fa-minus" title="Minimize" onclick="controlWindow(this, 'min')"></i>
                <i class="fas fa-expand" title="Fullscreen" onclick="controlWindow(this, 'full')"></i>
                <i class="fas fa-times" title="Close" onclick="controlWindow(this, 'del')" style="color:#ff4d4d"></i>
            `;
            label.appendChild(controls);
        }
    });
};

window.controlWindow = (btn, action) => {
    const box = btn.closest('.editor-box');
    const txt = box.querySelector('textarea');
    const lang = txt.id.split('-')[0];

    if (action === 'min') {
        txt.style.display = txt.style.display === 'none' ? 'block' : 'none';
        box.style.minHeight = txt.style.display === 'none' ? "45px" : "300px";
    } 
    else if (action === 'full') {
        box.classList.toggle('fullscreen-editor');
    } 
    else if (action === 'del') {
        const check = document.getElementById(`chk-${lang}`);
        if (check) {
            check.checked = false;
            updateVisibility();
        }
    }
};

// --- 3. SHUTTER & FILE EXPLORER LOGIC ---
window.addNewFile = () => {
    const fileName = prompt("Enter file name (e.g. index.html, style.css, script.js):");
    if (fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        let targetId = '';
        if (ext === 'html') targetId = 'chk-html';
        else if (ext === 'css') targetId = 'chk-css';
        else if (ext === 'js') targetId = 'chk-js';
        else {
            alert("Please use .html, .css or .js extension!");
            return;
        }

        const checkbox = document.getElementById(targetId);
        if (checkbox) {
            checkbox.checked = true;
            updateVisibility();
        }
    }
};

window.updateFileList = () => {
    const container = document.getElementById('file-list-container');
    if (!container) return;

    const fileMap = {
        'html': { name: 'index.html', icon: 'fa-code', color: '#e34c26' },
        'css': { name: 'style.css', icon: 'fa-css3-alt', color: '#264de4' },
        'js': { name: 'script.js', icon: 'fa-js', color: '#f7df1e' }
    };

    let htmlContent = '';
    ['html', 'css', 'js'].forEach(lang => {
        const isVisible = document.getElementById(`chk-${lang}`).checked;
        if (isVisible) {
            const file = fileMap[lang];
            htmlContent += `
                <div class="file-item" style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:rgba(255,255,255,0.05); margin-bottom:5px; border-radius:5px;">
                    <div class="file-info" style="display:flex; align-items:center; gap:10px;">
                        <i class="fab ${file.icon}" style="color: ${file.color}"></i>
                        <span style="font-size:14px;">${file.name}</span>
                    </div>
                    <div class="file-actions">
                        <i class="fas fa-trash" style="cursor:pointer; font-size:12px; opacity:0.6;" onclick="deleteFileFromShutter('${lang}')"></i>
                    </div>
                </div>`;
        }
    });

    container.innerHTML = htmlContent || '<p style="font-size:12px; opacity:0.5; text-align:center;">No files open</p>';
};

window.deleteFileFromShutter = (lang) => {
    const check = document.getElementById(`chk-${lang}`);
    if (check) {
        check.checked = false;
        updateVisibility();
    }
};

window.toggleLeftSidebar = () => {
    const sidebar = document.getElementById('leftSidebar');
    const shutter = document.getElementById('shutterBtn');
    sidebar.classList.toggle('open');
    shutter.classList.toggle('active');
    
    if (sidebar.classList.contains('open')) {
        updateFileList();
        document.getElementById('settingsPanel').classList.remove('open');
    }
};

// --- 4. CORE EDITOR FUNCTIONS ---
window.updateVisibility = () => {
    const langs = ['html', 'css', 'js'];
    langs.forEach(lang => {
        const box = document.getElementById(`${lang}-code`).closest('.editor-box');
        const isChecked = document.getElementById(`chk-${lang}`).checked;
        box.style.display = isChecked ? 'flex' : 'none';
    });
    updateFileList(); 
};

window.updateThemeAndFont = () => {
    const themeKey = document.getElementById('theme-sel').value;
    const font = document.getElementById('font-family-sel').value;
    const fontSize = document.getElementById('font-size-bar').value;
    if(document.getElementById('fs-display')) document.getElementById('fs-display').innerText = fontSize + "px";

    const theme = themes[themeKey] || themes.dark;
    document.documentElement.style.setProperty('--bg', theme.bg);
    document.documentElement.style.setProperty('--panel', theme.panel);
    document.documentElement.style.setProperty('--accent', theme.accent);
    
    document.querySelectorAll('textarea').forEach(tx => {
        tx.style.fontFamily = font;
        tx.style.fontSize = fontSize + "px"; 
        tx.style.color = theme.text;
        tx.style.background = theme.bg;
    });

    document.querySelectorAll('.label').forEach(el => {
        el.style.background = theme.panel;
        el.style.color = theme.accent;
    });
};

window.runCode = () => {
    const overlay = document.getElementById('preview-overlay');
    overlay.style.display = 'flex';
    const h = document.getElementById('html-code').value;
    const c = `<style>${document.getElementById('css-code').value}</style>`;
    const j = `<script>${document.getElementById('js-code').value}<\/script>`;
    const out = document.getElementById('output').contentWindow.document;
    out.open(); out.write(h + c + j); out.close();
};

window.closePreview = () => { document.getElementById('preview-overlay').style.display = 'none'; };
window.toggleSettings = () => { 
    document.getElementById('settingsPanel').classList.toggle('open'); 
    document.getElementById('leftSidebar').classList.remove('open');
    document.getElementById('shutterBtn').classList.remove('active');
};

// --- 5. INITIALIZE ON LOAD ---
window.onload = () => {
    initWindowControls(); // Window buttons generate karne
    updateVisibility();
    updateThemeAndFont();
    updateFileList();
};
