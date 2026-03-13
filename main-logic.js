
// --- 2. SIDEBARS & SETTINGS LOGIC ---
function toggleLeftSidebar() {
    const sb = document.getElementById('leftSidebar');
    const shutter = document.getElementById('shutterBtn');
    sb.classList.toggle('open');
    shutter.classList.toggle('active');
    shutter.querySelector('i').className = sb.classList.contains('open') ? 'fas fa-chevron-left' : 'fas fa-chevron-right';
}

function toggleSettings() {
    document.getElementById('settingsPanel').classList.toggle('open');
}

function updateVisibility() {
    // Shutter मधील फाईल्सच्या निवडीनुसार एडिटर दाखवणे/लपवणे
    const editors = {
        'html': document.getElementById('box-html'),
        'css': document.getElementById('box-css'),
        'js': document.getElementById('box-js')
    };
    
    if(document.getElementById('chk-html')) editors.html.style.display = document.getElementById('chk-html').checked ? 'flex' : 'none';
    if(document.getElementById('chk-css')) editors.css.style.display = document.getElementById('chk-css').checked ? 'flex' : 'none';
    if(document.getElementById('chk-js')) editors.js.style.display = document.getElementById('chk-js').checked ? 'flex' : 'none';
}

function updateThemeAndFont() {
    const themeKey = document.getElementById('theme-sel').value;
    const font = document.getElementById('font-family-sel').value;
    const fontSize = document.getElementById('font-size-bar').value;
    
    document.getElementById('fs-display').innerText = fontSize + "px"; 
    const theme = themes[themeKey] || themes.dark;

    document.documentElement.style.setProperty('--bg', theme.bg);
    document.documentElement.style.setProperty('--panel', theme.panel);
    document.documentElement.style.setProperty('--accent', theme.accent);
    document.documentElement.style.setProperty('--border-color', theme.border);
    
    document.querySelectorAll('textarea').forEach(tx => {
        tx.style.fontFamily = font;
        tx.style.fontSize = fontSize + "px"; // Slider fix applied here
        tx.style.color = theme.text;
        tx.style.background = theme.bg;
    });

    document.querySelectorAll('.label').forEach(label => {
        label.style.background = theme.panel;
        label.style.color = theme.accent;
    });

    document.querySelectorAll('.icon-btn i').forEach(icon => {
        icon.style.color = theme.accent;
    });
}

// --- 3. FILE SYSTEM & EDITOR CREATION ---
function addFileToUI(name, id, content = "") {
    // Shutter Explorer मध्ये फाईल ॲड करणे
    const fileList = document.getElementById('file-list');
    const newTab = document.createElement('div');
    newTab.className = 'file-item';
    newTab.id = `tab-${id}`;
    newTab.innerHTML = `<span><i class="fas fa-file-code"></i> ${name}</span> <small id="status-${id}" style="display:none; color:var(--accent)">(min)</small>`;
    newTab.onclick = () => restoreBox(id);
    fileList.appendChild(newTab);

    // Editor Wrapper मध्ये बॉक्स ॲड करणे
    const wrapper = document.getElementById('editor-wrapper');
    const newBox = document.createElement('div');
    newBox.className = 'editor-box';
    newBox.id = `box-${id}`;
    newBox.innerHTML = `
        <div class="label">
            <span>${name.toUpperCase()} <i class="fas fa-code"></i></span>
            <div class="window-controls">
                <i class="fas fa-minus" onclick="minimizeBox('${id}')"></i>
                <i class="fas fa-expand" onclick="expandBox('${id}')"></i>
                <i class="fas fa-trash" onclick="deleteBox('${id}')"></i>
            </div>
        </div>
        <textarea id="${id}-code" spellcheck="false">${content}</textarea>
    `;
    wrapper.appendChild(newBox);
    
    const txt = document.getElementById(`${id}-code`);
    attachInputListeners(txt);
}

function minimizeBox(id) { document.getElementById(`box-${id}`).style.display = 'none'; document.getElementById(`status-${id}`).style.display = 'inline'; }
function restoreBox(id) { document.getElementById(`box-${id}`).style.display = 'flex'; document.getElementById(`status-${id}`).style.display = 'none'; }
function expandBox(id) {
    const boxes = document.querySelectorAll('.editor-box');
    const current = document.getElementById(`box-${id}`);
    if (current.style.flex === "10") { boxes.forEach(b => b.style.flex = "1"); }
    else { boxes.forEach(b => b.style.flex = "0.1"); current.style.flex = "10"; current.style.display = "flex"; }
}
function deleteBox(id) { if(confirm("Delete this file?")) { document.getElementById(`box-${id}`).remove(); document.getElementById(`tab-${id}`).remove(); } }

