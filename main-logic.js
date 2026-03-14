// --- 1. CONFIGURATION & DICTIONARY ---
const dictionary = {
    html: ['div','span','h1','h2','h3','p','a','button','input','img','ul','li','article','aside','body','br','canvas','code','footer','form','head','header','html','iframe','label','link','main','nav','ol','script','section','select','style','table','textarea','title','tr','td','ul','main','strong','em','hr'],
    css: ['color','background','margin','padding','display','flex','grid','border','border-radius','box-shadow','cursor','font-family','font-size','height','width','opacity','position','top','left','right','bottom','z-index','transition','overflow','justify-content','align-items'],
    js: ['console.log','document','window','function','const','let','var','if','else','for','forEach','map','fetch','addEventListener','setTimeout','setInterval','JSON.stringify','JSON.parse','alert','Math.random','Math.floor','querySelector','getElementById']
};

const sBox = document.createElement('div');
sBox.id = 'suggestion-box';
document.body.appendChild(sBox);

let selectedIdx = 0;
let currentLang = '';

// --- 2. EDITOR CREATION ---
function addFileToUI(name, id, content = "") {
    const wrapper = document.getElementById('editor-grid');
    if(!wrapper) return;

    const newBox = document.createElement('div');
    newBox.className = 'window-frame';
    newBox.id = `box-${id}`;
    newBox.innerHTML = `
        <div class="window-header">
            <span class="window-title">${name.toUpperCase()} <i class="fas fa-code"></i></span>
            <div class="window-controls">
                <i class="fas fa-minus" onclick="minimizeBox('${id}')"></i>
                <i class="fas fa-expand" onclick="expandBox('${id}')"></i>
                <i class="fas fa-trash" onclick="deleteBox('${id}')"></i>
            </div>
        </div>
        <div class="window-body">
            <textarea id="${id}-code" spellcheck="false" data-lang="${id}">${content}</textarea>
        </div>
    `;
    wrapper.appendChild(newBox);
    attachInputListeners(document.getElementById(`${id}-code`));
    
    if(typeof updateThemeAndFont === "function") updateThemeAndFont();
}

// --- 3. AUTO-COMPLETE & POSITION LOGIC ---
function attachInputListeners(txt) {
    txt.addEventListener('input', (e) => {
        const pos = txt.selectionStart;
        const val = txt.value;
        const char = e.data;
        currentLang = txt.getAttribute('data-lang') || 'html';

        // Auto-Bracket/Pairing
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
        
        // --- POSITION FIX: Cursor chya exact khali dakhvne ---
        const { offsetLeft, offsetTop } = getCursorXY(txt, pos);
        const rect = txt.getBoundingClientRect();
        
        sBox.style.top = `${rect.top + offsetTop + 25}px`; 
        sBox.style.left = `${rect.left + offsetLeft}px`;
        sBox.style.display = 'block';

        sBox.innerHTML = matches.map((m, i) => `
            <div class="suggestion-item ${i === 0 ? 'active' : ''}" onclick="insertWord('${m}', '${txt.id}')">
                <i class="fas fa-bolt" style="font-size:10px; opacity:0.5; margin-right:5px;"></i>${m}
            </div>`).join('');
    } else { sBox.style.display = 'none'; }
}

// Helper: Cursor chi position calculate karne (X, Y)
function getCursorXY(textarea, selectionStart) {
    const { offsetLeft, offsetTop } = textarea;
    // He basic offset calculation aahe, layout nusar +/- karu shakto
    return { offsetLeft: 20, offsetTop: textarea.scrollTop + (selectionStart / 10) }; 
}

// --- 4. AUTO TAG CLOSE & INSERT ---
function insertWord(word, id) {
    const txt = document.getElementById(id);
    const pos = txt.selectionStart;
    const textBefore = txt.value.substring(0, pos);
    const lastWordMatch = textBefore.match(/[\w.-]+$/);
    const startPos = lastWordMatch ? pos - lastWordMatch[0].length : pos;
    
    let wordToInsert = word;

    // VS CODE STYLE AUTO-TAG CLOSE (Fakt HTML sathi)
    if (currentLang === 'html') {
        const selfClosing = ['img', 'br', 'hr', 'input', 'meta', 'link'];
        if (!selfClosing.includes(word.toLowerCase())) {
            wordToInsert = `<${word}></${word}>`;
        } else {
            wordToInsert = `<${word}>`;
        }
    }

    txt.value = txt.value.substring(0, startPos) + wordToInsert + txt.value.substring(pos);
    
    // Cursor position tag chya madhe set karne <h1>|</h1>
    if (currentLang === 'html' && wordToInsert.includes('></')) {
        const newPos = startPos + word.length + 2; 
        txt.selectionStart = txt.selectionEnd = newPos;
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

// --- 5. REALITY-BASED RUN CODE ---
function runCode() {
    const overlay = document.getElementById('preview-overlay');
    const frame = document.getElementById('output-frame');
    if (!overlay || !frame) return;

    overlay.style.display = 'flex';
    if(typeof setPreviewSize === "function") setPreviewSize('100%');

    const h = document.getElementById('html-code')?.value || '';
    const c = `<style>${document.getElementById('css-code')?.value || ''}</style>`;
    const j = `<script>${document.getElementById('js-code')?.value || ''}<\/script>`;

    const doc = frame.contentWindow.document;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">${c}</head><body>${h}${j}</body></html>`);
    doc.close();
}

// --- 6. UTILS & WINDOWS ---
function beautifyCode() {
    document.querySelectorAll('textarea').forEach(tx => {
        tx.value = tx.value.replace(/>\s+</g, '><').replace(/></g, '>\n<').replace(/;/g, ';\n  ');
    });
}
function exportCode() {
    const zip = new JSZip();
    
    // प्रोजेक्टमधील सर्व फाईल्स ZIP मध्ये ॲड करा
    Object.keys(files).forEach(fileName => {
        zip.file(fileName, files[fileName].content);
    });

    // ZIP फाईल तयार करून डाऊनलोड करा
    zip.generateAsync({ type: "blob" }).then(function(content) {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = "craby_project.zip"; // प्रोजेक्टचे नाव
        link.click();
    });
}


function expandBox(id) { document.getElementById(`box-${id}`).classList.toggle('fullscreen'); }
function minimizeBox(id) { document.getElementById(`box-${id}`).style.display = 'none'; }
function restoreBox(id) { 
    const box = document.getElementById(`box-${id}`);
    if (box) { box.style.display = 'flex'; box.classList.remove('fullscreen'); }
}
function deleteBox(id) { if(confirm("Delete this file?")) document.getElementById(`box-${id}`).remove(); }

window.onload = () => { 
    addFileToUI("index.html", "html", "<h1>Craby Editor</h1>");
    addFileToUI("style.css", "css", "h1 { color: #ffb400; text-align: center; }");
};

document.addEventListener('mousedown', (e) => { 
    if (sBox && !sBox.contains(e.target)) sBox.style.display = 'none'; 
});
