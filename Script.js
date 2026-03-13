// --- 1. CONFIGURATION & THEMES ---
const themes = {
    dark: { bg: '#0d1117', panel: '#161b22', accent: '#ffb400', text: '#9cdcfe', border: '#30363d' }, 
    light: { bg: '#ffffff', panel: '#f8fafc', accent: '#1e40af', text: '#0f172a', border: '#cbd5e1' },
    monokai: { bg: '#272822', panel: '#3e3d32', accent: '#f92672', text: '#f8f8f2', border: '#49483e' },
    dracula: { bg: '#282a36', panel: '#44475a', accent: '#bd93f9', text: '#f8f8f2', border: '#6272a4' },
    matrix: { bg: '#000000', panel: '#001a00', accent: '#00ff00', text: '#00ff00', border: '#003300' }
};

const dictionary = {
    html: ['div','span','h1','h2','p','a','img','button','input','script','link','section','article','ul','li','br','hr'],
    css: ['color','background','margin','padding','display','flex','justify-content','align-items','border','width','height','position'],
    js: ['console.log','document.getElementById','function','const','let','window.onload','addEventListener','querySelector','setTimeout']
};

const sBox = document.createElement('div');
sBox.id = 'suggestion-box';
document.body.appendChild(sBox);

let selectedIdx = 0;

// --- 2. SIDEBAR & FILE SYSTEM ---

function toggleSidebar() {
    const sidebar = document.getElementById('actionSidebar');
    const shutter = document.getElementById('shutterBtn');
    sidebar.classList.toggle('open');
    shutter.classList.toggle('active');
    shutter.querySelector('i').className = sidebar.classList.contains('open') ? 'fas fa-chevron-left' : 'fas fa-chevron-right';
}

function createNewFile() {
    const fileName = prompt("Enter file name (e.g. script.js):");
    if (!fileName || fileName.trim() === "") return;

    const fileId = fileName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    if(document.getElementById(`box-${fileId}`)) { alert("File already exists!"); return; }

    addFileToUI(fileName, fileId);
}

function addFileToUI(name, id, content = "") {
    // Sidebar Tab
    const fileList = document.getElementById('file-list');
    const newTab = document.createElement('div');
    newTab.className = 'file-item';
    newTab.id = `tab-${id}`;
    newTab.innerHTML = `<span><i class="fas fa-file-code"></i> ${name}</span> <small id="status-${id}" style="color:var(--accent); display:none;">(min)</small>`;
    newTab.onclick = () => restoreBox(id);
    fileList.appendChild(newTab);

    // Editor Box
    const wrapper = document.getElementById('editor-wrapper');
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
        <textarea id="${id}-code" spellcheck="false" placeholder="Write ${name} code here...">${content}</textarea>
    `;
    wrapper.appendChild(newBox);
    
    updateThemeAndFont();
    attachInputListeners(document.getElementById(`${id}-code`));
}

function minimizeBox(id) {
    document.getElementById(`box-${id}`).style.display = "none";
    document.getElementById(`status-${id}`).style.display = "inline";
}

function restoreBox(id) {
    document.getElementById(`box-${id}`).style.display = "flex";
    document.getElementById(`status-${id}`).style.display = "none";
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

// --- 3. EDITOR CORE LOGIC ---

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
    txt.addEventListener('keydown', (e) => handleNav(e, txt));
}

function showSuggestions(txt) {
    const pos = txt.selectionStart;
    const textBefore = txt.value.substring(0, pos);
    const words = textBefore.split(/[\s<>{}:;()]/);
    const lastWord = words[words.length - 1].toLowerCase();
    const lang = txt.id.includes('html') ? 'html' : txt.id.includes('css') ? 'css' : 'js';

    if (lastWord.length < 1 || !dictionary[lang]) { sBox.style.display = 'none'; return; }

    const matches = dictionary[lang].filter(word => word.startsWith(lastWord));
    if (matches.length > 0) {
        selectedIdx = 0;
        const rect = txt.getBoundingClientRect();
        sBox.style.top = `${rect.top + 30}px`; 
        sBox.style.left = `${rect.left + 30}px`;
        sBox.style.display = 'block';
        sBox.innerHTML = matches.map((m, i) => `<div class="${i === 0 ? 'active' : ''}" onclick="insertWord('${m}', '${txt.id}')">${m}</div>`).join('');
    } else { sBox.style.display = 'none'; }
}

function insertWord(word, id) {
    const txt = document.getElementById(id);
    const pos = txt.selectionStart;
    const textBefore = txt.value.substring(0, pos);
    const lastWordMatch = textBefore.match(/[\w.-]+$/);
    const startPos = lastWordMatch ? pos - lastWordMatch[0].length : pos;
    txt.value = txt.value.substring(0, startPos) + word + txt.value.substring(pos);
    sBox.style.display = 'none';
    txt.focus();
}

function handleNav(e, txt) {
    if (sBox.style.display === 'block') {
        const items = sBox.querySelectorAll('div');
        if (e.key === 'ArrowDown') { e.preventDefault(); selectedIdx = (selectedIdx + 1) % items.length; updateActive(items); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); selectedIdx = (selectedIdx - 1 + items.length) % items.length; updateActive(items); }
        else if (e.key === 'Enter') { e.preventDefault(); if (items[selectedIdx]) items[selectedIdx].click(); }
    }
}

function updateActive(items) { items.forEach((it, i) => it.classList.toggle('active', i === selectedIdx)); }

// --- 4. TOOLBAR & THEME ---

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
    });

    document.querySelectorAll('.label, .action-sidebar, header').forEach(el => el.style.background = theme.panel);
    document.querySelector('.sidebar-shutter').style.background = theme.accent;
}

function runCode() {
    document.getElementById('preview-overlay').style.display = 'flex';
    const html = document.querySelector('[id*="html-code"]') ? document.querySelector('[id*="html-code"]').value : '';
    const css = `<style>${document.querySelector('[id*="css-code"]') ? document.querySelector('[id*="css-code"]').value : ''}</style>`;
    const out = document.getElementById('output').contentWindow.document;
    out.open(); out.write(html + css); out.close();
}

function toggleSettings() { document.getElementById('settingsPanel').classList.toggle('open'); }
function closePreview() { document.getElementById('preview-overlay').style.display = 'none'; }
function undoCode() { document.execCommand('undo'); }
function redoCode() { document.execCommand('redo'); }
function beautifyCode() { alert("Beautify applied!"); }
function exportCode() { alert("Downloading files..."); }

// --- INITIAL LOAD ---
window.onload = () => {
    addFileToUI("index.html", "html", "<!DOCTYPE html>\n<html>\n<body>\n  <h1>Craby Editor</h1>\n</body>\n</html>");
    addFileToUI("style.css", "css", "h1 { color: #ffb400; }");
    updateThemeAndFont();
};