// --- 4. EDITOR CORE & AUTO-COMPLETE ---
function attachInputListeners(txt) {
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
}

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
        sBox.style.top = `${rect.top + 35}px`; 
        sBox.style.left = `${rect.left + 40}px`;
        sBox.style.display = 'block';

        sBox.innerHTML = matches.map((m, i) => `<div class="suggestion-item ${i === 0 ? 'active' : ''}" onclick="insertWord('${m}', '${txt.id}')">
            <b>${m}</b> <small>${currentLang}</small>
        </div>`).join('');
    } else { sBox.style.display = 'none'; }
}

function insertWord(word, id) {
    const txt = document.getElementById(id);
    const pos = txt.selectionStart;
    const textBefore = txt.value.substring(0, pos);
    const lastWordMatch = textBefore.match(/[\w.-]+$/);
    const startPos = lastWordMatch ? pos - lastWordMatch[0].length : pos;
    let wordToInsert = word;

    if (currentLang === 'html') {
        const selfClosing = ['img', 'br', 'hr', 'input'];
        if (selfClosing.includes(word.toLowerCase())) wordToInsert = `<${word}>`;
        else if (['class', 'id', 'href', 'src'].includes(word)) wordToInsert = `${word}=""`;
        else wordToInsert = `<${word}></${word}>`;
    } else if (currentLang === 'css') wordToInsert = `${word}: ;`;

    txt.value = txt.value.substring(0, startPos) + wordToInsert + txt.value.substring(pos);
    sBox.style.display = 'none';
    txt.focus();
}

function handleNav(e, txt) {
    if (sBox.style.display === 'block') {
        const items = sBox.querySelectorAll('.suggestion-item');
        if (e.key === 'ArrowDown') { e.preventDefault(); selectedIdx = (selectedIdx + 1) % items.length; updateActive(items); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); selectedIdx = (selectedIdx - 1 + items.length) % items.length; updateActive(items); }
        else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); if (items[selectedIdx]) items[selectedIdx].click(); }
    }
}
function updateActive(items) { items.forEach((it, i) => it.classList.toggle('active', i === selectedIdx)); }

// --- 5. TOOLBAR ACTIONS ---
function runCode() {
    document.getElementById('preview-overlay').style.display = 'flex';
    const h = document.getElementById('html-code')?.value || '';
    const c = `<style>${document.getElementById('css-code')?.value || ''}</style>`;
    const j = `<script>${document.getElementById('js-code')?.value || ''}<\/script>`;
    const out = document.getElementById('output').contentWindow.document;
    out.open(); out.write(h + c + j); out.close();
}

function closePreview() { document.getElementById('preview-overlay').style.display = 'none'; }
function setDevice(m) { document.getElementById('wrapper').className = 'iframe-wrapper ' + (m==='mobile'?'mobile':''); }

function beautifyCode() {
    document.querySelectorAll('textarea').forEach(tx => {
        tx.value = tx.value.replace(/>\s+</g, '><').replace(/></g, '>\n<').replace(/;/g, ';\n  ');
    });
}

function exportCode() {
    const blob = new Blob([document.getElementById('html-code').value], {type: "text/html"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "index.html"; a.click();
}

// --- 6. INITIAL LOAD (Default 2 Files) ---
window.onload = () => { 
    // डिफॉल्ट फक्त १ HTML आणि १ CSS
    addFileToUI("index.html", "html", "<!DOCTYPE html>\n<html>\n<body>\n  <h1>Craby Editor</h1>\n</body>\n</html>");
    addFileToUI("style.css", "css", "h1 { color: #ffb400; text-align: center; font-family: sans-serif; }");
    
    // Theme आणि Slider रिफ्रेश
    document.getElementById('theme-sel').value = 'dark'; 
    updateThemeAndFont(); 
};

document.addEventListener('mousedown', (e) => { if (sBox && !sBox.contains(e.target)) sBox.style.display = 'none'; });
