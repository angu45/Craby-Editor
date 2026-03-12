// --- 1. CONFIGURATION & ALL 12 THEMES ---
const themes = {
    dark: { bg: '#0d1117', panel: '#161b22', accent: '#ffb400', text: '#9cdcfe', border: '#30363d' }, // ATA HA DEFAULT AAHE
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

html: [
'a','alt','article','aside','audio',
'b','base','body','br','button',
'canvas','caption','cite','class','code','col','colgroup',
'datalist','dd','del','details','dfn','dialog','div','dl','dt',
'em','embed',
'fieldset','figcaption','figure','footer','form',
'h1','h2','h3','h4','h5','h6','head','header','height','hr','html','href',
'i','id','iframe','img','input',
'label','legend','li','link',
'main','map','mark','meta',
'name','nav',
'ol','onclick','optgroup','option',
'p','param','picture','placeholder','pre','progress',
'q',
'rel','required',
's','samp','script','section','select','small','source','span','strong','style','sub','summary','sup','svg',
'table','tbody','td','template','textarea','tfoot','th','thead','time','title','tr','track','type',
'u','ul',
'value','var','video',
'width'
],

css: [
'absolute','align-items','animation','background','background-color','border','border-radius',
'bottom','box-shadow','box-sizing',
'clear','color','column-count','column-gap','content','cursor',
'display',
'flex','flex-direction','flex-wrap','float','font','font-family','font-size','font-style','font-weight',
'gap','grid','grid-area','grid-template-columns','grid-template-rows',
'height',
'inline','inline-block',
'justify-content',
'left','letter-spacing','line-height',
'margin','margin-bottom','margin-left','margin-right','margin-top','max-height','max-width','min-height','min-width',
'none',
'opacity','overflow',
'padding','padding-bottom','padding-left','padding-right','padding-top','pointer','position',
'relative','right',
'text-align','text-decoration','text-transform','top','transform','transition','transparent',
'visibility',
'width','word-spacing',
'z-index'
],

js: [
'addEventListener','alert','Array','async','await',
'break',
'catch','class','clearInterval','clearTimeout','console','console.log','const','continue',
'Date','debugger','default','delete','document','document.getElementById','document.querySelector',
'else','export',
'fetch','finally','for','forEach','function',
'if','import','in','instanceof','isNaN',
'JSON','JSON.parse','JSON.stringify',
'let',
'map','Math','Math.floor','Math.random',
'new','null',
'Object',
'parseFloat','parseInt','pop','push',
'querySelector','querySelectorAll',
'return',
'setInterval','setTimeout','shift','slice','some','split','splice','String',
'this','throw','trim','try','typeof',
'undefined',
'var',
'window','while'
]


};


const sBox = document.createElement('div');
sBox.id = 'suggestion-box';
document.body.appendChild(sBox);

let selectedIdx = 0;
let currentLang = '';

// --- 2. THEME & VISIBILITY LOGIC ---
function updateVisibility() {
    document.getElementById('html-code').closest('.editor-box').style.display = document.getElementById('chk-html').checked ? 'flex' : 'none';
    document.getElementById('css-code').closest('.editor-box').style.display = document.getElementById('chk-css').checked ? 'flex' : 'none';
    document.getElementById('js-code').closest('.editor-box').style.display = document.getElementById('chk-js').checked ? 'flex' : 'none';
}

function updateThemeAndFont() {
    const themeKey = document.getElementById('theme-sel').value;
    const font = document.getElementById('font-family-sel').value;
    const theme = themes[themeKey] || themes.dark;

    document.documentElement.style.setProperty('--bg', theme.bg);
    document.documentElement.style.setProperty('--panel', theme.panel);
    document.documentElement.style.setProperty('--accent', theme.accent);
    document.documentElement.style.setProperty('--border-color', theme.border);
    
    document.querySelectorAll('textarea').forEach(tx => {
        tx.style.fontFamily = font;
        tx.style.color = theme.text;
        tx.style.background = theme.bg;
        tx.closest('.editor-box').style.borderColor = theme.border;
    });

    document.querySelectorAll('.label').forEach(label => {
        label.style.background = theme.panel;
        label.style.color = theme.accent;
    });

    document.querySelectorAll('.icon-btn i').forEach(icon => {
        icon.style.color = theme.accent;
    });
}

// --- 3. EDITOR CORE LOGIC ---
document.querySelectorAll('textarea').forEach(txt => {
    txt.addEventListener('input', (e) => {
        const pos = txt.selectionStart;
        const val = txt.value;
        const char = e.data;
        currentLang = txt.id.split('-')[0];

        const pairs = { '{': '}', '(': ')', '[': ']', '"': '"', "'": "'" };
        if (pairs[char]) {
            txt.value = val.substring(0, pos) + pairs[char] + val.substring(pos);
            txt.selectionStart = txt.selectionEnd = pos;
        } 
        else if (char === '>') {
            const match = val.substring(0, pos).match(/<(\w+)>$/);
            if (match && !['img', 'br', 'hr', 'input'].includes(match[1].toLowerCase())) {
                txt.value = val.substring(0, pos) + `</${match[1]}>` + val.substring(pos);
                txt.selectionStart = txt.selectionEnd = pos;
            }
        }
        showSuggestions(txt);
    });
    txt.addEventListener('keydown', (e) => handleNav(e, txt));
});

