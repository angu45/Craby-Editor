// --- 1. CONFIG & DICTIONARY ---
const themes = {
    dark: { bg: '#0d1117', panel: '#161b22', accent: '#ffb400', text: '#c9d1d9', border: 'rgba(255,255,255,0.1)' },
    light: { bg: '#f6f8fa', panel: '#ffffff', accent: '#d97706', text: '#24292f', border: 'rgba(0,0,0,0.1)' },
    monokai: { bg: '#272822', panel: '#3e3d32', accent: '#f92672', text: '#f8f8f2', border: '#49483e' },
    dracula: { bg: '#282a36', panel: '#44475a', accent: '#bd93f9', text: '#f8f8f2', border: '#6272a4' },
    matrix: { bg: '#000000', panel: '#001a00', accent: '#00ff00', text: '#00ff00', border: '#003300' }
};

const dictionary = {
    html: ['div', 'span', 'section', 'article', 'header', 'footer', 'nav', 'button', 'input', 'img', 'h1', 'p', 'a', 'ul', 'li'],
    css: ['background', 'color', 'margin', 'padding', 'display', 'flex', 'border', 'font-size', 'width', 'height', 'position']
};

const sBox = document.getElementById('suggestion-box');
let selectedIdx = 0;

// --- 2. SIDEBAR LOGIC (Left & Right) ---

function toggleLeftSidebar() {
    const sb = document.getElementById('leftSidebar');
    const shutter = document.getElementById('shutterBtn');
    sb.classList.toggle('open');
    shutter.classList.toggle('active');
    shutter.querySelector('i').className = sb.classList.contains('open') ? 'fas fa-chevron-left' : 'fas fa-chevron-right';
}

function toggleRightSidebar() {
    document.getElementById('rightSidebar').classList.toggle('open');
}

// --- 3. FILE SYSTEM LOGIC ---

function createNewFile() {
    const fileName = prompt("File name (e.g. index.html):");
    if (!fileName) return;
    const fileId = fileName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    if(document.getElementById(`box-${fileId}`)) return alert("File exists!");
    addFileToUI(fileName, fileId);
}

function addFileToUI(name, id, content = "") {
    const fileList = document.getElementById('file-list');
    const newTab = document.createElement('div');
    newTab.className = 'file-item';
    newTab.id = `tab-${id}`;
    newTab.innerHTML = `<span><i class="fas fa-file-code"></i> ${name}</span> <small id="status-${id}" style="display:none; color:var(--accent)">(min)</small>`;
    newTab.onclick = () => restoreBox(id);
    fileList.appendChild(newTab);

    const wrapper = document.getElementById('editor-wrapper');
    const newBox = document.createElement('div');
    newBox.className = 'editor-box';
    newBox.id = `box-${id}`;
    newBox.innerHTML = `
        <div class="label">
            <span>${name}</span>
            <div class="window-controls">
                <i class="fas fa-minus" onclick="minimizeBox('${id}')"></i>
                <i class="fas fa-expand" onclick="expandBox('${id}')"></i>
                <i class="fas fa-trash" onclick="deleteBox('${id}')"></i>
            </div>
        </div>
        <textarea id="${id}-code" spellcheck="false">${content}</textarea>
    `;
    wrapper.appendChild(newBox);
    updateThemeAndFont();
    attachInputListeners(document.getElementById(`${id}-code`));
}

function minimizeBox(id) {
    document.getElementById(`box-${id}`).style.display = "none";
    document.getElementById(`status-${id}`).style.display = "inline";
}

function restoreBox(id) {
    document.getElementById(`box-${id}`).style.display = "flex";
    document.getElementById(`status-${id}`).style.display = "none";
    document.getElementById(`${id}-code`).focus();
}

function expandBox(id) {
    const boxes = document.querySelectorAll('.editor-box');
    const cur = document.getElementById(`box-${id}`);
    if (cur.style.flex === "10") {
        boxes.forEach(b => b.style.flex = "1");
    } else {
        boxes.forEach(b => b.style.flex = "0.1");
        cur.style.flex = "10";
        cur.style.display = "flex";
    }
}

