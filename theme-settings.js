// --- 1. ALL 12 THEMES CONFIGURATION ---
const themes = {
    dark: { bg: '#0d1117', panel: '#161b22', accent: '#ffb400', text: '#9cdcfe', border: '#30363d' }, 
    light: { bg: '#eef1f4', panel: '#ffffff', accent: '#f59e0b', text: '#374151', border: '#e5e7eb' },  
    monokai: { bg: '#272822', panel: '#3e3d32', accent: '#f92672', text: '#f8f8f2', border: '#49483e' },
    dracula: { bg: '#282a36', panel: '#44475a', accent: '#bd93f9', text: '#f8f8f2', border: '#6272a4' },
    matrix: { bg: '#000000', panel: '#001a00', accent: '#00ff00', text: '#00ff00', border: '#003300' },
    nord: { bg: '#2e3440', panel: '#3b4252', accent: '#88c0d0', text: '#d8dee9', border: '#4c566a' },
    midnight: { bg: '#020617', panel: '#1e293b', accent: '#38bdf8', text: '#f1f5f9', border: '#334155' },
    solarized: { bg: '#002b36', panel: '#073642', accent: '#268bd2', text: '#859900', border: '#586e75' },
    cyberpunk: { bg: '#0b0e14', panel: '#1a1f29', accent: '#00ff41', text: '#f3f3f3', border: '#00ff41' },
    evergreen: { bg: '#0a1a12', panel: '#142b20', accent: '#4ade80', text: '#e2e8f0', border: '#2d4a3e' },
    midnight_purple: { bg: '#0f0c29', panel: '#1c184a', accent: '#a855f7', text: '#f3e8ff', border: '#3b2d7d' },
    oceanic: { bg: '#1b2b34', panel: '#23333b', accent: '#6699cc', text: '#d8dee9', border: '#343d46' }
};

// --- 2. THEME & FONT APPLICATION LOGIC ---

function updateThemeAndFont() {
    const themeSel = document.getElementById('theme-sel');
    const fontSel = document.getElementById('font-family-sel');
    
    if (!themeSel || !fontSel) return;

    const themeKey = themeSel.value;
    const font = fontSel.value;
    const theme = themes[themeKey] || themes.dark;

    document.documentElement.style.setProperty('--bg', theme.bg);
    document.documentElement.style.setProperty('--panel', theme.panel);
    document.documentElement.style.setProperty('--accent', theme.accent);
    document.documentElement.style.setProperty('--border', theme.border);
    
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(tx => {
        tx.style.fontFamily = font;
        tx.style.color = theme.text;
        tx.style.background = theme.bg;
        
        const frame = tx.closest('.window-frame');
        if(frame) frame.style.borderColor = theme.border;
    });

    document.querySelectorAll('.window-header').forEach(h => h.style.background = theme.panel);
    document.querySelectorAll('.icon-btn i').forEach(i => i.style.color = theme.accent);
    
    document.querySelectorAll('.line-numbers').forEach(ln => {
        ln.style.fontFamily = font;
    });
}

function updateFontSize(val) {
    const sizeLabel = document.getElementById('font-size-val');
    if (sizeLabel) sizeLabel.innerText = val + "px";

    const editors = document.querySelectorAll('.editor-container textarea');
    editors.forEach(editor => {
        editor.style.fontSize = val + "px";
    });

    const lineNumbers = document.querySelectorAll('.line-numbers');
    lineNumbers.forEach(ln => {
        ln.style.fontSize = val + "px";
    });

    if (typeof lineNumberFontSize !== 'undefined') {
        lineNumberFontSize = parseInt(val);
    }
}

// --- 3. RUN CODE LOGIC (ADDED) ---

function runCode() {
    const htmlFiles = Object.keys(files).filter(f => f.endsWith('.html'));
    if(htmlFiles.length === 0) return alert("No HTML files available!");

    // जर index.html असेल तर ते आधी निवडा, नसेल तर पहिले उपलब्ध HTML
    const defaultFile = files["index.html"] ? "index.html" : htmlFiles[0];
    
    const overlay = document.getElementById('preview-overlay');
    const frame = document.getElementById('output-frame');
    overlay.style.display = 'flex';

    let rawHTML = files[defaultFile].content;

    // CSS आणि JS फाईल्सना HTML मध्ये इंजेक्ट करणे
    Object.keys(files).forEach(name => {
        const content = files[name].content;
        if(name.endsWith('.css')) {
            rawHTML = rawHTML.replace(`href="${name}"`, `href="data:text/css;base64,${btoa(content)}"`);
            rawHTML = rawHTML.replace('</head>', `<style>${content}</style></head>`);
        }
        if(name.endsWith('.js')) {
            const encodedJS = btoa(unescape(encodeURIComponent(content)));
            rawHTML = rawHTML.replace(`src="${name}"`, `src="data:text/javascript;base64,${encodedJS}"`);
            rawHTML = rawHTML.replace('</body>', `<script>${content}<\/script></body>`);
        }
    });

    const doc = frame.contentWindow.document;
    doc.open();
    doc.write(rawHTML);
    doc.close();

    // प्रिव्ह्यू उघडताना तो नेहमी डेस्कटॉप साईजमध्ये उघडेल
    setPreviewSize('100%');
}

function closePreview() {
    document.getElementById('preview-overlay').style.display = 'none';
}

// --- 4. PREVIEW DEVICE REALITY LOGIC (FIXED) ---

function setPreviewSize(device) {
    const frame = document.getElementById('output-frame');
    const overlayBody = document.getElementById('preview-body');

    if (!frame || !overlayBody) return;

    // स्मूद ट्रांझिशन
    frame.style.transition = "all 0.4s ease-in-out";
    
    if (device === '100%') {
        // Desktop View Fix
        frame.style.width = "100%";
        frame.style.height = "100%";
        frame.style.maxWidth = "100%";
        frame.style.border = "none";
        frame.style.borderRadius = "0";
        overlayBody.style.padding = "0";
        overlayBody.style.alignItems = "stretch"; // फुल स्क्रीन करण्यासाठी
    } 
    else if (device === '375px') {
        // Mobile View Fix (iPhone Style)
        frame.style.width = "375px";
        frame.style.height = "667px"; // स्टँडर्ड मोबाईल हाईट
        frame.style.maxWidth = "90vw";
        frame.style.maxHeight = "80vh";
        frame.style.border = "14px solid #333"; // मोबाईल फ्रेम (बेझल)
        frame.style.borderRadius = "40px"; 
        frame.style.boxShadow = "0 30px 60px rgba(0,0,0,0.8)";
        overlayBody.style.padding = "40px 10px";
        overlayBody.style.alignItems = "center"; // फ्रेम सेंटरला ठेवण्यासाठी
    }
}

// --- 5. INITIAL SYNC ---
window.addEventListener('DOMContentLoaded', () => {
    const fsRange = document.getElementById('font-size-range');
    if(fsRange) updateFontSize(fsRange.value);
    updateThemeAndFont();
});
