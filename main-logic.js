// --- 1. CONFIGURATION & DICTIONARY ---
const dictionary = {
    html: ['div','span','h1','p','a','button','input','img','ul','li','article','aside','body','br','canvas','code','footer','form','head','header','html','iframe','label','link','main','nav','ol','script','section','select','style','table','textarea','title','tr','td','ul'],
    css: ['color','background','margin','padding','display','flex','grid','border','border-radius','box-shadow','cursor','font-family','font-size','height','width','opacity','position','top','left','right','bottom','z-index','transition'],
    js: ['console.log','document','window','function','const','let','var','if','else','for','forEach','map','fetch','addEventListener','setTimeout','setInterval','JSON.stringify','JSON.parse','alert','Math.random','Math.floor']
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
            <textarea id="${id}-code" spellcheck="false">${content}</textarea>
        </div>
    `;
    wrapper.appendChild(newBox);
    attachInputListeners(document.getElementById(`${id}-code`));
    
    // N नवीन फाईल ऍड झाल्यावर थीम अप्लाय करणे
    if(typeof updateThemeAndFont === "function") updateThemeAndFont();
}

// --- 3. AUTO-COMPLETE ENGINE ---
function attachInputListeners(txt) {
    txt.addEventListener('input', (e) => {
        const pos = txt.selectionStart;
        const val = txt.value;
        const char = e.data;
        currentLang = txt.id.split('-')[0];

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
    const matches = dictionary[currentLang].filter(word => word.startsWith(lastWord));

    if (matches.length > 0) {
        selectedIdx = 0;
        const rect = txt.getBoundingClientRect();
        sBox.style.top = `${rect.top + 30}px`; 
        sBox.style.left = `${rect.left + 20}px`;
        sBox.style.display = 'block';
        sBox.innerHTML = matches.map((m, i) => `<div class="suggestion-item ${i === 0 ? 'active' : ''}" onclick="insertWord('${m}', '${txt.id}')">${m}</div>`).join('');
    } else { sBox.style.display = 'none'; }
}

function insertWord(word, id) {
    const txt = document.getElementById(id);
    const pos = txt.selectionStart;
    const textBefore = txt.value.substring(0, pos);
    const lastWordMatch = textBefore.match(/[\w.-]+$/);
    const startPos = lastWordMatch ? pos - lastWordMatch[0].length : pos;
    txt.value = txt.value.substring(0, startPos) + word + txt.value.substring(pos);
    sBox.style.display = 'none';
    txt.focus();
}

function handleNav(e, txt) {
    if (sBox.style.display === 'block') {
        const items = sBox.querySelectorAll('.suggestion-item');
        if (e.key === 'ArrowDown') { e.preventDefault(); selectedIdx = (selectedIdx + 1) % items.length; updateActive(items); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); selectedIdx = (selectedIdx - 1 + items.length) % items.length; updateActive(items); }
        else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); if (items[selectedIdx]) items[selectedIdx].click(); }
    }
}
function updateActive(items) { items.forEach((it, i) => it.classList.toggle('active', i === selectedIdx)); }

// --- 4. CORE ACTIONS ---
function runCode() {
    const overlay = document.getElementById('preview-overlay');
    if(overlay) overlay.style.display = 'flex';
    const h = document.getElementById('html-code')?.value || '';
    const c = `<style>${document.getElementById('css-code')?.value || ''}</style>`;
    const j = `<script>${document.getElementById('js-code')?.value || ''}<\/script>`;
    const frame = document.getElementById('output-frame');
    if(frame) {
        const out = frame.contentWindow.document;
        out.open(); out.write(h + c + j); out.close();
    }
}

function beautifyCode() {
    document.querySelectorAll('textarea').forEach(tx => {
        tx.value = tx.value.replace(/>\s+</g, '><').replace(/</g, '>\n<').replace(/;/g, ';\n  ');
    });
}

function exportCode() {
    const html = document.getElementById('html-code')?.value || '';
    const blob = new Blob([html], {type: "text/html"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "index.html"; a.click();
}

// --- 5. WINDOW CONTROLS ---
function expandBox(id) {
    const targetBox = document.getElementById(`box-${id}`);
    targetBox.classList.toggle('fullscreen');
}

function minimizeBox(id) {
    document.getElementById(`box-${id}`).style.display = 'none';
}

function restoreBox(id) {
    const box = document.getElementById(`box-${id}`);
    if (box) { box.style.display = 'flex'; box.classList.remove('fullscreen'); }
}

function deleteBox(id) { 
    if(confirm("Delete this file?")) document.getElementById(`box-${id}`).remove(); 
}

window.onload = () => { 
    addFileToUI("index.html", "html", "<h1>Craby Editor</h1>");
    addFileToUI("style.css", "css", "h1 { color: orange; }");
};
