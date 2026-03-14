// --- 1. GLOBAL CONFIGURATION & THEMES ---
const themes = {
    dark: { bg: '#0d1117', panel: '#161b22', accent: '#ffb400', text: '#9cdcfe', border: '#30363d' }, 
    light: { bg: '#ffffff', panel: '#f8fafc', accent: '#1e40af', text: '#0f172a', border: '#cbd5e1' },
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

const dictionary = {
    html: ['div', 'span', 'h1', 'p', 'a', 'img', 'button', 'input', 'section', 'header', 'footer', 'ul', 'li', 'script', 'link', 'meta', 'class', 'id', 'href', 'src', 'style'],
    css: ['color', 'background', 'margin', 'padding', 'display', 'flex', 'justify-content', 'align-items', 'position', 'width', 'height', 'border', 'font-size', 'font-family', 'z-index', 'opacity', 'transition', 'cursor'],
    js: ['console.log', 'document.getElementById', 'document.querySelector', 'addEventListener', 'function', 'const', 'let', 'var', 'if', 'else', 'forEach', 'map', 'fetch', 'setTimeout', 'setInterval']
};

// Create Suggestion Box
const sBox = document.createElement('div');
sBox.id = 'suggestion-box';
document.body.appendChild(sBox);

let selectedIdx = 0;
let currentLang = '';

// --- 2. THEME & UI INITIALIZATION ---
window.onload = () => {
    // 2 Editors Default: HTML ani CSS (JS hidden)
    document.getElementById('chk-html').checked = true;
    document.getElementById('chk-css').checked = true;
    document.getElementById('chk-js').checked = false;
    
    updateVisibility();
    updateThemeAndFont();
};

window.updateVisibility = function() {
    document.getElementById('html-code').parentElement.style.display = document.getElementById('chk-html').checked ? 'flex' : 'none';
    document.getElementById('css-code').parentElement.style.display = document.getElementById('chk-css').checked ? 'flex' : 'none';
    document.getElementById('js-code').parentElement.style.display = document.getElementById('chk-js').checked ? 'flex' : 'none';
};

window.updateThemeAndFont = function() {
    const themeKey = document.getElementById('theme-sel').value;
    const font = document.getElementById('font-family-sel').value;
    const fontSize = document.getElementById('font-size-bar').value;
    
    if(document.getElementById('fs-display')) document.getElementById('fs-display').innerText = fontSize + "px";

    const theme = themes[themeKey] || themes.dark;

    document.documentElement.style.setProperty('--bg', theme.bg);
    document.documentElement.style.setProperty('--panel', theme.panel);
    document.documentElement.style.setProperty('--accent', theme.accent);
    
    document.querySelectorAll('textarea').forEach(tx => {
        tx.style.fontFamily = font;
        tx.style.fontSize = fontSize + "px"; 
        tx.style.color = theme.text;
        tx.style.background = theme.bg;
        const eb = tx.closest('.editor-box');
        if(eb) eb.style.borderColor = theme.border;
    });

    document.querySelectorAll('.label').forEach(el => {
        el.style.background = theme.panel;
        el.style.color = theme.accent;
    });
};

// --- 3. CORE EDITOR LOGIC (AUTOCOMPLETE & TAGS) ---
document.querySelectorAll('textarea').forEach(txt => {
    txt.addEventListener('input', (e) => {
        const pos = txt.selectionStart;
        const val = txt.value;
        const char = e.data;
        currentLang = txt.id.split('-')[0];

        // 1. Auto Close Pairs
        const pairs = { '{': '}', '(': ')', '[': ']', '"': '"', "'": "'" };
        if (pairs[char]) {
            txt.value = val.substring(0, pos) + pairs[char] + val.substring(pos);
            txt.selectionStart = txt.selectionEnd = pos;
        } 
        
        // 2. HTML Tag Auto-close
        if (char === '>') {
            const match = val.substring(0, pos).match(/<(\w+)>$/);
            if (match && !['img', 'br', 'hr', 'input', 'link'].includes(match[1].toLowerCase())) {
                txt.value = val.substring(0, pos) + `</${match[1]}>` + val.substring(pos);
                txt.selectionStart = txt.selectionEnd = pos;
            }
        }
        showSuggestions(txt);
    });

    txt.addEventListener('keydown', (e) => {
        if (sBox.style.display === 'block') {
            const items = sBox.querySelectorAll('.suggestion-item');
            if (e.key === 'ArrowDown') { e.preventDefault(); selectedIdx = (selectedIdx + 1) % items.length; updateActiveItem(items); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); selectedIdx = (selectedIdx - 1 + items.length) % items.length; updateActiveItem(items); }
            else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); if (items[selectedIdx]) items[selectedIdx].click(); }
            else if (e.key === 'Escape') { sBox.style.display = 'none'; }
        }
    });
});

