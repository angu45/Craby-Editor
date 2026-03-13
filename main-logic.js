/* CRABY EDITOR - MAIN LOGIC
   Features: Persistent Settings, Multi-file Management, Full-screen Output, 
   Smooth Animations, and Haptic Feedback.
*/

/* --- 1. SETTINGS & PERSISTENCE --- */
window.applySettings = () => {
    const font = localStorage.getItem('craby_font') || "'Plus Jakarta Sans', sans-serif";
    const theme = localStorage.getItem('craby_theme') || "dark";
    const fontSize = localStorage.getItem('craby_font_size') || "14px";

    // Smooth transition application
    requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--current-font', font);
        document.body.className = `theme-${theme}`;
        
        document.querySelectorAll('textarea').forEach(tx => {
            tx.style.fontSize = fontSize;
            tx.style.transition = "font-size 0.3s ease";
        });
    });

    // Update Dropdown values if they exist in UI
    if(document.getElementById('font-select')) document.getElementById('font-select').value = font;
    if(document.getElementById('theme-select')) document.getElementById('theme-select').value = theme;
    if(document.getElementById('size-select')) document.getElementById('size-select').value = fontSize;
};

// Global handlers for setting changes
window.changeFont = (font) => { localStorage.setItem('craby_font', font); window.applySettings(); };
window.changeTheme = (theme) => { localStorage.setItem('craby_theme', theme); window.applySettings(); };
window.changeFontSize = (size) => { localStorage.setItem('craby_font_size', size); window.applySettings(); };

window.resetAllSettings = () => {
    if(confirm("Are you sure you want to reset all settings to default?")) {
        localStorage.removeItem('craby_font');
        localStorage.removeItem('craby_theme');
        localStorage.removeItem('craby_font_size');
        document.body.style.opacity = '0.5';
        setTimeout(() => location.reload(), 300);
    }
};

/* --- 2. FILE & WINDOW MANAGEMENT --- */
window.saveHistory = (id, content) => localStorage.setItem(`craby_code_${id}`, content);

window.addFileToUI = function(name, id, content = "") {
    const wrapper = document.getElementById('editor-wrapper');
    const fileList = document.getElementById('file-list');
    if(!wrapper || document.getElementById(`box-${id}`)) return;

    // 1. Sidebar Item Creation
    const item = document.createElement('div');
    item.className = 'file-item';
    item.id = `tab-${id}`;
    item.innerHTML = `<i class="fas fa-file-code"></i> <span>${name}</span>`;
    item.onclick = () => window.restoreBox(id);
    fileList.appendChild(item);

    // 2. Editor Box Creation
    const newBox = document.createElement('div');
    newBox.className = 'editor-box';
    newBox.id = `box-${id}`;
    newBox.innerHTML = `
        <div class="label" style="backdrop-filter: blur(5px); background: rgba(0,0,0,0.3);">
            <span>${name.toUpperCase()}</span>
            <div class="box-controls">
                <button onclick="minimizeBox('${id}')" title="Minimize"><i class="fas fa-minus"></i></button>
                <button onclick="toggleFullscreen('${id}')" title="Full Screen"><i class="fas fa-expand-arrows-alt"></i></button>
                <button onclick="deleteFile('${id}')" title="Delete"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>
        <textarea id="${id}-code" spellcheck="false" oninput="saveHistory('${id}', this.value)">${content}</textarea>
    `;
    wrapper.appendChild(newBox);
    window.applySettings();
};

window.createNewFile = function() {
    let fileName = prompt("Enter file name (e.g. app.js):");
    if (fileName) {
        let fileId = fileName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        window.addFileToUI(fileName, fileId, "");
        window.restoreBox(fileId);
    }
};

window.minimizeBox = (id) => {
    document.getElementById(`box-${id}`).style.display = 'none';
};

window.restoreBox = (id) => {
    const box = document.getElementById(`box-${id}`);
    if(box) {
        box.style.display = 'flex';
        box.scrollIntoView({ behavior: 'smooth' });
    }
};

window.deleteFile = (id) => {
    if(confirm(`Delete ${id}?`)) {
        document.getElementById(`box-${id}`).remove();
        document.getElementById(`tab-${id}`).remove();
        localStorage.removeItem(`craby_code_${id}`);
    }
};

window.toggleFullscreen = (id) => {
    document.getElementById(`box-${id}`).classList.toggle('fullscreen-mode');
};

/* --- 3. UI INTERACTIVE ACTIONS --- */
window.toggleLeftSidebar = () => {
    const sidebar = document.getElementById('leftSidebar');
    const shutter = document.getElementById('shutterBtn');
    sidebar.classList.toggle('open');
    shutter.classList.toggle('active');
    if (window.navigator.vibrate) window.navigator.vibrate(10); // Haptic feedback
};

window.toggleSettings = () => {
    document.getElementById('settingsPanel').classList.toggle('open');
    if (window.navigator.vibrate) window.navigator.vibrate(10);
};

/* --- 4. RUN & DOWNLOAD ENGINE --- */
window.runCode = () => {
    const overlay = document.getElementById('preview-overlay');
    overlay.style.display = 'flex';

    // Collect values from editors
    const h = document.getElementById('html-code')?.value || '';
    const c = `<style>${document.getElementById('css-code')?.value || ''}</style>`;
    const j = `<script>${document.getElementById('js-code')?.value || ''}<\/script>`;

    const out = document.getElementById('output').contentWindow.document;
    out.open();
    out.write(h + c + j);
    out.close();
};

window.closePreview = () => {
    document.getElementById('preview-overlay').style.display = 'none';
};

window.setDevice = (mode) => {
    const wrap = document.querySelector('.iframe-wrapper');
    mode === 'mobile' ? wrap.classList.add('mobile') : wrap.classList.remove('mobile');
};

window.downloadCode = () => {
    const h = document.getElementById('html-code')?.value || '';
    const c = `<style>${document.getElementById('css-code')?.value || ''}</style>`;
    const j = `<script>${document.getElementById('js-code')?.value || ''}<\/script>`;
    
    const combined = `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n${c}\n</head>\n<body>\n${h}\n${j}\n</body>\n</html>`;
    
    const blob = new Blob([combined], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'craby_project.html';
    a.click();
};

/* --- 5. INITIALIZATION & SAFETY --- */
window.addEventListener('beforeunload', (e) => {
    e.preventDefault();
    e.returnValue = ''; // Shows unsaved changes warning
});

document.addEventListener('DOMContentLoaded', () => {
    // 1. Clear placeholder UI
    document.getElementById('editor-wrapper').innerHTML = '';
    document.getElementById('file-list').innerHTML = '';

    // 2. Load Default Files
    const defH = localStorage.getItem('craby_code_html') || "<h1>Craby Editor</h1>\n<p>Start coding...</p>";
    const defC = localStorage.getItem('craby_code_css') || "body { background: #f0f0f0; text-align: center; font-family: sans-serif; }\nh1 { color: #ffb400; }";
    const defJ = localStorage.getItem('craby_code_js') || "console.log('App Running!');";

    window.addFileToUI("index.html", "html", defH);
    window.addFileToUI("style.css", "css", defC);
    window.addFileToUI("main.js", "js", defJ);

    // 3. Sync Settings
    window.applySettings();
});
