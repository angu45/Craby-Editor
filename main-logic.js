// --- 1. CONFIGURATION ---

// 1.1 Definitions for IntelliSense
const dictionary = {
    html: ['a', 'alt', 'article', 'aside', 'audio', 'b', 'base', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'class', 'code', 'col', 'colgroup', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'height', 'hr', 'html', 'href', 'i', 'id', 'iframe', 'img', 'input', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'meta', 'name', 'nav', 'ol', 'optgroup', 'option', 'p', 'param', 'picture', 'placeholder', 'pre', 'progress', 'q', 'rel', 'required', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'type', 'u', 'ul', 'value', 'var', 'video', 'width'],
    css: ['absolute', 'align-items', 'animation', 'background', 'background-color', 'border', 'border-radius', 'bottom', 'box-shadow', 'box-sizing', 'clear', 'color', 'column-count', 'content', 'cursor', 'display', 'flex', 'flex-direction', 'flex-wrap', 'float', 'font', 'font-family', 'font-size', 'font-weight', 'gap', 'grid', 'grid-template-columns', 'height', 'inline-block', 'justify-content', 'left', 'letter-spacing', 'line-height', 'margin', 'margin-top', 'max-height', 'min-width', 'none', 'opacity', 'overflow', 'padding', 'pointer', 'position', 'relative', 'right', 'text-align', 'text-decoration', 'top', 'transform', 'transition', 'width', 'z-index'],
    js: ['addEventListener', 'alert', 'Array', 'async', 'await', 'break', 'catch', 'clearInterval', 'clearTimeout', 'console.log', 'const', 'continue', 'Date', 'default', 'delete', 'document.getElementById', 'document.querySelector', 'else', 'fetch', 'for', 'function', 'if', 'JSON.parse', 'JSON.stringify', 'let', 'Math.floor', 'new', 'null', 'parseFloat', 'parseInt', 'return', 'setInterval', 'setTimeout', 'String', 'switch', 'this', 'typeof', 'undefined', 'var', 'window', 'while']
};

// 1.2 Themes
const themes = {
    dark: { '--bg-main': '#0d1117', '--bg-panel': '#161b22', '--bg-header': '#010409', '--border-color': 'rgba(255,255,255,0.1)', '--accent': '#ffb400', '--text-primary': '#c9d1d9', '--text-textarea': '#9cdcfe', '--shutter-bg': '#161b22', '--window-header-bg': '#21262d' },
    light: { '--bg-main': '#ffffff', '--bg-panel': '#f8fafc', '--bg-header': '#f1f5f9', '--border-color': '#cbd5e1', '--accent': '#1e40af', '--text-primary': '#0f172a', '--text-textarea': '#111827', '--shutter-bg': '#f1f5f9', '--window-header-bg': '#e2e8f0' },
    monokai: { '--bg-main': '#272822', '--bg-panel': '#3e3d32', '--bg-header': '#1b1b1b', '--border-color': '#49483e', '--accent': '#f92672', '--text-primary': '#f8f8f2', '--text-textarea': '#a6e22e', '--shutter-bg': '#3e3d32', '--window-header-bg': '#1b1b1b' },
    dracula: { '--bg-main': '#282a36', '--bg-panel': '#44475a', '--bg-header': '#191a21', '--border-color': '#6272a4', '--accent': '#bd93f9', '--text-primary': '#f8f8f2', '--text-textarea': '#f8f8f2', '--shutter-bg': '#44475a', '--window-header-bg': '#191a21' },
    cyberpunk: { '--bg-main': '#000000', '--bg-panel': '#1a1f29', '--bg-header': '#0b0e14', '--border-color': '#00ff41', '--accent': '#00ff41', '--text-primary': '#ffffff', '--text-textarea': '#ffb400', '--shutter-bg': '#1a1f29', '--window-header-bg': '#0b0e14' },
    oceanic: { '--bg-main': '#1b2b34', '--bg-panel': '#23333b', '--bg-header': '#1b2b34', '--border-color': '#343d46', '--accent': '#6699cc', '--text-primary': '#d8dee9', '--text-textarea': '#fac863', '--shutter-bg': '#23333b', '--window-header-bg': '#1b2b34' }
};

