const dict = {
    html: { tags: ['div','span','h1','p','button','input','img','section','ul','li','br','a'] },
    css: { props: ['background','color','margin','padding','display','flex','width','height','border'] },
    js: { keys: ['function','const','let','console.log','document','if','else','addEventListener'] }
};

let selectedIdx = 0;
const sBox = document.getElementById('suggestion-box');
const enabled = { html: true, css: true, js: true };

function handleInput(el, lang) {
    const lines = el.value.split('\n').length;
    document.getElementById(lang + '-lines').innerHTML = Array.from({length: lines}, (_, i) => i + 1).join('<br>');
    
    // Auto End Tag HTML
    if (lang === 'html') {
        const pos = el.selectionStart;
        if (el.value[pos-1] === ">") {
            const textBefore = el.value.substring(0, pos);
            const tagMatch = textBefore.match(/<(\w+)[^>]*>$/);
            if (tagMatch && !["br","hr","img","input"].includes(tagMatch[1])) {
                el.value = el.value.substring(0, pos) + `</${tagMatch[1]}>` + el.value.substring(pos);
                el.selectionStart = el.selectionEnd = pos;
            }
        }
    }
    showSuggest(el, lang);
    if (document.getElementById('live-toggle').checked) runCode();
}

function updateFont() {
    const root = document.querySelector(':root');
    root.style.setProperty('--editor-font', document.getElementById('font-family').value);
    root.style.setProperty('--editor-size', document.getElementById('font-size').value + 'px');
}

function autoFormat(el, type) {
    let val = el.value;
    if(type === 'html') val = val.replace(/>\s+</g, '><').replace(/(<[^>]+>)/g, '$1\n').replace(/\n\s*\n/g, '\n');
    else if(type === 'css') val = val.replace(/\s*\{\s*/g, ' {\n    ').replace(/\s*;\s*/g, ';\n    ').replace(/\s*\}\s*/g, '\n}\n');
    el.value = val.trim();
    runCode();
}

function runCode() {
    const h = document.getElementById('html-code').value;
    const c = `<style>${document.getElementById('css-code').value}</style>`;
    const j = `<script>${document.getElementById('js-code').value}<\/script>`;
    const out = document.getElementById('output').contentWindow.document;
    out.open(); out.write(h + c + j); out.close();
}

function showSuggest(el, lang) {
    const pos = el.selectionStart;
    const text = el.value.substring(0, pos);
    const lastWord = text.split(/[\s<>{}:;()]/).pop().toLowerCase();
    if(!lastWord) { sBox.style.display = 'none'; return; }
    let list = (lang === 'html') ? dict.html.tags : (lang === 'css' ? dict.css.props : dict.js.keys);
    const matches = list.filter(m => m.toLowerCase().startsWith(lastWord));
    if (matches.length > 0) {
        sBox.innerHTML = matches.map((m, i) => `<div class="suggestion-item ${i===0?'active':''}" onclick="insert('${m}','${el.id}')">${m}</div>`).join('');
        sBox.style.display = 'block';
        sBox.style.top = (el.parentElement.parentElement.offsetTop + 40) + 'px';
        sBox.style.left = '50px';
        selectedIdx = 0;
    } else { sBox.style.display = 'none'; }
}

function insert(val, id) {
    const el = document.getElementById(id);
    const pos = el.selectionStart;
    const lastWordMatch = el.value.substring(0, pos).match(/[\w-]+$/);
    const start = lastWordMatch ? pos - lastWordMatch[0].length : pos;
    el.value = el.value.substring(0, start) + val + el.value.substring(pos);
    sBox.style.display = 'none';
    el.focus(); runCode();
}

function setDevice(m) { document.getElementById('preview-frame').className = 'iframe-container ' + (m==='mobile'?'mobile':''); }
function toggleSettings() { document.getElementById('settingsPanel').classList.toggle('open'); }
function exportCode() {
    const code = `<!DOCTYPE html><html><head><style>${document.getElementById('css-code').value}</style></head><body>${document.getElementById('html-code').value}<script>${document.getElementById('js-code').value}<\/script></body></html>`;
    const blob = new Blob([code], {type: "text/html"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "index.html"; a.click();
}

window.onload = runCode;
