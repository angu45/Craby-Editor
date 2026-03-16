/**
 * Craby Editor - Full System Logic
 * Includes: Analytics, Suggestion System, File Management, Themes & Preview Fixes
 */

// --- 1. CONFIGURATION & DICTIONARY ---
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
const sBox = document.createElement('div');
sBox.id = 'suggestion-box';
document.body.appendChild(sBox);

let showLineNumbers = false; 
let lineNumberFontSize = 14; 
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

// --- 2. FILE & UI MANAGEMENT ---

function updateTaskbar() {
    const taskbar = document.getElementById('shutter-file-list'); 
    if(!taskbar) return;
    taskbar.innerHTML = ''; 
    Object.keys(files).forEach(fileName => {
        const fileItem = document.createElement('div');
        fileItem.className = 'shutter-item';
        fileItem.innerHTML = `<i class="fas fa-file-code"></i> <span>${fileName}</span>`;
        fileItem.onclick = () => addFileToUI(fileName, files[fileName].type, files[fileName].content);
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
            <div class="line-numbers" id="${safeId}-lines" style="display:${showLineNumbers ? 'block' : 'none'};">1.</div>
            <textarea id="${safeId}-code" spellcheck="false" data-lang="${type}" 
                oninput="updateFileContent('${name}', this.value); updateLineNumbers('${safeId}')"
                onscroll="syncScroll('${safeId}')">${content}</textarea>
        </div>
    `;
    wrapper.appendChild(newBox);
    attachInputListeners(document.getElementById(`${safeId}-code`));
    updateLineNumbers(safeId);
    updateThemeAndFont(); // नवीन विन्डोला थीम लागू करण्यासाठी
}

// --- 3. SUGGESTION SYSTEM (ENTER & TOP SELECT FIX) ---

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

        sBox.innerHTML = matches.map((m, index) => {
            let label = (m === 'h1 class') ? 'h1 class=""' : m;
            let style = (index === 0) ? 'style="background-color: #3e4451;"' : '';
            return `<div class="suggestion-item" ${style} onclick="insertWord('${m}', '${txt.id}')">${label}</div>`;
        }).join('');
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
        else if (word === 'h1 class') { finalInsert = `<h1 class=""></h1>`; offset = 10; }
        else if (!word.includes('<')) { finalInsert = `<${word}></${word}>`; offset = word.length + 2; }
    }

    txt.value = before + finalInsert + after;
    txt.selectionStart = txt.selectionEnd = before.length + offset;
    sBox.style.display = 'none';
    txt.focus();
    updateFileContent(id.replace('file-','').replace('-code',''), txt.value);
}

// --- 1. RUN CODE LOGIC (WITH HTML SELECTION & VIEWPORT FIX) ---

function runCode() {
    const htmlFiles = Object.keys(files).filter(f => f.endsWith('.html'));
    if (htmlFiles.length === 0) return alert("कोणतीही HTML फाईल उपलब्ध नाही!");

    let choice = prompt("रन करण्यासाठी फाईल निवडा:\n" + htmlFiles.map((f, i) => `${i + 1}. ${f}`).join('\n'), htmlFiles[0]);
    let selectedFile = htmlFiles.find(f => f === choice) || htmlFiles[parseInt(choice) - 1] || htmlFiles[0];

    const overlay = document.getElementById('preview-overlay');
    const frame = document.getElementById('output-frame');
    overlay.style.display = 'flex';

    let content = files[selectedFile].content;

    // मोबाईलवर फॉन्ट आणि स्केलिंग व्यवस्थित दिसण्यासाठी Viewport Injection
    const viewportTag = `<meta name="viewport" content="width=device-width, initial-scale=1.0">`;
    
    // CSS आणि JS इंजेक्ट करणे
    let cssContent = "";
    let jsContent = "";
    Object.keys(files).forEach(name => {
        if(name.endsWith('.css')) cssContent += files[name].content + "\n";
        if(name.endsWith('.js')) jsContent += files[name].content + "\n";
    });

    // फायनल HTML तयार करणे
    let finalHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            ${viewportTag}
            <style>
                body { background-color: white !important; margin: 0; padding: 10px; font-family: sans-serif; }
                ${cssContent}
            </style>
        </head>
        <body>
            ${content}
            <script>${jsContent}<\/script>
        </body>
        </html>
    `;

    const doc = frame.contentWindow.document;
    doc.open();
    doc.write(finalHTML);
    doc.close();

    setPreviewSize('100%'); // सुरुवातीला डेस्कटॉप व्ह्यू
}

// --- 2. REFRESH LOGIC ---

function refreshPreview() {
    runCode();
    showToast("Output has been refreshed!");
}

function showToast(msg) {
    let toast = document.createElement('div');
    toast.innerText = msg;
    toast.style.cssText = `
        position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
        background: #222; color: #fff; padding: 12px 24px; border-radius: 50px;
        font-size: 14px; z-index: 20000; box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// --- 3. FIX MOBILE & DESKTOP BORDER LOGIC ---

function setPreviewSize(device) {
    const frame = document.getElementById('output-frame');
    const container = document.getElementById('preview-body');

    if (!frame || !container) return;

    // स्मूद ट्रांझिशन
    frame.style.transition = "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
    
    if (device === '100%') {
        // --- DESKTOP MODE ---
        container.style.background = "#f0f0f0"; // बाहेरील भाग हलका राखाडी
        frame.style.width = "100%";
        frame.style.height = "100%";
        frame.style.border = "none";
        frame.style.borderRadius = "0";
        frame.style.boxShadow = "none";
        frame.style.marginTop = "0";
    } 
    else {
        // --- MOBILE MODE (iPhone Realistic Fix) ---
        container.style.background = "#1e1e1e"; // मोबाईल मागे डार्क बॅकग्राउंड जेणेकरून तो उठावदार दिसेल
        frame.style.width = "375px";
        frame.style.height = "750px";
        frame.style.maxWidth = "90vw";
        frame.style.maxHeight = "85vh";
        
        // मोबाईलची खरी बॉर्डर आणि बेझल
        frame.style.background = "white";
        frame.style.border = "12px solid #333"; // फोनची फ्रेम
        frame.style.borderTop = "45px solid #333"; // वरचा भाग (Speaker/Camera)
        frame.style.borderBottom = "45px solid #333"; // खालचा भाग
        frame.style.borderRadius = "40px";
        frame.style.boxShadow = "0 25px 50px -12px rgba(0, 0, 0, 0.8)";
        
        // स्क्रीनवर मोबाईल मधोमध ठेवण्यासाठी
        container.style.display = "flex";
        container.style.alignItems = "center";
        container.style.justifyContent = "center";
    }
}

// --- 5. THEME, FONT & SETTINGS ---

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
    document.querySelectorAll('.line-numbers').forEach(ln => ln.style.fontFamily = font);
}

function resetAllSettings() {
    if(confirm("Reset everything?")) {
        files = JSON.parse(JSON.stringify(defaultFiles));
        document.getElementById('editor-grid').innerHTML = '';
        updateTaskbar();
        window.onload();
        alert("Reset Done!");
    }
}

// --- 6. CORE UTILITIES ---

function updateLineNumbers(safeId) {
    const tx = document.getElementById(`${safeId}-code`);
    const lb = document.getElementById(`${safeId}-lines`);
    if(!tx || !lb) return;
    const lines = tx.value.split('\n').length;
    lb.innerHTML = Array.from({length: lines}, (_, i) => (i + 1) + '.').join('<br>');
}

function updateFileContent(name, val) { if(files[name]) files[name].content = val; }
function syncScroll(id) { 
    const tx = document.getElementById(`${id}-code`);
    const lb = document.getElementById(`${id}-lines`);
    if(tx && lb) lb.scrollTop = tx.scrollTop; 
}
function minimizeBox(id) { document.getElementById(`box-${id}`).style.display='none'; }
function expandBox(id) { document.getElementById(`box-${id}`).classList.toggle('fullscreen'); }

// --- 7. INITIALIZATION ---
window.onload = () => {
    updateTaskbar();
    addFileToUI("index.html", "html", files["index.html"].content);
    addFileToUI("style.css", "css", files["style.css"].content);
};
