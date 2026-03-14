// --- 1. CONFIGURATION & DICTIONARY ---
const dictionary = {
    html: ['div','span','h1','h2','h3','p','a','button','input','img','ul','li','article','aside','body','br','canvas','code','footer','form','head','header','html','iframe','label','link','main','nav','ol','script','section','select','style','table','textarea','title','tr','td','ul','main','strong','em','hr'],
    css: ['color','background','margin','padding','display','flex','grid','border','border-radius','box-shadow','cursor','font-family','font-size','height','width','opacity','position','top','left','right','bottom','z-index','transition','overflow','justify-content','align-items'],
    js: ['console.log','document','window','function','const','let','var','if','else','for','forEach','map','fetch','addEventListener','setTimeout','setInterval','JSON.stringify','JSON.parse','alert','Math.random','Math.floor','querySelector','getElementById']
};

// Global object with updated default index.html content
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

// --- 2. EDITOR CREATION & UI LOGIC ---

/**
 * Creates a new editor window in the grid
 */
function addFileToUI(name, type, content = "") {
    const wrapper = document.getElementById('editor-grid');
    if(!wrapper) return;

    // Create a safe ID from filename (e.g., "123.html" -> "file-123-html")
    const safeId = "file-" + name.replace(/[^a-z0-9]/gi, '-');

    // If box already exists, just show it
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
        <div class="window-body">
            <textarea id="${safeId}-code" spellcheck="false" data-lang="${type}" oninput="updateFileContent('${name}', this.value)">${content}</textarea>
        </div>
    `;
    wrapper.appendChild(newBox);
    attachInputListeners(document.getElementById(`${safeId}-code`));
    
    if(typeof updateThemeAndFont === "function") updateThemeAndFont();
}

/**
 * Updates the content in the global files object
 */
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
        alert("HTML File not found! Please check the name.");
        return;
    }

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

    if (fileName.toLowerCase() === 'all') {
        if (typeof JSZip !== "undefined") {
            const zip = new JSZip();
            Object.keys(files).forEach(name => {
                zip.file(name, files[name].content);
            });
            zip.generateAsync({ type: "blob" }).then(function(content) {
                const link = document.createElement("a");
                link.href = URL.createObjectURL(content);
                link.download = "Craby_Project_Complete.zip";
                link.click();
            });
        } else {
            alert("JSZip library not found.");
        }
    } else {
        if (files[fileName]) {
            const blob = new Blob([files[fileName].content], { type: "text/plain" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
        } else {
            alert("File not found!");
        }
    }
}

// --- 5. UTILITY FUNCTIONS ---

function toggleShutter() {
    const shutter = document.getElementById('shutter');
    if(shutter) shutter.classList.toggle('open');
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
    if(confirm(`Are you sure you want to delete ${fileName}?`)) {
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
    const name = prompt("Enter new file name (e.g. about.html):");
    if(name && name.includes('.')) {
        const ext = name.split('.').pop().toLowerCase();
        files[name] = { content: "", type: ext };
        renderFileList();
        addFileToUI(name, ext, "");
    } else if(name) {
        alert("Please include file extension (e.g., .html, .css, .js)");
    }
}
function beautifyCode() {
    document.querySelectorAll('textarea').forEach(tx => {
        let code = tx.value;

        tx.value = formatCode(code);
    });
}

function formatCode(code) {

    let tab = "  "; // 2 spaces
    let indent = "";
    let result = "";

    // Add line breaks
    code = code
        .replace(/>\s*</g, ">\n<")   // HTML tags
        .replace(/{/g, "{\n")       // open brace
        .replace(/}/g, "\n}\n")     // close brace
        .replace(/;/g, ";\n");      // css/js line

    let lines = code.split("\n");

    lines.forEach(line => {

        line = line.trim();
        if(line === "") return;

        // reduce indent when closing
        if(line.startsWith("}") || line.startsWith("</")) {
            indent = indent.substring(tab.length);
        }

        result += indent + line + "\n";

        // increase indent
        if(line.endsWith("{") || line.match(/^<[^\/!][^>]*>$/)) {
            indent += tab;
        }

    });

    return result.trim();
}
// Helper: Format CSS and JS (Basic Braces logic)
function formatCSSJS(code) {
    let tab = '  ';
    let result = '';
    let indent = '';
    
    // Clean existing mess
    code = code.replace(/\s*\{\s*/g, " {\n").replace(/\s*\}\s*/g, "\n}\n").replace(/\s*;\s*/g, ";\n");

    code.split('\n').forEach(line => {
        line = line.trim();
        if (line.match(/\}/)) indent = indent.substring(tab.length);
        if (line !== "") result += indent + line + '\n';
        if (line.match(/\{/)) indent += tab;
    });

    return result.trim();
}

window.onload = () => { 
    renderFileList();
    addFileToUI("index.html", "html", files["index.html"].content);
    addFileToUI("style.css", "css", files["style.css"].content);
    addFileToUI("script.js", "js", files["script.js"].content);
};

document.addEventListener('mousedown', (e) => { 
    if (sBox && !sBox.contains(e.target)) sBox.style.display = 'none'; 
});
