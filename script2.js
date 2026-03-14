// --- 1. SHUTTER (LEFT SIDEBAR) LOGIC ---

function toggleShutter() {
    const shutter = document.getElementById('shutter');
    const trigger = document.getElementById('shutter-trigger');
    
    if (!shutter) return;

    shutter.classList.toggle('open');

    const icon = trigger.querySelector('i');
    if (shutter.classList.contains('open')) {
        icon.className = 'fas fa-chevron-left';
        trigger.style.left = '300px'; 
    } else {
        icon.className = 'fas fa-chevron-right';
        trigger.style.left = '0';
    }
}

function addNewFilePrompt() {
    const fileName = prompt("Navin file che naav dya (e.g. index.html, style.css, main.js):");
    
    if (fileName && fileName.trim() !== "") {
        const id = fileName.split('.')[0].toLowerCase().replace(/\s+/g, '-') + "-" + Math.floor(Math.random() * 1000);
        
        if (typeof addFileToUI === "function") {
            addFileToUI(fileName, id, "");
            updateShutterFileList(fileName, id);
        }
    }
}

function updateShutterFileList(name, id) {
    const list = document.getElementById('shutter-file-list');
    if (!list) return;

    const item = document.createElement('div');
    item.className = 'shutter-item';
    item.style.cssText = "padding:10px; margin-top:5px; background:rgba(255,255,255,0.05); border-radius:4px; cursor:pointer; font-size:13px;";
    item.id = `tab-${id}`;
    item.innerHTML = `<span><i class="fas fa-file-code" style="color:var(--accent);"></i> ${name}</span>`;
    
    item.onclick = () => {
        if (typeof restoreBox === "function") {
            restoreBox(id);
            toggleShutter();
        }
    };
    list.appendChild(item);
}

// --- 2. SETTINGS PANEL (RIGHT SIDEBAR) LOGIC ---

function toggleSettings() {
    // HTML madhe 'settingsPanel' ID aahe
    const panel = document.getElementById('settingsPanel');
    if (!panel) return;

    panel.classList.toggle('open');
    
    const shutter = document.getElementById('shutter');
    if (shutter && shutter.classList.contains('open') && panel.classList.contains('open')) {
        toggleShutter();
    }
}

// Settings: Editors Show/Hide Logic
function updateVisibility() {
    const htmlBox = document.getElementById('box-html');
    const cssBox = document.getElementById('box-css');
    const jsBox = document.getElementById('box-js');

    if(htmlBox) htmlBox.style.display = document.getElementById('chk-html').checked ? 'flex' : 'none';
    if(cssBox) cssBox.style.display = document.getElementById('chk-css').checked ? 'flex' : 'none';
    if(jsBox) jsBox.style.display = document.getElementById('chk-js').checked ? 'flex' : 'none';
}

// Settings: Theme aani Font Change Logic
function updateThemeAndFont() {
    const fontFamily = document.getElementById('font-family-sel').value;
    const theme = document.getElementById('theme-sel').value;
    const textareas = document.querySelectorAll('textarea');

    textareas.forEach(ta => {
        ta.style.fontFamily = fontFamily;
        // Theme badalnyache logic (main-logic.js madhe aslyas tithe apply hoil)
        applyThemeToEditor(ta, theme); 
    });
}

function applyThemeToEditor(el, theme) {
    // Basic theme colors
    const themes = {
        'dark': { bg: '#161b22', text: '#9cdcfe' },
        'monokai': { bg: '#272822', text: '#f8f8f2' },
        'dracula': { bg: '#282a36', text: '#f8f8f2' },
        'cyberpunk': { bg: '#000', text: '#0ff' },
        'matrix': { bg: '#000', text: '#0f0' }
    };
    
    if (themes[theme]) {
        el.parentElement.style.background = themes[theme].bg;
        el.style.color = themes[theme].text;
    }
}

// --- 3. CORE ACTION FUNCTIONS ---

function runCode() {
    const overlay = document.getElementById('preview-overlay');
    if (!overlay) return;

    overlay.style.display = 'flex';

    // main-logic.js madhle code execution trigger karne
    if (typeof updatePreview === "function") {
        updatePreview();
    }
}

function closePreview() {
    document.getElementById('preview-overlay').style.display = 'none';
}

function exportCode() {
    alert("Project Download hot aahe...");
    // main-logic.js madhle download logic asel tar te call kara
    if (typeof downloadProject === "function") {
        downloadProject();
    }
}

function beautifyCode() {
    alert("Code Format kela jat aahe...");
    // Prettier kiwa itar library che logic yethil
}

// --- 4. INITIAL SYNC ---

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const defaultFiles = [
            { name: "index.html", id: "html" },
            { name: "style.css", id: "css" },
            { name: "main.js", id: "js" }
        ];

        defaultFiles.forEach(file => {
            // Check karne ki main-logic ne he boxes create kele aahet ka
            if (document.getElementById(`box-${file.id}`)) {
                updateShutterFileList(file.name, file.id);
            }
        });
    }, 800);
});
