// --- 1. CONFIGURATION & DICTIONARY ---
const dictionary = {
    html: ['div','span','h1','h2','h3','p','a','button','input','img','ul','li','article','aside','body','br','canvas','code','footer','form','head','header','html','iframe','label','link','main','nav','ol','script','section','select','style','table','textarea','title','tr','td','ul','main','strong','em','hr'],
    css: ['color','background','margin','padding','display','flex','grid','border','border-radius','box-shadow','cursor','font-family','font-size','height','width','opacity','position','top','left','right','bottom','z-index','transition','overflow','justify-content','align-items'],
    js: ['console.log','document','window','function','const','let','var','if','else','for','forEach','map','fetch','addEventListener','setTimeout','setInterval','JSON.stringify','JSON.parse','alert','Math.random','Math.floor','querySelector','getElementById']
};

let files = {
    "index.html": { 
        content: `<!DOCTYPE html>\n<html>\n<head>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Craby Editor Ready</h1>\n  <script src="script.js"></script>\n</body>\n</html>`, 
        type: "html" 
    },
    "style.css": { content: "h1 { color: #ffb400; text-align: center; }", type: "css" },
    "script.js": { content: "console.log('JS Connected!');", type: "js" }
};

const sBox = document.createElement('div');
sBox.id = 'suggestion-box';
document.body.appendChild(sBox);

let showLineNumbers = true; 
let lineNumberFontSize = 14; 

// --- 2. TASKBAR & UI UPDATES ---

// टास्कबारवर फाईल्सची लिस्ट अपडेट करण्यासाठी
function updateTaskbar() {
    const taskbar = document.getElementById('taskbar-files'); // तुमच्या HTML मध्ये हा ID असावा
    if(!taskbar) return;
    
    taskbar.innerHTML = '';
    Object.keys(files).forEach(fileName => {
        const btn = document.createElement('button');
        btn.innerText = fileName;
        btn.onclick = () => addFileToUI(fileName, files[fileName].type, files[fileName].content);
        taskbar.appendChild(btn);
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
            <div class="line-numbers" id="${safeId}-lines" style="display:${showLineNumbers ? 'block' : 'none'}; text-align: right; padding: 10px 5px; border-right: 1.5px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.3); background: transparent; overflow: hidden; white-space: nowrap;">1.</div>
            <textarea id="${safeId}-code" spellcheck="false" data-lang="${type}" 
                style="flex: 1; padding: 10px; border: none; outline: none; background: transparent; color: #e0e0e0; resize: none; white-space: pre; overflow: auto; line-height: 1.5;"
                oninput="updateFileContent('${name}', this.value); updateLineNumbers('${safeId}')"
                onscroll="syncScroll('${safeId}')">${content}</textarea>
        </div>
    `;
    wrapper.appendChild(newBox);
    attachInputListeners(document.getElementById(`${safeId}-code`));
    updateLineNumbers(safeId);
}

function deleteFile(name) {
    if(confirm(`Delete ${name}?`)) {
        const safeId = "file-" + name.replace(/[^a-z0-9]/gi, '-');
        document.getElementById(`box-${safeId}`)?.remove();
        delete files[name];
        updateTaskbar();
        trackCrabyEvent('file_delete', { file_name: name });
    }
}

// --- 3. RUN & DOWNLOAD LOGIC (WITH LIST) ---

function runCode() {
    const htmlFiles = Object.keys(files).filter(f => f.endsWith('.html'));
    if(htmlFiles.length === 0) return alert("No HTML file found!");

    const selectedFile = prompt("Select HTML file to run:\n" + htmlFiles.join('\n'), htmlFiles[0]);
    if (!files[selectedFile]) return;

    const overlay = document.getElementById('preview-overlay');
    const frame = document.getElementById('output-frame');
    overlay.style.display = 'flex';

    let rawHTML = files[selectedFile].content;

    // व्हर्च्युअल लिंकिंग: CSS आणि JS फाईल्सना आपोआप इंजेक्ट करणे
    Object.keys(files).forEach(name => {
        if(name.endsWith('.css')) {
            rawHTML = rawHTML.replace(new RegExp(`href=["']${name}["']`, 'g'), `href="data:text/css;base64,${btoa(files[name].content)}"`);
            // Backup injection जर लिंक टॅग नसेल तर
            rawHTML += `<style>${files[name].content}</style>`;
        }
        if(name.endsWith('.js')) {
            rawHTML = rawHTML.replace(new RegExp(`src=["']${name}["']`, 'g'), `src="data:text/javascript;base64,${btoa(files[name].content)}"`);
        }
    });

    const doc = frame.contentWindow.document;
    doc.open();
    doc.write(rawHTML);
    doc.close();

    trackCrabyEvent('code_run', { file_name: selectedFile });
}

function exportCode() {
    const allFiles = Object.keys(files);
    const selectedFile = prompt("Select file to download:\n" + allFiles.join('\n'), allFiles[0]);
    
    if (files[selectedFile]) {
        const blob = new Blob([files[selectedFile].content], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = selectedFile;
        link.click();
        trackCrabyEvent('file_download', { file_name: selectedFile });
    }
}

// --- 4. CORE FUNCTIONS (UTILITIES) ---

function updateLineNumbers(safeId) {
    const tx = document.getElementById(`${safeId}-code`);
    const lineBox = document.getElementById(`${safeId}-lines`);
    if(!tx || !lineBox) return;
    const lines = tx.value.split('\n').length;
    let lineHTML = '';
    for(let i = 1; i <= lines; i++) { lineHTML += i + '.<br>'; }
    lineBox.innerHTML = lineHTML;
    lineBox.style.fontSize = lineNumberFontSize + "px";
}

function updateFileContent(name, val) {
    if(files[name]) files[name].content = val;
}

function syncScroll(safeId) {
    const tx = document.getElementById(`${safeId}-code`);
    const lineBox = document.getElementById(`${safeId}-lines`);
    if(tx && lineBox) lineBox.scrollTop = tx.scrollTop;
}

function toggleLineNumbers(status) {
    showLineNumbers = status;
    document.querySelectorAll('.line-numbers').forEach(el => el.style.display = status ? 'block' : 'none');
}

// --- 5. AUTO-COMPLETE & INITIALIZATION ---

function attachInputListeners(txt) {
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
        sBox.style.display = 'block';
        sBox.innerHTML = matches.map(m => `<div class="suggestion-item" onclick="insertWord('${m}', '${txt.id}')">${m}</div>`).join('');
    } else { sBox.style.display = 'none'; }
}

function insertWord(word, id) {
    const txt = document.getElementById(id);
    const pos = txt.selectionStart;
    const before = txt.value.substring(0, pos).replace(/[\w.-]+$/, "");
    txt.value = before + word + txt.value.substring(pos);
    sBox.style.display = 'none';
    txt.focus();
    updateFileContent(id.replace('file-','').replace('-code',''), txt.value);
}

window.onload = () => {
    updateTaskbar();
    // Default फाईल्स ओपन करणे
    addFileToUI("index.html", "html", files["index.html"].content);
    addFileToUI("style.css", "css", files["style.css"].content);
};

// UI Helpers
function minimizeBox(id) { document.getElementById(`box-${id}`).style.display='none'; }
function expandBox(id) { document.getElementById(`box-${id}`).classList.toggle('fullscreen'); }