// --- 2. GLOBAL STATE ---
let files = []; // Current list of file objects
let nextId = 1;
let sBox = null;
let selectedIdx = 0;
let runBtn = null;

// File structure for core files
const coreFiles = [
    { id: 'core1', name: 'index.html', lang: 'html', content: '<!DOCTYPE html>\n<html>\n<body>\n  <h1>Welcome to Craby Editor</h1>\n</body>\n</html>' },
    { id: 'core2', name: 'style.css', lang: 'css', content: 'h1 { color: #ffb400; text-align: center; }' },
    { id: 'core3', name: 'main.js', lang: 'js', content: 'console.log("Craby Editor is live!");' }
];

// --- 3. INITIALIZATION ---
window.onload = () => {
    runBtn = document.getElementById('run-btn');
    files = [...coreFiles];
    renderAllFiles();
    updateRunButtonState();
    
    // Create Suggestion Box
    sBox = document.createElement('div');
    sBox.id = 'suggestion-box';
    document.body.appendChild(sBox);
};

// --- 4. CORE RENDERING LOGIC ---

// Render all files based on global state
function renderAllFiles() {
    const grid = document.getElementById('editor-grid');
    grid.innerHTML = '';
    files.forEach(file => createFileWindow(file, grid));
    updateShutter();
}

// Create a window for a single file on the main screen
function createFileWindow(file, container) {
    const frame = document.createElement('div');
    frame.className = 'window-frame';
    frame.id = `win-${file.id}`;

    // Header with computer-style controls
    frame.innerHTML = `
        <div class="window-header">
            <span class="window-title">${file.name}</span>
            <div class="window-controls">
                <i class="win-control fas fa-minus ctrl-min" title="Minimize" onclick="minimizeWindow('${file.id}')"></i>
                <i class="win-control fas fa-expand ctrl-fs" title="Fullscreen" onclick="toggleFullscreen('${file.id}')"></i>
                <i class="win-control fas fa-times ctrl-del" title="Delete" onclick="deleteFile('${file.id}')"></i>
            </div>
        </div>
        <div class="window-body">
            <textarea id="ta-${file.id}" lang="${file.lang}" spellcheck="false" oninput="updateFileContent('${file.id}', this.value)" onkeydown="handleKeyActions(event, '${file.id}')">${file.content}</textarea>
        </div>
    `;
    container.appendChild(frame);
}

// Update content in global state when typing
function updateFileContent(id, content) {
    const fileIndex = files.findIndex(f => f.id === id);
    if (fileIndex !== -1) { files[fileIndex].content = content; }
}

// Enable/Disable run button based on core file presence
function updateRunButtonState() {
    const hasHtml = files.some(f => f.name.endsWith('.html'));
    if (hasHtml) {
        runBtn.classList.add('active');
        runBtn.onclick = runCode;
        runBtn.title = "Run Project";
    } else {
        runBtn.classList.remove('active');
        runBtn.onclick = null;
        runBtn.title = "No HTML file found.";
    }
}

// --- 5. SHUTTER (Taskbar) LOGIC ---

// Open/Close Shutter
function toggleShutter() {
    document.getElementById('shutter').classList.toggle('open');
}

// Update taskbar icons based on current files
function updateShutter() {
    const list = document.getElementById('shutter-file-list');
    list.innerHTML = '';

    files.forEach(file => {
        const item = document.createElement('div');
        item.className = 'shutter-item';
        item.onclick = () => handleShutterItemClick(file.id);

        let icon = '<i class="far fa-file"></i> ';
        if (file.lang === 'html') icon = '<i class="fab fa-html5" style="color:#e34c26"></i> ';
        if (file.lang === 'css') icon = '<i class="fab fa-css3-alt" style="color:#264de4"></i> ';
        if (file.lang === 'js') icon = '<i class="fab fa-js" style="color:#f7df1e"></i> ';

        item.innerHTML = `
            <span class="shutter-item-name">${icon} ${file.name}</span>
            <span class="shutter-item-status" id="status-${file.id}">Active</span>
        `;
        list.appendChild(item);
    });
}

