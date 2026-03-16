// --- 1. CONFIGURATION & DICTIONARY ---
const dictionary = {
    html: ['div','span','h1','h2','h3','p','a','button','input','img','ul','li','article','aside','body','br','canvas','code','footer','form','head','header','html','iframe','label','link','main','nav','ol','script','section','select','style','table','textarea','title','tr','td','ul','main','strong','em','hr'],
    css: ['color','background','margin','padding','display','flex','grid','border','border-radius','box-shadow','cursor','font-family','font-size','height','width','opacity','position','top','left','right','bottom','z-index','transition','overflow','justify-content','align-items'],
    js: ['console.log','document','window','function','const','let','var','if','else','for','forEach','map','fetch','addEventListener','setTimeout','setInterval','JSON.stringify','JSON.parse','alert','Math.random','Math.floor','querySelector','getElementById']
};

// Global files object
let files = {
    "index.html": { 
        content: `<!DOCTYPE html>\n<html>\n<head>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Craby Editor Ready</h1>\n</body>\n</html>`, 
        type: "html" 
    },
    "style.css": { content: "h1 { color: #ffb400; text-align: center; }", type: "css" }
};

const sBox = document.createElement('div');
sBox.id = 'suggestion-box';
document.body.appendChild(sBox);

let showLineNumbers = false; 
let lineNumberFontSize = 14; 

// --- 2. BEAUTIFY CODE LOGIC (NEW) ---

/**
 * Iterates through all active textareas and formats the code
 */
function beautifyCode() {
    document.querySelectorAll('textarea').forEach(tx => {
        let code = tx.value;
        tx.value = formatCode(code);
        
        // Extract the filename from the textarea's ID to update the files object
        const fileName = tx.id.replace('file-', '').replace('-code', '');
        updateFileContent(fileName, tx.value);
        
        // Refresh line numbers for the specific editor
        const safeId = tx.id.replace('-code', '');
        updateLineNumbers(safeId);
    });
}

/**
 * Basic formatter for HTML, CSS, and JS
 */
function formatCode(code) {
    let tab = "  "; // 2 spaces
    let indent = "";
    let result = "";

    // Add line breaks for basic formatting
    code = code
        .replace(/>\s*</g, ">\n<")   // HTML tags
        .replace(/{/g, "{\n")       // open brace
        .replace(/}/g, "\n}\n")     // close brace
        .replace(/;/g, ";\n");      // css/js line

    let lines = code.split("\n");

    lines.forEach(line => {
        line = line.trim();
        if(line === "") return;

        // reduce indent when closing tag or brace is found
        if(line.startsWith("}") || line.startsWith("</")) {
            indent = indent.substring(tab.length);
        }

        result += indent + line + "\n";

        // increase indent for opening tags or braces
        if(line.endsWith("{") || line.match(/^<[^\/!][^>]*>$/)) {
            indent += tab;
        }
    });

    return result.trim();
}

// --- 3. FILE MANAGEMENT & SHUTTER LOGIC ---

function updateTaskbar() {
    const taskbar = document.getElementById('shutter-file-list'); 
    if(!taskbar) return;
    
    taskbar.innerHTML = ''; 
    Object.keys(files).forEach(fileName => {
        const fileItem = document.createElement('div');
        fileItem.className = 'shutter-item';
        fileItem.innerHTML = `<i class="fas fa-file-code"></i> <span>${fileName}</span>`;
        fileItem.onclick = () => {
            addFileToUI(fileName, files[fileName].type, files[fileName].content);
        };
        taskbar.appendChild(fileItem);
    });
}

function addNewFilePrompt() {
    const fileName = prompt("Enter file name (e.g., script.js, about.html, theme.css):");
    if (!fileName) return;

    if (files[fileName]) {
        alert("This file already exists!");
        return;
    }

    const extension = fileName.split('.').pop().toLowerCase();
    let type = "html";
    if (extension === "css") type = "css";
    if (extension === "js") type = "js";

    files[fileName] = { content: "", type: type };

    updateTaskbar();
    addFileToUI(fileName, type, "");
    
    if (typeof trackCrabyEvent === 'function') {
        trackCrabyEvent('create_file', { file_name: fileName });
    }
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
    if(confirm(`Are you sure you want to delete ${name}?`)) {
        const safeId = "file-" + name.replace(/[^a-z0-9]/gi, '-');
        const element = document.getElementById(`box-${safeId}`);
        if(element) element.remove();
        
        delete files[name];
        updateTaskbar();
    }
}

// --- 4. RUN & DOWNLOAD LOGIC ---

function runCode() {
    const htmlFiles = Object.keys(files).filter(f => f.endsWith('.html'));
    if(htmlFiles.length === 0) return alert("No HTML files available!");

    const selectedFile = prompt("Select HTML to run:\n" + htmlFiles.join(', '), htmlFiles[0]);
    if (!files[selectedFile]) return;

    const overlay = document.getElementById('preview-overlay');
    const frame = document.getElementById('output-frame');
    overlay.style.display = 'flex';

    let rawHTML = files[selectedFile].content;

    Object.keys(files).forEach(name => {
        const content = files[name].content;
        if(name.endsWith('.css')) {
            rawHTML = rawHTML.replace(new RegExp(`href=["']${name}["']`, 'g'), `href="data:text/css;base64,${btoa(content)}"`);
            rawHTML += `<style>${content}</style>`; 
        }
        if(name.endsWith('.js')) {
            rawHTML = rawHTML.replace(new RegExp(`src=["']${name}["']`, 'g'), `src="data:text/javascript;base64,${btoa(unescape(encodeURIComponent(content)))}"`);
        }
    });

    const doc = frame.contentWindow.document;
    doc.open();
    doc.write(rawHTML);
    doc.close();
    
    if (typeof trackCrabyEvent === 'function') trackCrabyEvent('code_run', { file_name: selectedFile });
}

