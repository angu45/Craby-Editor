// --- 1. WINDOW CONTROLS LOGIC ---
window.initWindowControls = () => {
    document.querySelectorAll('.editor-box').forEach(box => {
        const label = box.querySelector('.label');
        if (label && !label.querySelector('.window-controls')) {
            const ctrl = document.createElement('div');
            ctrl.className = 'window-controls';
            ctrl.innerHTML = `
                <i class="fas fa-minus" title="Minimize" onclick="controlWindow(this, 'min')"></i>
                <i class="fas fa-expand" title="Fullscreen" onclick="controlWindow(this, 'full')"></i>
                <i class="fas fa-times" title="Close" onclick="controlWindow(this, 'del')" style="color:#ff4d4d"></i>
            `;
            label.appendChild(ctrl);
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
    } else if (action === 'full') {
        box.classList.toggle('fullscreen-editor');
    } else if (action === 'del') {
        document.getElementById(`chk-${lang}`).checked = false;
        updateVisibility();
    }
    updateFileList();
};

// --- 2. SHUTTER & FILE LIST LOGIC ---
window.updateFileList = () => {
    const container = document.getElementById('file-list-container');
    if (!container) return;
    const names = { html: 'index.html', css: 'style.css', js: 'script.js' };
    let html = '';
    ['html', 'css', 'js'].forEach(l => {
        const isChecked = document.getElementById(`chk-${l}`).checked;
        if (isChecked) {
            html += `<div class="file-item">
                <span><i class="far fa-file"></i> ${names[l]}</span>
                <i class="fas fa-trash" style="cursor:pointer" onclick="deleteFileFromShutter('${l}')"></i>
            </div>`;
        }
    });
    container.innerHTML = html || '<p style="font-size:12px;opacity:0.5;">No files open</p>';
};

window.deleteFileFromShutter = (l) => {
    document.getElementById(`chk-${l}`).checked = false;
    updateVisibility();
};

window.toggleLeftSidebar = () => {
    document.getElementById('leftSidebar').classList.toggle('open');
    document.getElementById('shutterBtn').classList.toggle('active');
    updateFileList();
};

// --- 3. CORE FUNCTIONS (Sagal Agodarsarkha) ---
window.updateVisibility = () => {
    ['html', 'css', 'js'].forEach(l => {
        const box = document.getElementById(`${l}-code`).closest('.editor-box');
        box.style.display = document.getElementById(`chk-${l}`).checked ? 'flex' : 'none';
    });
    initWindowControls(); // Refresh buttons
    updateFileList();    // Refresh shutter
};

window.runCode = () => {
    const h = document.getElementById('html-code').value;
    const c = `<style>${document.getElementById('css-code').value}</style>`;
    const j = `<script>${document.getElementById('js-code').value}<\/script>`;
    const out = document.getElementById('output').contentWindow.document;
    out.open(); out.write(h + c + j); out.close();
    document.getElementById('preview-overlay').style.display = 'flex';
};

window.updateThemeAndFont = () => {
    // Tuza original theme logic
    const themeKey = document.getElementById('theme-sel').value;
    // ... (rest of theme code)
};

window.toggleSettings = () => document.getElementById('settingsPanel').classList.toggle('open');
window.closePreview = () => document.getElementById('preview-overlay').style.display = 'none';

window.onload = () => { 
    updateVisibility(); 
    // updateThemeAndFont(); // Garaj asel tar chalu kara
};
