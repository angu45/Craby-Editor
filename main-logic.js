/**
 * Craby Editor - Full System Logic (Updated with Syntax Highlighting)
 */

// --- 1. CONFIGURATION & DICTIONARY ---
const dictionary = {
    html:// --- 1. CONFIGURATION & DICTIONARY ---
const dictionary = {
    html: ['div','span','h1','h2','h3','p','a','button','input','img','ul','li','article','aside','body','br','canvas','code','footer','form','head','header','html','iframe','label','link','main','nav','ol','script','section','select','style','table','textarea','title','tr','td','ul','main','strong','em','hr'],
    css: ['color','background','margin','padding','display','flex','grid','border','border-radius','box-shadow','cursor','font-family','font-size','height','width','opacity','position','top','left','right','bottom','z-index','transition','overflow','justify-content','align-items'],
    js: ['console.log','document','window','function','const','let','var','if','else','for','forEach','map','fetch','addEventListener','setTimeout','setInterval','JSON.stringify','JSON.parse','alert','Math.random','Math.floor','querySelector','getElementById']
};

// Default Files Configuration
const defaultFiles = {
    "index.html": { 
        content: `<!DOCTYPE html>\n<html>\n<head>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Craby Editor Ready</h1>\n</body>\n</html>`, 
        type: "html" 
    },
    "style.css": { content: "h1 { color: #ffb400; text-align: center; }", type: "css" }
};

let files = JSON.parse(JSON.stringify(defaultFiles)); // कॉपी तयार करणे

const sBox = document.createElement('div');
sBox.id = 'suggestion-box';
document.body.appendChild(sBox);

let showLineNumbers = false; 
let lineNumberFontSize = 14; 
let selectedIndex = 0; 

// --- 2. RESET SETTINGS (NEW FEATURE) ---

function resetAllSettings() {
    if(confirm("सर्व सेटिंग्ज आणि फाइल्स रीसेट करायच्या आहेत का?")) {
        // १. फाइल्स डिफॉल्ट करा
        files = JSON.parse(JSON.stringify(defaultFiles));
        
        // २. सर्व एडिटर्स क्लोज करा
        document.getElementById('editor-grid').innerHTML = '';
        
        // ३. डिफॉल्ट व्हॅल्यूज सेट करा
        showLineNumbers = false;
        lineNumberFontSize = 14;
        
        // ४. टॉस्कबार आणि UI रिफ्रेश करा
        updateTaskbar();
        addFileToUI("index.html", "html", files["index.html"].content);
        addFileToUI("style.css", "css", files["style.css"].content);
        
        // ५. चेकबॉक्स किंवा इतर UI असल्यास ते अपडेट करा (उदा. Show Line Numbers)
        const lnToggle = document.getElementById('line-number-toggle');
        if(lnToggle) lnToggle.checked = false;

        alert("सेटिंग्ज रिसेट झाल्या आहेत!");
    }
}

// --- 3. BEAUTIFY & FORMATTING ---
// (जसा होता तसाच - कोणताही बदल नाही)
function beautifyCode() {
    document.querySelectorAll('textarea').forEach(tx => {
        let code = tx.value;
        tx.value = formatCode(code);
        const fileName = tx.id.replace('file-', '').replace('-code', '');
        updateFileContent(fileName, tx.value);
        updateLineNumbers(tx.id.replace('-code', ''));
    });
}

function formatCode(code) {
    let tab = "  ", indent = "", result = "";
    code = code.replace(/>\s*</g, ">\n<").replace(/{/g, "{\n").replace(/}/g, "\n}\n").replace(/;/g, ";\n");
    let lines = code.split("\n");
    lines.forEach(line => {
        line = line.trim();
        if(line === "") return;
        if(line.startsWith("}") || line.startsWith("</")) indent = indent.substring(tab.length);
        result += indent + line + "\n";
        if(line.endsWith("{") || line.match(/^<[^\/!][^>]*>$/)) indent += tab;
    });
    return result.trim();
}

// --- 4. FILE MANAGEMENT ---
function updateTaskbar() {
    const taskbar = document.getElementById('shutter-file-list');
    if(!taskbar) return;
    taskbar.innerHTML = '';
    Object.keys(files).forEach(fileName => {
        const fileItem = document.createElement('div');
        fileItem.className = 'shutter-item';
        fileItem.style.display = 'flex';
        fileItem.style.alignItems = 'center';
        fileItem.style.gap = '10px';
        fileItem.style.padding = '8px 12px';
        fileItem.style.justifyContent = 'flex-start';
        fileItem.innerHTML = `<i class="fas fa-file-code" style="color: #ffb400; font-size: 1.2rem;"></i> <span style="font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; text-align: left;">${fileName}</span>`;
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
            <span class="window-title">${name.toUpperCase()}</span>
            <div class="window-controls">
                <i class="fas fa-minus" onclick="minimizeBox('${safeId}')"></i>
                <i class="fas fa-expand" onclick="expandBox('${safeId}')"></i>
                <i class="fas fa-trash" onclick="deleteFile('${name}')"></i>
            </div>
        </div>
        <div class="window-body editor-container" style="display: flex; position: relative; background: #0d1117; overflow: hidden;">
            <div class="line-numbers" id="${safeId}-lines" style="display:block;">1.</div>
            <div class="editor-wrapper" style="position: relative; flex: 1; overflow: hidden;">
                <pre id="${safeId}-highlight" class="highlight-layer" aria-hidden="true"></pre>
                <textarea id="${safeId}-code" class="input-layer" spellcheck="false" data-lang="${type}" 
                    oninput="handleInput('${name}', '${safeId}', this.value)"
                    onscroll="syncScroll('${safeId}')">${content}</textarea>
            </div>
        </div>
    `;
    wrapper.appendChild(newBox);
    attachInputListeners(document.getElementById(`${safeId}-code`));
    applyHighlighting(safeId, content, type);
    updateLineNumbers(safeId);
}

// --- 5. SUGGESTION SYSTEM (Updated with Enter/Top Select) ---

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
        if (index === selectedIndex) {
            item.style.backgroundColor = '#3e4451';
            item.classList.add('active-suggestion');
        } else {
            item.style.backgroundColor = '';
            item.classList.remove('active-suggestion');
        }
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
        selectedIndex = 0; // नेहमी पहिला आयटम सिलेक्टेड

        sBox.innerHTML = matches.map((m, index) => {
            let label = (m === 'h1 class') ? 'h1 class=""' : m;
            let activeStyle = (index === 0) ? 'style="background-color: #3e4451;"' : '';
            return `<div class="suggestion-item" ${activeStyle} onclick="insertWord('${m}', '${txt.id}')">${label}</div>`;
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

// --- 6. CORE UTILITIES ---

function updateLineNumbers(safeId) {
    const tx = document.getElementById(`${safeId}-code`);
    const lineBox = document.getElementById(`${safeId}-lines`);
    if(!tx || !lineBox) return;
    const lines = tx.value.split('\n').length;
    lineBox.innerHTML = Array.from({length: lines}, (_, i) => (i + 1) + '.').join('<br>');
    lineBox.style.fontSize = lineNumberFontSize + "px";
}

function updateFileContent(name, val) { if(files[name]) files[name].content = val; }
function syncScroll(safeId) {
    const tx = document.getElementById(`${safeId}-code`);
    const lb = document.getElementById(`${safeId}-lines`);
    if(tx && lb) lb.scrollTop = tx.scrollTop;
}

// --- 7. INITIALIZATION ---

window.onload = () => {
    updateTaskbar();
    // Default Editors Open
    addFileToUI("index.html", "html", files["index.html"].content);
    addFileToUI("style.css", "css", files["style.css"].content);
};

function minimizeBox(id) { document.getElementById(`box-${id}`).style.display='none'; }
function expandBox(id) { document.getElementById(`box-${id}`).classList.toggle('fullscreen'); } ['div','span','h1','h2','h3','p','a','button','input','img','ul','li','article','aside','body','br','canvas','code','footer','form','head','header','html','iframe','label','link','main','nav','ol','script','section','select','style','table','textarea','title','tr','td','ul','main','strong','em','hr'],
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

let showLineNumbers = true; 
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

// --- 2. UI & FILE MANAGEMENT ---

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
            <div class="editor-wrapper" style="position: relative; flex: 1; overflow: hidden;">
                <pre id="${safeId}-highlight" class="highlight-layer" aria-hidden="true"></pre>
                <textarea id="${safeId}-code" class="input-layer" spellcheck="false" data-lang="${type}" 
                    oninput="handleInput('${name}', '${safeId}', this.value)"
                    onscroll="syncScroll('${safeId}')">${content}</textarea>
            </div>
        </div>
    `;
    wrapper.appendChild(newBox);
    attachInputListeners(document.getElementById(`${safeId}-code`));
    applyHighlighting(safeId, content, type);
    updateLineNumbers(safeId);
    updateThemeAndFont(); 
}

function handleInput(fileName, safeId, value) {
    updateFileContent(fileName, value);
    updateLineNumbers(safeId);
    applyHighlighting(safeId, value, files[fileName].type);
    showSuggestions(document.getElementById(`${safeId}-code`));
}

function deleteFile(name) {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
        delete files[name];
        const safeId = "file-" + name.replace(/[^a-z0-9]/gi, '-');
        const editorBox = document.getElementById(`box-${safeId}`);
        if (editorBox) editorBox.remove();
        updateTaskbar();
        showToast(`${name} deleted!`);
    }
}

// --- 3. SYNTAX HIGHLIGHTING ENGINE ---

function applyHighlighting(safeId, code, type) {
    const hl = document.getElementById(`${safeId}-highlight`);
    if (!hl) return;

    let html = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    if (type === 'html') {
        html = html.replace(/(&lt;[a-z1-6!/]+)/gi, '<span style="color: #ff7b72;">$1</span>')
                   .replace(/([a-z-]+)(?==)/gi, '<span style="color: #79c0ff;"> $1</span>')
                   .replace(/(".+?")/g, '<span style="color: #a5d6ff;">$1</span>');
    } else if (type === 'css') {
        html = html.replace(/([a-z-]+)(?=\s*:)/gi, '<span style="color: #7ee787;">$1</span>')
                   .replace(/(\.[a-z0-9_-]+|#[a-z0-9_-]+)/gi, '<span style="color: #ffa657;">$1</span>')
                   .replace(/(:.+?;)/g, '<span style="color: #a5d6ff;">$1</span>');
    } else if (type === 'js') {
        const keywords = /\b(const|let|var|function|if|else|for|while|return|class|new|this|console|document|window)\b/g;
        html = html.replace(keywords, '<span style="color: #ff7b72;">$1</span>')
                   .replace(/(".+?"|'.+?'|`.+?`)/g, '<span style="color: #a5d6ff;">$1</span>')
                   .replace(/\b(\d+)\b/g, '<span style="color: #d2a8ff;">$1</span>');
    }
    hl.innerHTML = html + "\n";
}

// --- 4. SUGGESTION SYSTEM ---

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
            let style = (index === 0) ? 'style="background-color: #3e4451;"' : '';
            return `<div class="suggestion-item" ${style} onclick="insertWord('${m}', '${txt.id}')">${m}</div>`;
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
        finalInsert = `<${word}></${word}>`;
        offset = word.length + 2;
    }

    txt.value = before + finalInsert + after;
    txt.selectionStart = txt.selectionEnd = before.length + offset;
    sBox.style.display = 'none';
    txt.focus();
    handleInput(id.replace('file-','').replace('-code',''), id.replace('-code',''), txt.value);
}


// --- 6. CORE UTILITIES ---

function syncScroll(id) { 
    const tx = document.getElementById(`${id}-code`);
    const hl = document.getElementById(`${id}-highlight`);
    const lb = document.getElementById(`${id}-lines`);
    if(tx && hl) {
        hl.scrollTop = tx.scrollTop;
        hl.scrollLeft = tx.scrollLeft;
    }
    if(tx && lb) lb.scrollTop = tx.scrollTop; 
}

function updateLineNumbers(safeId) {
    const tx = document.getElementById(`${safeId}-code`);
    const lb = document.getElementById(`${safeId}-lines`);
    if(!tx || !lb) return;
    const lines = tx.value.split('\n').length;
    lb.innerHTML = Array.from({length: lines}, (_, i) => (i + 1) + '.').join('<br>');
}

function updateFileContent(name, val) { if(files[name]) files[name].content = val; }
function minimizeBox(id) { document.getElementById(`box-${id}`).style.display='none'; }
function expandBox(id) { document.getElementById(`box-${id}`).classList.toggle('fullscreen'); }
function closePreview() { document.getElementById('preview-overlay').style.display = 'none'; }

function updateThemeAndFont() {
    const tKey = document.getElementById('theme-sel')?.value || 'dark';
    const font = document.getElementById('font-family-sel')?.value || 'monospace';
    const theme = themes[tKey];

    document.documentElement.style.setProperty('--bg', theme.bg);
    document.documentElement.style.setProperty('--accent', theme.accent);
    
    document.querySelectorAll('.input-layer').forEach(tx => {
        tx.style.fontFamily = font;
        tx.style.caretColor = theme.accent;
    });
    document.querySelectorAll('.highlight-layer').forEach(hl => {
        hl.style.fontFamily = font;
        hl.style.backgroundColor = theme.bg;
    });
}

function showToast(msg) {
    let t = document.createElement('div');
    t.innerText = msg;
    t.style.cssText = "position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:8px 16px;border-radius:4px;z-index:10000;";
    document.body.appendChild(t);
    setTimeout(()=>t.remove(), 2000);
}

// --- 7. INITIALIZATION ---
window.onload = () => {
    updateTaskbar();
    addFileToUI("index.html", "html", files["index.html"].content);
    addFileToUI("style.css", "css", files["style.css"].content);
};


/* --- PERFECT RUN CODE LOGIC --- */

let currentActiveFile = null;

function runCode() {
    // १. सर्व HTML फाईल्स शोधणे
    const htmlFiles = Object.keys(files).filter(f => f.endsWith('.html'));
    
    if (htmlFiles.length === 0) {
        showToast("Error: No HTML file found to run!");
        return;
    }

    // २. कोणती फाईल रन करायची ते ठरवणे (index.html ला प्राधान्य)
    let selectedFile = currentActiveFile || (files["index.html"] ? "index.html" : htmlFiles[0]);
    currentActiveFile = selectedFile;

    const overlay = document.getElementById('preview-overlay');
    const frame = document.getElementById('output-frame');
    
    if(!overlay || !frame) return;
    
    overlay.style.display = 'flex';

    // ३. सर्व CSS फाईल्स एकत्र करणे
    let allCSS = "";
    Object.keys(files).forEach(name => {
        if(name.endsWith('.css')) {
            allCSS += `/* --- ${name} --- */\n${files[name].content}\n`;
        }
    });

    // ४. सर्व JS फाईल्स एकत्र करणे
    let allJS = "";
    Object.keys(files).forEach(name => {
        if(name.endsWith('.js')) {
            allJS += `// --- ${name} ---\n${files[name].content}\n`;
        }
    });

    // ५. फायनल HTML स्ट्रक्चर तयार करणे
    const finalHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Craby Preview</title>
            <style>
                /* Default Styles */
                html, body { margin: 0; padding: 0; min-height: 100vh; background: white; color: black; }
                ${allCSS}
            </style>
        </head>
        <body>
            ${files[selectedFile].content}
            <script>
                (function() {
                    try {
                        ${allJS}
                    } catch (err) {
                        console.error("Craby JS Error: ", err);
                        document.body.innerHTML += \`
                            <div style="position:fixed; bottom:0; left:0; width:100%; background:rgba(255,0,0,0.1); color:red; padding:10px; font-family:monospace; border-top:1px solid red;">
                                <strong>JS Error:</strong> \${err.message}
                            </div>\`;
                    }
                })();
            <\/script>
        </body>
        </html>
    `;

    // ६. Iframe मध्ये कोड इंजेक्ट करणे
    const doc = frame.contentWindow.document;
    doc.open();
    doc.write(finalHTML);
    doc.close();
}

/* --- PREVIEW CONTROLS --- */

function refreshPreview() {
    runCode();
    showToast("Preview Updated!");
}

function setPreviewSize(mode) {
    const frame = document.getElementById('output-frame');
    const body = document.getElementById('preview-body');
    if (!frame || !body) return;

    frame.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

    if (mode === '100%') {
        frame.style.width = "100%";
        frame.style.height = "100%";
        frame.style.border = "none";
        frame.style.borderRadius = "0";
    } else if (mode === '375px') {
        frame.style.width = "375px";
        frame.style.height = "667px";
        frame.style.border = "12px solid #333";
        frame.style.borderRadius = "30px";
        frame.style.boxShadow = "0 20px 50px rgba(0,0,0,0.5)";
    }
}

function closePreview() {
    document.getElementById('preview-overlay').style.display = 'none';
    // Preview बंद केल्यावर frame रिकामी करणे जेणेकरून जुना कोड चालू राहणार नाही
    document.getElementById('output-frame').src = "about:blank";
}

function showToast(msg) {
    const existing = document.querySelector('.craby-toast');
    if(existing) existing.remove();

    let toast = document.createElement('div');
    toast.className = 'craby-toast';
    toast.innerText = msg;
    toast.style.cssText = `
        position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%);
        background: #ffb400; color: #000; padding: 12px 24px; 
        border-radius: 50px; font-weight: 800; font-size: 14px; 
        z-index: 100000; box-shadow: 0 10px 20px rgba(0,0,0,0.3);
        pointer-events: none; animation: slideUp 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 2000);
}
