const themes = {
    dark: { bg: '#0d1117', panel: '#161b22', accent: '#ffb400', text: '#9cdcfe', border: '#30363d' }, 
    light: { bg: '#eef1f4', panel: '#ffffff', accent: '#f59e0b', text: '#374151', border: '#e5e7eb' },  
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
function openEditor(){
    window.location.href = "https://craby-editor.vercel.app/html-editor.html";
}

function updateThemeAndFont() {
    const tKey = document.getElementById('theme-sel')?.value || 'dark';
    const font = document.getElementById('font-family-sel')?.value || 'monospace';
    const theme = themes[tKey] || themes.dark;
    document.documentElement.style.setProperty('--bg', theme.bg);
    document.documentElement.style.setProperty('--panel', theme.panel);
    document.documentElement.style.setProperty('--accent', theme.accent);
    document.documentElement.style.setProperty('--border', theme.border);
    document.querySelectorAll('textarea').forEach(tx => { 
        tx.style.fontFamily = font; tx.style.color = theme.text; tx.style.background = theme.bg; 
    });
}

function updateFontSize(val) {
    document.querySelectorAll('textarea').forEach(tx => { tx.style.fontSize = val + "px"; });
}

function deleteFile(fileName) {
    if (confirm(`Delete ${fileName}?`)) {
        delete files[fileName];
        const safeId = "file-" + fileName.replace(/[^a-z0-9]/gi, '-');
        document.getElementById(`box-${safeId}`)?.remove();
        updateTaskbar();
    }
}

function minimizeBox(id) { document.getElementById(`box-${id}`).style.display='none'; }
function expandBox(id) { document.getElementById(`box-${id}`).classList.toggle('fullscreen'); }
function syncScroll(id) { }
function updateFileContent(name, val) { if(files[name]) files[name].content = val; }
function closePreview() { document.getElementById('preview-overlay').style.display = 'none'; }

function saveSettings() {
    const s = { 
        theme: document.getElementById('theme-sel').value, 
        size: document.getElementById('font-size-range').value, 
        font: document.getElementById('font-family-sel').value 
    };
    localStorage.setItem('craby_settings', JSON.stringify(s));
}




function saveSettings() {
    const settings = {
        theme: document.getElementById('theme-sel').value,
        fontSize: document.getElementById('font-size-range').value,
        fontFamily: document.getElementById('font-family-sel').value,
        visibility: {
            html: document.getElementById('chk-html').checked,
            css: document.getElementById('chk-css').checked,
            js: document.getElementById('chk-js').checked
        }
    };
    localStorage.setItem('craby_settings', JSON.stringify(settings));
}

function loadSettings() {
    const saved = localStorage.getItem('craby_settings');
    if (!saved) return;
    const settings = JSON.parse(saved);

    if(settings.theme) document.getElementById('theme-sel').value = settings.theme;
    if(settings.fontSize) {
        document.getElementById('font-size-range').value = settings.fontSize;
        document.getElementById('font-size-val').innerText = settings.fontSize + "px";
        updateFontSize(settings.fontSize);
    }
    if(settings.fontFamily) document.getElementById('font-family-sel').value = settings.fontFamily;
    if(settings.visibility) {
        document.getElementById('chk-html').checked = settings.visibility.html;
        document.getElementById('chk-css').checked = settings.visibility.css;
        document.getElementById('chk-js').checked = settings.visibility.js;
        updateVisibility();
    }
    if(typeof updateThemeAndFont === "function") updateThemeAndFont();
}

function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    if (!panel) return;
    if (panel.style.display === 'none' || !panel.classList.contains('open')) {
        panel.style.display = 'block';
        setTimeout(() => panel.classList.add('open'), 10);
    } else {
        panel.classList.remove('open');
        setTimeout(() => {
            panel.style.display = 'none';
            saveSettings();
        }, 300);
    }
}

function updateVisibility() {
    const htmlBox = document.querySelector('[id*="index-html"]')?.closest('.window-frame');
    const cssBox = document.querySelector('[id*="style-css"]')?.closest('.window-frame');
    const jsBox = document.querySelector('[id*="script-js"]')?.closest('.window-frame');

    if(htmlBox) htmlBox.style.display = document.getElementById('chk-html').checked ? 'flex' : 'none';
    if(cssBox) cssBox.style.display = document.getElementById('chk-css').checked ? 'flex' : 'none';
    if(jsBox) jsBox.style.display = document.getElementById('chk-js').checked ? 'flex' : 'none';
}

function updateFontSize(val) {
    document.getElementById('font-size-val').innerText = val + "px";
    document.querySelectorAll('textarea').forEach(tx => {
        tx.style.fontSize = val + "px";
    });
}

function resetAllSettings() {
    if(confirm("Reset all settings to default?")) {
        localStorage.removeItem('craby_settings');
        location.reload();
    }
}