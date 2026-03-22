/**
 * CRABY EDITOR - MAIN CORE ENGINE
 */

const dictionary = {
    html: [
        'div','span','h1','h2','h3','p','a','button','input','img','ul','li','article','aside','body','br','canvas','code','footer','form','head','header','html','iframe','label','link','main','nav','ol','script','section','select','style','table','textarea','title','tr','td','strong','em','hr',
        'class','id','style','src','href','type','value','placeholder','target','rel','alt','width','height','onclick','onload','name','method','action','required'
    ],
    css: [
        'color','background','background-color','background-image','margin','margin-top','margin-right','margin-bottom','margin-left','padding','display','flex','grid','border','border-radius','box-shadow','cursor','font-family','font-size','font-weight','height','width','opacity','position','top','left','right','bottom','z-index','transition','overflow','justify-content','align-items','text-align','text-decoration','list-style','white-space'
    ],
    js: [
        'console.log','document','window','function','const','let','var','if','else','for','forEach','map','filter','reduce','fetch','addEventListener','setTimeout','setInterval','JSON.stringify','JSON.parse','alert','Math.random','Math.floor','Math.ceil','querySelector','querySelectorAll','getElementById','innerHTML','innerText','style','value','length','push','pop','shift','unshift','split','join','replace','then','catch','async','await'
    ]
};

const defaultFiles = {
    "index.html": { 
        content: `<!DOCTYPE html>\n<html>\n<head>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Craby Editor Ready</h1>\n</body>\n</html>`, 
        type: "html" 
    },
    "style.css": { content: "h1 { color: #ffb400; text-align: center; font-family: sans-serif; margin-top: 50px; }", type: "css" }
};

let files = JSON.parse(JSON.stringify(defaultFiles));
let currentActiveFile = null;
let selectedIndex = 0;

// --- Highlighting Engine ---
function applyHighlighting(code, lang) {
    let escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (lang === 'html') {
        dictionary.html.forEach(tag => {
            const reg = new RegExp(`&lt;(\\/?${tag})\\b`, 'gi');
            escaped = escaped.replace(reg, `&lt;<span class="hl-html-tag">$1</span>`);
        });
        escaped = escaped.replace(/\s([a-z-]+)=/gi, ` <span class="hl-html-attr">$1</span>=`);
    } else if (lang === 'css') {
        dictionary.css.forEach(prop => {
            const reg = new RegExp(`\\b(${prop})\\s*:`, 'gi');
            escaped = escaped.replace(reg, `<span class="hl-css-prop">$1</span>:`);
        });
    } else if (lang === 'js') {
        dictionary.js.forEach(word => {
            const reg = new RegExp(`\\b(${word.replace('.', '\\.')})\\b`, 'g');
            if (word.includes('.') || word.includes('log')) {
                escaped = escaped.replace(reg, `<span class="hl-js-func">$1</span>`);
            } else {
                escaped = escaped.replace(reg, `<span class="hl-js-kw">$1</span>`);
            }
        });
    }
    escaped = escaped.replace(/"(.*?)"/g, `<span class="hl-str">"$1"</span>`);
    escaped = escaped.replace(/\b(\d+)\b/g, `<span class="hl-num">$1</span>`);
    return escaped;
}

// --- Suggestion UI ---
const sBox = document.createElement('div');
sBox.id = 'suggestion-box';
Object.assign(sBox.style, {
    position: 'fixed', display: 'none', zIndex: '10000', background: '#1c1c1c',
    border: '1px solid #444', borderRadius: '4px', boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
    minWidth: '180px', maxHeight: '200px', overflowY: 'auto'
});
document.body.appendChild(sBox);

