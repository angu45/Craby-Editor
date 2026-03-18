/**
 * Craby Editor - Full System Logic (Professional Version)
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

let showLineNumbers = true; 
let lineNumberFontSize = 14; 
let selectedIndex = 0; 

// --- 2. UI & FILE MANAGEMENT (Shutter Fix) ---

function updateTaskbar() {
    const taskbar = document.getElementById('shutter-file-list'); 
    if(!taskbar) return;
    taskbar.innerHTML = ''; 
    Object.keys(files).forEach(fileName => {
        const fileItem = document.createElement('div');
        fileItem.className = 'shutter-item';
        fileItem.innerHTML = `
            <i class="fas fa-file-code"></i> 
            <span style="display:block; font-size:10px; margin-top:5px;">${fileName}</span>
        `;
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
        <div class="window-body editor-container" style="display: flex; position: relative; background: #0b1619; overflow: hidden; min-height: 200px;">
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
}

// --- 3. SYNTAX HIGHLIGHTING ENGINE ---

function handleInput(fileName, safeId, value) {
    if(files[fileName]) files[fileName].content = value;
    updateLineNumbers(safeId);
    applyHighlighting(safeId, value, files[fileName].type);
    showSuggestions(document.getElementById(`${safeId}-code`));
}

function applyHighlighting(safeId, code, type) {
    const hl = document.getElementById(`${safeId}-highlight`);
    if (!hl) return;

    let html = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    if (type === 'html') {
        html = html.replace(/(&lt;[a-z1-6!/]+)/gi, '<span class="tag">$1</span>')
                   .replace(/([a-z-]+)(?==)/gi, '<span class="attr"> $1</span>')
                   .replace(/(".+?")/g, '<span class="string">$1</span>');
    } else if (type === 'css') {
        html = html.replace(/([a-z-]+)(?=\s*:)/gi, '<span class="keyword">$1</span>')
                   .replace(/(\.[a-z0-9_-]+|#[a-z0-9_-]+)/gi, '<span class="attr">$1</span>')
                   .replace(/(:.+?;)/g, '<span class="string">$1</span>');
    } else if (type === 'js') {
        const keywords = /\b(const|let|var|function|if|else|for|while|return|class|new|this|console|document|window)\b/g;
        html = html.replace(keywords, '<span class="tag">$1</span>')
                   .replace(/(".+?"|'.+?'|`.+?`)/g, '<span class="string">$1</span>')
                   .replace(/\b(\d+)\b/g, '<span class="keyword">$1</span>');
    }
    hl.innerHTML = html + "\n";
}

// --- 4. SUGGESTION & UTILITIES ---

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

    let finalInsert = (lang === 'html') ? `<${word}></${word}>` : word;
    let offset = (lang === 'html') ? word.length + 2 : word.length;

    txt.value = before + finalInsert + after;
    txt.selectionStart = txt.selectionEnd = before.length + offset;
    sBox.style.display = 'none';
    txt.focus();
    handleInput(id.replace('file-','').replace('-code',''), id.replace('-code',''), txt.value);
}

function syncScroll(id) { 
    const tx = document.getElementById(`${id}-code`);
    const hl = document.getElementById(`${id}-highlight`);
    const lb = document.getElementById(`${id}-lines`);
    if(tx && hl) { hl.scrollTop = tx.scrollTop; hl.scrollLeft = tx.scrollLeft; }
    if(tx && lb) lb.scrollTop = tx.scrollTop; 
}

function updateLineNumbers(safeId) {
    const tx = document.getElementById(`${safeId}-code`);
    const lb = document.getElementById(`${safeId}-lines`);
    if(!tx || !lb) return;
    const lines = tx.value.split('\n').length;
    lb.innerHTML = Array.from({length: lines}, (_, i) => (i + 1) + '.').join('<br>');
}

// --- 5. SYSTEM ACTIONS ---

function runCode() {
    const overlay = document.getElementById('preview-overlay');
    const frame = document.getElementById('output-frame');
    overlay.style.display = 'flex';

    let css = Object.keys(files).filter(f => f.endsWith('.css')).map(f => `<style>${files[f].content}</style>`).join('');
    let js = Object.keys(files).filter(f => f.endsWith('.js')).map(f => `<script>${files[f].content}<\/script>`).join('');
    let html = files["index.html"] ? files["index.html"].content : "";

    const doc = frame.contentWindow.document;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head>${css}</head><body>${html}${js}</body></html>`);
    doc.close();
}

function resetAllSettings() {
    if(confirm("Reset everything?")) {
        files = JSON.parse(JSON.stringify(defaultFiles));
        document.getElementById('editor-grid').innerHTML = '';
        updateTaskbar();
        addFileToUI("index.html", "html", files["index.html"].content);
        addFileToUI("style.css", "css", files["style.css"].content);
    }
}

function minimizeBox(id) { document.getElementById(`box-${id}`).style.display='none'; }
function expandBox(id) { document.getElementById(`box-${id}`).classList.toggle('fullscreen'); }
function closePreview() { document.getElementById('preview-overlay').style.display = 'none'; }
function deleteFile(name) {
    if(confirm(`Delete ${name}?`)) {
        delete files[name];
        updateTaskbar();
        document.getElementById(`box-file-${name.replace(/[^a-z0-9]/gi, '-')}`)?.remove();
    }
}

// --- 6. INITIALIZATION ---
window.onload = () => {
    updateTaskbar();
    addFileToUI("index.html", "html", files["index.html"].content);
    addFileToUI("style.css", "css", files["style.css"].content);
};
