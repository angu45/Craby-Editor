// --- 1. CONFIGURATION ---
const dictionary = {
    html: ['a', 'body', 'button', 'div', 'h1', 'h2', 'head', 'html', 'img', 'input', 'link', 'meta', 'p', 'script', 'span', 'style', 'title'],
    css: ['background', 'border', 'color', 'display', 'flex', 'font-size', 'height', 'margin', 'padding', 'position', 'width'],
    js: ['alert', 'console.log', 'const', 'document', 'function', 'let', 'window']
};

// --- 2. GLOBAL STATE ---
let files = [
    { id: 'f1', name: 'index.html', lang: 'html', content: '<!DOCTYPE html>\n<html>\n<body>\n  <h1>Craby Editor Live!</h1>\n</body>\n</html>', minimized: false },
    { id: 'f2', name: 'style.css', lang: 'css', content: 'h1 { color: #ffb400; }', minimized: false },
    { id: 'f3', name: 'main.js', lang: 'js', content: 'console.log("Hello World");', minimized: false }
];
let sBox = null;

window.onload = () => {
    renderAllFiles();
    sBox = document.createElement('div');
    sBox.id = 'suggestion-box';
    document.body.appendChild(sBox);
};

// --- 3. UI TOGGLES ---
function toggleShutter() {
    document.getElementById('shutter').classList.toggle('open');
}

function toggleSettings() {
    const panel = document.getElementById('settings-panel');
    panel.classList.toggle('open');
}

// --- 4. WINDOW LOGIC ---
function renderAllFiles() {
    const grid = document.getElementById('editor-grid');
    grid.innerHTML = '';
    files.forEach(file => {
        if (!file.minimized) {
            const frame = document.createElement('div');
            frame.className = 'window-frame';
            frame.id = `win-${file.id}`;
            frame.innerHTML = `
                <div class="window-header">
                    <span class="window-title">${file.name}</span>
                    <div class="window-controls">
                        <i class="fas fa-minus" onclick="minimizeWindow('${file.id}')"></i>
                        <i class="fas fa-expand" onclick="toggleFullscreen('${file.id}')"></i>
                        <i class="fas fa-times" onclick="deleteFile('${file.id}')"></i>
                    </div>
                </div>
                <div class="window-body">
                    <textarea id="ta-${file.id}" lang="${file.lang}" oninput="updateFileContent('${file.id}', this.value)" onkeydown="handleKeyActions(event, '${file.id}')">${file.content}</textarea>
                </div>`;
            grid.appendChild(frame);
        }
    });
    updateShutter();
}

function minimizeWindow(id) {
    const file = files.find(f => f.id === id);
    if (file) { file.minimized = true; renderAllFiles(); }
}

function restoreWindow(id) {
    const file = files.find(f => f.id === id);
    if (file) { file.minimized = false; renderAllFiles(); }
}

function updateShutter() {
    const list = document.getElementById('shutter-file-list');
    list.innerHTML = '';
    files.forEach(file => {
        const item = document.createElement('div');
        item.className = 'shutter-item';
        item.style.padding = "10px";
        item.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
        item.style.cursor = "pointer";
        item.onclick = () => { if(file.minimized) restoreWindow(file.id); toggleShutter(); };
        item.innerHTML = `<span>${file.name}</span> <small style="color:${file.minimized?'red':'#4ade80'}">${file.minimized?'Minimized':'Active'}</small>`;
        list.appendChild(item);
    });
}

// --- 5. CORE FUNCTIONS ---
function updateFileContent(id, content) {
    const file = files.find(f => f.id === id);
    if (file) file.content = content;
}

function runCode() {
    let html="", css="", js="";
    files.forEach(f => {
        if(f.lang==='html') html+=f.content;
        if(f.lang==='css') css+=`<style>${f.content}</style>`;
        if(f.lang==='js') js+=`<script>${f.content}<\/script>`;
    });
    const overlay = document.getElementById('preview-overlay');
    overlay.style.display = 'flex';
    const doc = document.getElementById('output-frame').contentWindow.document;
    doc.open(); doc.write(html+css+js); doc.close();
}

function closePreview() { document.getElementById('preview-overlay').style.display='none'; }

function exportCode() {
    let html="", css="", js="";
    files.forEach(f => {
        if(f.lang==='html') html+=f.content;
        if(f.lang==='css') css+=`<style>${f.content}</style>`;
        if(f.lang==='js') js+=`<script>${f.content}<\/script>`;
    });
    const blob = new Blob([html+css+js], {type: 'text/html'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'craby_project.html';
    a.click();
}

// --- 6. INTELLISENSE (Merged) ---
function handleKeyActions(e, id) {
    const ta = document.getElementById(`ta-${id}`);
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = ta.selectionStart;
        ta.value = ta.value.substring(0, start) + "  " + ta.value.substring(ta.selectionEnd);
        ta.selectionStart = ta.selectionEnd = start + 2;
    }
}