// Shutter item interaction: Restore minimized file or focus
function handleShutterItemClick(id) {
    const win = document.getElementById(`win-${id}`);
    const ta = document.getElementById(`ta-${id}`);
    
    // Restore if minimized
    if (win.classList.contains('minimized')) {
        restoreWindow(id);
    }
    
    // Close sidebar
    toggleShutter();
    
    // Smooth scroll and focus
    win.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => ta.focus(), 200); // Small delay for scroll smoothness
}

// --- 6. FILE ADD/DELETE LOGIC ---

function addNewFilePrompt() {
    const filename = prompt("Enter filename (e.g. style.css):");
    if (!filename || filename.trim() === '') return;

    if (files.some(f => f.name.toLowerCase() === filename.toLowerCase())) {
        alert("A file with that name already exists.");
        return;
    }

    const extMatch = filename.match(/\.([a-zA-Z0-9]+)$/);
    if (!extMatch || !['html', 'css', 'js'].includes(extMatch[1].toLowerCase())) {
        alert("Only .html, .css, .js files allowed.");
        return;
    }

    const newFile = {
        id: `f${nextId++}`,
        name: filename,
        lang: extMatch[1].toLowerCase(),
        content: ''
    };
    files.push(newFile);
    renderAllFiles();
    updateRunButtonState();
}

function deleteFile(id) {
    if (!confirm("Are you sure you want to delete this file?")) return;
    
    // Close if fullscreened
    const win = document.getElementById(`win-${id}`);
    if(win.classList.contains('fullscreen')) { toggleFullscreen(id); }

    files = files.filter(f => f.id !== id);
    renderAllFiles();
    updateRunButtonState();
}

// --- 7. WINDOW UTILITIES (Minimize/Restore/Fullscreen) ---

function minimizeWindow(id) {
    document.getElementById(`win-${id}`).classList.add('minimized');
    document.getElementById(`status-${id}`).innerText = "Minimized";
    document.getElementById(`status-${id}`).style.color = "#ff4d4d"; // Red status
}

function restoreWindow(id) {
    document.getElementById(`win-${id}`).classList.remove('minimized');
    document.getElementById(`status-${id}`).innerText = "Active";
    document.getElementById(`status-${id}`).style.color = ""; // Reset accent
}

function toggleFullscreen(id) {
    const grid = document.getElementById('editor-grid');
    const win = document.getElementById(`win-${id}`);
    const ta = document.getElementById(`ta-${id}`);
    
    if (win.classList.contains('minimized')) return restoreWindow(id);

    if (win.classList.contains('fullscreen')) {
        win.classList.remove('fullscreen');
        document.body.style.overflow = '';
        win.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        // Exit other fullscreens first
        document.querySelectorAll('.window-frame.fullscreen').forEach(f => f.classList.remove('fullscreen'));
        win.classList.add('fullscreen');
        document.body.style.overflow = 'hidden';
    }
}

// --- 8. EDITOR INTELLISENSE & KEY ACTIONS ---

function handleKeyActions(e, id) {
    const ta = document.getElementById(`ta-${id}`);
    const lang = ta.getAttribute('lang');

    // Autocomplete navigation
    if (sBox.style.display === 'block') {
        const items = sBox.querySelectorAll('.suggestion-item');
        if (e.key === 'ArrowDown') { e.preventDefault(); selectedIdx = (selectedIdx + 1) % items.length; updateActiveSBox(items); return; }
        else if (e.key === 'ArrowUp') { e.preventDefault(); selectedIdx = (selectedIdx - 1 + items.length) % items.length; updateActiveSBox(items); return; }
        else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); if (items[selectedIdx]) items[selectedIdx].click(); return; }
        else if (e.key === 'Escape') { e.preventDefault(); sBox.style.display = 'none'; return; }
    }

    // Tab handling (insert spaces)
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const indent = "  "; // 2 spaces
        ta.value = ta.value.substring(0, start) + indent + ta.value.substring(end);
        ta.selectionStart = ta.selectionEnd = start + indent.length;
        updateFileContent(id, ta.value);
    }

    // Auto-Close features
    const pos = ta.selectionStart;
    const pairs = { '{': '}', '(': ')', '[': ']', '"': '"', "'": "'", '`': '`' };
    
    // Auto-Close brackets/quotes
    if (pairs[e.key]) {
        ta.value = ta.value.substring(0, pos) + pairs[e.key] + ta.value.substring(pos);
        ta.selectionStart = ta.selectionEnd = pos;
        updateFileContent(id, ta.value);
    }
    
    // Trigger suggestions on input delay
    clearTimeout(ta.suggestTimeout);
    ta.suggestTimeout = setTimeout(() => handleSuggestions(ta, lang), 10);
}

