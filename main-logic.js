// --- 1. GLOBAL CONFIGURATION & THEMES (JUNA CODE AS IT IS) ---
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

const dictionary = {
    html: ['div','span','h1','p','a','img','button','input','script','link','meta','class','id','style'],
    css: ['color','background','margin','padding','display','flex','width','height','border','font-size'],
    js: ['console.log','document.getElementById','addEventListener','function','const','let','if','else']
};

let selectedIdx = 0;
let currentLang = '';

// --- 2. SHUTTER & FILE EXPLORER LOGIC (NAVIN ADDED) ---

// Navin file add karne (Prompts for name)
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
            alert(`${fileName} added to workspace!`);
        }
    }
};

// Shutter madhli file list update karne
window.updateFileList = () => {
    const container = document.getElementById('file-list-container');
    if (!container) return;

    const langs = [
        { id: 'html', name: 'index.html', icon: 'fa-code', color: '#e34c26' },
        { id: 'css', name: 'style.css', icon: 'fa-css3-alt', color: '#264de4' },
        { id: 'js', name: 'script.js', icon: 'fa-js', color: '#f7df1e' }
    ];

    let html = '';
    langs.forEach(lang => {
        const isVisible = document.getElementById(`chk-${lang.id}`).checked;
        if (isVisible) {
            html += `
                <div class="file-item">
                    <div class="file-info">
                        <i class="fab ${lang.icon}" style="color: ${lang.color}"></i>
                        <span>${lang.name}</span>
                    </div>
                    <div class="file-actions">
                        <i class="fas fa-trash" onclick="deleteFileFromShutter('${lang.id}')" title="Delete File"></i>
                    </div>
                </div>
            `;
        }
    });

    container.innerHTML = html || '<p style="font-size:12px; opacity:0.5; text-align:center; padding:20px;">No files open</p>';
};

window.deleteFileFromShutter = (lang) => {
    if (confirm(`Close ${lang.toUpperCase()} editor?`)) {
        const check = document.getElementById(`chk-${lang}`);
        if (check) {
            check.checked = false;
            updateVisibility();
        }
    }
};

window.toggleLeftSidebar = () => {
    const sidebar = document.getElementById('leftSidebar');
    const shutter = document.getElementById('shutterBtn');
    if (sidebar) sidebar.classList.toggle('open');
    if (shutter) shutter.classList.toggle('active');
    
    if (sidebar && sidebar.classList.contains('open')) {
        updateFileList();
        // Close settings if shutter opens
        document.getElementById('settingsPanel').classList.remove('open');
    }
};

// --- 3. EDITOR CORE FUNCTIONS (JUNE FUNCTIONS) ---

window.updateVisibility = () => {
    const langs = ['html', 'css', 'js'];
    langs.forEach(lang => {
        const box = document.getElementById(`${lang}-code`).closest('.editor-box');
        const isChecked = document.getElementById(`chk-${lang}`).checked;
        box.style.display = isChecked ? 'flex' : 'none';
    });
    updateFileList(); // Shutter list update kara
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
window.toggleSettings = () => { document.getElementById('settingsPanel').classList.toggle('open'); };
window.setDevice = (m) => { document.getElementById('wrapper').className = 'iframe-wrapper ' + (m==='mobile'?'mobile':''); };

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

// Initial Load
window.onload = () => {
    updateVisibility();
    updateThemeAndFont();
    updateFileList();
};
