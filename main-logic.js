// --- 1. WINDOW CONTROLS LOGIC ---
window.initWindowControls = () => {
    document.querySelectorAll('.editor-box').forEach(box => {
        const label = box.querySelector('.label');
        // Check if controls already exist to avoid duplication
        if (label && !label.querySelector('.window-controls')) {
            const ctrl = document.createElement('div');
            ctrl.className = 'window-controls';
            ctrl.innerHTML = `
                <i class="fas fa-minus" title="Minimize" onclick="controlWindow(this, 'min')"></i>
                <i class="fas fa-expand" title="Fullscreen" onclick="controlWindow(this, 'full')"></i>
                <i class="fas fa-trash-alt" title="Close" onclick="controlWindow(this, 'del')"></i>
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
        box.style.flex = isHidden ? "1" : "0 0 35px";
    } else if (action === 'full') {
        box.classList.toggle('fullscreen-editor');
    } else if (action === 'del') {
        document.getElementById(`chk-${lang}`).checked = false;
        updateVisibility();
    }
};

// --- 2. CORE FUNCTIONS ---
window.updateVisibility = () => {
    ['html', 'css', 'js'].forEach(l => {
        const el = document.getElementById(`${l}-code`);
        if (el) {
            const box = el.closest('.editor-box');
            box.style.display = document.getElementById(`chk-${l}`).checked ? 'flex' : 'none';
        }
    });
    initWindowControls();
    if (typeof updateFileList === 'function') updateFileList();
};

window.runCode = () => {
    const h = document.getElementById('html-code').value;
    const c = `<style>${document.getElementById('css-code').value}</style>`;
    const j = `<script>${document.getElementById('js-code').value}<\/script>`;
    const out = document.getElementById('output').contentWindow.document;
    out.open(); out.write(h + c + j); out.close();
    document.getElementById('preview-overlay').style.display = 'flex';
};

window.toggleLeftSidebar = () => {
    document.getElementById('leftSidebar').classList.toggle('open');
    document.getElementById('shutterBtn').classList.toggle('active');
};

window.toggleSettings = () => document.getElementById('settingsPanel').classList.toggle('open');
window.closePreview = () => document.getElementById('preview-overlay').style.display = 'none';

// Onload initialization
window.onload = () => {
    updateVisibility();
};