// Suggestion Logic (Optimized for mobile focus)
function handleSuggestions(ta, lang) {
    const pos = ta.selectionStart;
    const textBefore = ta.value.substring(0, pos);
    const words = textBefore.split(/[\s<>{}:;()]/);
    const lastWord = words[words.length - 1].toLowerCase();

    if (!dictionary[lang] || lastWord.length < 1) { sBox.style.display = 'none'; return; }

    const matches = dictionary[lang].filter(word => word.startsWith(lastWord)).slice(0, 10); // Limit to 10

    if (matches.length > 0) {
        selectedIdx = 0;
        
        // Mobile-centric positioning: above current textarea line
        const textareaRect = ta.getBoundingClientRect();
        sBox.style.bottom = `${window.innerHeight - textareaRect.top + 10}px`; // Above textarea
        sBox.style.left = '10%'; // Anchored centrally
        sBox.style.width = '80%';
        sBox.style.display = 'block';

        sBox.innerHTML = matches.map((m, i) => {
            const currentTheme = themes[document.getElementById('theme-select').value];
            const accentColor = currentTheme['--accent'];
            
            return `<div class="suggestion-item ${i === 0 ? 'active' : ''}" onclick="insertWord('${m}', '${ta.id}', '${lang}')">
                <span style="color:${accentColor}">${m}</span>
                <small style="opacity:0.6;">${lang}</small>
            </div>`;
        }).join('');
    } else { sBox.style.display = 'none'; }
}

function updateActiveSBox(items) { items.forEach((it, i) => it.classList.toggle('active', i === selectedIdx)); }

// Insert the word, handling context like tags or attributes
function insertWord(word, textareaId, lang) {
    const ta = document.getElementById(textareaId);
    const pos = ta.selectionStart;
    const textBefore = ta.value.substring(0, pos);
    const lastWordMatch = textBefore.match(/[\w.-]+$/);
    const startPos = lastWordMatch ? pos - lastWordMatch[0].length : pos;

    let wordToInsert = word;

    if (lang === 'html') {
        const selfClosing = ['img', 'br', 'hr', 'input', 'link', 'meta'];
        if (selfClosing.includes(word.toLowerCase())) { wordToInsert = `<${word}>`; }
        else if (['class', 'id', 'href', 'src', 'style'].includes(word)) { wordToInsert = `${word}=""`; }
        else { wordToInsert = `<${word}></${word}>`; } // Default: <h1></h1>
    } else if (lang === 'css') {
        wordToInsert = `${word}: ;`;
    }

    ta.value = ta.value.substring(0, startPos) + wordToInsert + ta.value.substring(pos);
    updateFileContent(textareaId.split('-')[1], ta.value);

    // Position cursor logically
    if (lang === 'html' && wordToInsert.includes('></')) { ta.selectionStart = ta.selectionEnd = startPos + word.length + 2; }
    else if (wordToInsert.endsWith('=""') || wordToInsert.endsWith(': ;')) { ta.selectionStart = ta.selectionEnd = startPos + wordToInsert.length - 1; }
    else { ta.selectionStart = ta.selectionEnd = startPos + wordToInsert.length; }

    sBox.style.display = 'none';
    ta.focus();
}

// --- 9. RUN CODE & LIVE PREVIEW ---

