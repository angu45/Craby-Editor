// --- Window Controls Logic ---
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
        const isHidden = txt.style.display === 'none';
        txt.style.display = isHidden ? 'block' : 'none';
        box.style.minHeight = isHidden ? "250px" : "40px";
    } else if (action === 'full') {
        box.classList.toggle('fullscreen-editor');
    } else if (action === 'del') {
        document.getElementById(`chk-${lang}`).checked = false;
        updateVisibility();
    }
    updateFileList();
};

// --- Shutter Logic ---
window.updateFileList = () => {
    const container = document.getElementById('file-list-container');
    if (!container) return;
    const names = { html: 'index.html', css: 'style.css', js: 'script.js' };
    let html = '';
    ['html', 'css', 'js'].forEach(l => {
        if (document.getElementById(`chk-${l}`).checked) {
            html += `<div style="display:flex; justify-content:space-between; background:rgba(255,255,255,0.05); padding:10px; border-radius:5px; margin-bottom:8px;">
                <span><i class="far fa-file"></i> ${names[l]}</span>
                <i class="fas fa-trash" style="cursor:pointer; color:#ff4d4d" onclick="deleteFileFromShutter('${l}')"></i>
            </div>`;
        }
    });
    container.innerHTML = html || '<p style="font-size:12px;opacity:0.5;text-align:center;">No files open</p>';
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

// --- Core Functions ---
window.updateVisibility = () => {
    ['html', 'css', 'js'].forEach(l => {
        const box = document.getElementById(`${l}-code`).closest('.editor-box');
        box.style.display = document.getElementById(`chk-${l}`).checked ? 'flex' : 'none';
    });
    initWindowControls();
    updateFileList();
};

window.runCode = () => {
    const h = document.getElementById('html-code').value;
    const c = `<style>${document.getElementById('css-code').value}</style>`;
    const j = `<script>${document.getElementById('js-code').value}<\/script>`;
    const out = document.getElementById('output').contentWindow.document;
    out.open(); out.write(h + c + j); out.close();
    document.getElementById('preview-overlay').style.display = 'flex';
};

window.toggleSettings = () => document.getElementById('settingsPanel').classList.toggle('open');
window.closePreview = () => document.getElementById('preview-overlay').style.display = 'none';

window.onload = () => {
    updateVisibility();
    // theme function jar script.js madhe asel tar ithe call kara
};
