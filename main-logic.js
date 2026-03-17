// --- 1. CONFIGURATION & DICTIONARY ---
const dictionary = {
    html: ['div','span','h1','h2','h3','p','a','button','input','img','ul','li','body','head','html','script','style','section','footer','header','main'],
    css: ['color','background','margin','padding','display','flex','grid','border','border-radius','font-size','width','height','position','top','left'],
    js: ['console.log','document','window','function','const','let','var','if','else','for','fetch','addEventListener','JSON.parse']
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

let showLineNumbers = true; 
let selectedIndex = 0; 

// --- 2. SYNTAX HIGHLIGHTING ENGINE (NEW) ---
function applySyntaxHighlighting(code, lang) {
    // Escape HTML characters to prevent rendering
    code = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    if (lang === 'html') {
        // Highlight Tags (e.g., <div>)
        code = code.replace(/(&lt;\/?[a-z1-6]+)/gi, '<span style="color: #ff7b72;">$1</span>');
        // Highlight Attributes (e.g., class=)
        code = code.replace(/(\s)([a-z-]+)(?==)/gi, '$1<span style="color: #d2a8ff;">$2</span>');
        // Highlight Strings (Values in quotes)
        code = code.replace(/"(.*?)"/g, '<span style="color: #a5d6ff;">"$1"</span>');
    } 
    else if (lang === 'css') {
        // Highlight Properties (e.g., color:)
        code = code.replace(/([a-z-]+)(?=\s*:)/gi, '<span style="color: #79c0ff;">$1</span>');
        // Highlight Values (e.g., : red;)
        code = code.replace(/(:\s*)([^;]+)/gi, '$1<span style="color: #ffa657;">$2</span>');
    }
    else if (lang === 'js') {
        // Highlight Keywords
        const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else'];
        keywords.forEach(kw => {
            const reg = new RegExp(`\\b${kw}\\b`, 'g');
            code = code.replace(reg, `<span style="color: #ff7b72;">${kw}</span>`);
        });
    }
    return code + "\n"; // Extra newline for scroll sync
}

// --- 3. FILE MANAGEMENT & DELETE (FIXED) ---

function deleteFile(name) {
    if(confirm(`Are you sure you want to delete ${name}?`)) {
        // 1. Remove from files object
        delete files[name];
        
        // 2. Remove from UI
        const safeId = "file-" + name.replace(/[^a-z0-9]/gi, '-');
        const element = document.getElementById(`box-${safeId}`);
        if(element) element.remove();
        
        // 3. Refresh Taskbar
        updateTaskbar();
    }
}

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

// --- 4. UI CONSTRUCTION ---

function addFileToUI(name, type, content = "") {
    const wrapper = document.getElementById('editor-grid');
    const safeId = "file-" + name.replace(/[^a-z0-9]/gi, '-');
    
    if(document.getElementById(`box-${safeId}`)) return;

    const newBox = document.createElement('div');
    newBox.className = 'window-frame';
    newBox.id = `box-${safeId}`;
    newBox.innerHTML = `
        <div class="window-header">
            <span class="window-title">${name.toUpperCase()} <i class="fas fa-code"></i></span>
            <div class="window-controls">
                <i class="fas fa-minus" onclick="minimizeBox('${safeId}')"></i>
                <i class="fas fa-expand" onclick="expandBox('${safeId}')"></i>
                <i class="fas fa-trash" onclick="deleteFile('${name}')" style="color:#ff4d4d; cursor:pointer;"></i>
            </div>
        </div>
        <div class="window-body editor-container" style="display: flex; position: relative; background: #0b1619; height: 300px;">
            <div class="line-numbers" id="${safeId}-lines" style="width: 35px; text-align: right; padding: 10px 5px; color: #555; background: #081012; font-family: monospace; font-size: 14px; user-select: none;">1.</div>
            
            <div style="flex: 1; position: relative; overflow: hidden;">
                <pre id="${safeId}-highlight" aria-hidden="true" 
                    style="position: absolute; margin: 0; padding: 10px; pointer-events: none; white-space: pre-wrap; word-wrap: break-word; font-family: 'Fira Code', monospace; font-size: 14px; color: #e0e0e0; z-index: 1;"></pre>
                
                <textarea id="${safeId}-code" data-lang="${type}" spellcheck="false"
                    style="position: relative; width: 100%; height: 100%; margin: 0; padding: 10px; background: transparent; color: transparent; caret-color: white; border: none; outline: none; resize: none; font-family: 'Fira Code', monospace; font-size: 14px; z-index: 2; line-height: 1.5; white-space: pre; overflow: auto;"
                    oninput="handleInput('${name}', '${safeId}')"
                    onscroll="syncScroll('${safeId}')">${content}</textarea>
            </div>
        </div>
    `;
    wrapper.appendChild(newBox);
    attachInputListeners(document.getElementById(`${safeId}-code`));
    handleInput(name, safeId); // Initial highlight
}

// --- 5. CORE LOGIC FUNCTIONS ---

function handleInput(fileName, safeId) {
    const tx = document.getElementById(`${safeId}-code`);
    const hl = document.getElementById(`${safeId}-highlight`);
    
    // Update central data
    files[fileName].content = tx.value;
    
    // Update Highlighting
    hl.innerHTML = applySyntaxHighlighting(tx.value, tx.getAttribute('data-lang'));
    
    // Update Lines
    updateLineNumbers(safeId);
}

function syncScroll(safeId) {
    const tx = document.getElementById(`${safeId}-code`);
    const hl = document.getElementById(`${safeId}-highlight`);
    const lb = document.getElementById(`${safeId}-lines`);
    
    hl.scrollTop = tx.scrollTop;
    hl.scrollLeft = tx.scrollLeft;
    if(lb) lb.scrollTop = tx.scrollTop;
}

function updateLineNumbers(safeId) {
    const tx = document.getElementById(`${safeId}-code`);
    const lb = document.getElementById(`${safeId}-lines`);
    const lines = tx.value.split('\n').length;
    lb.innerHTML = Array.from({length: lines}, (_, i) => (i + 1) + '.').join('<br>');
}

// Keep your existing beautifyCode, showSuggestions, insertWord, etc. here as they were.
// Ensure they call handleInput() after modifying text to refresh the highlights.
