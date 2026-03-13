// --- 1. GLOBAL VARIABLES ---
const dictionary = {
    html: ['div', 'span', 'h1', 'p', 'a', 'img', 'button', 'ul', 'li', 'section', 'header', 'footer', 'class', 'id', 'href', 'src'],
    css: ['color', 'background', 'font-size', 'margin', 'padding', 'display', 'flex', 'border', 'width', 'height', 'position'],
    js: ['console.log', 'function', 'const', 'let', 'var', 'document.getElementById', 'addEventListener']
};
let currentLang = 'html';
let selectedIdx = 0;
const sBox = document.createElement('div');
sBox.className = 'suggestion-box';
document.body.appendChild(sBox);

// --- 2. SIDEBARS & SETTINGS LOGIC (Slide Animation) ---
window.toggleLeftSidebar = () => {
    const sb = document.getElementById('leftSidebar');
    const shutter = document.getElementById('shutterBtn');
    
    // Toggle 'open' class for slide effect
    sb.classList.toggle('open');
    shutter.classList.toggle('active');
    
    // Icon Change logic
    const icon = shutter.querySelector('i');
    if(sb.classList.contains('open')) {
        icon.className = 'fas fa-chevron-left';
    } else {
        icon.className = 'fas fa-chevron-right';
    }
};

window.toggleSettings = () => {
    // Right sidebar slide toggle
    document.getElementById('settingsPanel').classList.toggle('open');
};

// --- 3. DYNAMIC LAYOUT & FILE SYSTEM ---
function addFileToUI(name, id, content = "") {
    const fileList = document.getElementById('file-list');
    const wrapper = document.getElementById('editor-wrapper');
    if(!wrapper || document.getElementById(`box-${id}`)) return;

    // Explorer Tab
    const newTab = document.createElement('div');
    newTab.className = 'file-item';
    newTab.id = `tab-${id}`;
    newTab.innerHTML = `<span><i class="fas fa-file-code"></i> ${name}</span> <small id="status-${id}" style="display:none; color:var(--accent)">(min)</small>`;
    newTab.onclick = () => restoreBox(id);
    fileList.appendChild(newTab);

    // Editor Box
    const newBox = document.createElement('div');
    newBox.className = 'editor-box';
    newBox.id = `box-${id}`;
    newBox.style.flex = "1"; // Auto-divide height
    newBox.innerHTML = `
        <div class="label">
            <span>${name.toUpperCase()} <i class="fas fa-code"></i></span>
            <div class="window-controls">
                <i class="fas fa-minus" onclick="minimizeBox('${id}')"></i>
                <i class="fas fa-expand" onclick="expandBox('${id}')"></i>
                <i class="fas fa-trash" onclick="deleteBox('${id}')"></i>
            </div>
        </div>
        <textarea id="${id}-code" spellcheck="false" oninput="saveHistory('${id}', this.value)">${content}</textarea>
    `;
    wrapper.appendChild(newBox);
    attachInputListeners(document.getElementById(`${id}-code`));
    updateLayout();
}

function updateLayout() {
    const boxes = Array.from(document.querySelectorAll('.editor-box')).filter(b => b.style.display !== 'none');
    if(boxes.length > 0) {
        const h = 100 / boxes.length;
        boxes.forEach(b => b.style.height = h + "%");
    }
}

function minimizeBox(id) { 
    document.getElementById(`box-${id}`).style.display = 'none'; 
    document.getElementById(`status-${id}`).style.display = 'inline'; 
    updateLayout();
}

function restoreBox(id) { 
    document.getElementById(`box-${id}`).style.display = 'flex'; 
    document.getElementById(`status-${id}`).style.display = 'none'; 
    updateLayout();
}

function deleteBox(id) { 
    if(confirm("Delete this file?")) { 
        document.getElementById(`box-${id}`).remove(); 
        document.getElementById(`tab-${id}`).remove(); 
        updateLayout();
    } 
}

// --- 4. THEME & FONT LOGIC ---
window.updateThemeAndFont = () => {
    const themeKey = document.getElementById('theme-sel').value;
    const font = document.getElementById('font-family-sel').value;
    const fontSize = document.getElementById('font-size-bar').value;
    
    document.getElementById('fs-display').innerText = fontSize + "px"; 
    const theme = window.themes[themeKey] || window.themes.dark;

    document.documentElement.style.setProperty('--bg', theme.bg);
    document.documentElement.style.setProperty('--panel', theme.panel);
    document.documentElement.style.setProperty('--accent', theme.accent);
    
    document.querySelectorAll('textarea').forEach(tx => {
        tx.style.fontFamily = font;
        tx.style.fontSize = fontSize + "px";
        tx.style.color = theme.text;
        tx.style.background = theme.bg;
    });
};

// --- 5. TOOLBAR ACTIONS ---
window.runCode = () => {
    document.getElementById('preview-overlay').style.display = 'flex';
    const h = document.getElementById('html-code')?.value || '';
    const c = `<style>${document.getElementById('css-code')?.value || ''}</style>`;
    const j = `<script>${document.getElementById('js-code')?.value || ''}<\/script>`;
    const out = document.getElementById('output').contentWindow.document;
    out.open(); out.write(h + c + j); out.close();
};

window.closePreview = () => document.getElementById('preview-overlay').style.display = 'none';

window.exportCode = () => {
    const h = document.getElementById('html-code')?.value || '';
    const c = document.getElementById('css-code')?.value || '';
    const full = `<!DOCTYPE html><html><head><style>${c}</style></head><body>${h}</body></html>`;
    const blob = new Blob([full], {type: "text/html"});
    const a = document.createElement("a"); 
    a.href = URL.createObjectURL(blob); 
    a.download = "index.html"; 
    a.click();
};

window.saveHistory = (id, val) => localStorage.setItem('craby_' + id, val);

// --- 6. INITIAL LOAD ---
window.onload = () => { 
    // Default 2 Files: HTML and CSS
    const oldH = localStorage.getItem('craby_html') || "<h1>Craby Editor</h1>";
    const oldC = localStorage.getItem('craby_css') || "h1 { color: #ffb400; text-align: center; }";
    
    addFileToUI("index.html", "html", oldH);
    addFileToUI("style.css", "css", oldC);
    
    window.updateThemeAndFont(); 
};

// Outside click logic for Sidebars
document.addEventListener('mousedown', (e) => {
    const sb = document.getElementById('leftSidebar');
    const set = document.getElementById('settingsPanel');
    if (sb.classList.contains('open') && !sb.contains(e.target) && !e.target.closest('#shutterBtn')) {
        toggleLeftSidebar();
    }
    if (set.classList.contains('open') && !set.contains(e.target) && !e.target.closest('.icon-btn')) {
        toggleSettings();
    }
});
