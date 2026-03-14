// --- 1. CONFIG & THEMES ---
window.themes = {
    vscode: { bg: '#1e1e1e', panel: '#252526', accent: '#007acc', text: '#d4d4d4', border: '#3c3c3c' },
    dark: { bg: '#0d1117', panel: '#161b22', accent: '#ffb400', text: '#9cdcfe', border: '#30363d' }
};

// --- 2. WINDOW CONTROLS GENERATOR ---
window.initWindowControls = () => {
    document.querySelectorAll('.editor-box').forEach(box => {
        const label = box.querySelector('.label');
        if (label && !label.querySelector('.window-controls')) {
            const controls = document.createElement('div');
            controls.className = 'window-controls';
            controls.innerHTML = `
                <i class="fas fa-minus" title="Minimize" onclick="controlWindow(this, 'min')"></i>
                <i class="fas fa-expand" title="Fullscreen" onclick="controlWindow(this, 'full')"></i>
                <i class="fas fa-times" title="Close" onclick="controlWindow(this, 'del')" style="color:#f44336"></i>
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
        const isMin = txt.style.display === 'none';
        txt.style.display = isMin ? 'block' : 'none';
        box.style.minHeight = isMin ? "300px" : "40px";
    } else if (action === 'full') {
        box.classList.toggle('fullscreen-editor');
    } else if (action === 'del') {
        document.getElementById(`chk-${lang}`).checked = false;
        updateVisibility();
    }
    updateFileList(); // Shutter refresh kara
};

// --- 3. SHUTTER (FILE MANAGER) LOGIC ---
window.updateFileList = () => {
    const container = document.getElementById('file-list-container');
    if (!container) return;
    
    const fileMap = { html: 'index.html', css: 'style.css', js: 'script.js' };
    let html = '';

    ['html', 'css', 'js'].forEach(lang => {
        const isChecked = document.getElementById(`chk-${lang}`).checked;
        const box = document.getElementById(`${lang}-code`).closest('.editor-box');
        const isMin = box.querySelector('textarea').style.display === 'none';

        if (isChecked) {
            html += `
                <div class="file-item ${isMin ? 'minimized-file' : ''}">
                    <div class="file-info">
                        <i class="fas ${lang === 'html' ? 'fa-code' : (lang === 'css' ? 'fa-css3-alt' : 'fa-js')}" style="color:var(--accent)"></i>
                        <span>${fileMap[lang]} ${isMin ? '<small>(Min)</small>' : ''}</span>
                    </div>
                    <div class="file-actions">
                        <i class="fas ${isMin ? 'fa-eye' : 'fa-eye-slash'}" onclick="toggleMinimize('${lang}')" title="Toggle Size"></i>
                        <i class="fas fa-times" onclick="deleteFileFromShutter('${lang}')"></i>
                    </div>
                </div>`;
        }
    });
    container.innerHTML = html || '<p style="text-align:center;opacity:0.5;">No active files</p>';
};

window.toggleMinimize = (lang) => {
    const box = document.getElementById(`${lang}-code`).closest('.editor-box');
    const btn = box.querySelector('.fa-minus');
    controlWindow(btn, 'min');
};

window.deleteFileFromShutter = (lang) => {
    document.getElementById(`chk-${lang}`).checked = false;
    updateVisibility();
};

window.toggleLeftSidebar = () => {
    document.getElementById('leftSidebar').classList.toggle('open');
    document.getElementById('shutterBtn').classList.toggle('active');
    updateFileList();
};

// --- 4. CORE UPDATES ---
window.updateVisibility = () => {
    ['html', 'css', 'js'].forEach(l => {
        const box = document.getElementById(`${l}-code`).closest('.editor-box');
        box.style.display = document.getElementById(`chk-${l}`).checked ? 'flex' : 'none';
    });
    initWindowControls();
    updateFileList();
};

window.updateThemeAndFont = () => {
    const theme = window.themes.vscode; // Default VS Code theme
    const size = document.getElementById('font-size-bar').value;
    
    document.documentElement.style.setProperty('--bg', theme.bg);
    document.documentElement.style.setProperty('--panel', theme.panel);
    document.documentElement.style.setProperty('--accent', theme.accent);
    document.documentElement.style.setProperty('--border', theme.border);

    document.querySelectorAll('textarea').forEach(t => {
        t.style.fontSize = size + "px";
        t.style.color = theme.text;
    });
};

window.runCode = () => {
    const h = document.getElementById('html-code').value;
    const c = `<style>${document.getElementById('css-code').value}</style>`;
    const j = `<script>${document.getElementById('js-code').value}<\/script>`;
    const out = document.getElementById('output').contentWindow.document;
    out.open(); out.write(h + c + j); out.close();
    document.getElementById('preview-overlay').style.display = 'flex';
};

window.onload = () => {
    updateVisibility();
    updateThemeAndFont();
};
