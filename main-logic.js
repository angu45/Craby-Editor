/* --- 1. SETTINGS & PERSISTENCE --- */
window.applySettings = () => {
    const font = localStorage.getItem('craby_font') || "'Fira Code', monospace";
    const theme = localStorage.getItem('craby_theme') || "dark";
    const fontSize = localStorage.getItem('craby_font_size') || "16px";

    document.body.className = `theme-${theme}`;
    document.querySelectorAll('textarea').forEach(tx => {
        tx.style.fontFamily = font;
        tx.style.fontSize = fontSize;
    });

    // Update UI controls if they exist
    if(document.getElementById('font-family-sel')) document.getElementById('font-family-sel').value = font;
    if(document.getElementById('theme-sel')) document.getElementById('theme-sel').value = theme;
    if(document.getElementById('font-size-bar')) document.getElementById('font-size-bar').value = parseInt(fontSize);
    if(document.getElementById('fs-display')) document.getElementById('fs-display').innerText = fontSize;
};

/* --- 2. DYNAMIC PARTITIONING & VISIBILITY --- */
window.updateVisibility = () => {
    const boxes = document.querySelectorAll('.editor-box');
    const visibleBoxes = Array.from(boxes).filter(box => box.style.display !== 'none');
    
    // Equal height division: 100 / number of visible boxes
    const height = visibleBoxes.length > 0 ? (100 / visibleBoxes.length) + '%' : '100%';
    
    visibleBoxes.forEach(box => {
        box.style.height = height;
    });
};

window.minimizeBox = (id) => {
    const box = document.getElementById(`box-${id}`);
    const checkbox = document.getElementById(`chk-${id}`);
    if (box) box.style.display = 'none';
    if (checkbox) checkbox.checked = false;
    window.updateVisibility();
};

window.restoreBox = (id) => {
    const box = document.getElementById(`box-${id}`);
    const checkbox = document.getElementById(`chk-${id}`);
    if (box) box.style.display = 'flex';
    if (checkbox) checkbox.checked = true;
    window.updateVisibility();
};

/* --- 3. FULLSCREEN LOGIC --- */
window.toggleFullscreen = (id) => {
    const box = document.getElementById(`box-${id}`);
    const btn = document.getElementById(`exit-${id}`);
    
    if (!box.classList.contains('fullscreen')) {
        // Enter Fullscreen
        box.classList.add('fullscreen');
        if(btn) btn.style.display = 'block';
    } else {
        // Exit Fullscreen
        box.classList.remove('fullscreen');
        if(btn) btn.style.display = 'none';
        window.updateVisibility();
    }
};

/* --- 4. SIDEBAR & SHUTTER --- */
window.toggleLeftSidebar = () => {
    const sidebar = document.getElementById('leftSidebar');
    const shutter = document.getElementById('shutterBtn');
    sidebar.classList.toggle('active');
    shutter.classList.toggle('active');
    
    // Rotate the arrow icon
    const icon = shutter.querySelector('i');
    if(sidebar.classList.contains('active')) {
        icon.className = 'fas fa-chevron-left';
    } else {
        icon.className = 'fas fa-chevron-right';
    }
};

window.toggleSettings = () => {
    document.getElementById('settingsPanel').classList.toggle('active');
};

/* --- 5. RUN & EXPORT --- */
window.runCode = () => {
    const html = document.getElementById('html-code').value;
    const css = `<style>${document.getElementById('css-code').value}</style>`;
    const js = `<script>${document.getElementById('js-code')?.value || ''}<\/script>`;
    
    const preview = document.getElementById('preview-overlay');
    const iframe = document.getElementById('output');
    
    preview.style.display = 'flex';
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(html + css + js);
    doc.close();
};

window.closePreview = () => {
    document.getElementById('preview-overlay').style.display = 'none';
};

window.setDevice = (mode) => {
    const wrapper = document.querySelector('.iframe-wrapper');
    if(mode === 'mobile') {
        wrapper.style.width = '375px';
        wrapper.style.maxWidth = '90%';
    } else {
        wrapper.style.width = '100%';
    }
};

window.exportCode = () => {
    const html = document.getElementById('html-code').value;
    const css = `<style>${document.getElementById('css-code').value}</style>`;
    const js = `<script>${document.getElementById('js-code').value}<\/script>`;
    const blob = new Blob([`<html><head>${css}</head><body>${html}${js}</body></html>`], {type: 'text/html'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'index.html';
    a.click();
};

/* --- 6. INITIALIZATION --- */
window.saveHistory = (id, val) => {
    localStorage.setItem(`craby_code_${id}`, val);
};

document.addEventListener('DOMContentLoaded', () => {
    // Load saved code
    if(localStorage.getItem('craby_code_html')) document.getElementById('html-code').value = localStorage.getItem('craby_code_html');
    if(localStorage.getItem('craby_code_css')) document.getElementById('css-code').value = localStorage.getItem('craby_code_css');
    
    window.applySettings();
    window.updateVisibility();
});
