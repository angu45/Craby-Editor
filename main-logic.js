// --- 1. SETTINGS & THEMES ---
window.applySettings = () => {
    const font = localStorage.getItem('craby_font') || "'Plus Jakarta Sans', sans-serif";
    const theme = localStorage.getItem('craby_theme') || "dark";
    const fontSize = localStorage.getItem('craby_font_size') || "14px";

    document.documentElement.style.setProperty('--current-font', font);
    document.body.className = `theme-${theme}`;
    document.querySelectorAll('textarea').forEach(tx => tx.style.fontSize = fontSize);

    if(document.getElementById('font-select')) document.getElementById('font-select').value = font;
    if(document.getElementById('theme-select')) document.getElementById('theme-select').value = theme;
    if(document.getElementById('size-select')) document.getElementById('size-select').value = fontSize;
};

// --- 2. DYNAMIC LAYOUT (DIVIDE BODY) ---
window.updateLayout = () => {
    const wrapper = document.getElementById('editor-wrapper');
    const visibleBoxes = Array.from(wrapper.children).filter(box => box.style.display !== 'none');
    const count = visibleBoxes.length;
    if (count > 0) {
        const height = 100 / count;
        visibleBoxes.forEach(box => {
            box.style.flex = `1 1 ${height}%`;
            box.style.height = `${height}%`;
        });
    }
};

// --- 3. FILE LOGIC (MINIMIZE/DELETE) ---
window.addFileToUI = (name, id, content = "") => {
    const wrapper = document.getElementById('editor-wrapper');
    const fileList = document.getElementById('file-list');
    if(!wrapper || document.getElementById(`box-${id}`)) return;

    const item = document.createElement('div');
    item.className = 'file-item';
    item.id = `tab-${id}`;
    item.innerHTML = `<i class="fas fa-file-code"></i> <span>${name}</span>`;
    item.onclick = () => window.restoreBox(id);
    fileList.appendChild(item);

    const newBox = document.createElement('div');
    newBox.className = 'editor-box';
    newBox.id = `box-${id}`;
    newBox.innerHTML = `
        <div class="label">
            <span>${name.toUpperCase()}</span>
            <div class="box-controls">
                <button onclick="minimizeBox('${id}')"><i class="fas fa-minus"></i></button>
                <button onclick="deleteFile('${id}')"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>
        <textarea id="${id}-code" spellcheck="false" oninput="localStorage.setItem('craby_code_${id}', this.value)">${content}</textarea>`;
    
    wrapper.appendChild(newBox);
    window.applySettings();
    window.updateLayout();
};

window.minimizeBox = (id) => {
    document.getElementById(`box-${id}`).style.display = 'none';
    window.updateLayout();
};

window.restoreBox = (id) => {
    const box = document.getElementById(`box-${id}`);
    if(box) {
        box.style.display = 'flex';
        window.updateLayout();
    }
};

window.deleteFile = (id) => {
    if(confirm(`Delete ${id}?`)) {
        document.getElementById(`box-${id}`).remove();
        document.getElementById(`tab-${id}`).remove();
        localStorage.removeItem(`craby_code_${id}`);
        window.updateLayout();
    }
};

// --- 4. RUN & PREVIEW FIX (Close, Desktop, Phone) ---
window.runCode = () => {
    const overlay = document.getElementById('preview-overlay');
    overlay.style.display = 'flex';

    const h = document.getElementById('html-code')?.value || '';
    const c = `<style>${document.getElementById('css-code')?.value || ''}</style>`;
    const j = `<script>${document.getElementById('js-code')?.value || ''}<\/script>`;
    
    const out = document.getElementById('output').contentWindow.document;
    out.open();
    out.write(h + c + j);
    out.close();
};

// प्रिव्ह्यू बंद करण्यासाठी
window.closePreview = () => {
    document.getElementById('preview-overlay').style.display = 'none';
};

// प्रिव्ह्यू मोड बदलण्यासाठी (Desktop/Mobile)
window.setPreviewMode = (mode) => {
    const iframe = document.getElementById('output');
    if(mode === 'mobile') {
        iframe.style.width = '375px';
        iframe.style.margin = 'auto';
    } else {
        iframe.style.width = '100%';
    }
};

// --- 5. DOWNLOAD FIX (Durable Logic) ---
window.downloadCode = () => {
    const h = document.getElementById('html-code')?.value || "";
    const c = document.getElementById('css-code')?.value || "";
    const j = document.getElementById('js-code')?.value || "";

    const fullCode = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${c}</style>
</head>
<body>
    ${h}
    <script>${j}<\/script>
</body>
</html>`;

    const blob = new Blob([fullCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = "index.html";
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);
};

// --- 6. UI TOGGLES & INIT ---
window.toggleSettings = () => document.getElementById('settingsPanel').classList.toggle('open');
window.toggleLeftSidebar = () => {
    document.getElementById('leftSidebar').classList.toggle('open');
    document.getElementById('shutterBtn').classList.toggle('active');
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('editor-wrapper').innerHTML = '';
    document.getElementById('file-list').innerHTML = '';
    
    window.addFileToUI("index.html", "html", localStorage.getItem('craby_code_html') || "<h1>Craby Editor</h1>");
    window.addFileToUI("style.css", "css", localStorage.getItem('craby_code_css') || "h1 { color: orange; }");
    window.addFileToUI("main.js", "js", localStorage.getItem('craby_code_js') || "console.log('Live');");
    
    window.applySettings();
});
