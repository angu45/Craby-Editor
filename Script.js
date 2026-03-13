// --- 1. CONFIGURATION & ALL 12 THEMES (Pahilyasarkhe) ---
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
    html: ['a','alt','article','aside','audio','b','base','body','br','button','canvas','caption','cite','class','code','col','colgroup','datalist','dd','del','details','dfn','dialog','div','dl','dt','em','embed','fieldset','figcaption','figure','footer','form','h1','h2','h3','h4','h5','h6','head','header','height','hr','html','href','i','id','iframe','img','input','label','legend','li','link','main','map','mark','meta','name','nav','ol','onclick','optgroup','option','p','param','picture','placeholder','pre','progress','q','rel','required','s','samp','script','section','select','small','source','span','strong','style','sub','summary','sup','svg','table','tbody','td','template','textarea','tfoot','th','thead','time','title','tr','track','type','u','ul','value','var','video','width'],
    css: ['absolute','align-items','animation','background','background-color','border','border-radius','bottom','box-shadow','box-sizing','clear','color','column-count','column-gap','content','cursor','display','flex','flex-direction','flex-wrap','float','font','font-family','font-size','font-style','font-weight','gap','grid','grid-area','grid-template-columns','grid-template-rows','height','inline','inline-block','justify-content','left','letter-spacing','line-height','margin','margin-bottom','margin-left','margin-right','margin-top','max-height','max-width','min-height','min-width','none','opacity','overflow','padding','padding-bottom','padding-left','padding-right','padding-top','pointer','position','relative','right','text-align','text-decoration','text-transform','top','transform','transition','transparent','visibility','width','word-spacing','z-index'],
    js: ['addEventListener','alert','Array','async','await','break','catch','class','clearInterval','clearTimeout','console','console.log','const','continue','Date','debugger','default','delete','document','document.getElementById','document.querySelector','else','export','fetch','finally','for','forEach','function','if','import','in','instanceof','isNaN','JSON','JSON.parse','JSON.stringify','let','map','Math','Math.floor','Math.random','new','null','Object','parseFloat','parseInt','pop','push','querySelector','querySelectorAll','return','setInterval','setTimeout','shift','slice','some','split','splice','String','this','throw','trim','try','typeof','undefined','var','window','while']
};

const sBox = document.createElement('div');
sBox.id = 'suggestion-box';
document.body.appendChild(sBox);

let selectedIdx = 0;
let currentLang = '';

// --- 2. NEW SIDEBAR & FILE LOGIC (Functional) ---

function toggleSidebar() {
    const sidebar = document.getElementById('actionSidebar');
    const shutter = document.getElementById('shutterBtn');
    sidebar.classList.toggle('open');
    shutter.classList.toggle('active');
    shutter.querySelector('i').className = sidebar.classList.contains('open') ? 'fas fa-chevron-left' : 'fas fa-chevron-right';
}

function createNewFile() {
    const fileName = prompt("New file name (e.g. script.js):");
    if (!fileName || fileName.trim() === "") return;
    const fileId = fileName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    if(document.getElementById(`box-${fileId}`)) { alert("File exists!"); return; }
    addFileToUI(fileName, fileId);
}

function addFileToUI(name, id, content = "") {
    const fileList = document.getElementById('file-list');
    const newTab = document.createElement('div');
    newTab.className = 'file-item';
    newTab.id = `tab-${id}`;
    newTab.innerHTML = `<span><i class="fas fa-file-code"></i> ${name}</span> <small id="status-${id}" style="display:none;">(min)</small>`;
    newTab.onclick = () => restoreBox(id);
    fileList.appendChild(newTab);

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
        <textarea id="${id}-code" spellcheck="false">${content}</textarea>
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
    const boxes = document.querySelectorAll('.editor-box');
    const current = document.getElementById(`box-${id}`);
    if (current.style.flex === "10") {
        boxes.forEach(b => b.style.flex = "1");
    } else {
        boxes.forEach(b => b.style.flex = "0.1");
        current.style.flex = "10";
        current.style.display = "flex";
    }
}

function deleteBox(id) {
    if(confirm("Delete this file?")) {
        document.getElementById(`box-${id}`).remove();
        document.getElementById(`tab-${id}`).remove();
    }
}

// --- 3. CORE EDITOR & AUTOCOMPLETE (Pahilyasarkhe) ---

