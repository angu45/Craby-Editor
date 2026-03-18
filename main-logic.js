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
        content: `<!DOCTYPE html>\n<html>\n<head>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <div class="container">\n    <h1>Craby Editor</h1>\n    <p>Start coding professionally.</p>\n  </div>\n</body>\n</html>`, 
        type: "html" 
    },
    "style.css": { content: "body { background: #0d1117; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; }\n.container { text-align: center; border: 2px solid #ffb400; padding: 20px; border-radius: 15px; }", type: "css" }
};

let files = JSON.parse(JSON.stringify(defaultFiles));
const sBox = document.createElement('div');
sBox.id = 'suggestion-box';
document.body.appendChild(sBox);

let showLineNumbers = true; 
let lineNumberFontSize = 14; 
let selectedIndex = 0; 

// --- 2. FILE MANAGEMENT (WITH NAMES IN SHUTTER) ---

function updateTaskbar() {
    const taskbar = document.getElementById('shutter-file-list'); 
    if(!taskbar) return;
    taskbar.innerHTML = ''; 
    
    Object.keys(files).forEach(fileName => {
        const type = files[fileName].type;
        let iconClass = "fa-file-code"; // Default
        let iconColor = "#ffb400";

        if(type === 'html') { iconClass = "fa-html5"; iconColor = "#e34c26"; }
        if(type === 'css') { iconClass = "fa-css3-alt"; iconColor = "#264de4"; }
        if(type === 'js') { iconClass = "fa-js-square"; iconColor = "#f7df1e"; }

        const fileItem = document.createElement('div');
        fileItem.className = 'shutter-item';
        // फाईलचे नाव आणि आयकॉन दोन्ही दिसतील
        fileItem.innerHTML = `
            <i class="fab ${iconClass}" style="color: ${iconColor}; font-size: 24px;"></i>
            <span style="display: block; margin-top: 8px; font-size: 11px; font-weight: 600;">${fileName}</span>
        `;
        fileItem.onclick = () => addFileToUI(fileName, type, files[fileName].content);
        taskbar.appendChild(fileItem);
    });
}

function addFileToUI(name, type, content = "") {
    const wrapper = document.getElementById('editor-grid');
    if(!wrapper) return;
    const safeId = "file-" + name.replace(/[^a-z0-9]/gi, '-');
    
    if(document.getElementById(`box-${safeId}`)) {
        document.getElementById(`box-${safeId}`).style.display = 'flex';
        // शटर बंद करणे (Optional)
        const shutter = document.querySelector('.shutter');
        if(shutter) shutter.classList.remove('open');
        return;
    }

    const newBox = document.createElement('div');
    newBox.className = 'window-frame';
    newBox.id = `box-${safeId}`;
    newBox.innerHTML = `
        <div class="window-header">
            <span class="window-title">${name.toUpperCase()}</span>
            <div class="window-controls">
                <i class="fas fa-minus" title="Minimize" onclick="minimizeBox('${safeId}')"></i>
                <i class="fas fa-expand" title="Fullscreen" onclick="expandBox('${safeId}')"></i>
                <i class="fas fa-trash" title="Delete" onclick="deleteFile('${name}')"></i>
            </div>
        </div>
        <div class="window-body editor-container" style="display: flex; position: relative; background: #0d1117; overflow: hidden;">
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

// --- 3. SYSTEM LOGIC (SYNTAX, INPUT, RUN) ---

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
        const keywords = /\b(const|let|var|function|if|else|for|while|return|console|document|window)\b/g;
        html = html.replace(keywords, '<span class="tag">$1</span>')
                   .replace(/(".+?"|'.+?'|`.+?`)/g, '<span class="string">$1</span>')
                   .replace(/\b(\d+)\b/g, '<span class="keyword">$1</span>');
    }
    hl.innerHTML = html + "\n";
}

function runCode() {
    const htmlFiles = Object.keys(files).filter(f => f.endsWith('.html'));
    if (htmlFiles.length === 0) { showToast("Create an HTML file first!"); return; }

    const overlay = document.getElementById('preview-overlay');
    const frame = document.getElementById('output-frame');
    overlay.style.display = 'flex';

    let allCSS = Object.keys(files).filter(f => f.endsWith('.css')).map(f => `<style>${files[f].content}</style>`).join('\n');
    let allJS = Object.keys(files).filter(f => f.endsWith('.js')).map(f => `<script>${files[f].content}<\/script>`).join('\n');
    
    // index.html शोधणे, नसल्यास पहिली HTML फाईल घेणे
    let mainHTML = files["index.html"] ? files["index.html"].content : files[htmlFiles[0]].content;
    let finalDoc = `<!DOCTYPE html><html><head>${allCSS}</head><body>${mainHTML}${allJS}</body></html>`;

    const doc = frame.contentWindow.document;
    doc.open();
    doc.write(finalDoc);
    doc.close();
}

// --- 4. UTILITIES (SCROLL, SUGGESTIONS, DELETE) ---

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
    lb.innerHTML = Array.from({length: lines}, (_, i) => (i + 1)).join('<br>');
}

function deleteFile(name) {
    if (confirm(`Delete "${name}"?`)) {
        delete files[name];
        const safeId = "file-" + name.replace(/[^a-z0-9]/gi, '-');
        if(document.getElementById(`box-${safeId}`)) document.getElementById(`box-${safeId}`).remove();
        updateTaskbar();
    }
}

function resetAllSettings() {
    if(confirm("Reset all files to default?")) {
        files = JSON.parse(JSON.stringify(defaultFiles));
        document.getElementById('editor-grid').innerHTML = '';
        updateTaskbar();
        addFileToUI("index.html", "html", files["index.html"].content);
        addFileToUI("style.css", "css", files["style.css"].content);
        showToast("System Reset!");
    }
}

function showToast(msg) {
    let t = document.createElement('div');
    t.innerText = msg;
    t.className = "toast-msg"; // CSS मध्ये स्टाईल करा
    document.body.appendChild(t);
    setTimeout(()=>t.remove(), 2500);
}

// --- 5. INITIALIZATION ---
window.onload = () => {
    updateTaskbar();
    addFileToUI("index.html", "html", files["index.html"].content);
    addFileToUI("style.css", "css", files["style.css"].content);
};

function minimizeBox(id) { document.getElementById(`box-${id}`).style.display='none'; }
function expandBox(id) { document.getElementById(`box-${id}`).classList.toggle('fullscreen'); }
function closePreview() { document.getElementById('preview-overlay').style.display = 'none'; }