// --- File & UI Core ---
function updateTaskbar() {
    const taskbar = document.getElementById('shutter-file-list'); 
    if(!taskbar) return;
    taskbar.innerHTML = ''; 
    Object.keys(files).forEach(fileName => {
        const fileItem = document.createElement('div');
        fileItem.className = 'shutter-item';
        Object.assign(fileItem.style, {
            display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 15px',
            margin: '5px 10px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', cursor: 'pointer'
        });
        fileItem.innerHTML = `<i class="fas fa-file-code" style="color: var(--accent); font-size: 1.2rem;"></i> 
                              <span style="color: white; font-size: 0.95rem;">${fileName}</span>`;
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
            <textarea id="${safeId}-code" spellcheck="false" data-lang="${type}" data-filename="${name}"
                style="flex: 1; padding: 15px; border: none; outline: none; background: transparent; color: #e0e0e0; resize: none; white-space: pre; overflow: auto; line-height: 1.5; font-family: monospace;"
                oninput="updateFileContent('${name}', this.value); showSuggestions(this)"
                onscroll="syncScroll('${safeId}')">${content}</textarea>
        </div>
    `;
    wrapper.appendChild(newBox);
    attachInputListeners(document.getElementById(`${safeId}-code`));
    updateThemeAndFont(); // Calling function from theme file
}

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
    const overlay = document.getElementById('preview-overlay');
    const frame = document.getElementById('output-frame');
    overlay.style.display = 'flex';
    let themeCSS = "";
    Object.keys(files).forEach(name => { if(name.endsWith('.css')) themeCSS += files[name].content + "\n"; });
    let finalHTML = `<!DOCTYPE html><html><head><style>body{padding:15px;font-family:sans-serif;}${themeCSS}</style></head><body>${files[selectedFile].content}<script>${Object.keys(files).filter(f=>f.endsWith('.js')).map(f=>files[f].content).join('\n')}<\/script></body></html>`;
    const doc = frame.contentWindow.document;
    doc.open(); doc.write(finalHTML); doc.close();
}

function beautifyCode(){
    const textareas = document.querySelectorAll('.editor-grid textarea');
    Object.keys(files).forEach(fileName=>{
        let content = files[fileName].content;
        const type = fileName.split('.').pop().toLowerCase();
        if(!content) return;
        if(type==="html") content = content.replace(/>\s*</g,"><").replace(/</g,"\n<").trim();
        else if(type==="css") content = content.replace(/\s*\{\s*/g," {\n  ").replace(/;\s*/g,";\n  ").replace(/\s*\}\s*/g,"\n}\n").trim();
        else if(type==="js") content = content.replace(/\{\s*/g," {\n  ").replace(/\}\s*/g,"\n}\n").replace(/;\s*/g,";\n").trim();
        files[fileName].content = content;
        textareas.forEach(tx => { if(tx.getAttribute("data-filename")===fileName) tx.value = content; });
    });
}

function exportCode() {
    const fileList = Object.keys(files);
    let promptText = "Type file number:\n" + fileList.map((n, i) => `${i+1}. ${n}`).join('\n');
    const choice = parseInt(prompt(promptText)) - 1;
    if (fileList[choice]) {
        const blob = new Blob([files[fileList[choice]].content], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileList[choice];
        a.click();
    }
}

// --- Suggestion Engine ---
function attachInputListeners(txt) {
    txt.addEventListener('keydown', (e) => {
        const items = document.querySelectorAll('.suggestion-item');
        if (sBox.style.display === 'block' && items.length > 0) {
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                insertWord(items[selectedIndex].innerText, txt.id);
            } 
            else if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = (selectedIndex + 1) % items.length;
                updateHighlight(items);
            } 
            else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = (selectedIndex - 1 + items.length) % items.length;
                updateHighlight(items);
            }
            else if (e.key === 'Escape') { sBox.style.display = 'none'; }
        }
    });
}

function showSuggestions(txt) {
    const pos = txt.selectionStart;
    const textBefore = txt.value.substring(0, pos);
    const words = textBefore.split(/[\s<>{}:;()\[\]"']/);
    const currentWord = words[words.length - 1].toLowerCase();
    if (currentWord.length < 1) { sBox.style.display = 'none'; return; }
    const lang = txt.getAttribute('data-lang');
    let matches = [];
    if (lang === 'html') {
        const inTag = textBefore.lastIndexOf('<') > textBefore.lastIndexOf('>');
        const afterSpaceInTag = inTag && textBefore.slice(-currentWord.length - 1).startsWith(' ');
        if (afterSpaceInTag) {
            matches = dictionary.html.filter(w => ['class','id','src','href','style','type'].includes(w)).filter(w => w.startsWith(currentWord));
        } else {
            matches = dictionary.html.filter(w => w.startsWith(currentWord));
        }
    } else {
        matches = (dictionary[lang] || []).filter(w => w.startsWith(currentWord));
    }
    if (matches.length > 0) {
        const rect = txt.getBoundingClientRect();
        sBox.style.top = `${rect.top + 35}px`;
        sBox.style.left = `${rect.left + 20}px`;
        sBox.style.display = 'block';
        selectedIndex = 0;
        sBox.innerHTML = matches.map((m, i) => `
            <div class="suggestion-item" onclick="insertWord('${m}', '${txt.id}')"
                 style="padding:8px; color:white; cursor:pointer; font-family:monospace; border-bottom:1px solid #333; ${i===0?'background:var(--accent); color:black;':''}">
                ${m}
            </div>
        `).join('');
    } else { sBox.style.display = 'none'; }
}

function updateHighlight(items) {
    items.forEach((item, i) => {
        item.style.background = (i === selectedIndex) ? 'var(--accent)' : 'transparent';
        item.style.color = (i === selectedIndex) ? 'black' : 'white';
    });
}

function insertWord(word, id) {
    const txt = document.getElementById(id);
    const pos = txt.selectionStart;
    const lang = txt.getAttribute('data-lang');
    const text = txt.value;
    const beforePart = text.substring(0, pos);
    const afterPart = text.substring(pos);
    const wordMatch = beforePart.match(/[\w.-]+$/);
    const wordStart = wordMatch ? wordMatch.index : pos;
    let wordToInsert = word;
    let cursorOffset = 0;
    if (lang === 'html') {
        const inTag = beforePart.lastIndexOf('<') > beforePart.lastIndexOf('>');
        if (inTag && beforePart.slice(wordStart - 1, wordStart) === ' ') {
            wordToInsert = `${word}=""`; cursorOffset = 1;
        } else {
            wordToInsert = `<${word}></${word}>`; cursorOffset = word.length + 3;
        }
    } else if (lang === 'css') {
        wordToInsert = `${word}: ;`; cursorOffset = 1;
    }
    const newBefore = text.substring(0, wordStart) + wordToInsert;
    txt.value = newBefore + afterPart;
    txt.selectionStart = txt.selectionEnd = newBefore.length - cursorOffset;
    sBox.style.display = 'none';
    txt.focus();
    updateFileContent(txt.getAttribute('data-filename'), txt.value);
}

// --- Utils ---
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
function closePreview() { document.getElementById('preview-overlay').style.display = 'none'; }

// --- Initialization ---
window.onload = () => {
    updateTaskbar();
    addFileToUI("index.html", "html", files["index.html"].content);
    addFileToUI("style.css", "css", files["style.css"].content);
    
    const saved = localStorage.getItem('craby_settings');
    if(saved) {
        const s = JSON.parse(saved);
        if(document.getElementById('theme-sel')) document.getElementById('theme-sel').value = s.theme;
        updateFontSize(s.size);
    }
    updateThemeAndFont();
};
