// --- 1. CONFIGURATION & DICTIONARY ---
const dictionary = {
    html: ['a', 'alt', 'article', 'aside', 'audio', 'b', 'base', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'class', 'code', 'col', 'colgroup', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'height', 'hr', 'html', 'href', 'i', 'id', 'iframe', 'img', 'input', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'meta', 'name', 'nav', 'ol', 'optgroup', 'option', 'p', 'param', 'picture', 'placeholder', 'pre', 'progress', 'q', 'rel', 'required', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'type', 'u', 'ul', 'value', 'var', 'video', 'width'],
    css: ['absolute', 'align-items', 'animation', 'background', 'background-color', 'border', 'border-radius', 'bottom', 'box-shadow', 'box-sizing', 'clear', 'color', 'column-count', 'content', 'cursor', 'display', 'flex', 'flex-direction', 'flex-wrap', 'float', 'font', 'font-family', 'font-size', 'font-weight', 'gap', 'grid', 'grid-template-columns', 'height', 'inline-block', 'justify-content', 'left', 'letter-spacing', 'line-height', 'margin', 'margin-top', 'max-height', 'min-width', 'none', 'opacity', 'overflow', 'padding', 'pointer', 'position', 'relative', 'right', 'text-align', 'text-decoration', 'top', 'transform', 'transition', 'width', 'z-index'],
    js: ['addEventListener', 'alert', 'Array', 'async', 'await', 'break', 'catch', 'clearInterval', 'clearTimeout', 'console.log', 'const', 'continue', 'Date', 'default', 'delete', 'document.getElementById', 'document.querySelector', 'else', 'fetch', 'for', 'function', 'if', 'JSON.parse', 'JSON.stringify', 'let', 'Math.floor', 'new', 'null', 'parseFloat', 'parseInt', 'return', 'setInterval', 'setTimeout', 'String', 'switch', 'this', 'typeof', 'undefined', 'var', 'window', 'while']
};

const themes = {
    dark: { '--bg-main': '#0d1117', '--bg-panel': '#161b22', '--bg-header': '#010409', '--border-color': 'rgba(255,255,255,0.1)', '--accent': '#ffb400', '--text-primary': '#c9d1d9', '--text-textarea': '#9cdcfe', '--shutter-bg': '#161b22', '--window-header-bg': '#21262d' },
    light: { '--bg-main': '#ffffff', '--bg-panel': '#f8fafc', '--bg-header': '#f1f5f9', '--border-color': '#cbd5e1', '--accent': '#1e40af', '--text-primary': '#0f172a', '--text-textarea': '#111827', '--shutter-bg': '#f1f5f9', '--window-header-bg': '#e2e8f0' }
};

// --- 2. GLOBAL STATE ---
let files = [
    { id: 'f1', name: 'index.html', lang: 'html', content: '<!DOCTYPE html>\n<html>\n<body>\n  <h1>Welcome to Craby Editor</h1>\n</body>\n</html>', minimized: false },
    { id: 'f2', name: 'style.css', lang: 'css', content: 'h1 { color: #ffb400; text-align: center; }', minimized: false },
    { id: 'f3', name: 'main.js', lang: 'js', content: 'console.log("Craby Editor is live!");', minimized: false }
];
let nextId = 4;
let sBox = null;
let selectedIdx = 0;

// --- 3. INITIALIZATION ---
window.onload = () => {
    renderAllFiles();
    
    // Create Suggestion Box
    sBox = document.createElement('div');
    sBox.id = 'suggestion-box';
    document.body.appendChild(sBox);
};

// --- 4. CORE RENDERING LOGIC ---
function renderAllFiles() {
    const grid = document.getElementById('editor-grid');
    grid.innerHTML = '';
    files.forEach(file => {
        if (!file.minimized) {
            createFileWindow(file, grid);
        }
    });
    updateShutter();
    updateRunButtonState();
}

function createFileWindow(file, container) {
    const frame = document.createElement('div');
    frame.className = 'window-frame';
    frame.id = `win-${file.id}`;

    frame.innerHTML = `
        <div class="window-header">
            <span class="window-title">${file.name}</span>
            <div class="window-controls">
                <i class="win-control fas fa-minus" title="Minimize" onclick="minimizeWindow('${file.id}')"></i>
                <i class="win-control fas fa-expand" title="Fullscreen" onclick="toggleFullscreen('${file.id}')"></i>
                <i class="win-control fas fa-times" title="Delete" onclick="deleteFile('${file.id}')"></i>
            </div>
        </div>
        <div class="window-body">
            <textarea id="ta-${file.id}" lang="${file.lang}" spellcheck="false" 
                oninput="updateFileContent('${file.id}', this.value)" 
                onkeydown="handleKeyActions(event, '${file.id}')">${file.content}</textarea>
        </div>
    `;
    container.appendChild(frame);
}

// --- 5. UI CONTROLS (Shutter, Settings, Windows) ---
function toggleShutter() {
    document.getElementById('shutter').classList.toggle('open');
}

function toggleSettings() {
    document.getElementById('settings-panel').classList.toggle('open');
}

function minimizeWindow(id) {
    const file = files.find(f => f.id === id);
    if (file) {
        file.minimized = true;
        renderAllFiles();
    }
}

