// --- 1. CONFIGURATION & DICTIONARY ---
const dictionary = {
    html: ['div','span','h1','h2','h3','p','a','button','input','img','ul','li','article','aside','body','br','canvas','code','footer','form','head','header','html','iframe','label','link','main','nav','ol','script','section','select','style','table','textarea','title','tr','td','ul','main','strong','em','hr'],
    css: ['color','background','margin','padding','display','flex','grid','border','border-radius','box-shadow','cursor','font-family','font-size','height','width','opacity','position','top','left','right','bottom','z-index','transition','overflow','justify-content','align-items'],
    js: ['console.log','document','window','function','const','let','var','if','else','for','forEach','map','fetch','addEventListener','setTimeout','setInterval','JSON.stringify','JSON.parse','alert','Math.random','Math.floor','querySelector','getElementById']
};

let files = {
    "index.html": { 
        content: `<!DOCTYPE html>\n<html>\n<head>\n<title>Craby Html Editor</title>\n</head>\n<body>\n\n<h1>Welcome to Craby Html Editor</h1>\n\n</body>\n</html>`, 
        type: "html" 
    },
    "style.css": { content: "h1 { color: #ffb400; text-align: center; font-family: sans-serif; }", type: "css" },
    "script.js": { content: "console.log('Craby Editor is Ready!');", type: "js" }
};

const sBox = document.createElement('div');
sBox.id = 'suggestion-box';
document.body.appendChild(sBox);

let selectedIdx = 0;
let currentLang = '';
let showLineNumbers = false; // Default Off ठेवले आहे
let lineNumberFontSize = 14; // Default line number font size

