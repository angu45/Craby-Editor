// --- 1. CONFIGURATION & DICTIONARY ---
const dictionary = {
    html: [
        'div', 'span', 'h1', 'h2', 'h3', 'p', 'button', 'input', 'img', 'a', 'section', 'article', 'header', 'footer', 'nav', 'ul', 'li', 'ol', 'form', 'label', 'select', 'textarea', 'table', 'tr', 'td', 'th', 'canvas', 'svg', 'class', 'id', 'style', 'src', 'href', 'type', 'placeholder', 'onclick', 'value', 'name', 'required', 'alt', 'target', 'width', 'height', 'rel'
    ],
    css: [
        'background', 'color', 'margin', 'padding', 'display', 'flex', 'grid', 'border', 'width', 'height', 'font-size', 'font-family', 'font-weight', 'position', 'top', 'left', 'right', 'bottom', 'opacity', 'transition', 'z-index', 'justify-content', 'align-items', 'text-align', 'border-radius', 'box-shadow', 'overflow', 'cursor', 'none', 'block', 'inline-block', 'absolute', 'relative', 'fixed', 'pointer', 'transparent'
    ],
    js: [
        'function', 'const', 'let', 'var', 'console.log', 'document.getElementById', 'document.querySelector', 'addEventListener', 'window', 'setInterval', 'setTimeout', 'if', 'else', 'for', 'return', 'async', 'await', 'fetch', 'JSON.parse', 'JSON.stringify', 'Math.random', 'Math.floor', 'push', 'split', 'replace', 'trim'
    ]
};

const sBox = document.createElement('div');
sBox.id = 'suggestion-box';
document.body.appendChild(sBox);

let selectedIdx = 0;
let currentLang = '';

// --- 2. CORE EDITOR LOGIC ---
document.querySelectorAll('textarea').forEach(txt => {
    txt.addEventListener('input', (e) => {
        const pos = txt.selectionStart;
        const val = txt.value;
        const char = e.data;
        currentLang = txt.id.split('-')[0]; 

        // A. AUTO-CLOSE & SYMBOL COMPLETION
        const pairs = { '{': '}', '(': ')', '[': ']', '"': '"', "'": "'" };
        
        // 1. Basic Pairs
        if (pairs[char]) {
            txt.value = val.substring(0, pos) + pairs[char] + val.substring(pos);
            txt.selectionStart = txt.selectionEnd = pos;
        } 
        // 2. HTML Auto End Tag
        else if (char === '>') {
            const lastPart = val.substring(0, pos);
            const match = lastPart.match(/<(\w+)>$/);
            if (match) {
                const tagName = match[1];
                const selfClosing = ['img', 'br', 'hr', 'input', 'link', 'meta'];
                if (!selfClosing.includes(tagName.toLowerCase())) {
                    txt.value = val.substring(0, pos) + `</${tagName}>` + val.substring(pos);
                    txt.selectionStart = txt.selectionEnd = pos;
                }
            }
        }

        // B. RECOMMENDATION SHOW
        showSuggestions(txt);
    });

    txt.addEventListener('keydown', (e) => {
        handleNav(e, txt);
    });
});

// Recommendation Box Function
function showSuggestions(txt) {
    const pos = txt.selectionStart;
    const textBefore = txt.value.substring(0, pos);
    const words = textBefore.split(/[\s<>{}:;()]/);
    const lastWord = words[words.length - 1].toLowerCase();

    if (lastWord.length < 1) {
        sBox.style.display = 'none';
        return;
    }

    const matches = dictionary[currentLang].filter(word => word.startsWith(lastWord));

    if (matches.length > 0) {
        selectedIdx = 0;
        const rect = txt.getBoundingClientRect();
        sBox.style.top = `${rect.top + 30}px`;
        sBox.style.left = `${rect.left + 30}px`;
        sBox.style.display = 'block';

        sBox.innerHTML = matches.map((m, i) => 
            `<div class="suggestion-item ${i === 0 ? 'active' : ''}" onclick="insertWord('${m}', '${txt.id}')">
                ${m} <small style="float:right; opacity:0.5;">${currentLang}</small>
            </div>`
        ).join('');
    } else {
        sBox.style.display = 'none';
    }
}