function showSuggestions(txt) {
    const pos = txt.selectionStart;
    const textBefore = txt.value.substring(0, pos);
    const words = textBefore.split(/[\s<>{}:;()]/);
    const lastWord = words[words.length - 1].toLowerCase();

    if (lastWord.length < 1) { sBox.style.display = 'none'; return; }

    const matches = dictionary[currentLang].filter(word => word.startsWith(lastWord));

    if (matches.length > 0) {
        selectedIdx = 0;
        const rect = txt.getBoundingClientRect();
        sBox.style.top = `${rect.top + 40}px`; 
        sBox.style.left = `${rect.left + 50}px`;
        sBox.style.display = 'block';

        sBox.innerHTML = matches.map((m, i) => {
            const themeKey = document.getElementById('theme-sel').value;
            let color = themeKey === 'light' ? "#1e40af" : "#79c0ff"; 
            if (currentLang === 'html') color = themeKey === 'light' ? "#b91c1c" : "#ff7b72"; 
            if (currentLang === 'css') color = themeKey === 'light' ? "#7e22ce" : "#d2a8ff";  

            return `<div class="suggestion-item ${i === 0 ? 'active' : ''}" onclick="insertWord('${m}', '${txt.id}')">
                <span style="color: ${color}; font-weight: bold;">${m}</span> 
                <small style="color: #64748b; margin-left:10px;">${currentLang}</small>
            </div>`;
        }).join('');
    } else { sBox.style.display = 'none'; }
}

function insertWord(word, id) {
    const txt = document.getElementById(id);
    const pos = txt.selectionStart;
    const lastWordMatch = txt.value.substring(0, pos).match(/[\w.-]+$/);
    const startPos = lastWordMatch ? pos - lastWordMatch[0].length : pos;

    let wordToInsert = word;
    if (currentLang === 'html' && ['class', 'id', 'href', 'src', 'type', 'style'].includes(word)) wordToInsert = word + '=""';
    else if (currentLang === 'css') wordToInsert = word + ': ;';

    txt.value = txt.value.substring(0, startPos) + wordToInsert + txt.value.substring(pos);
    
    if (wordToInsert.endsWith('=""') || wordToInsert.endsWith(': ;')) {
        txt.selectionStart = txt.selectionEnd = startPos + word.length + 2;
    } else {
        txt.selectionStart = txt.selectionEnd = startPos + wordToInsert.length;
    }
    sBox.style.display = 'none';
    txt.focus();
}

function handleNav(e, txt) {
    if (sBox.style.display === 'block') {
        const items = sBox.querySelectorAll('.suggestion-item');
        if (e.key === 'ArrowDown') { e.preventDefault(); selectedIdx = (selectedIdx + 1) % items.length; updateActive(items); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); selectedIdx = (selectedIdx - 1 + items.length) % items.length; updateActive(items); }
        else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); if (items[selectedIdx]) items[selectedIdx].click(); }
        else if (e.key === 'Escape') { sBox.style.display = 'none'; }
    }
}

function updateActive(items) { items.forEach((it, i) => it.classList.toggle('active', i === selectedIdx)); }

// --- 4. TOOLBAR ACTIONS ---
function runCode() {
    const overlay = document.getElementById('preview-overlay');
    overlay.style.display = 'flex';
    const h = document.getElementById('html-code').value;
    const c = `<style>${document.getElementById('css-code').value}</style>`;
    const j = `<script>${document.getElementById('js-code').value}<\/script>`;
    const out = document.getElementById('output').contentWindow.document;
    out.open(); out.write(h + c + j); out.close();
}

function closePreview() { document.getElementById('preview-overlay').style.display = 'none'; }
function toggleSettings() { document.getElementById('settingsPanel').classList.toggle('open'); }
function setDevice(m) { document.getElementById('wrapper').className = 'iframe-wrapper ' + (m==='mobile'?'mobile':''); }

function beautifyCode() {
    const h = document.getElementById('html-code');
    h.value = h.value.replace(/>\s+</g, '><').replace(/(<[^>]+>)/g, '$1\n').trim();
}

function exportCode() {
    const content = `<!DOCTYPE html><html><head><style>${document.getElementById('css-code').value}</style></head><body>${document.getElementById('html-code').value}<script>${document.getElementById('js-code').value}<\/script></body></html>`;
    const blob = new Blob([content], {type: "text/html"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "index.html"; a.click();
}

// --- 5. INITIALIZATION ---
window.onload = () => { 
    updateVisibility(); 
    // YETHE GITHUB DARK DEFAULT SET KELA AAHE
    document.getElementById('theme-sel').value = 'dark'; 
    updateThemeAndFont(); 
};

document.addEventListener('mousedown', (e) => {
    if (sBox && !sBox.contains(e.target)) sBox.style.display = 'none';
});

