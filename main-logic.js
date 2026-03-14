// --- 1. CONFIGURATION & STATE ---
const dictionary = {
    html: ['div','span','h1','h2','h3','p','a','button','input','img','ul','li','article','aside','body','br','canvas','code','footer','form','head','header','html','iframe','label','link','main','nav','ol','script','section','select','style','table','textarea','title','tr','td','ul','main','strong','em','hr'],
    css: ['color','background','margin','padding','display','flex','grid','border','border-radius','box-shadow','cursor','font-family','font-size','height','width','opacity','position','top','left','right','bottom','z-index','transition','overflow','justify-content','align-items'],
    js: ['console.log','document','window','function','const','let','var','if','else','for','forEach','map','fetch','addEventListener','setTimeout','setInterval','JSON.stringify','JSON.parse','alert','Math.random','Math.floor','querySelector','getElementById']
};

// प्रोजेक्टमधील सर्व फाईल्सचा डेटा साठवण्यासाठी
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

// --- 2. EDITOR CREATION & UI ---
function addFileToUI(name, id, content = "") {
    const wrapper = document.getElementById('editor-grid');
    if(!wrapper) return;

    // जर आधीच तो बॉक्स असेल तर फक्त दाखवा
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
                <i class="fas fa-minus" onclick="minimizeBox('${id}')"></i>
                <i class="fas fa-expand" onclick="expandBox('${id}')"></i>
                <i class="fas fa-trash" onclick="deleteBox('${id}', '${name}')"></i>
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

// फाईलचा कंटेंट अपडेट करण्यासाठी फंक्शन
function updateFileContent(fileName, newContent) {
    if(files[fileName]) {
        files[fileName].content = newContent;
    }
}

// --- 3. AUTO-COMPLETE LOGIC ---
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
        
        // Suggestion box ची पोझिशन थोडी सुधारली आहे
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

// --- 4. RUN & EXPORT (ZIP System) ---
function runCode() {
    const overlay = document.getElementById('preview-overlay');
    const frame = document.getElementById('output-frame');
    if (!overlay || !frame) return;

    overlay.style.display = 'flex';

    // फाईल्स ऑब्जेक्ट मधून लेटेस्ट डेटा घेणे
    const h = files["index.html"]?.content || '';
    const c = `<style>${files["style.css"]?.content || ''}</style>`;
    const j = `<script>${files["script.js"]?.content || ''}<\/script>`;

    const doc = frame.contentWindow.document;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">${c}</head><body>${h}${j}</body></html>`);
    doc.close();
}

function exportCode() {
    // index.html मध्ये JSZip लायब्ररी असणे आवश्यक आहे
    if (typeof JSZip === "undefined") {
        alert("JSZip library not loaded!");
        return;
    }

    const zip = new JSZip();
    Object.keys(files).forEach(fileName => {
        zip.file(fileName, files[fileName].content);
    });

    zip.generateAsync({ type: "blob" }).then(function(content) {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = "Craby_Project.zip";
        link.click();
    });
}

// --- 5. UTILS ---
function toggleShutter() {
    const shutter = document.getElementById('shutter');
    shutter.classList.toggle('open');
}

function expandBox(id) { document.getElementById(`box-${id}`).classList.toggle('fullscreen'); }
function minimizeBox(id) { document.getElementById(`box-${id}`).style.display = 'none'; }

function deleteBox(id, fileName) { 
    if(confirm(`Delete ${fileName}?`)) {
        document.getElementById(`box-${id}`).remove();
        delete files[fileName];
        renderFileList();
    } 
}

// टास्कबारमध्ये फाईल्सची लिस्ट दाखवण्यासाठी
function renderFileList() {
    const list = document.getElementById('shutter-file-list');
    if(!list) return;
    list.innerHTML = "";
    Object.keys(files).forEach(name => {
        const div = document.createElement('div');
        div.className = "file-item";
        div.innerHTML = `<i class="fas fa-file-code"></i> ${name}`;
        div.onclick = () => addFileToUI(name, files[name].type, files[name].content);
        list.appendChild(div);
    });
}

// नवीन फाईल ॲड करण्यासाठी
function addNewFilePrompt() {
    const name = prompt("Enter file name (e.g. about.html):");
    if(name) {
        const ext = name.split('.').pop();
        files[name] = { content: "", type: ext };
        renderFileList();
        addFileToUI(name, ext, "");
    }
}

// विंडो लोड झाल्यावर डिफॉल्ट फाईल्स दाखवा
window.onload = () => { 
    renderFileList();
    addFileToUI("index.html", "html", files["index.html"].content);
    addFileToUI("style.css", "css", files["style.css"].content);
};

document.addEventListener('mousedown', (e) => { 
    if (sBox && !sBox.contains(e.target)) sBox.style.display = 'none'; 
});