// Word Insert Logic (With Auto Symbols)
function insertWord(word, id) {
    const txt = document.getElementById(id);
    const pos = txt.selectionStart;
    const text = txt.value;
    const textBefore = text.substring(0, pos);
    const lastWordMatch = textBefore.match(/[\w.-]+$/);
    const startPos = lastWordMatch ? pos - lastWordMatch[0].length : pos;

    let wordToInsert = word;

    // logic for HTML attributes (class, href, etc.)
    if (currentLang === 'html') {
        const attributes = ['class', 'id', 'href', 'src', 'type', 'value', 'placeholder', 'style', 'rel', 'alt'];
        if (attributes.includes(word)) {
            wordToInsert = word + '=""';
        }
    }
    // logic for CSS properties (color, margin, etc.)
    else if (currentLang === 'css') {
        const cssProps = dictionary.css;
        if (cssProps.includes(word)) {
            wordToInsert = word + ': ;';
        }
    }

    txt.value = text.substring(0, startPos) + wordToInsert + text.substring(pos);
    
    // Position cursor correctly
    if (wordToInsert.endsWith('=""')) {
        txt.selectionStart = txt.selectionEnd = startPos + word.length + 2; // inside ""
    } else if (wordToInsert.endsWith(': ;')) {
        txt.selectionStart = txt.selectionEnd = startPos + word.length + 2; // after :
    } else {
        txt.selectionStart = txt.selectionEnd = startPos + wordToInsert.length;
    }

    sBox.style.display = 'none';
    txt.focus();
}

function handleNav(e, txt) {
    if (sBox.style.display === 'block') {
        const items = sBox.querySelectorAll('.suggestion-item');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIdx = (selectedIdx + 1) % items.length;
            updateActive(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIdx = (selectedIdx - 1 + items.length) % items.length;
            updateActive(items);
        } else if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            if (items[selectedIdx]) items[selectedIdx].click();
        } else if (e.key === 'Escape') {
            sBox.style.display = 'none';
        }
    }
}

function updateActive(items) {
    items.forEach((it, i) => it.classList.toggle('active', i === selectedIdx));
}

// --- 3. OTHER TOOLS ---
function runCode() {
    const overlay = document.getElementById('preview-overlay');
    overlay.style.display = 'flex';
    const h = document.getElementById('html-code').value;
    const c = `<style>${document.getElementById('css-code').value}</style>`;
    const j = `<script>${document.getElementById('js-code').value}<\/script>`;
    const out = document.getElementById('output').contentWindow.document;
    out.open(); out.write(h + c + j); out.close();
}

function closePreview() { document.getElementById('preview-overlay').style.display = 'none'; }
function toggleSettings() { document.getElementById('settingsPanel').classList.toggle('open'); }
function setDevice(m) { document.getElementById('wrapper').className = 'iframe-wrapper ' + (m==='mobile'?'mobile':''); }

function beautifyCode() {
    const h = document.getElementById('html-code');
    h.value = h.value.replace(/>\s+</g, '><').replace(/(<[^>]+>)/g, '$1\n').trim();
}

function exportCode() {
    const content = `<!DOCTYPE html><html><head><style>${document.getElementById('css-code').value}</style></head><body>${document.getElementById('html-code').value}<script>${document.getElementById('js-code').value}<\/script></body></html>`;
    const blob = new Blob([content], {type: "text/html"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "index.html"; a.click();
}

function updateEditorStyles() {
    const fs = document.getElementById('font-size-sel').value;
    document.querySelectorAll('textarea').forEach(t => t.style.fontSize = fs);
}

document.addEventListener('mousedown', (e) => {
    const p = document.getElementById('settingsPanel');
    const b = document.querySelector('.fa-sliders-h')?.parentElement;
    if (p.classList.contains('open') && !p.contains(e.target) && (!b || !b.contains(e.target))) p.classList.remove('open');
    if (!sBox.contains(e.target)) sBox.style.display = 'none';
});
