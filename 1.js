/**
 * CRABY EDITOR - FINAL COMPREHENSIVE LOGIC
 * Includes: File System, Shutter, Settings, Preview, Suggestion, and Formatting.
 */

// --- 1. GLOBAL CONFIGURATION ---
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
let showLineNumbers = false; // DEFAULT DISABLED
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

// Suggestion Box Setup
const sBox = document.createElement('div');
sBox.id = 'suggestion-box';
document.body.appendChild(sBox);

// --- 2. FILE & UI CORE ---

// --- UPDATED TASKBAR FUNCTION (FIXED ALIGNMENT) ---

function updateTaskbar() {
    const taskbar = document.getElementById('shutter-file-list'); 
    if(!taskbar) return;
    
    taskbar.innerHTML = ''; // Juna kachra clear kara

    Object.keys(files).forEach(fileName => {
        const fileItem = document.createElement('div');
        fileItem.className = 'shutter-item';
        
        // Inline CSS for Perfect Alignment
        fileItem.style.display = 'flex';
        fileItem.style.alignItems = 'center';
        fileItem.style.justifyContent = 'flex-start';
        fileItem.style.gap = '12px';
        fileItem.style.padding = '10px 15px';
        fileItem.style.margin = '5px 10px';
        fileItem.style.borderRadius = '8px';
        fileItem.style.background = 'rgba(255, 255, 255, 0.05)'; // Halka background dila aahe box sarkha distava mhanun
        fileItem.style.cursor = 'pointer';

        // Logo (Left) ani Name (Right to Logo)
        fileItem.innerHTML = `
            <i class="fas fa-file-code" style="color: var(--accent); font-size: 1.2rem;"></i> 
            <span style="color: white; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${fileName}
            </span>
        `;

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

// --- 3. ALL BUTTON FUNCTIONS ---

function toggleShutter() {
    const shutter = document.getElementById('shutter');
    const trigger = document.getElementById('shutter-trigger');
    if(!shutter) return;
    shutter.classList.toggle('open');
    const icon = trigger.querySelector('i');
    icon.className = shutter.classList.contains('open') ? 'fas fa-chevron-left' : 'fas fa-chevron-right';
}

function addNewFilePrompt() {
    const fileName = prompt("Enter File Name (e.g., script.js):");
    if (fileName) {
        if (files[fileName]) { alert("File exists!"); return; }
        const type = fileName.split('.').pop().toLowerCase();
        files[fileName] = { content: "", type: type };
        addFileToUI(fileName, type, "");
        updateTaskbar();
    }
}

function runCode() {
    const htmlFiles = Object.keys(files).filter(f => f.endsWith('.html'));
    if (htmlFiles.length === 0) { alert("No HTML files!"); return; }
    
    let selectedFile = currentActiveFile || htmlFiles[0];
    currentActiveFile = selectedFile;

    const overlay = document.getElementById('preview-overlay');
    const frame = document.getElementById('output-frame');
    overlay.style.display = 'flex';
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

function beautifyCode(){

const textareas=document.querySelectorAll('.editor-grid textarea');

if(typeof files==="undefined") return;

Object.keys(files).forEach(fileName=>{

let content=files[fileName].content;
const type=fileName.split('.').pop().toLowerCase();

if(!content) return;


/* ---------- HTML FORMAT ---------- */
if(type==="html"){

let indent=0;

content=content
.replace(/>\s*</g,"><")
.replace(/</g,"\n<")
.trim()
.split("\n")
.map(line=>{

line=line.trim();

if(line.match(/^<\/.+/)) indent--;

let formatted=" ".repeat(indent*2)+line;

if(line.match(/^<[^!\/].*[^\/]>$/)) indent++;

return formatted;

}).join("\n");

}


/* ---------- CSS FORMAT ---------- */
else if(type==="css"){

content=content
.replace(/\s*\{\s*/g," {\n  ")
.replace(/;\s*/g,";\n  ")
.replace(/\s*\}\s*/g,"\n}\n")
.replace(/\s*:\s*/g,": ")
.replace(/,\s*/g,", ")
.replace(/\n\s*\n/g,"\n")
.trim();

}


/* ---------- JS FORMAT ---------- */
else if(type==="js"){

content=content
.replace(/\{\s*/g," {\n  ")
.replace(/\}\s*/g,"\n}\n")
.replace(/;\s*/g,";\n")
.replace(/,\s*/g,", ")
.replace(/if\s*\(/g,"if (")
.replace(/for\s*\(/g,"for (")
.replace(/while\s*\(/g,"while (")
.replace(/\n\s*\n/g,"\n")
.trim();

}


/* Save formatted code */
files[fileName].content=content;


/* Update UI */
textareas.forEach(tx=>{

if(tx.getAttribute("data-filename")===fileName || tx.id.includes(type)){
tx.value=content;
}

});

});

}

function exportCode() {
    const fileList = Object.keys(files);
    let promptText = "Type file number to download:\n" + fileList.map((n, i) => `${i+1}. ${n}`).join('\n');
    const choice = parseInt(prompt(promptText)) - 1;
    if (fileList[choice]) {
        const blob = new Blob([files[fileList[choice]].content], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileList[choice];
        a.click();
    }
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

// --- 4. SUGGESTION & UTILS ---

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
    updateFileContent(txt.getAttribute('data-filename'), txt.value);
}

// --- 5. THEME & SYSTEM ---

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
    const display = document.getElementById('font-size-val');
    if(display) display.innerText = val + "px";
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
function updateLineNumbers(id) {} // Disabled
function closePreview() { document.getElementById('preview-overlay').style.display = 'none'; }
function setPreviewSize(w) { document.getElementById('output-frame').style.width = w; }

function saveSettings() {
    const s = { theme: document.getElementById('theme-sel').value, size: document.getElementById('font-size-range').value, font: document.getElementById('font-family-sel').value };
    localStorage.setItem('craby_settings', JSON.stringify(s));
}

function resetAllSettings() { if(confirm("Reset all?")) { localStorage.removeItem('craby_settings'); location.reload(); } }

// --- 6. INITIALIZATION ---

window.onload = () => {
    updateTaskbar();
    // DEFAULT 2 FILES ON HOME
    addFileToUI("index.html", "html", files["index.html"].content);
    addFileToUI("style.css", "css", files["style.css"].content);
    
    // Load Saved Settings
    const saved = localStorage.getItem('craby_settings');
    if(saved) {
        const s = JSON.parse(saved);
        if(document.getElementById('theme-sel')) document.getElementById('theme-sel').value = s.theme;
        if(document.getElementById('font-family-sel')) document.getElementById('font-family-sel').value = s.font;
        updateFontSize(s.size);
    }
    updateThemeAndFont();
    window.onbeforeunload = () => "Unsaved changes might be lost.";
};
