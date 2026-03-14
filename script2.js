// --- 1. CONFIGURATION & THEMES ---
const themes = {
    dark: { bg: '#0d1117', panel: '#161b22', accent: '#ffb400', text: '#9cdcfe', border: '#30363d' }, 
    light: { bg: '#ffffff', panel: '#f8fafc', accent: '#1e40af', text: '#0f172a', border: '#cbd5e1' },
    monokai: { bg: '#272822', panel: '#3e3d32', accent: '#f92672', text: '#f8f8f2', border: '#49483e' },
    dracula: { bg: '#282a36', panel: '#44475a', accent: '#bd93f9', text: '#f8f8f2', border: '#6272a4' }
};

const dictionary = {
    html: ['div', 'span', 'h1', 'p', 'a', 'img', 'body', 'html', 'script', 'style', 'button', 'input'],
    css: ['color', 'background', 'margin', 'padding', 'display', 'flex', 'position', 'width', 'height'],
    js: ['console.log', 'document', 'window', 'function', 'let', 'const', 'if', 'else']
};

let currentLang = '';

// --- 2. SLIDER & PANEL LOGIC (Functional) ---
function toggleLeftSidebar() {
    const shutter = document.getElementById('shutter');
    if (shutter) shutter.classList.toggle('open');
}

function toggleSettings() {
    const panel = document.getElementById('settings-panel');
    if (panel) panel.classList.toggle('open');
}

// --- 3. SMART LAYOUT & FILE SYSTEM ---
function addFileToUI(name, id, content = "") {
    // Explorer (Shutter) madhe add kara
    const fileList = document.getElementById('shutter-file-list');
    if (fileList) {
        const item = document.createElement('div');
        item.className = 'shutter-item';
        item.id = `tab-${id}`;
        item.innerHTML = `<span><i class="fas fa-file-code"></i> ${name}</span> <small id="status-${id}" style="display:none; color:var(--accent)">(min)</small>`;
        item.onclick = () => { restoreBox(id); toggleLeftSidebar(); };
        fileList.appendChild(item);
    }

    // Editor Area madhe box add kara
    const grid = document.getElementById('editor-grid');
    if (grid) {
        const frame = document.createElement('div');
        frame.className = 'window-frame';
        frame.id = `box-${id}`;
        frame.innerHTML = `
            <div class="window-header">
                <span class="window-title">${name.toUpperCase()}</span>
                <div class="window-controls">
                    <i class="fas fa-minus" title="Minimize" onclick="minimizeBox('${id}')"></i>
                    <i class="fas fa-expand" title="Fullscreen" onclick="expandBox('${id}')"></i>
                    <i class="fas fa-trash" title="Delete" onclick="deleteBox('${id}')"></i>
                </div>
            </div>
            <div class="window-body">
                <textarea id="${id}-code" spellcheck="false" oninput="currentLang='${id}'">${content}</textarea>
            </div>`;
        grid.appendChild(frame);
    }
}

// --- 4. WINDOW CONTROLS (Smart Height Applied) ---
function minimizeBox(id) {
    const box = document.getElementById(`box-${id}`);
    if (box) {
        box.style.display = 'none';
        document.getElementById(`status-${id}`).style.display = 'inline';
    }
}

function restoreBox(id) {
    const box = document.getElementById(`box-${id}`);
    if (box) {
        box.style.display = 'flex';
        box.classList.remove('fullscreen');
        document.getElementById(`status-${id}`).style.display = 'none';
    }
}

function expandBox(id) {
    const target = document.getElementById(`box-${id}`);
    const all = document.querySelectorAll('.window-frame');
    if (target.classList.contains('fullscreen')) {
        target.classList.remove('fullscreen');
        all.forEach(b => b.style.display = 'flex');
    } else {
        all.forEach(b => { b.classList.remove('fullscreen'); b.style.display = 'none'; });
        target.classList.add('fullscreen');
        target.style.display = 'flex';
    }
}

function deleteBox(id) {
    if (confirm("He file delete karaychi ka?")) {
        document.getElementById(`box-${id}`)?.remove();
        document.getElementById(`tab-${id}`)?.remove();
    }
}

// --- 5. THEME & FONT UPDATER ---
function updateThemeAndFont() {
    const themeKey = document.getElementById('theme-sel')?.value || 'dark';
    const fontSize = document.getElementById('font-size-bar')?.value || '14';
    const theme = themes[themeKey];

    document.documentElement.style.setProperty('--accent', theme.accent);
    document.documentElement.style.setProperty('--bg-panel', theme.panel);
    
    document.querySelectorAll('textarea').forEach(tx => {
        tx.style.fontSize = fontSize + "px";
        tx.style.color = theme.text;
        tx.style.background = theme.bg;
    });
}

// --- 6. CORE ACTIONS ---
function runCode() {
    const h = document.getElementById('html-code')?.value || '';
    const c = `<style>${document.getElementById('css-code')?.value || ''}</style>`;
    const j = `<script>${document.getElementById('js-code')?.value || ''}<\/script>`;
    
    const overlay = document.getElementById('preview-overlay');
    overlay.style.display = 'flex';
    
    const doc = document.getElementById('output-frame').contentWindow.document;
    doc.open(); doc.write(h + c + j); doc.close();
}

function exportCode() {
    const code = document.getElementById('html-code')?.value || 'No Content';
    const blob = new Blob([code], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'craby_project.html';
    a.click();
}

// --- INITIAL LOAD ---
window.onload = () => {
    addFileToUI("index.html", "html", "<!DOCTYPE html>\n<html>\n<body>\n  <h1>Craby Editor</h1>\n</body>\n</html>");
    addFileToUI("style.css", "css", "h1 { color: #ffb400; text-align: center; }");
    updateThemeAndFont();
};
