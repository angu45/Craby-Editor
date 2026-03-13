// --- 1. CONFIGURATION & THEMES ---
const themes = {
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
    html: ['div','span','h1','p','a','img','button','input','script','link','section','article'],
    css: ['color','background','margin','padding','display','flex','justify-content','align-items'],
    js: ['console.log','document.getElementById','function','const','let','window.onload']
};

const sBox = document.createElement('div');
sBox.id = 'suggestion-box';
document.body.appendChild(sBox);

let selectedIdx = 0;
let currentLang = '';

// --- 2. SIDEBAR & FILE SYSTEM ---

function toggleSidebar() {
    const sidebar = document.getElementById('actionSidebar');
    const shutter = document.getElementById('shutterBtn');
    sidebar.classList.toggle('open');
    shutter.classList.toggle('active');
    shutter.querySelector('i').className = sidebar.classList.contains('open') ? 'fas fa-chevron-left' : 'fas fa-chevron-right';
}

// नवीन फाईल तयार करणे
function createNewFile() {
    const fileName = prompt("Enter file name (e.g. index.html):");
    if (!fileName || fileName.trim() === "") return;

    const fileId = fileName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    if(document.getElementById(`box-${fileId}`)) { alert("File already exists!"); return; }

    addFileToUI(fileName, fileId);
}

// UI मध्ये फाईल आणि टॅब जोडणे
function addFileToUI(name, id) {
    // Sidebar मध्ये टॅब जोडणे
    const fileList = document.getElementById('file-list');
    const newTab = document.createElement('div');
    newTab.className = 'file-item';
    newTab.id = `tab-${id}`;
    newTab.innerHTML = `<span><i class="fas fa-file-code"></i> ${name}</span> <small id="status-${id}" style="color:var(--accent); display:none;">(min)</small>`;
    newTab.onclick = () => restoreBox(id);
    fileList.appendChild(newTab);

    // मुख्य विंडोमध्ये Textarea जोडणे
    const wrapper = document.querySelector('.editor-section');
    const newBox = document.createElement('div');
    newBox.className = 'editor-box';
    newBox.id = `box-${id}`;
    newBox.innerHTML = `
        <div class="label">
            <span>${name}</span>
            <div class="window-controls">
                <i class="fas fa-minus" onclick="minimizeBox('${id}')"></i>
                <i class="fas fa-expand" onclick="expandBox('${id}')"></i>
                <i class="fas fa-trash" onclick="deleteBox('${id}')"></i>
            </div>
        </div>
        <textarea id="${id}-code" spellcheck="false"></textarea>
    `;
    wrapper.appendChild(newBox);
    
    updateThemeAndFont();
    attachInputListeners(document.getElementById(`${id}-code`));
}

// Minimize: बॉक्स लपवणे आणि शटरमध्ये स्टेटस दाखवणे
function minimizeBox(id) {
    const box = document.getElementById(`box-${id}`);
    const status = document.getElementById(`status-${id}`);
    box.style.display = "none";
    if(status) status.style.display = "inline"; // शटरमध्ये (min) दिसेल
}

// Restore: शटरमधून फाईलवर क्लिक केल्यावर पुन्हा दाखवणे
function restoreBox(id) {
    const box = document.getElementById(`box-${id}`);
    const status = document.getElementById(`status-${id}`);
    box.style.display = "flex";
    if(status) status.style.display = "none";
    document.getElementById(`${id}-code`).focus();
}

function expandBox(id) {
    const allBoxes = document.querySelectorAll('.editor-box');
    const currentBox = document.getElementById(`box-${id}`);
    if (currentBox.style.flex === "10") {
        allBoxes.forEach(b => b.style.flex = "1");
    } else {
        allBoxes.forEach(b => b.style.flex = "0.1");
        currentBox.style.flex = "10";
        currentBox.style.display = "flex";
    }
}

function deleteBox(id) {
    if(confirm(`Delete ${id} permanently?`)) {
        document.getElementById(`box-${id}`).remove();
        document.getElementById(`tab-${id}`).remove();
    }
}

// --- 3. THEME & SETTINGS FIX ---

function updateThemeAndFont() {
    const themeKey = document.getElementById('theme-sel').value;
    const font = document.getElementById('font-family-sel').value;
    const theme = themes[themeKey] || themes.dark;

    document.documentElement.style.setProperty('--bg', theme.bg);
    document.documentElement.style.setProperty('--panel', theme.panel);
    document.documentElement.style.setProperty('--accent', theme.accent);
    
    document.querySelectorAll('textarea').forEach(tx => {
        tx.style.fontFamily = font;
        tx.style.color = theme.text;
        tx.style.background = theme.bg;
        tx.closest('.editor-box').style.borderColor = theme.border;
    });

    document.querySelectorAll('.label, .action-sidebar').forEach(el => {
        el.style.background = theme.panel;
        el.style.color = theme.accent;
    });

    document.querySelectorAll('.sidebar-shutter').forEach(sh => {
        sh.style.background = theme.accent;
    });
}

// --- 4. CORE EDITOR LOGIC ---

function attachInputListeners(txt) {
    txt.addEventListener('input', (e) => {
        const pos = txt.selectionStart;
        const char = e.data;
        const pairs = { '{': '}', '(': ')', '[': ']', '"': '"', "'": "'" };
        if (pairs[char]) {
            txt.value = txt.value.substring(0, pos) + pairs[char] + txt.value.substring(pos);
            txt.selectionStart = txt.selectionEnd = pos;
        }
        showSuggestions(txt);
    });
}

function undoCode() { document.execCommand('undo'); }
function redoCode() { document.execCommand('redo'); }

function runCode() {
    const overlay = document.getElementById('preview-overlay');
    overlay.style.display = 'flex';
    const h = document.getElementById('html-code') ? document.getElementById('html-code').value : '';
    const c = `<style>${document.getElementById('css-code') ? document.getElementById('css-code').value : ''}</style>`;
    const out = document.getElementById('output').contentWindow.document;
    out.open(); out.write(h + c); out.close();
}

function toggleSettings() { 
    document.getElementById('settingsPanel').classList.toggle('open'); 
}

// सुरुवातीला फक्त HTML आणि CSS असणे
window.onload = () => {
    // जर आधीच डबे असतील तर त्यांना लिस्टमध्ये ॲड करणे
    updateThemeAndFont();
    document.querySelectorAll('textarea').forEach(tx => attachInputListeners(tx));
};