function restoreWindow(id) {
    const file = files.find(f => f.id === id);
    if (file) {
        file.minimized = false;
        renderAllFiles();
        // Scroll to the restored window
        setTimeout(() => {
            const win = document.getElementById(`win-${id}`);
            if (win) win.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
}

function toggleFullscreen(id) {
    const win = document.getElementById(`win-${id}`);
    if (!document.fullscreenElement) {
        win.requestFullscreen().catch(err => alert("Error enabling fullscreen"));
    } else {
        document.exitFullscreen();
    }
}

function updateShutter() {
    const list = document.getElementById('shutter-file-list');
    list.innerHTML = '';
    files.forEach(file => {
        const item = document.createElement('div');
        item.className = 'shutter-item';
        item.onclick = () => {
            if (file.minimized) restoreWindow(file.id);
            toggleShutter();
        };
        item.innerHTML = `
            <span>${file.name}</span>
            <span style="font-size:10px; color:${file.minimized ? '#ff4d4d' : '#4ade80'}">
                ${file.minimized ? 'Minimized' : 'Active'}
            </span>
        `;
        list.appendChild(item);
    });
}

// --- 6. FILE MANAGEMENT ---
function updateFileContent(id, content) {
    const file = files.find(f => f.id === id);
    if (file) file.content = content;
}

function deleteFile(id) {
    if (confirm("Delete this file?")) {
        files = files.filter(f => f.id !== id);
        renderAllFiles();
    }
}

function updateRunButtonState() {
    const runBtn = document.getElementById('run-btn');
    const hasHtml = files.some(f => f.lang === 'html');
    runBtn.style.opacity = hasHtml ? "1" : "0.5";
    runBtn.disabled = !hasHtml;
}

// --- 7. INTELLISENSE & KEY ACTIONS ---
function handleKeyActions(e, id) {
    const ta = document.getElementById(`ta-${id}`);
    const lang = ta.getAttribute('lang');

    if (sBox.style.display === 'block') {
        const items = sBox.querySelectorAll('.suggestion-item');
        if (e.key === 'ArrowDown') { e.preventDefault(); selectedIdx = (selectedIdx + 1) % items.length; updateActiveSBox(items); return; }
        if (e.key === 'ArrowUp') { e.preventDefault(); selectedIdx = (selectedIdx - 1 + items.length) % items.length; updateActiveSBox(items); return; }
        if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); if (items[selectedIdx]) items[selectedIdx].click(); return; }
        if (e.key === 'Escape') { sBox.style.display = 'none'; return; }
    }

    if (e.key === 'Tab') {
        e.preventDefault();
        const start = ta.selectionStart;
        ta.value = ta.value.substring(0, start) + "  " + ta.value.substring(ta.selectionEnd);
        ta.selectionStart = ta.selectionEnd = start + 2;
    }

    // Auto-close brackets
    const pairs = { '{': '}', '(': ')', '[': ']', '"': '"', "'": "'" };
    if (pairs[e.key]) {
        const pos = ta.selectionStart;
        ta.value = ta.value.substring(0, pos) + pairs[e.key] + ta.value.substring(pos);
        ta.selectionStart = ta.selectionEnd = pos;
    }

    clearTimeout(ta.suggestTimeout);
    ta.suggestTimeout = setTimeout(() => handleSuggestions(ta, lang), 100);
}

function handleSuggestions(ta, lang) {
    const pos = ta.selectionStart;
    const textBefore = ta.value.substring(0, pos);
    const words = textBefore.split(/[\s<>{}:;()]/);
    const lastWord = words[words.length - 1].toLowerCase();

    if (!dictionary[lang] || lastWord.length < 1) { sBox.style.display = 'none'; return; }

    const matches = dictionary[lang].filter(w => w.startsWith(lastWord)).slice(0, 10);

    if (matches.length > 0) {
        selectedIdx = 0;
        const rect = ta.getBoundingClientRect();
        sBox.style.display = 'block';
        sBox.style.top = (rect.top + 30) + 'px';
        sBox.style.left = '20px';
        sBox.style.width = '80%';

        sBox.innerHTML = matches.map((m, i) => `
            <div class="suggestion-item ${i === 0 ? 'active' : ''}" onclick="insertWord('${m}', '${ta.id}', '${lang}')">
                ${m}
            </div>
        `).join('');
    } else { sBox.style.display = 'none'; }
}

function updateActiveSBox(items) {
    items.forEach((it, i) => it.classList.toggle('active', i === selectedIdx));
}

function insertWord(word, taId, lang) {
    const ta = document.getElementById(taId);
    const pos = ta.selectionStart;
    const textBefore = ta.value.substring(0, pos);
    const lastWordMatch = textBefore.match(/[\w.-]+$/);
    const startPos = lastWordMatch ? pos - lastWordMatch[0].length : pos;

    let insertText = word;
    if (lang === 'html') insertText = `<${word}></${word}>`;
    if (lang === 'css') insertText = `${word}: ;`;

    ta.value = ta.value.substring(0, startPos) + insertText + ta.value.substring(pos);
    updateFileContent(taId.replace('ta-', ''), ta.value);
    sBox.style.display = 'none';
    ta.focus();
}

// --- 8. RUN & PREVIEW ---
function runCode() {
    let html = "", css = "", js = "";
    files.forEach(f => {
        if (f.lang === 'html') html += f.content;
        if (f.lang === 'css') css += `<style>${f.content}</style>`;
        if (f.lang === 'js') js += `<script>${f.content}<\/script>`;
    });

    const overlay = document.getElementById('preview-overlay');
    const frame = document.getElementById('output-frame');
    overlay.style.display = 'flex';
    
    const doc = frame.contentWindow.document;
    doc.open();
    doc.write(html + css + js);
    doc.close();
}

function closePreview() {
    document.getElementById('preview-overlay').style.display = 'none';
}

document.addEventListener('mousedown', (e) => {
    if (sBox && !sBox.contains(e.target)) sBox.style.display = 'none';
});