function showSuggestions(txt) {
    const pos = txt.selectionStart;
    const textBefore = txt.value.substring(0, pos);
    const words = textBefore.split(/[\s<>{}:;()]/);
    const lastWord = words[words.length - 1].toLowerCase();

    if (lastWord.length < 1) { sBox.style.display = 'none'; return; }

    const matches = dictionary[currentLang].filter(w => w.startsWith(lastWord));

    if (matches.length > 0) {
        selectedIdx = 0;
        const rect = txt.getBoundingClientRect();
        sBox.style.display = 'block';
        sBox.style.top = (rect.top + 50) + 'px';
        sBox.style.left = (rect.left + 50) + 'px';

        sBox.innerHTML = matches.map((m, i) => `
            <div class="suggestion-item ${i === 0 ? 'active' : ''}" onclick="insertWord('${m}', '${txt.id}')">
                <span>${m}</span> <small>${currentLang}</small>
            </div>
        `).join('');
    } else { sBox.style.display = 'none'; }
}

window.insertWord = function(word, id) {
    const txt = document.getElementById(id);
    const pos = txt.selectionStart;
    const textBefore = txt.value.substring(0, pos);
    const lastWordMatch = textBefore.match(/[\w.-]+$/);
    const startPos = lastWordMatch ? pos - lastWordMatch[0].length : pos;

    let finalWord = word;
    if (currentLang === 'html' && !['class','id','href'].includes(word)) finalWord = `<${word}></${word}>`;
    if (currentLang === 'css') finalWord = `${word}: ;`;

    txt.value = txt.value.substring(0, startPos) + finalWord + txt.value.substring(pos);
    txt.focus();
    sBox.style.display = 'none';
};

function updateActiveItem(items) {
    items.forEach((it, i) => it.classList.toggle('active', i === selectedIdx));
}

// --- 4. TOOLBAR & SIDEBAR (SHUTTER) ACTIONS ---
window.toggleLeftSidebar = () => {
    const sidebar = document.getElementById('leftSidebar');
    const shutter = document.getElementById('shutterBtn');
    if(sidebar) sidebar.classList.toggle('open');
    if(shutter) shutter.classList.toggle('active');
};

window.toggleSettings = () => {
    document.getElementById('settingsPanel').classList.toggle('open');
};

window.runCode = () => {
    const overlay = document.getElementById('preview-overlay');
    overlay.style.display = 'flex';
    const html = document.getElementById('html-code').value;
    const css = `<style>${document.getElementById('css-code').value}</style>`;
    const js = `<script>${document.getElementById('js-code').value}<\/script>`;
    const out = document.getElementById('output').contentWindow.document;
    out.open(); out.write(html + css + js); out.close();
};

window.closePreview = () => { document.getElementById('preview-overlay').style.display = 'none'; };

window.beautifyCode = () => {
    const editors = ['html-code', 'css-code', 'js-code'];
    editors.forEach(id => {
        const el = document.getElementById(id);
        // Simple regex-based beautification
        el.value = el.value.replace(/\s+/g, ' ').replace(/{/g, ' {\n  ').replace(/}/g, '\n}\n').replace(/;/g, ';\n  ').trim();
    });
    alert("Code formatted!");
};

window.exportCode = () => {
    const code = `<!DOCTYPE html><html><head><style>${document.getElementById('css-code').value}</style></head><body>${document.getElementById('html-code').value}<script>${document.getElementById('js-code').value}<\/script></body></html>`;
    const blob = new Blob([code], {type: "text/html"});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "craby-project.html";
    a.click();
};

window.setDevice = (mode) => {
    document.getElementById('wrapper').className = 'iframe-wrapper ' + (mode === 'mobile' ? 'mobile' : '');
};

// Global click to close suggestion box
document.addEventListener('mousedown', (e) => {
    if (!sBox.contains(e.target)) sBox.style.display = 'none';
});
