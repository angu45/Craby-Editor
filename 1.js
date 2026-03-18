/**
 * CRABY EDITOR - FINAL INTEGRATED JS
 * Default: Line Numbers Disabled | index.html & style.css Auto-open
 */

// --- 1. CONFIGURATION ---
const dictionary = {
    html: ['div','span','h1','h2','h3','p','a','button','input','img','ul','li','article','aside','body','br','canvas','code','footer','form','head','header','html','iframe','label','link','main','nav','ol','script','section','select','style','table','textarea','title','tr','td','ul','main','strong','em','hr'],
    css: ['color','background','margin','padding','display','flex','grid','border','border-radius','box-shadow','cursor','font-family','font-size','height','width','opacity','position','top','left','right','bottom','z-index','transition','overflow','justify-content','align-items'],
    js: ['console.log','document','window','function','const','let','var','if','else','for','forEach','map','fetch','addEventListener','setTimeout','setInterval','JSON.stringify','JSON.parse','alert','Math.random','Math.floor','querySelector','getElementById']
};

const defaultFiles = {
    "index.html": { 
        content: `<!DOCTYPE html>\n<html>\n<head>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Craby Editor Ready</h1>\n</body>\n</html>`, 
        type: "html" 
    },
    "style.css": { content: "h1 { color: #ffb400; text-align: center; font-family: sans-serif; margin-top: 50px; }", type: "css" }
};

let files = JSON.parse(JSON.stringify(defaultFiles));
let showLineNumbers = false; // DEFAUlT: DISABLED
let currentActiveFile = null;
let selectedIndex = 0;

const themes = {
    dark: { bg: '#0d1117', panel: '#161b22', accent: '#ffb400', text: '#9cdcfe', border: '#30363d' }, 
    light: { bg: '#eef1f4', panel: '#ffffff', accent: '#f59e0b', text: '#374151', border: '#e5e7eb' },
    dracula: { bg: '#282a36', panel: '#44475a', accent: '#bd93f9', text: '#f8f8f2', border: '#6272a4' }
};

// Injection of Suggestion Box
const sBox = document.createElement('div');
sBox.id = 'suggestion-box';
document.body.appendChild(sBox);

// --- 2. FILE & UI MANAGEMENT ---

function updateTaskbar() {
    const taskbar = document.getElementById('shutter-file-list'); 
    if(!taskbar) return;
    taskbar.innerHTML = ''; 
    Object.keys(files).forEach(fileName => {
        const fileItem = document.createElement('div');
        fileItem.className = 'shutter-item';
        fileItem.innerHTML = `<i class="fas fa-file-code"></i> <span>${fileName}</span>`;
        fileItem.onclick = () => {
            addFileToUI(fileName, files[fileName].type, files[fileName].content);
            if(window.innerWidth < 768) toggleShutter(); 
        };
        taskbar.appendChild(fileItem);
    });
}

function addFileToUI(name, type, content = "") {
    const wrapper = document.getElementById('editor-grid');
    if(!wrapper) return;
    const safeId = "file-" + name.replace(/[^a-z0-9]/gi, '-');
    
    if(document.getElementById(`box-${safeId}`)) {
        document.getElementById(`box-${safeId}`).style.display = 'flex';
        return;
    }

    const newBox = document.createElement('div');
    newBox.className = 'window-frame';
    newBox.id = `box-${safeId}`;
    newBox.innerHTML = `
        <div class="window-header">
            <span class="window-title">${name.toUpperCase()} <i class="fas fa-code"></i></span>
            <div class="window-controls">
                <i class="fas fa-minus" onclick="minimizeBox('${safeId}')"></i>
                <i class="fas fa-expand" onclick="expandBox('${safeId}')"></i>
                <i class="fas fa-trash" onclick="deleteFile('${name}')"></i>
            </div>
        </div>
        <div class="window-body editor-container" style="display: flex; position: relative; background: #0b1619; overflow: hidden;">
            <div class="line-numbers" id="${safeId}-lines" style="display: none;"></div>
            <textarea id="${safeId}-code" spellcheck="false" data-lang="${type}" data-filename="${name}"
                style="flex: 1; padding: 15px; border: none; outline: none; background: transparent; color: #e0e0e0; resize: none; white-space: pre; overflow: auto; line-height: 1.5; font-family: monospace;"
                oninput="updateFileContent('${name}', this.value)"
                onscroll="syncScroll('${safeId}')">${content}</textarea>
        </div>
    `;
    wrapper.appendChild(newBox);
    attachInputListeners(document.getElementById(`${safeId}-code`));
    updateThemeAndFont();
}

// --- 3. SUGGESTION & CORE LOGIC ---

