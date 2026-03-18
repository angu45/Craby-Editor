/**
 * CRABY EDITOR - ALL-IN-ONE LOGIC
 * Combined from 3 Files: File Management, UI/Shutter, and Core Settings.
 */

// --- 1. CONFIGURATION & STATE ---
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
let showLineNumbers = false; // Set to false per your requirement
let currentActiveFile = null;
let selectedIndex = 0;

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

// --- 4. PREVIEW & RUN LOGIC ---

function runCode() {
    const htmlFiles = Object.keys(files).filter(f => f.endsWith('.html'));
    if (htmlFiles.length === 0) { alert("No HTML files available!"); return; }

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
        html,body{margin:0;padding:0;width:100%;height:100%;background:transparent !important;}
        body{padding:15px;box-sizing:border-box;font-family:sans-serif;}
        ${themeCSS}</style></head><body>${files[selectedFile].content}
        <script>window.onbeforeunload=()=>false;${Object.keys(files).filter(f=>f.endsWith('.js')).map(f=>files[f].content).join('\n')}<\/script></body></html>`;

    const doc = frame.contentWindow.document;
    doc.open(); doc.write(finalHTML); doc.close();
    if (!frame.style.width || frame.style.width === "100%") setPreviewSize('100%');
}

function setPreviewSize(width) {
    const frame = document.getElementById('output-frame');
    if (width === '100%') {
        frame.style.width = "100%"; frame.style.height = "100%"; frame.style.border = "none";
    } else {
        frame.style.width = "375px"; frame.style.height = "667px"; frame.style.border = "14px solid #333"; frame.style.borderRadius = "35px";
    }
}

function closePreview() { document.getElementById('preview-overlay').style.display = 'none'; }

// --- 5. SETTINGS, THEME & UTILITIES ---

function updateThemeAndFont() {
    const tKey = document.getElementById('theme-sel')?.value || 'dark';
    const font = document.getElementById('font-family-sel')?.value || 'monospace';
    const theme = themes[tKey];
    
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

function saveSettings() {
    const settings = {
        theme: document.getElementById('theme-sel').value,
        fontSize: document.getElementById('font-size-range').value,
        fontFamily: document.getElementById('font-family-sel').value
    };
    localStorage.setItem('craby_settings', JSON.stringify(settings));
}

function loadSettings() {
    const saved = localStorage.getItem('craby_settings');
    if (!saved) return;
    const settings = JSON.parse(saved);
    if(settings.theme) document.getElementById('theme-sel').value = settings.theme;
    if(settings.fontSize) updateFontSize(settings.fontSize);
    if(settings.fontFamily) document.getElementById('font-family-sel').value = settings.fontFamily;
    updateThemeAndFont();
}

function updateFontSize(val) {
    const display = document.getElementById('font-size-val');
    if(display) display.innerText = val + "px";
    document.querySelectorAll('textarea').forEach(tx => { tx.style.fontSize = val + "px"; });
    const range = document.getElementById('font-size-range');
    if(range) range.value = val;
}

function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    if (panel.style.display === 'none' || !panel.classList.contains('open')) {
        panel.style.display = 'block';
        setTimeout(() => panel.classList.add('open'), 10);
    } else {
        panel.classList.remove('open');
        setTimeout(() => { panel.style.display = 'none'; saveSettings(); }, 300);
    }
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

function beautifyCode() {
    Object.keys(files).forEach(fileName => {
        let content = files[fileName].content;
        const type = files[fileName].type;
        if (!content) return;

        if(type === "html") {
            content = content.replace(/>\s*</g, "><").replace(/</g, "\n<").trim();
        } else if(type === "css") {
            content = content.replace(/\s*\{\s*/g, " {\n  ").replace(/;\s*/g, ";\n  ").replace(/\s*\}\s*/g, "\n}\n");
        } else if(type === "js") {
            content = content.replace(/\{\s*/g, " {\n  ").replace(/\}\s*/g, "\n}\n").replace(/;\s*/g, ";\n");
        }
        
        files[fileName].content = content;
        document.querySelectorAll('textarea').forEach(tx => {
            if(tx.getAttribute('data-filename') === fileName) tx.value = content;
        });
    });
}

// --- 6. CORE UTILS ---
function updateFileContent(name, val) { if(files[name]) files[name].content = val; }
function updateLineNumbers(id) { /* Disabled per request */ }
function syncScroll(safeId) {
    const tx = document.getElementById(`${safeId}-code`);
    const lb = document.getElementById(`${safeId}-lines`);
    if(tx && lb) lb.scrollTop = tx.scrollTop;
}
function minimizeBox(id) { document.getElementById(`box-${id}`).style.display='none'; }
function expandBox(id) { document.getElementById(`box-${id}`).classList.toggle('fullscreen'); }
function resetAllSettings() { if(confirm("Reset everything?")) { localStorage.removeItem('craby_settings'); location.reload(); } }

// --- 7. INITIALIZATION ---
window.onload = () => {
    updateTaskbar();
    addFileToUI("index.html", "html", files["index.html"].content);
    addFileToUI("style.css", "css", files["style.css"].content);
    loadSettings();
    window.onbeforeunload = () => "Unsaved changes might be lost.";
};
