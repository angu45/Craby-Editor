// --- 1. CONFIGURATION & THEME DATA ---
const themes = {
    dark: { bg: '#0d1117', panel: '#161b22', accent: '#ffb400', text: '#9cdcfe' },
    monokai: { bg: '#272822', panel: '#3e3d32', accent: '#f92672', text: '#f8f8f2' },
    dracula: { bg: '#282a36', panel: '#44475a', accent: '#bd93f9', text: '#f8f8f2' },
    midnight: { bg: '#020617', panel: '#1e293b', accent: '#38bdf8', text: '#f1f5f9' },
    solarized: { bg: '#002b36', panel: '#073642', accent: '#268bd2', text: '#859900' },
    nord: { bg: '#2e3440', panel: '#3b4252', accent: '#88c0d0', text: '#d8dee9' },
    matrix: { bg: '#000000', panel: '#001a00', accent: '#00ff00', text: '#00ff00' },
    'high-contrast': { bg: '#000000', panel: '#111111', accent: '#ffffff', text: '#ffffff' }
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

// --- 2. EDITOR VISIBILITY & THEME FUNCTIONS ---

function updateVisibility() {
    const htmlBox = document.getElementById('html-code').closest('.editor-box');
    const cssBox = document.getElementById('css-code').closest('.editor-box');
    const jsBox = document.getElementById('js-code').closest('.editor-box');

    htmlBox.style.display = document.getElementById('chk-html').checked ? 'flex' : 'none';
    cssBox.style.display = document.getElementById('chk-css').checked ? 'flex' : 'none';
    jsBox.style.display = document.getElementById('chk-js').checked ? 'flex' : 'none';
}

function updateThemeAndFont() {
    const themeKey = document.getElementById('theme-sel').value;
    const font = document.getElementById('font-family-sel').value;
    const theme = themes[themeKey];

    document.documentElement.style.setProperty('--bg', theme.bg);
    document.documentElement.style.setProperty('--panel', theme.panel);
    document.documentElement.style.setProperty('--accent', theme.accent);
    
    document.querySelectorAll('textarea').forEach(tx => {
        tx.style.fontFamily = font;
        tx.style.color = theme.text;
        tx.style.textShadow = `0 0 1px ${theme.accent}44`;
    });
}

// --- 3. AUTO-CLOSE & SUGGESTIONS LOGIC ---

document.querySelectorAll('textarea').forEach(txt => {
    txt.addEventListener('input', (e) => {
        const pos = txt.selectionStart;
        const val = txt.value;
        const char = e.data;
        currentLang = txt.id.split('-')[0];

        // Basic Auto-Pairs
        const pairs = { '{': '}', '(': ')', '[': ']', '"': '"', "'": "'" };
        if (pairs[char]) {
            txt.value = val.substring(0, pos) + pairs[char] + val.substring(pos);
            txt.selectionStart = txt.selectionEnd = pos;
        } 
        // HTML Tag Auto-Close
        else if (char === '>') {
            const lastPart = val.substring(0, pos);
            const match = lastPart.match(/<(\w+)>$/);
            if (match) {
                const tagName = match[1];
                const selfClosing = ['img', 'br', 'hr', 'input', 'link', 'meta'];
                if (!selfClosing.includes(tagName.toLowerCase())) {
                    txt.value = val.substring(0, pos) + `</${tagName}>` + val.substring(pos);
                    txt.selectionStart = txt.selectionEnd = pos;
                }
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

    if (lastWord.length < 1) {
        sBox.style.display = 'none';
        return;
    }

    const matches = dictionary[currentLang].filter(word => word.startsWith(lastWord));

    if (matches.length > 0) {
        selectedIdx = 0;
        const rect = txt.getBoundingClientRect();
        // Box position shifted to avoid covering text
        sBox.style.top = `${rect.top + 40}px`; 
        sBox.style.left = `${rect.left + 50}px`;
        sBox.style.display = 'block';

        sBox.innerHTML = matches.map((m, i) => 
            `<div class="suggestion-item ${i === 0 ? 'active' : ''}" onclick="insertWord('${m}', '${txt.id}')">
                <span>${m}</span> <small>${currentLang}</small>
            </div>`
        ).join('');
    } else {
        sBox.style.display = 'none';
    }
}

function insertWord(word, id) {
    const txt = document.getElementById(id);
    const pos = txt.selectionStart;
    const text = txt.value;
    const textBefore = text.substring(0, pos);
    const lastWordMatch = textBefore.match(/[\w.-]+$/);
    const startPos = lastWordMatch ? pos - lastWordMatch[0].length : pos;

    let wordToInsert = word;

    // Smart Symbol Insertion
    if (currentLang === 'html' && ['class', 'id', 'href', 'src', 'type', 'style'].includes(word)) {
        wordToInsert = word + '=""';
    } else if (currentLang === 'css' && dictionary.css.includes(word)) {
        wordToInsert = word + ': ;';
    }

    txt.value = text.substring(0, startPos) + wordToInsert + text.substring(pos);
    
    // Position Cursor
    if (wordToInsert.endsWith('=""')) {
        txt.selectionStart = txt.selectionEnd = startPos + word.length + 2;
    } else if (wordToInsert.endsWith(': ;')) {
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
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIdx = (selectedIdx + 1) % items.length;
            updateActive(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIdx = (selectedIdx - 1 + items.length) % items.length;
            updateActive(items);
        } else if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            if (items[selectedIdx]) items[selectedIdx].click();
        } else if (e.key === 'Escape') {
            sBox.style.display = 'none';
        }
    }
}

function updateActive(items) {
    items.forEach((it, i) => it.classList.toggle('active', i === selectedIdx));
}

// --- 4. NAVIGATION & TOOLS ---

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

// Global Event Listeners
document.addEventListener('mousedown', (e) => {
    const p = document.getElementById('settingsPanel');
    const b = document.querySelector('.fa-sliders-h')?.parentElement;
    if (p && p.classList.contains('open') && !p.contains(e.target) && (!b || !b.contains(e.target))) p.classList.remove('open');
    if (sBox && !sBox.contains(e.target)) sBox.style.display = 'none';
});

// Init on Load
window.onload = () => {
    updateVisibility(); 
    updateThemeAndFont();
};
