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
    "style.css": { content: "h1 { color: #ffb400; text-align: center; }", type: "css" }
};

let files = JSON.parse(JSON.stringify(defaultFiles));
const sBox = document.createElement('div');
sBox.id = 'suggestion-box';
document.body.appendChild(sBox);

let showLineNumbers = false; // Always false to hide numbers
let currentActiveFile = null;
let selectedIndex = 0;

// --- 2. RESET SETTINGS ---
function resetAllSettings() {
    if(confirm("सर्व सेटिंग्ज आणि फाइल्स रीसेट करायच्या आहेत का?")) {
        files = JSON.parse(JSON.stringify(defaultFiles));
        document.getElementById('editor-grid').innerHTML = '';
        showLineNumbers = false;
        updateTaskbar();
        addFileToUI("index.html", "html", files["index.html"].content);
        addFileToUI("style.css", "css", files["style.css"].content);
        alert("सेटिंग्ज रीसेट झाल्या आहेत!");
    }
}

// --- 3. BEAUTIFY & FORMATTING ---
function beautifyCode() {
    document.querySelectorAll('textarea').forEach(tx => {
        tx.value = formatCode(tx.value);
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

// --- 4. FILE MANAGEMENT & UI ---
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
            <div class="line-numbers" id="${safeId}-lines" style="display: none;"></div>
            <textarea id="${safeId}-code" spellcheck="false" data-lang="${type}" 
                style="flex: 1; padding: 15px; border: none; outline: none; background: transparent; color: #e0e0e0; resize: none; white-space: pre; overflow: auto; line-height: 1.5; font-family: monospace;"
                oninput="updateFileContent('${name}', this.value); updateLineNumbers('${safeId}')"
                onscroll="syncScroll('${safeId}')">${content}</textarea>
        </div>
    `;
    wrapper.appendChild(newBox);
    attachInputListeners(document.getElementById(`${safeId}-code`));
}

// --- 5. PREVIEW & RUN LOGIC (SANDBOXED) ---
function runCode() {
    const htmlFiles = Object.keys(files).filter(f => f.endsWith('.html'));
    if (htmlFiles.length === 0) { alert("No HTML files!"); return; }

    let selectedFile = currentActiveFile || htmlFiles[0];
    currentActiveFile = selectedFile;

    const overlay = document.getElementById('preview-overlay');
    const frame = document.getElementById('output-frame');
    overlay.style.display = 'flex';

    // Anti-interfere settings
    frame.setAttribute('sandbox', 'allow-scripts');

    let themeCSS = "";
    Object.keys(files).forEach(name => { if(name.endsWith('.css')) themeCSS += files[name].content + "\n"; });

    let finalHTML = `<!DOCTYPE html><html><head><style>
        html,body{margin:0;padding:0;width:100%;height:100%;background:none !important;}
        body{padding:15px;box-sizing:border-box;font-family:sans-serif;}
        ${themeCSS}</style></head><body>${files[selectedFile].content}
        <script>
            window.onbeforeunload = function() { return false; };
            ${Object.keys(files).filter(f => f.endsWith('.js')).map(f => files[f].content).join('\n')}
        <\/script></body></html>`;

    const doc = frame.contentWindow.document;
    doc.open(); doc.write(finalHTML); doc.close();
}

function closePreview() { document.getElementById('preview-overlay').style.display = 'none'; currentActiveFile = null; }

// --- 6. SUGGESTION SYSTEM ---
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
}

// --- 7. UTILS & INIT ---
function updateLineNumbers(id) { /* Disabled numbers */ }
function updateFileContent(name, val) { if(files[name]) files[name].content = val; }
function syncScroll(id) { }
function minimizeBox(id) { document.getElementById(`box-${id}`).style.display='none'; }
function expandBox(id) { document.getElementById(`box-${id}`).classList.toggle('fullscreen'); }

window.onload = () => {
    updateTaskbar();
    addFileToUI("index.html", "html", files["index.html"].content);
    addFileToUI("style.css", "css", files["style.css"].content);
};