function exportCode() {
    const allFiles = Object.keys(files);
    const selectedFile = prompt("Select file to download:\n" + allFiles.join(', '), allFiles[0]);
    
    if (files[selectedFile]) {
        const blob = new Blob([files[selectedFile].content], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = selectedFile;
        link.click();
        if (typeof trackCrabyEvent === 'function') trackCrabyEvent('file_download', { file_name: selectedFile });
    }
}

// --- 5. CORE UTILITIES ---

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

function changeLineNumberSize(size) {
    lineNumberFontSize = size;
    document.querySelectorAll('.line-numbers').forEach(el => {
        updateLineNumbers(el.id.replace('-lines', ''));
    });
}
// --- Global State for Selection ---
let selectedIndex = 0; // नेहमी पहिल्या आयटमवर राहण्यासाठी

function attachInputListeners(txt) {
    txt.addEventListener('keydown', (e) => {
        const items = document.querySelectorAll('.suggestion-item');
        
        // जर सजेशन बॉक्स उघडा असेल तर Enter की हँडल करा
        if (sBox.style.display === 'block' && items.length > 0) {
            if (e.key === 'Enter') {
                e.preventDefault(); // नवीन लाईनवर जाण्यापासून रोखा
                items[selectedIndex].click(); // सिलेक्ट केलेल्या आयटमला क्लिक करा
            }
            // एरो कीज ने वर-खाली करण्यासाठी (Optional Bonus)
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
            item.classList.add('active-suggestion');
            item.style.backgroundColor = '#3e4451'; // हायलाइट कलर
        } else {
            item.classList.remove('active-suggestion');
            item.style.backgroundColor = ''; 
        }
    });
}

function showSuggestions(txt) {
    const pos = txt.selectionStart;
    const word = txt.value.substring(0, pos).split(/[\s<>{}:;()]/).pop().toLowerCase();
    
    if (word.length < 1) { 
        sBox.style.display = 'none'; 
        return; 
    }

    const lang = txt.getAttribute('data-lang');
    const matches = (dictionary[lang] || []).filter(w => w.startsWith(word));

    if (matches.length > 0) {
        const rect = txt.getBoundingClientRect();
        sBox.style.top = `${rect.top + 30}px`; 
        sBox.style.left = `${rect.left + 20}px`;
        sBox.style.display = 'block';
        
        selectedIndex = 0; // प्रत्येक वेळी नवीन सजेशन आल्यावर पहिल्याला सिलेक्ट करा

        sBox.innerHTML = matches.map((m, index) => {
            let displayLabel = m;
            if(m === 'h1 class') displayLabel = 'h1 class=""';
            
            // पहिला आयटम 'active-suggestion' क्लाससह येईल
            const activeClass = index === 0 ? 'active-suggestion' : '';
            const activeStyle = index === 0 ? 'style="background-color: #3e4451;"' : '';

            return `<div class="suggestion-item ${activeClass}" ${activeStyle} onclick="insertWord('${m}', '${txt.id}')">${displayLabel}</div>`;
        }).join('');
    } else { 
        sBox.style.display = 'none'; 
    }
}

function insertWord(word, id) {
    const txt = document.getElementById(id);
    const pos = txt.selectionStart;
    const lang = txt.getAttribute('data-lang');
    
    const textBeforeCursor = txt.value.substring(0, pos);
    const beforeWord = textBeforeCursor.replace(/[\w.-]+$/, "");
    const afterWord = txt.value.substring(pos);

    let finalInsert = word;
    let cursorOffset = word.length;

    // HTML साठी तुमची विशेष मागणी
    if (lang === 'html' || id.includes('html')) {
        if (word === 'h1') {
            finalInsert = `<h1></h1>`;
            cursorOffset = 4; // <h1>|</h1> च्या मध्ये
        } else if (word === 'h1 class') {
            finalInsert = `<h1 class=""></h1>`;
            cursorOffset = 10; // class="|" च्या मध्ये
        } else if (!word.includes('<')) {
            finalInsert = `<${word}></${word}>`;
            cursorOffset = word.length + 2;
        }
    }

    txt.value = beforeWord + finalInsert + afterWord;
    
    const newCursorPos = beforeWord.length + cursorOffset;
    txt.selectionStart = txt.selectionEnd = newCursorPos;

    sBox.style.display = 'none';
    txt.focus();
    
    updateFileContent(id.replace('file-','').replace('-code',''), txt.value);
}
    // टेक्स्ट अपडेट करा
    txt.value = beforeWord + finalInsert + afterWord;
    
    // कर्सरची जागा सेट करा
    const newCursorPos = beforeWord.length + cursorOffset;
    txt.selectionStart = txt.selectionEnd = newCursorPos;

    sBox.style.display = 'none';
    txt.focus();
    
    // फाईल अपडेट कॉल
    const fileKey = id.replace('file-','').replace('-code','');
    if (typeof updateFileContent === 'function') {
        updateFileContent(fileKey, txt.value);
    }
}

// --- 7. INITIALIZATION ---

window.onload = () => {
    updateTaskbar();
    addFileToUI("index.html", "html", files["index.html"].content);
    addFileToUI("style.css", "css", files["style.css"].content);
};

function minimizeBox(id) { document.getElementById(`box-${id}`).style.display='none'; }
function expandBox(id) { document.getElementById(`box-${id}`).classList.toggle('fullscreen'); }
