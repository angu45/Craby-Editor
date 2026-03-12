// --- 1. CONFIGURATION & DICTIONARY ---
const tags = {
    html: ['div', 'span', 'h1', 'h2', 'h3', 'p', 'button', 'input', 'img', 'a', 'section', 'article', 'header', 'footer', 'nav', 'ul', 'li'],
    css: ['color', 'background', 'margin', 'padding', 'display', 'flex', 'font-size', 'border', 'width', 'height', 'position', 'justify-content', 'align-items'],
    js: ['function', 'const', 'let', 'var', 'console.log', 'document.getElementById', 'addEventListener', 'window', 'if', 'else', 'return']
};

// --- 2. AUTO-CLOSE BRACKETS & TAGS LOGIC ---
document.querySelectorAll('textarea').forEach(txt => {
    txt.addEventListener('input', (e) => {
        const pos = txt.selectionStart;
        const val = txt.value;
        const char = e.data;

        // Pair closing characters
        const pairs = {
            '{': '}',
            '(': ')',
            '[': ']',
            '"': '"',
            "'": "'"
        };

        if (pairs[char]) {
            txt.value = val.substring(0, pos) + pairs[char] + val.substring(pos);
            txt.selectionStart = txt.selectionEnd = pos;
        } 
        
        // HTML Auto End Tag Logic
        else if (char === '>') {
            // Check if it's an opening tag like <div>
            const lastPart = val.substring(0, pos);
            const match = lastPart.match(/<(\w+)>$/);
            if (match) {
                const tagName = match[1];
                // Self-closing tags exclude kara (e.g., <img>, <br>)
                const selfClosing = ['img', 'br', 'hr', 'input', 'link', 'meta'];
                if (!selfClosing.includes(tagName.toLowerCase())) {
                    txt.value = val.substring(0, pos) + `</${tagName}>` + val.substring(pos);
                    txt.selectionStart = txt.selectionEnd = pos;
                }
            }
        }
    });
});

// --- 3. CORE RUN FUNCTION (FLOW SCREEN) ---
function runCode() {
    const overlay = document.getElementById('preview-overlay');
    if (!overlay) return;

    overlay.style.display = 'flex'; // Full screen preview open kara

    const html = document.getElementById('html-code').value;
    const css = "<style>" + document.getElementById('css-code').value + "</style>";
    const js = "<script>" + document.getElementById('js-code').value + "<\/script>";
    
    const outputFrame = document.getElementById('output');
    const outDoc = outputFrame.contentWindow.document;
    
    outDoc.open();
    outDoc.write(html + css + js);
    outDoc.close();
}

// --- 4. NAVIGATION & UI FUNCTIONS ---

// Close Preview Overlay
function closePreview() {
    const overlay = document.getElementById('preview-overlay');
    if (overlay) overlay.style.display = 'none';
}

// Toggle Settings Panel
function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    if (panel) panel.classList.toggle('open');
}

// Device View Switcher (Desktop/Mobile)
function setDevice(mode) {
    const wrapper = document.getElementById('wrapper');
    if (wrapper) {
        wrapper.className = 'iframe-wrapper ' + (mode === 'mobile' ? 'mobile' : '');
    }
}

// Beautify HTML (Simple Formatter)
function beautifyCode() {
    const h = document.getElementById('html-code');
    if (h) {
        h.value = h.value.replace(/>\s+</g, '><').replace(/(<[^>]+>)/g, '$1\n').trim();
        alert("HTML Code Formatted!");
    }
}

// Export Code as index.html
function exportCode() {
    const html = document.getElementById('html-code').value;
    const css = document.getElementById('css-code').value;
    const js = document.getElementById('js-code').value;

    const fullContent = `<!DOCTYPE html>
<html>
<head>
    <style>${css}</style>
</head>
<body>
    ${html}
    <script>${js}<\/script>
</body>
</html>`;

    const blob = new Blob([fullContent], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "index.html";
    link.click();
}

// Update Font Size from Settings
function updateEditorStyles() {
    const fontSize = document.getElementById('font-size-sel').value;
    document.querySelectorAll('textarea').forEach(tx => {
        tx.style.fontSize = fontSize;
    });
}

// --- 5. GLOBAL EVENT LISTENERS ---

// Close Settings Panel when clicking outside
document.addEventListener('mousedown', function(e) {
    const panel = document.getElementById('settingsPanel');
    const settingsBtn = document.querySelector('.fa-sliders-h')?.parentElement;
    
    if (panel && panel.classList.contains('open')) {
        if (!panel.contains(e.target) && (!settingsBtn || !settingsBtn.contains(e.target))) {
            panel.classList.remove('open');
        }
    }
});

// Shortcut Key: Ctrl + Enter to Run Code
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
        runCode();
    }
});

console.log("Craby Editor Ultra JS Loaded Successfully!");
