/**
 * CRABY EDITOR - FINAL INTEGRATED JS
 * Features: No Line Numbers, Default HTML/CSS on Load, Full Sandboxing.
 */

// --- 1. CONFIGURATION & STATE ---
const dictionary = {
    html: ['div','span','h1','h2','h3','p','a','button','input','img','ul','li','article','aside','body','br','canvas','code','footer','form','head','header','html','iframe','label','link','main','nav','ol','script','section','select','style','table','textarea','title','tr','td','ul','main','strong','em','hr'],
    css: ['color','background','margin','padding','display','flex','grid','border','border-radius','box-shadow','cursor','font-family','font-size','height','width','opacity','position','top','left','right','bottom','z-index','transition','overflow','justify-content','align-items'],
    js: ['console.log','document','window','function','const','let','var','if','else','for','forEach','map','fetch','addEventListener','setTimeout','setInterval','JSON.stringify','JSON.parse','alert','Math.random','Math.floor','querySelector','getElementById']
};

const defaultFiles = {
    "index.html": { 
        content: `<!DOCTYPE html>\n<html>\n<head>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Craby Editor Ready</h1>\n  <p>Start coding here...</p>\n</body>\n</html>`, 
        type: "html" 
    },
    "style.css": { 
        content: "body { background: #f4f4f4; }\nh1 { color: #ffb400; text-align: center; font-family: sans-serif; margin-top: 50px; }", 
        type: "css" 
    }
};

let files = JSON.parse(JSON.stringify(defaultFiles));
let showLineNumbers = false; // DEFAULT DISABLED
let currentActiveFile = null;
let selectedIndex = 0;

const themes = {
    dark: { bg: '#0d1117', panel: '#161b22', accent: '#ffb400', text: '#9cdcfe', border: '#30363d' }, 
    light: { bg: '#eef1f4', panel: '#ffffff', accent: '#f59e0b', text: '#374151', border: '#e5e7eb' },  
    monokai: { bg: '#272822', panel: '#3e3d32', accent: '#f92672', text: '#f8f8f2', border: '#49483e' },
    dracula: { bg: '#282a36', panel: '#44475a', accent: '#bd93f9', text: '#f8f8f2', border: '#6272a4' }
};

// Injection of Suggestion Box
const sBox = document.createElement('div');
sBox.id = 'suggestion-box';
document.body.appendChild(sBox);