function attachInputListeners(txt) {
    txt.addEventListener('input', (e) => {
        const pos = txt.selectionStart;
        const val = txt.value;
        const char = e.data;
        currentLang = txt.id.includes('html') ? 'html' : txt.id.includes('css') ? 'css' : 'js';

        const pairs = { '{': '}', '(': ')', '[': ']', '"': '"', "'": "'" };
        if (pairs[char]) {
            txt.value = val.substring(0, pos) + pairs[char] + val.substring(pos);
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

    if (lastWord.length < 1) { sBox.style.display = 'none'; return; }
    const matches = dictionary[currentLang].filter(word => word.startsWith(lastWord));

    if (matches.length > 0) {
        selectedIdx = 0;
        const rect = txt.getBoundingClientRect();
        sBox.style.top = `${rect.top + 35}px`; 
        sBox.style.left = `${rect.left + 20}px`;
        sBox.style.display = 'block';
        sBox.innerHTML = matches.map((m, i) => `<div class="suggestion-item ${i === 0 ? 'active' : ''}" onclick="insertWord('${m}', '${txt.id}')">${m}</div>`).join('');
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
        const items = sBox.querySelectorAll('.suggestion-item');
        if (e.key === 'ArrowDown') { e.preventDefault(); selectedIdx = (selectedIdx + 1) % items.length; updateActive(items); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); selectedIdx = (selectedIdx - 1 + items.length) % items.length; updateActive(items); }
        else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); if (items[selectedIdx]) items[selectedIdx].click(); }
        else if (e.key === 'Escape') { sBox.style.display = 'none'; }
    }
}

function updateActive(items) { items.forEach((it, i) => it.classList.toggle('active', i === selectedIdx)); }

// --- 4. TOOLBAR ACTIONS (Pahilyasarkhe Work Kartil) ---

function updateThemeAndFont() {
    const themeKey = document.getElementById('theme-sel').value;
    const font = document.getElementById('font-family-sel').value;
    const theme = themes[themeKey] || themes.dark;

    document.documentElement.style.setProperty('--bg', theme.bg);
    document.documentElement.style.setProperty('--panel', theme.panel);
    document.documentElement.style.setProperty('--accent', theme.accent);
    document.documentElement.style.setProperty('--border-color', theme.border);
    
    document.querySelectorAll('textarea').forEach(tx => {
        tx.style.fontFamily = font;
        tx.style.color = theme.text;
        tx.style.background = theme.bg;
    });
    document.querySelectorAll('.label, .action-sidebar, header').forEach(el => el.style.background = theme.panel);
    document.querySelectorAll('.sidebar-shutter').forEach(sh => sh.style.background = theme.accent);
}

function beautifyCode() {
    document.querySelectorAll('textarea').forEach(tx => {
        let val = tx.value;
        if (tx.id.includes('html')) {
            tx.value = val.replace(/>\s+</g, '><').replace(/></g, '>\n<');
        } else if (tx.id.includes('css')) {
            tx.value = val.replace(/\s*([\{\}\:\;])\s*/g, "$1\n  ").replace(/\}\n\s*/g, "}\n\n");
        }
    });
}

function exportCode() {
    const h = document.getElementById('html-code') ? document.getElementById('html-code').value : '';
    const c = document.getElementById('css-code') ? document.getElementById('css-code').value : '';
    const content = `<!DOCTYPE html><html><head><style>${c}</style></head><body>${h}</body></html>`;
    const blob = new Blob([content], {type: "text/html"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "index.html"; a.click();
}

function runCode() {
    const overlay = document.getElementById('preview-overlay');
    overlay.style.display = 'flex';
    const h = document.getElementById('html-code') ? document.getElementById('html-code').value : '';
    const c = `<style>${document.getElementById('css-code') ? document.getElementById('css-code').value : ''}</style>`;
    const out = document.getElementById('output').contentWindow.document;
    out.open(); out.write(h + c); out.close();
}

function toggleSettings() { document.getElementById('settingsPanel').classList.toggle('open'); }
function closePreview() { document.getElementById('preview-overlay').style.display = 'none'; }
function undoCode() { document.execCommand('undo'); }
function redoCode() { document.execCommand('redo'); }

// --- INITIAL LOAD ---
window.onload = () => {
    addFileToUI("index.html", "html", "<h1>Craby Editor</h1>");
    addFileToUI("style.css", "css", "h1 { color: #ffb400; }");
    updateThemeAndFont();
};
