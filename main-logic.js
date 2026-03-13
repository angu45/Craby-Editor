/* CRABY EDITOR - MASTER LOGIC 
   Features: Dynamic Layout, Persistence, Shutter, Settings, Run & Download
*/

// --- 1. INITIALIZATION & SETTINGS ---
document.addEventListener('DOMContentLoaded', () => {
    // सुरुवातीला डिफॉल्ट फाईल्स लोड करणे
    initFiles();
    // सेव्ह केलेल्या सेटिंग्ज अप्लाय करणे
    if (window.updateThemeAndFont) window.updateThemeAndFont();
    window.applySettings();
});

window.applySettings = () => {
    const font = localStorage.getItem('craby_font') || "'Fira Code', monospace";
    const theme = localStorage.getItem('craby_theme') || "dark";
    const fontSize = localStorage.getItem('craby_font_size') || "16";

    // UI सिंक करणे
    if(document.getElementById('font-family-sel')) document.getElementById('font-family-sel').value = font;
    if(document.getElementById('theme-sel')) document.getElementById('theme-sel').value = theme;
    if(document.getElementById('font-size-bar')) document.getElementById('font-size-bar').value = fontSize;
    
    if (window.updateThemeAndFont) window.updateThemeAndFont();
};

// --- 2. DYNAMIC LAYOUT ENGINE (Divide Screen Height) ---
window.updateLayout = () => {
    const wrapper = document.getElementById('editor-wrapper');
    if (!wrapper) return;
    
    const visibleBoxes = Array.from(wrapper.children).filter(box => box.style.display !== 'none');
    const count = visibleBoxes.length;

    if (count > 0) {
        const heightPercentage = 100 / count;
        visibleBoxes.forEach(box => {
            box.style.flex = `1 1 ${heightPercentage}%`;
            box.style.height = `${heightPercentage}%`;
            box.style.minHeight = "0"; // Flexbox ला नीट काम करण्यासाठी
        });
    }
};

// --- 3. FILE & WINDOW CONTROLS ---
function initFiles() {
    // लोकल स्टोअरेजमधून कोड मिळवणे
    const html = localStorage.getItem('craby_code_html') || "<h1>Welcome to Craby</h1>";
    const css = localStorage.getItem('craby_code_css') || "h1 { color: orange; text-align: center; font-family: sans-serif; }";
    
    document.getElementById('html-code').value = html;
    document.getElementById('css-code').value = css;
    
    window.updateLayout();
}

window.saveHistory = (id, value) => {
    localStorage.setItem(`craby_code_${id}`, value);
};

window.minimizeBox = (id) => {
    const box = document.getElementById(`box-${id}`);
    const checkbox = document.getElementById(`chk-${id}`);
    if(box) {
        box.style.display = 'none';
        if(checkbox) checkbox.checked = false;
        window.updateLayout();
    }
};

window.updateVisibility = () => {
    const htmlBox = document.getElementById('box-html');
    const cssBox = document.getElementById('box-css');
    
    htmlBox.style.display = document.getElementById('chk-html').checked ? 'flex' : 'none';
    cssBox.style.display = document.getElementById('chk-css').checked ? 'flex' : 'none';
    
    window.updateLayout();
};

window.deleteFile = (id) => {
    if(confirm(`तुम्हाला खरोखर ${id.toUpperCase()} मधील कोड साफ करायचा आहे का?`)) {
        document.getElementById(`${id}-code`).value = "";
        localStorage.setItem(`craby_code_${id}`, "");
    }
};

window.toggleFullscreen = (id) => {
    const box = document.getElementById(`box-${id}`);
    box.classList.toggle('fullscreen-mode');
};

// --- 4. RUN & PREVIEW LOGIC ---
window.runCode = () => {
    const overlay = document.getElementById('preview-overlay');
    const iframe = document.getElementById('output');
    
    overlay.style.display = 'flex';
    
    const html = document.getElementById('html-code').value;
    const css = `<style>${document.getElementById('css-code').value}</style>`;
    // जर JS बॉक्स भविष्यात ॲड केला तर त्याचे लॉजिक:
    const js = document.getElementById('js-code') ? `<script>${document.getElementById('js-code').value}<\/script>` : "";

    const fullCode = html + css + js;
    
    const out = iframe.contentWindow.document;
    out.open();
    out.write(fullCode);
    out.close();
};

window.closePreview = () => {
    document.getElementById('preview-overlay').style.display = 'none';
};

window.setDevice = (mode) => {
    const wrapper = document.querySelector('.iframe-wrapper');
    if(mode === 'mobile') {
        wrapper.style.width = '375px';
        wrapper.style.height = '667px';
    } else {
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
    }
};

// --- 5. DOWNLOAD / EXPORT LOGIC ---
window.exportCode = () => {
    const html = document.getElementById('html-code').value;
    const css = document.getElementById('css-code').value;
    
    const fullContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Craby Export</title>
    <style>${css}</style>
</head>
<body>
    ${html}
</body>
</html>`;

    const blob = new Blob([fullContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "index.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// --- 6. SHUTTER & MENU LOGIC ---
window.toggleLeftSidebar = () => {
    const sidebar = document.getElementById('leftSidebar');
    const shutter = document.getElementById('shutterBtn');
    sidebar.classList.toggle('open');
    shutter.classList.toggle('active');
};

window.toggleSettings = () => {
    document.getElementById('settingsPanel').classList.toggle('open');
};

document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('leftSidebar');
    const settings = document.getElementById('settingsPanel');
    const shutter = document.getElementById('shutterBtn');

    if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !shutter.contains(e.target)) {
        window.toggleLeftSidebar();
    }
    if (settings.classList.contains('open') && !settings.contains(e.target) && !e.target.closest('.icon-btn')) {
        window.toggleSettings();
    }
});

window.resetAllSettings = () => {
    if(confirm("सर्व सेटिंग्ज रिसेट करायच्या आहेत का?")) {
        localStorage.clear();
        location.reload();
    }
};
