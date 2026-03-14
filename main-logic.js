// --- 1. CONFIGURATION & DICTIONARY ---
const dictionary = {
    html: ['div','span','h1','h2','h3','p','a','button','input','img','ul','li','article','aside','body','br','canvas','code','footer','form','head','header','html','iframe','label','link','main','nav','ol','script','section','select','style','table','textarea','title','tr','td','ul','main','strong','em','hr'],
    css: ['color','background','margin','padding','display','flex','grid','border','border-radius','box-shadow','cursor','font-family','font-size','height','width','opacity','position','top','left','right','bottom','z-index','transition','overflow','justify-content','align-items'],
    js: ['console.log','document','window','function','const','let','var','if','else','for','forEach','map','fetch','addEventListener','setTimeout','setInterval','JSON.stringify','JSON.parse','alert','Math.random','Math.floor','querySelector','getElementById']
};

// Global object to store all files data
let files = {
    "index.html": { content: "<h1>Welcome to Craby Editor</h1>", type: "html" },
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
function addFileToUI(name, id, content = "") {
    const wrapper = document.getElementById('editor-grid');
    if(!wrapper) return;

    // If box already exists, just show it
    if(document.getElementById(`box-${id}`)) {
        document.getElementById(`box-${id}`).style.display = 'flex';
        return;
    }

    const newBox = document.createElement('div');
    newBox.className = 'window-frame';
    newBox.id = `box-${id}`;
    newBox.innerHTML = `
        <div class="window-header">
            <span class="window-title">${name.toUpperCase()} <i class="fas fa-code"></i></span>
            <div class="window-controls">
                <i class="fas fa-minus" onclick="minimizeBox('${id}')" title="Minimize"></i>
                <i class="fas fa-expand" onclick="expandBox('${id}')" title="Full Screen"></i>
                <i class="fas fa-trash" onclick="deleteBox('${id}', '${name}')" title="Delete"></i>
            </div>
        </div>
        <div class="window-body">
            <textarea id="${id}-code" spellcheck="false" data-lang="${id}" oninput="updateFileContent('${name}', this.value)">${content}</textarea>
        </div>
    `;
    wrapper.appendChild(newBox);
    attachInputListeners(document.getElementById(`${id}-code`));
    
    if(typeof updateThemeAndFont === "function") updateThemeAndFont();
}

/**
 * Updates the content in the global files object whenever user types
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

        // Auto-pairing brackets and quotes
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
        
        // Position suggestion box near cursor
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

    // Auto tag closing for HTML
    if (currentLang === 'html') {
        const selfClosing = ['img', 'br', 'hr', 'input', 'meta', 'link'];
        if (!selfClosing.includes(word.toLowerCase())) {
            wordToInsert = `<${word}></${word}>`;
        } else {
            wordToInsert = `<${word}>`;
        }
    }

    txt.value = txt.value.substring(0, startPos) + wordToInsert + txt.value.substring(pos);
    
    // Set cursor inside tag for HTML
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

/**
 * Runs the code by asking user which file to use as entry point
 */
function runCode() {
    const overlay = document.getElementById('preview-overlay');
    const frame = document.getElementById('output-frame');
    if (!overlay || !frame) return;

    const fileToRun = prompt("Which HTML file do you want to run?", "index.html");
    
    if (!files[fileToRun]) {
        alert("File not found! Please check the name.");
        return;
    }

    overlay.style.display = 'flex';

    // Get current contents from global object
    const htmlContent = files[fileToRun].content || '';
    const cssContent = `<style>${files["style.css"] ? files["style.css"].content : ""}</style>`;
    const jsContent = `<script>${files["script.js"] ? files["script.js"].content : ""}<\/script>`;

    const doc = frame.contentWindow.document;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">${cssContent}</head><body>${htmlContent}${jsContent}</body></html>`);
    doc.close();
}

/**
 * Downloads single file or entire project based on user input
 */
function exportCode() {
    const fileName = prompt("Which file to download? (e.g. index.html) or type 'all' for ZIP:", "index.html");

    if (!fileName) return;

    if (fileName.toLowerCase() === 'all') {
        // ZIP Download logic
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
            alert("JSZip library not found. Downloading individual files only.");
        }
    } else {
        // Single File Download logic
        if (files[fileName]) {
            const blob = new Blob([files[fileName].content], { type: "text/plain" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
        } else {
            alert("File not found! Make sure you included the extension (.html, .css)");
        }
    }
}

// --- 5. UTILITY FUNCTIONS ---

function toggleShutter() {
    const shutter = document.getElementById('shutter');
    shutter.classList.toggle('open');
}

function expandBox(id) { document.getElementById(`box-${id}`).classList.toggle('fullscreen'); }
function minimizeBox(id) { document.getElementById(`box-${id}`).style.display = 'none'; }

function deleteBox(id, fileName) { 
    if(confirm(`Are you sure you want to delete ${fileName}?`)) {
        const box = document.getElementById(`box-${id}`);
        if(box) box.remove();
        delete files[fileName];
        renderFileList();
    } 
}

/**
 * Renders the file list in the taskbar/shutter
 */
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
    if(name) {
        const ext = name.split('.').pop();
        files[name] = { content: "", type: ext };
        renderFileList();
        addFileToUI(name, ext, "");
    }
}

function beautifyCode() {
    document.querySelectorAll('textarea').forEach(tx => {
        // Simple beautification logic
        tx.value = tx.value.replace(/>\s+</g, '><').replace(/></g, '>\n<');
    });
}

/**
 * Initialize the editor on page load
 */
window.onload = () => { 
    renderFileList();
    addFileToUI("index.html", "html", files["index.html"].content);
    addFileToUI("style.css", "css", files["style.css"].content);
};

// Close suggestion box when clicking outside
document.addEventListener('mousedown', (e) => { 
    if (sBox && !sBox.contains(e.target)) sBox.style.display = 'none'; 
});