// --- 2. EDITOR CREATION & UI LOGIC ---

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
                <i class="fas fa-minus" onclick="minimizeBox('${safeId}')" title="Minimize"></i>
                <i class="fas fa-expand" onclick="expandBox('${safeId}')" title="Full Screen"></i>
                <i class="fas fa-trash" onclick="deleteBox('${safeId}', '${name}')" title="Delete"></i>
            </div>
        </div>
        <div class="window-body editor-container" style="display: flex; position: relative; background: #0b1619; overflow: hidden;">
            <div class="line-numbers" id="${safeId}-lines" 
                 style="${showLineNumbers ? 'display:block;' : 'display:none;'} 
                        text-align: right; padding: 10px 5px; border-right: 1.5px solid rgba(255,255,255,0.1); 
                        color: rgba(255,255,255,0.3); user-select: none; background: transparent; 
                        overflow: hidden; white-space: nowrap; font-size: ${lineNumberFontSize}px;">
                1.
            </div>
            <textarea id="${safeId}-code" spellcheck="false" data-lang="${type}" 
                style="flex: 1; padding: 10px; border: none; outline: none; background: transparent; color: #e0e0e0; resize: none; white-space: pre; overflow: auto; line-height: 1.5;"
                oninput="updateFileContent('${name}', this.value); updateLineNumbers('${safeId}')"
                onscroll="syncScroll('${safeId}')">${content}</textarea>
        </div>
    `;
    wrapper.appendChild(newBox);
    attachInputListeners(document.getElementById(`${safeId}-code`));
    updateLineNumbers(safeId);
    
    if(typeof updateThemeAndFont === "function") updateThemeAndFont();
}

function updateLineNumbers(safeId) {
    const tx = document.getElementById(`${safeId}-code`);
    const lineBox = document.getElementById(`${safeId}-lines`);
    if(!tx || !lineBox) return;

    const computedStyle = window.getComputedStyle(tx);
    
    lineBox.style.fontSize = lineNumberFontSize + "px";
    lineBox.style.fontFamily = computedStyle.fontFamily;
    lineBox.style.lineHeight = computedStyle.lineHeight;
    lineBox.style.paddingTop = computedStyle.paddingTop;

    const lines = tx.value.split('\n').length;
    let lineHTML = '';
    for(let i = 1; i <= lines; i++) {
        lineHTML += i + '.<br>';
    }
    lineBox.innerHTML = lineHTML;

    const charCount = lines.toString().length;
    lineBox.style.width = (charCount * (lineNumberFontSize * 0.8)) + "px";
}

function syncScroll(safeId) {
    const tx = document.getElementById(`${safeId}-code`);
    const lineBox = document.getElementById(`${safeId}-lines`);
    if(tx && lineBox) {
        lineBox.scrollTop = tx.scrollTop;
    }
}

function toggleLineNumbers(status) {
    showLineNumbers = status;
    document.querySelectorAll('.line-numbers').forEach(el => {
        el.style.display = showLineNumbers ? 'block' : 'none';
    });
    // Tracking toggle event
    if(typeof trackCrabyEvent === 'function') trackCrabyEvent('button_click', { button_id: 'toggle_line_numbers', status: status });
}

function changeLineNumberSize(size) {
    lineNumberFontSize = size;
    document.querySelectorAll('.line-numbers').forEach(el => {
        const safeId = el.id.replace('-lines', '');
        updateLineNumbers(safeId);
    });
}

function updateFileContent(fileName, newContent) {
    if(files[fileName]) {
        files[fileName].content = newContent;
    }
}

// --- 3. AUTO-COMPLETE & SUGGESTION LOGIC ---

function attachInputListeners(txt) {
    txt.addEventListener('input', (e) => {
        const pos = txt.selectionStart;
        const val = txt.value;
        const char = e.data;
        currentLang = txt.getAttribute('data-lang') || 'html';

        const pairs = { '{': '}', '(': ')', '[': ']', '"': '"', "'": "'" };
        if (pairs[char]) {
            txt.value = val.substring(0, pos) + pairs[char] + val.substring(pos);
            txt.selectionStart = txt.selectionEnd = pos;
        } 
        showSuggestions(txt);
    });
    txt.addEventListener('keydown', (e) => handleNav(e, txt));
}

function showSuggestions(txt) {
    const pos = txt.selectionStart;
    const textBefore = txt.value.substring(0, pos);
    const words = textBefore.split(/[\s<>{}:;()]/);
    const lastWord = words[words.length - 1].toLowerCase();

    if (lastWord.length < 1) { sBox.style.display = 'none'; return; }
    
    const matches = (dictionary[currentLang] || []).filter(word => word.startsWith(lastWord));

    if (matches.length > 0) {
        selectedIdx = 0;
        const rect = txt.getBoundingClientRect();
        sBox.style.top = `${rect.top + 30}px`; 
        sBox.style.left = `${rect.left + 20}px`;
        sBox.style.display = 'block';

        sBox.innerHTML = matches.map((m, i) => `
            <div class="suggestion-item ${i === 0 ? 'active' : ''}" onclick="insertWord('${m}', '${txt.id}')">
                <i class="fas fa-bolt" style="font-size:10px; color:var(--accent); margin-right:5px;"></i>${m}
            </div>`).join('');
    } else { sBox.style.display = 'none'; }
}

function insertWord(word, id) {
    const txt = document.getElementById(id);
    const pos = txt.selectionStart;
    const textBefore = txt.value.substring(0, pos);
    const lastWordMatch = textBefore.match(/[\w.-]+$/);
    const startPos = lastWordMatch ? pos - lastWordMatch[0].length : pos;
    
    let wordToInsert = word;

    if (currentLang === 'html') {
        const selfClosing = ['img', 'br', 'hr', 'input', 'meta', 'link'];
        if (!selfClosing.includes(word.toLowerCase())) {
            wordToInsert = `<${word}></${word}>`;
        } else {
            wordToInsert = `<${word}>`;
        }
    }

    txt.value = txt.value.substring(0, startPos) + wordToInsert + txt.value.substring(pos);
    
    if (currentLang === 'html' && wordToInsert.includes('></')) {
        txt.selectionStart = txt.selectionEnd = startPos + word.length + 2;
    }

    sBox.style.display = 'none';
    txt.focus();
    updateLineNumbers(id.replace('-code', ''));
}

function handleNav(e, txt) {
    if (sBox.style.display === 'block') {
        const items = sBox.querySelectorAll('.suggestion-item');
        if (e.key === 'ArrowDown') { e.preventDefault(); selectedIdx = (selectedIdx + 1) % items.length; updateActive(items); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); selectedIdx = (selectedIdx - 1 + items.length) % items.length; updateActive(items); }
        else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); if (items[selectedIdx]) items[selectedIdx].click(); }
        else if (e.key === 'Escape') { sBox.style.display = 'none'; }
    }
}

function updateActive(items) { items.forEach((it, i) => it.classList.toggle('active', i === selectedIdx)); }

// --- 4. INTERACTIVE RUN & DOWNLOAD SYSTEM ---

function runCode() {
    const overlay = document.getElementById('preview-overlay');
    const frame = document.getElementById('output-frame');
    if (!overlay || !frame) return;

    const fileToRun = prompt("Which HTML file do you want to run?", "index.html");
    
    if (!files[fileToRun] || files[fileToRun].type !== 'html') {
        alert("HTML File not found!");
        return;
    }

    // TRACK: Code Run Event
    if(typeof trackCrabyEvent === 'function') trackCrabyEvent('code_run', { file_name: fileToRun });

    overlay.style.display = 'flex';
    const htmlContent = files[fileToRun].content || '';
    const cssContent = `<style>${files["style.css"] ? files["style.css"].content : ""}</style>`;
    const jsContent = `<script>${files["script.js"] ? files["script.js"].content : ""}<\/script>`;

    const doc = frame.contentWindow.document;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">${cssContent}</head><body>${htmlContent}${jsContent}</body></html>`);
    doc.close();
}