function attachInputListeners(txt) {
    txt.addEventListener('keydown', (e) => {
        const items = document.querySelectorAll('.suggestion-item');
        if (sBox.style.display === 'block' && items.length > 0) {
            if (e.key === 'Enter') { e.preventDefault(); items[selectedIndex].click(); }
            else if (e.key === 'ArrowDown') { e.preventDefault(); selectedIndex = (selectedIndex + 1) % items.length; updateHighlight(items); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); selectedIndex = (selectedIndex - 1 + items.length) % items.length; updateHighlight(items); }
        }
    });
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

function showSuggestions(txt) {
    const pos = txt.selectionStart;
    const word = txt.value.substring(0, pos).split(/[\s<>{}:;()]/).pop().toLowerCase();
    if (word.length < 1) { sBox.style.display = 'none'; return; }
    const lang = txt.getAttribute('data-lang');
    const matches = (dictionary[lang] || []).filter(w => w.startsWith(word));
    if (matches.length > 0) {
        const rect = txt.getBoundingClientRect();
        sBox.style.top = `${rect.top + 30}px`; sBox.style.left = `${rect.left + 20}px`;
        sBox.style.display = 'block'; selectedIndex = 0; 
        sBox.innerHTML = matches.map((m, i) => `<div class="suggestion-item" ${i===0?'style="background:#3e4451"':''} onclick="insertWord('${m}', '${txt.id}')">${m}</div>`).join('');
    } else { sBox.style.display = 'none'; }
}

function insertWord(word, id) {
    const txt = document.getElementById(id);
    const pos = txt.selectionStart;
    const before = txt.value.substring(0, pos).replace(/[\w.-]+$/, "");
    const after = txt.value.substring(pos);
    txt.value = before + word + after;
    txt.selectionStart = txt.selectionEnd = before.length + word.length;
    sBox.style.display = 'none'; txt.focus();
    updateFileContent(id.replace('file-','').replace('-code',''), txt.value);
}

// --- 4. PREVIEW (SANDBOXED) ---
function runCode() {
    const htmlFiles = Object.keys(files).filter(f => f.endsWith('.html'));
    if (htmlFiles.length === 0) return;
    let selectedFile = currentActiveFile || htmlFiles[0];
    const overlay = document.getElementById('preview-overlay');
    const frame = document.getElementById('output-frame');
    overlay.style.display = 'flex';
    frame.setAttribute('sandbox', 'allow-scripts');

    let themeCSS = "";
    Object.keys(files).forEach(name => { if(name.endsWith('.css')) themeCSS += files[name].content + "\n"; });

    let finalHTML = `<!DOCTYPE html><html><head><style>
        html,body{margin:0;padding:0;width:100%;height:100%;background:white;}
        body{padding:15px;box-sizing:border-box;font-family:sans-serif;}
        ${themeCSS}</style></head><body>${files[selectedFile].content}
        <script>${Object.keys(files).filter(f=>f.endsWith('.js')).map(f=>files[f].content).join('\n')}<\/script></body></html>`;

    const doc = frame.contentWindow.document;
    doc.open(); doc.write(finalHTML); doc.close();
}

// --- 5. SETTINGS & THEMES ---
function updateThemeAndFont() {
    const tKey = document.getElementById('theme-sel')?.value || 'dark';
    const font = document.getElementById('font-family-sel')?.value || 'monospace';
    const theme = themes[tKey] || themes.dark;
    document.documentElement.style.setProperty('--bg', theme.bg);
    document.documentElement.style.setProperty('--panel', theme.panel);
    document.documentElement.style.setProperty('--accent', theme.accent);
    document.querySelectorAll('textarea').forEach(tx => { 
        tx.style.fontFamily = font; tx.style.color = theme.text; tx.style.background = theme.bg; 
    });
}

function toggleShutter() {
    const shutter = document.getElementById('shutter');
    shutter.classList.toggle('open');
}

// --- 6. UTILS ---
function updateFileContent(name, val) { if(files[name]) files[name].content = val; }
function updateLineNumbers(id) { /* DISABLED */ }
function syncScroll(id) { }
function minimizeBox(id) { document.getElementById(`box-${id}`).style.display='none'; }
function expandBox(id) { document.getElementById(`box-${id}`).classList.toggle('fullscreen'); }
function deleteFile(n) { if(confirm("Delete?")) { delete files[n]; updateTaskbar(); location.reload(); } }

// --- 7. INITIALIZATION (DEFAULT ON) ---
window.onload = () => {
    updateTaskbar();
    // HTML ani CSS default open thevne
    addFileToUI("index.html", "html", files["index.html"].content);
    addFileToUI("style.css", "css", files["style.css"].content);
    
    const saved = localStorage.getItem('craby_settings');
    if(saved) {
        const s = JSON.parse(saved);
        if(s.fontSize) document.querySelectorAll('textarea').forEach(tx => tx.style.fontSize = s.fontSize + "px");
    }
    updateThemeAndFont();
};