function runCode() {
    // 1. Prepare HTML, CSS, JS Content
    let htmlContent = '';
    let cssContent = '';
    let jsContent = '';

    files.forEach(file => {
        if (file.name.endsWith('.html')) htmlContent += file.content;
        if (file.name.endsWith('.css')) cssContent += `<style>${file.content}</style>\n`;
        if (file.name.endsWith('.js')) jsContent += `<script>${file.content}<\/script>\n`;
    });

    // 2. Build final output document
    const finalDocument = `<!DOCTYPE html><html><head><meta charset="UTF-8">\n${cssContent}</head><body>\n${htmlContent}\n${jsContent}</body></html>`;

    // 3. Show Overlay & Write to Iframe
    const overlay = document.getElementById('preview-overlay');
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Lock main screen

    const frame = document.getElementById('output-frame');
    const out = frame.contentWindow.document;
    out.open();
    out.write(finalDocument);
    out.close();
}

function closePreview() {
    document.getElementById('preview-overlay').style.display = 'none';
    document.body.style.overflow = ''; // Unlock main screen
}

// Device specific preview (wrapper resizing)
function setDevice(device) {
    document.getElementById('iframe-wrapper').className = 'iframe-wrapper ' + (device === 'mobile' ? 'mobile' : '');
}

// --- 10. SETTINGS & UTILITIES ---

function toggleSettings() {
    document.getElementById('settings-panel').classList.toggle('open');
}

function updateTheme() {
    const themeKey = document.getElementById('theme-select').value;
    const theme = themes[themeKey] || themes.dark;
    for (const [property, value] of Object.entries(theme)) {
        document.documentElement.style.setProperty(property, value);
    }
}

function updateFontSize() {
    const size = document.getElementById('font-size-slider').value;
    document.querySelectorAll('textarea').forEach(ta => ta.style.fontSize = `${size}px`);
}

// Basic Beautifier Logic
function beautifyCode() {
    if (!confirm("Beautify all files (simple indenting)?")) return;
    
    files.forEach(file => {
        if (file.content.trim() === '') return;
        let content = file.content.trim();
        
        if (file.lang === 'html') {
            // Very basic tag indentation (regex based, limited)
            content = content.replace(/>\s+</g, '><').replace(/</g, '\n<').replace(/>/g, '>\n');
        } else if (file.lang === 'css') {
            // Basic property indentation
            content = content.replace(/\s*{\s*/g, ' {\n  ').replace(/\;\s*/g, ';\n  ').replace(/\s*}\s*/g, '\n}\n\n');
        } else if (file.lang === 'js') {
            // Very simple brace indenting
            content = content.replace(/\s*{\s*/g, ' {\n  ').replace(/\;\s*/g, ';\n  ').replace(/\s*}\s*/g, '\n}\n');
        }
        
        file.content = content;
        document.getElementById(`ta-${file.id}`).value = content;
    });
    alert("Beautified successfully!");
}

// Export files as single project HTML
function exportCode() {
    if (!confirm("Export project as single HTML file?")) return;
    
    const hasHtml = files.some(f => f.name.endsWith('.html'));
    if (!hasHtml) return alert("Requires at least one .html file to export.");

    let htmlContent = '';
    let cssContent = '';
    let jsContent = '';

    files.forEach(file => {
        if (file.name.endsWith('.html')) htmlContent += file.content;
        if (file.name.endsWith('.css')) cssContent += `<style>${file.content}</style>\n`;
        if (file.name.endsWith('.js')) jsContent += `<script>${file.content}<\/script>\n`;
    });

    const finalDocument = `<!DOCTYPE html><html><head><meta charset="UTF-8">\n${cssContent}</head><body>\n${htmlContent}\n${jsContent}</body></html>`;
    const blob = new Blob([finalDocument], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "index.html";
    a.click();
}

// --- 11. GLOBAL EVENTS ---
document.addEventListener('mousedown', (e) => {
    // Hide suggestion box when clicking outside
    if (sBox && !sBox.contains(e.target)) sBox.style.display = 'none';
});
