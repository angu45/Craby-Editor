// --- 1. GLOBAL CONFIG & THEMES (JUNE AS IT IS) ---
window.themes = {
    dark: { bg: '#0d1117', panel: '#161b22', accent: '#ffb400', text: '#9cdcfe', border: '#30363d' }, 
    light: { bg: '#ffffff', panel: '#f8fafc', accent: '#1e40af', text: '#0f172a', border: '#cbd5e1' },
    monokai: { bg: '#272822', panel: '#3e3d32', accent: '#f92672', text: '#f8f8f2', border: '#49483e' },
    dracula: { bg: '#282a36', panel: '#44475a', accent: '#bd93f9', text: '#f8f8f2', border: '#6272a4' },
    matrix: { bg: '#000000', panel: '#001a00', accent: '#00ff00', text: '#00ff00', border: '#003300' },
    nord: { bg: '#2e3440', panel: '#3b4252', accent: '#88c0d0', text: '#d8dee9', border: '#4c566a' },
    midnight: { bg: '#020617', panel: '#1e293b', accent: '#38bdf8', text: '#f1f5f9', border: '#334155' },
    solarized: { bg: '#002b36', panel: '#073642', accent: '#268bd2', text: '#859900', border: '#586e75' },
    cyberpunk: { bg: '#0b0e14', panel: '#1a1f29', accent: '#00ff41', text: '#f3f3f3', border: '#00ff41' },
    evergreen: { bg: '#0a1a12', panel: '#142b20', accent: '#4ade80', text: '#e2e8f0', border: '#2d4a3e' },
    midnight_purple: { bg: '#0f0c29', panel: '#1c184a', accent: '#a855f7', text: '#f3e8ff', border: '#3b2d7d' },
    oceanic: { bg: '#1b2b34', panel: '#23333b', accent: '#6699cc', text: '#d8dee9', border: '#343d46' }
};

// --- 2. WINDOW CONTROLS LOGIC (MINIMIZE, FULLSCREEN, DELETE) ---
window.initWindowControls = () => {
    document.querySelectorAll('.editor-box').forEach(box => {
        const label = box.querySelector('.label');
        if (label && !label.querySelector('.window-controls')) {
            const controls = document.createElement('div');
            controls.className = 'window-controls';
            controls.style.display = 'flex';
            controls.style.gap = '12px';
            
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
        if (txt.style.display === 'none') {
            txt.style.display = 'block';
            box.style.minHeight = "300px";
        } else {
            txt.style.display = 'none';
            box.style.minHeight = "45px";
        }
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

// --- 3. SHUTTER & FILE EXPLORER ---
window.addNewFile = () => {
    const fileName = prompt("Enter file name (e.g. index.html, style.css):");
    if (fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        let target = (ext === 'html') ? 'chk-html' : (ext === 'css' ? 'chk-css' : (ext === 'js' ? 'chk-js' : null));
        
        if (target) {
            document.getElementById(target).checked = true;
            updateVisibility();
        } else {
            alert("Use .html, .css, or .js extension!");
        }
    }
};

window.updateFileList = () => {
    const container = document.getElementById('file-list-container');
    if (!container) return;
    const fileMap = { 'html': 'index.html', 'css': 'style.css', 'js': 'script.js' };
    let html = '';

    ['html', 'css', 'js'].forEach(lang => {
        if (document.getElementById(`chk-${lang}`).checked) {
            html += `
                <div class="file-item" style="display:flex; justify-content:space-between; padding:10px; background:rgba(255,255,255,0.05); margin-bottom:5px; border-radius:5px;">
                    <span><i class="fas fa-file-code" style="margin-right:8px; color:var(--accent);"></i>${fileMap[lang]}</span>
                    <i class="fas fa-trash" onclick="deleteFileFromShutter('${lang}')" style="cursor:pointer; color:#ff4d4d; font-size:12px;"></i>
                </div>`;
        }
    });
    container.innerHTML = html || '<p style="text-align:center; opacity:0.5; font-size:12px;">Empty Workspace</p>';
};

window.deleteFileFromShutter = (lang) => {
    document.getElementById(`chk-${lang}`).checked = false;
    updateVisibility();
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

// --- 4. CORE FUNCTIONS (FORMAT, RUN, EXPORT, THEMES) ---
window.updateVisibility = () => {
    const langs = ['html', 'css', 'js'];
    langs.forEach(lang => {
        const box = document.getElementById(`${lang}-code`).closest('.editor-box');
        const isChecked = document.getElementById(`chk-${lang}`).checked;
        box.style.display = isChecked ? 'flex' : 'none';
    });
    initWindowControls();
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
};

window.beautifyCode = () => {
    const editors = ['html-code', 'css-code', 'js-code'];
    editors.forEach(id => {
        const el = document.getElementById(id);
        el.value = el.value.replace(/\s+/g, ' ').replace(/{/g, ' {\n  ').replace(/}/g, '\n}\n').replace(/;/g, ';\n  ').trim();
    });
    alert("Code Formatted!");
};

window.exportCode = () => {
    const code = `<!DOCTYPE html><html><head><style>${document.getElementById('css-code').value}</style></head><body>${document.getElementById('html-code').value}<script>${document.getElementById('js-code').value}<\/script></body></html>`;
    const blob = new Blob([code], {type: "text/html"});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "index.html";
    a.click();
};

window.onload = () => {
    updateVisibility();
    updateThemeAndFont();
};