function deleteBox(id) {
    if(confirm("Delete file?")) {
        document.getElementById(`box-${id}`).remove();
        document.getElementById(`tab-${id}`).remove();
    }
}

// --- 4. THE PROFESSIONAL RUN SCREEN LOGIC ---

function runCode() {
    const overlay = document.getElementById('preview-overlay');
    overlay.style.display = 'flex';
    refreshPreview();
}

function refreshPreview() {
    const h = document.querySelector('[id*="html-code"]') ? document.querySelector('[id*="html-code"]').value : '';
    const c = `<style>${document.querySelector('[id*="css-code"]') ? document.querySelector('[id*="css-code"]').value : ''}</style>`;
    const out = document.getElementById('output').contentWindow.document;
    out.open();
    out.write(h + c);
    out.close();
}

function closePreview() {
    document.getElementById('preview-overlay').style.display = 'none';
}

function setDevice(mode) {
    const container = document.getElementById('iframe-container');
    const btnD = document.getElementById('btn-desk');
    const btnM = document.getElementById('btn-mob');
    
    if(mode === 'mobile') {
        container.style.width = '375px';
        container.style.margin = '20px auto';
        btnM.classList.add('active');
        btnD.classList.remove('active');
    } else {
        container.style.width = '100%';
        container.style.margin = '0';
        btnD.classList.add('active');
        btnM.classList.remove('active');
    }
}

// --- 5. EDITOR CORE (Autocomplete & Themes) ---

function attachInputListeners(txt) {
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

function showSuggestions(txt) {
    const pos = txt.selectionStart;
    const text = txt.value.substring(0, pos);
    const words = text.split(/[\s<>{}:;()]/);
    const lastWord = words[words.length - 1].toLowerCase();
    const lang = txt.id.includes('html') ? 'html' : 'css';

    if (lastWord.length < 1) { sBox.style.display = 'none'; return; }
    const matches = dictionary[lang].filter(w => w.startsWith(lastWord));

    if (matches.length > 0) {
        sBox.innerHTML = matches.map(m => `<div onclick="insertWord('${m}', '${txt.id}')">${m}</div>`).join('');
        sBox.style.display = 'block';
        const rect = txt.getBoundingClientRect();
        sBox.style.top = (rect.top + 30) + 'px';
        sBox.style.left = (rect.left + 20) + 'px';
    } else { sBox.style.display = 'none'; }
}

function insertWord(word, id) {
    const txt = document.getElementById(id);
    const pos = txt.selectionStart;
    const text = txt.value.substring(0, pos);
    const lastWordMatch = text.match(/[\w-]+$/);
    const startPos = lastWordMatch ? pos - lastWordMatch[0].length : pos;
    txt.value = txt.value.substring(0, startPos) + word + txt.value.substring(pos);
    sBox.style.display = 'none';
    txt.focus();
}

function updateThemeAndFont() {
    const themeKey = document.getElementById('theme-sel').value;
    const size = document.getElementById('font-size-bar').value;
    const theme = themes[themeKey];

    document.documentElement.style.setProperty('--bg', theme.bg);
    document.documentElement.style.setProperty('--panel', theme.panel);
    document.documentElement.style.setProperty('--accent', theme.accent);
    document.documentElement.style.setProperty('--text', theme.text);
    document.documentElement.style.setProperty('--border', theme.border);
    
    document.querySelectorAll('textarea').forEach(tx => {
        tx.style.fontSize = size + "px";
        tx.style.color = theme.text;
    });
}

function beautifyCode() {
    document.querySelectorAll('textarea').forEach(tx => {
        tx.value = tx.value.trim().replace(/>\s+</g, '><').replace(/>/g, '>\n');
    });
}

function exportCode() {
    const h = document.querySelector('[id*="html-code"]').value;
    const blob = new Blob([h], {type: "text/html"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "index.html";
    a.click();
}

function undoCode() { document.execCommand('undo'); }
function redoCode() { document.execCommand('redo'); }

// --- INITIAL LOAD ---
window.onload = () => {
    addFileToUI("index.html", "html", "<h1>Hello Craby Pro!</h1>");
    addFileToUI("style.css", "css", "h1 { color: #ffb400; text-align: center; }");
    updateThemeAndFont();
};