// --- 2. UI & FILE MANAGEMENT ---

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
                oninput="updateFileContent('${name}', this.value); updateLineNumbers('${safeId}')"
                onscroll="syncScroll('${safeId}')">${content}</textarea>
        </div>
    `;
    wrapper.appendChild(newBox);
    attachInputListeners(document.getElementById(`${safeId}-code`));
    updateThemeAndFont();
}

function deleteFile(fileName) {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;
    delete files[fileName];
    const safeId = "file-" + fileName.replace(/[^a-z0-9]/gi, '-');
    const mainBox = document.getElementById(`box-${safeId}`);
    if (mainBox) mainBox.remove();
    updateTaskbar();
}

function addNewFilePrompt() {
    const fileName = prompt("File Name (e.g. script.js):");
    if (fileName) {
        if (files[fileName]) { alert("File already exists!"); return; }
        const type = fileName.split('.').pop().toLowerCase();
        files[fileName] = { content: "", type: type };
        addFileToUI(fileName, type, "");
        updateTaskbar();
    }
}

// --- 3. SUGGESTION SYSTEM ---

function attachInputListeners(txt) {
    txt.addEventListener('keydown', (e) => {
        const items = document.querySelectorAll('.suggestion-item');
        if (sBox.style.display === 'block' && items.length > 0) {
            if (e.key === 'Enter') {
                e.preventDefault();
                items[selectedIndex].click();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = (selectedIndex + 1) % items.length;
                updateHighlight(items);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = (selectedIndex - 1 + items.length) % items.length;
                updateHighlight(items);
            }
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

function updateHighlight(items) {
    items.forEach((item, index) => {
        item.style.backgroundColor = (index === selectedIndex) ? '#3e4451' : '';
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
        sBox.style.top = `${rect.top + 30}px`; 
        sBox.style.left = `${rect.left + 20}px`;
        sBox.style.display = 'block';
        selectedIndex = 0; 
        sBox.innerHTML = matches.map((m, i) => `<div class="suggestion-item" ${i===0?'style="background:#3e4451"':''} onclick="insertWord('${m}', '${txt.id}')">${m}</div>`).join('');
    } else { sBox.style.display = 'none'; }
}

function insertWord(word, id) {
    const txt = document.getElementById(id);
    const pos = txt.selectionStart;
    const lang = txt.getAttribute('data-lang');
    const before = txt.value.substring(0, pos).replace(/[\w.-]+$/, "");
    const after = txt.value.substring(pos);

    let finalInsert = word;
    let offset = word.length;

    if (lang === 'html') {
        if (word === 'h1') { finalInsert = `<h1></h1>`; offset = 4; }
        else if (!word.includes('<')) { finalInsert = `<${word}></${word}>`; offset = word.length + 2; }
    }

    txt.value = before + finalInsert + after;
    txt.selectionStart = txt.selectionEnd = before.length + offset;
    sBox.style.display = 'none';
    txt.focus();
    updateFileContent(id.replace('file-','').replace('-code',''), txt.value);
}

// --- 4. PREVIEW & RUN LOGIC (SANDBOXED) ---

function runCode() {
    const htmlFiles = Object.keys(files).filter(f => f.endsWith('.html'));
    if (htmlFiles.length === 0) { alert("No HTML files!"); return; }

    let selectedFile = currentActiveFile || htmlFiles[0];
    currentActiveFile = selectedFile;

    const overlay = document.getElementById('preview-overlay');
    const frame = document.getElementById('output-frame');
    overlay.style.display = 'flex';
    overlay.style.backgroundColor = "rgba(0,0,0,0.8)"; 

    frame.setAttribute('sandbox', 'allow-scripts');

    let themeCSS = "";
    Object.keys(files).forEach(name => { if(name.endsWith('.css')) themeCSS += files[name].content + "\n"; });

    let finalHTML = `<!DOCTYPE html><html><head><style>
        html,body{margin:0;padding:0;width:100%;height:100%;background:white !important;}
        body{padding:15px;box-sizing:border-box;font-family:sans-serif;}
        ${themeCSS}</style></head><body>${files[selectedFile].content}
        <script>window.onbeforeunload=()=>false;${Object.keys(files).filter(f=>f.endsWith('.js')).map(f=>files[f].content).join('\n')}<\/script></body></html>`;

    const doc = frame.contentWindow.document;
    doc.open(); doc.write(finalHTML); doc.close();
}

// --- 5. SETTINGS, THEME & UTILITIES ---

function updateThemeAndFont() {
    const tKey = document.getElementById('theme-sel')?.value || 'dark';
    const font = document.getElementById('font-family-sel')?.value || 'monospace';
    const theme = themes[tKey] || themes.dark;
    
    document.documentElement.style.setProperty('--bg', theme.bg);
    document.documentElement.style.setProperty('--panel', theme.panel);
    document.documentElement.style.setProperty('--accent', theme.accent);
    document.documentElement.style.setProperty('--border', theme.border);
    
    document.querySelectorAll('textarea').forEach(tx => { 
        tx.style.fontFamily = font; 
        tx.style.color = theme.text; 
        tx.style.background = theme.bg; 
    });
}

function toggleShutter() {
    const shutter = document.getElementById('shutter');
    const trigger = document.getElementById('shutter-trigger');
    shutter.classList.toggle('open');
    const icon = trigger.querySelector('i');
    icon.className = shutter.classList.contains('open') ? 'fas fa-chevron-left' : 'fas fa-chevron-right';
}

function exportCode() {
    const fileList = Object.keys(files);
    let promptText = "File Number to download:\n" + fileList.map((n, i) => `${i+1}. ${n}`).join('\n');
    const choice = parseInt(prompt(promptText)) - 1;
    if (fileList[choice]) {
        const blob = new Blob([files[fileList[choice]].content], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileList[choice];
        a.click();
    }
}

// --- 6. CORE UTILS ---
function updateFileContent(name, val) { if(files[name]) files[name].content = val; }
function updateLineNumbers(id) { /* Line numbers disabled */ }
function syncScroll(safeId) { }
function minimizeBox(id) { document.getElementById(`box-${id}`).style.display='none'; }
function expandBox(id) { document.getElementById(`box-${id}`).classList.toggle('fullscreen'); }
function resetAllSettings() { if(confirm("Reset everything?")) { localStorage.removeItem('craby_settings'); location.reload(); } }

// --- 7. INITIALIZATION (DEFAULT ON LOAD) ---
window.onload = () => {
    updateTaskbar();
    
    // Default 2 files on homepage
    if(files["index.html"]) addFileToUI("index.html", "html", files["index.html"].content);
    if(files["style.css"]) addFileToUI("style.css", "css", files["style.css"].content);
    
    // UI Setup
    updateThemeAndFont();
    window.onbeforeunload = () => "Unsaved changes might be lost.";
};
