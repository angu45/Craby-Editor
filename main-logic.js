// --- 1. GLOBAL CONFIG & THEMES ---
window.themes = {
    dark: { bg: '#0d1117', panel: '#161b22', accent: '#ffb400', text: '#9cdcfe', border: '#30363d' }, 
    light: { bg: '#ffffff', panel: '#f8fafc', accent: '#1e40af', text: '#0f172a', border: '#cbd5e1' },
    monokai: { bg: '#272822', panel: '#3e3d32', accent: '#f92672', text: '#f8f8f2', border: '#49483e' },
    dracula: { bg: '#282a36', panel: '#44475a', accent: '#bd93f9', text: '#f8f8f2', border: '#6272a4' },
    matrix: { bg: '#000000', panel: '#001a00', accent: '#00ff00', text: '#00ff00', border: '#003300' },
    cyberpunk: { bg: '#0b0e14', panel: '#1a1f29', accent: '#00ff41', text: '#f3f3f3', border: '#00ff41' }
};

// --- 2. WINDOW CONTROLS (Minimize, Fullscreen, Delete) ---
// Pratyek editor box chya 'label' div madhe he buttons asne garjeche aahe.
window.initWindowControls = () => {
    document.querySelectorAll('.editor-box').forEach(box => {
        const label = box.querySelector('.label');
        if (label && !label.querySelector('.window-controls')) {
            const controls = document.createElement('div');
            controls.className = 'window-controls';
            controls.style.display = 'flex';
            controls.style.gap = '8px';
            
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
        box.style.flex = txt.style.display === 'none' ? '0 0 auto' : '1';
    } 
    else if (action === 'full') {
        box.classList.toggle('fullscreen-editor');
        if(box.classList.contains('fullscreen-editor')) {
            box.style.position = 'fixed';
            box.style.top = '60px'; box.style.left = '0';
            box.style.width = '100%'; box.style.height = 'calc(100vh - 60px)';
            box.style.zIndex = '9999';
        } else {
            box.style.position = 'relative';
            box.style.top = '0'; box.style.width = '100%'; box.style.height = '100%';
            box.style.zIndex = '1';
            updateVisibility(); // Reset to normal flex
        }
    } 
    else if (action === 'del') {
        const check = document.getElementById(`chk-${lang}`);
        if (check) {
            check.checked = false;
            updateVisibility();
        }
    }
};

// --- 3. SHUTTER & SETTINGS LOGIC ---
window.toggleLeftSidebar = () => {
    const sidebar = document.getElementById('leftSidebar');
    const shutter = document.getElementById('shutterBtn');
    if (sidebar) sidebar.classList.toggle('open');
    if (shutter) shutter.classList.toggle('active');
    
    // Sidebar उघडला तर Settings बंद करा
    if (sidebar && sidebar.classList.contains('open')) {
        document.getElementById('settingsPanel').classList.remove('open');
    }
};

window.toggleSettings = () => {
    const settings = document.getElementById('settingsPanel');
    if (settings) settings.classList.toggle('open');
    
    // Settings उघडली तर Sidebar बंद करा
    if (settings && settings.classList.contains('open')) {
        const sidebar = document.getElementById('leftSidebar');
        if (sidebar) {
            sidebar.classList.remove('open');
            document.getElementById('shutterBtn').classList.remove('active');
        }
    }
};

// --- 4. CORE FUNCTIONALITIES ---
window.updateVisibility = () => {
    const langs = ['html', 'css', 'js'];
    langs.forEach(lang => {
        const box = document.getElementById(`${lang}-code`).closest('.editor-box');
        const isChecked = document.getElementById(`chk-${lang}`).checked;
        box.style.display = isChecked ? 'flex' : 'none';
    });
};

window.updateThemeAndFont = () => {
    const themeKey = document.getElementById('theme-sel').value;
    const font = document.getElementById('font-family-sel').value;
    const fontSize = document.getElementById('font-size-bar').value;
    const theme = window.themes[themeKey] || window.themes.dark;

    document.getElementById('fs-display').innerText = fontSize + "px";
    document.documentElement.style.setProperty('--bg', theme.bg);
    document.documentElement.style.setProperty('--accent', theme.accent);

    document.querySelectorAll('textarea').forEach(tx => {
        tx.style.fontFamily = font;
        tx.style.fontSize = fontSize + "px";
        tx.style.color = theme.text;
        tx.style.background = theme.bg;
    });
    
    document.querySelectorAll('.label').forEach(l => {
        l.style.background = theme.panel;
        l.style.color = theme.accent;
    });
};

// --- 5. INITIALIZE ---
window.onload = () => {
    // Default 2 editors (HTML & CSS)
    document.getElementById('chk-html').checked = true;
    document.getElementById('chk-css').checked = true;
    document.getElementById('chk-js').checked = false;
    
    initWindowControls();
    updateVisibility();
    updateThemeAndFont();
};

// Toolbar Buttons
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

window.exportCode = () => {
    const code = `<!DOCTYPE html><html><head><style>${document.getElementById('css-code').value}</style></head><body>${document.getElementById('html-code').value}<script>${document.getElementById('js-code').value}<\/script></body></html>`;
    const blob = new Blob([code], {type: "text/html"});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "index.html";
    a.click();
};