function exportCode() {
    const fileName = prompt("Which file to download? (e.g. index.html) or type 'all' for ZIP:", "index.html");
    if (!fileName) return;

    // TRACK: File Download Event
    if(typeof trackCrabyEvent === 'function') trackCrabyEvent('file_download', { file_name: fileName });

    if (fileName.toLowerCase() === 'all') {
        if (typeof JSZip !== "undefined") {
            const zip = new ZIP();
            Object.keys(files).forEach(name => {
                zip.file(name, files[name].content);
            });
            zip.generateAsync({ type: "blob" }).then(function(content) {
                const link = document.createElement("a");
                link.href = URL.createObjectURL(content);
                link.download = "Craby_Project.zip";
                link.click();
            });
        }
    } else {
        if (files[fileName]) {
            const blob = new Blob([files[fileName].content], { type: "text/plain" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
        }
    }
}

// --- 5. UTILITY FUNCTIONS ---

function toggleShutter() {
    const shutter = document.getElementById('shutter');
    if(shutter) shutter.classList.toggle('open');
    // TRACK: Shutter Open
    if(typeof trackCrabyEvent === 'function') trackCrabyEvent('button_click', { button_id: 'toggle_shutter' });
}

function expandBox(id) { 
    const box = document.getElementById(`box-${id}`);
    if(box) box.classList.toggle('fullscreen'); 
}

function minimizeBox(id) { 
    const box = document.getElementById(`box-${id}`);
    if(box) box.style.display = 'none'; 
}

function deleteBox(id, fileName) { 
    if(confirm(`Delete ${fileName}?`)) {
        const box = document.getElementById(`box-${id}`);
        if(box) box.remove();
        delete files[fileName];
        renderFileList();
    } 
}

function renderFileList() {
    const list = document.getElementById('shutter-file-list');
    if(!list) return;
    list.innerHTML = "";
    Object.keys(files).forEach(name => {
        const div = document.createElement('div');
        div.className = "file-item";
        div.innerHTML = `<i class="fas fa-file-code"></i> ${name}`;
        div.onclick = () => {
            addFileToUI(name, files[name].type, files[name].content);
            toggleShutter();
        };
        list.appendChild(div);
    });
}

function addNewFilePrompt() {
    const name = prompt("New file name:");
    if(name && name.includes('.')) {
        const ext = name.split('.').pop().toLowerCase();
        files[name] = { content: "", type: ext };
        renderFileList();
        addFileToUI(name, ext, "");
        // TRACK: New File Created
        if(typeof trackCrabyEvent === 'function') trackCrabyEvent('button_click', { button_id: 'add_new_file', file_ext: ext });
    }
}

function beautifyCode() {
    document.querySelectorAll('textarea').forEach(tx => {
        let code = tx.value;
        tx.value = formatCode(code);
        updateLineNumbers(tx.id.replace('-code', ''));
    });
    // TRACK: Beautify
    if(typeof trackCrabyEvent === 'function') trackCrabyEvent('button_click', { button_id: 'beautify_code' });
}

function formatCode(code) {
    let tab = "  ";
    let indent = "";
    let result = "";
    code = code.replace(/>\s*</g, ">\n<").replace(/{/g, "{\n").replace(/}/g, "\n}\n").replace(/;/g, ";\n");
    let lines = code.split("\n");
    lines.forEach(line => {
        line = line.trim();
        if(line === "") return;
        if(line.startsWith("}") || line.startsWith("</")) indent = indent.substring(tab.length);
        result += indent + line + "\n";
        if(line.endsWith("{") || (line.startsWith("<") && !line.includes("/") && !line.includes("!"))) indent += tab;
    });
    return result.trim();
}

window.onload = () => { 
    renderFileList();
    addFileToUI("index.html", "html", files["index.html"].content);
    addFileToUI("style.css", "css", files["style.css"].content);
    
    const settingsPanel = document.getElementById('settingsPanel');
    if(settingsPanel) {
        const toggleDiv = document.createElement('div');
        toggleDiv.className = 'setting-item';
        toggleDiv.innerHTML = `
            <span>Show Line Numbers</span>
            <label class="switch">
                <input type="checkbox" onchange="toggleLineNumbers(this.checked)">
                <span class="slider"></span>
            </label>`;
        settingsPanel.appendChild(toggleDiv);

        const rangeDiv = document.createElement('div');
        rangeDiv.className = 'setting-item';
        rangeDiv.style.flexDirection = 'column';
        rangeDiv.style.alignItems = 'flex-start';
        rangeDiv.innerHTML = `
            <span>Line Number Size</span>
            <input type="range" min="8" max="30" value="14" style="width: 100%; margin-top:10px;" 
                oninput="changeLineNumberSize(this.value)">
        `;
        settingsPanel.appendChild(rangeDiv);
    }
};

document.addEventListener('mousedown', (e) => { 
    if (sBox && !sBox.contains(e.target)) sBox.style.display = 'none'; 
});
