const dict = {
    html: { 
        tags: ['div','span','h1','h2','h3','p','button','input','img','a','section','article','header','footer','nav','ul','li','ol','main','canvas','video','audio','iframe','form','label','select','textarea','table','tr','td','th'], 
        attrs: ['class','id','style','src','href','type','placeholder','onclick','value','name','required','data-','alt','target','rel','width','height'] 
    },
    css: { 
        props: ['background','background-color','color','margin','padding','display','flex','grid','border','width','height','font-size','font-family','position','top','left','right','bottom','opacity','transition','z-index','overflow','box-shadow','border-radius','justify-content','align-items','text-align'], 
        vals: ['block','none','flex','grid','inline-block','center','relative','absolute','fixed','pointer','transparent','white','black','red','blue','100%','100vh','0.5','inherit'] 
    },
    js: { 
        keys: ['function','const','let','var','console.log','document.getElementById','document.querySelector','addEventListener','window','setInterval','setTimeout','if','else','for','while','return','async','await','fetch','JSON.parse','JSON.stringify','Math.random','localStorage.setItem','localStorage.getItem'] 
    }
};

let selectedIdx = 0;
const sBox = document.getElementById('suggestion-box');

function handleInput(el, lang) {
    const isLive = document.getElementById('live-toggle').checked;
    
    el.addEventListener('input', (e) => {
        const pos = el.selectionStart;
        const val = el.value;
        if (e.data === '>') {
            const match = val.substring(0, pos).match(/<(\w+)[^>]*>$/);
            if (match && !['br','img','input','hr'].includes(match[1])) {
                el.value = val.substring(0, pos) + `</${match[1]}>` + val.substring(pos);
                el.selectionStart = el.selectionEnd = pos;
            }
        }
        if (e.data === '{') {
            el.value = val.substring(0, pos) + `}` + val.substring(pos);
            el.selectionStart = el.selectionEnd = pos;
        }
    }, {once: true});

    showSuggest(el, lang);
    if(isLive) runCode();
}

function showSuggest(el, lang) {
    const pos = el.selectionStart;
    const text = el.value.substring(0, pos);
    const lastWord = text.split(/[\s<>{}:;()]/).pop().toLowerCase();
    const line = text.split('\n').pop();

    let list = []; let type = '';
    if (lang === 'html') {
        if (line.match(/<(\w+)\s+[^>]*$/)) { list = dict.html.attrs; type = 'attr'; }
        else { list = dict.html.tags; type = 'tag'; }
    } else if (lang === 'css') {
        if (line.includes(':')) { list = dict.css.vals; type = 'val'; }
        else { list = dict.css.props; type = 'prop'; }
    } else { list = dict.js.keys; type = 'js'; }

    const matches = list.filter(m => m.startsWith(lastWord));

    if (matches.length > 0 && lastWord.length > 0) {
        sBox.innerHTML = matches.map((m, i) => `<div class="suggestion-item ${i===0?'active':''}" onclick="insert('${m}','${el.id}','${type}')"><span>${m}</span><small style="opacity:0.4">${type}</small></div>`).join('');
        sBox.style.display = 'block';
        sBox.style.top = (el.parentElement.offsetTop + 45) + 'px';
        sBox.style.left = '45px';
        selectedIdx = 0;
    } else { sBox.style.display = 'none'; }
}

function insert(val, id, type) {
    const el = document.getElementById(id);
    const pos = el.selectionStart;
    const text = el.value;
    const lastWordMatch = text.substring(0, pos).match(/[\w.-]+$/);
    const start = lastWordMatch ? pos - lastWordMatch[0].length : pos;

    let suffix = ""; let move = 0;
    if (type === 'attr') { suffix = '=""'; move = 1; }
    else if (type === 'prop') { suffix = ': ;'; move = 1; }
    else if (val === 'function') { suffix = ' () {}'; move = 4; }
    else if (val.includes('log') || val.includes('Get')) { suffix = '()'; move = 1; }

    el.value = text.substring(0, start) + val + suffix + text.substring(pos);
    el.selectionStart = el.selectionEnd = start + val.length + (suffix.length - move);
    sBox.style.display = 'none';
    el.focus();
    if(document.getElementById('live-toggle').checked) runCode();
}

function handleNav(e) {
    if (sBox.style.display === 'block') {
        const items = sBox.querySelectorAll('.suggestion-item');
        if (e.key === 'ArrowDown') { e.preventDefault(); selectedIdx = (selectedIdx + 1) % items.length; updateActive(items); }
        if (e.key === 'ArrowUp') { e.preventDefault(); selectedIdx = (selectedIdx - 1 + items.length) % items.length; updateActive(items); }
        if (e.key === 'Enter') { e.preventDefault(); items[selectedIdx].click(); }
        if (e.key === 'Escape') sBox.style.display = 'none';
    }
}

function updateActive(items) { items.forEach((it, i) => it.classList.toggle('active', i === selectedIdx)); }

function runCode() {
    const h = document.getElementById('html-code').value;
    const c = `<style>${document.getElementById('css-code').value}</style>`;
    const j = `<script>${document.getElementById('js-code').value}<\/script>`;
    const out = document.getElementById('output').contentWindow.document;
    out.open(); out.write(h + c + j); out.close();
}

function toggleBox(id, show) { document.getElementById(id).style.display = show ? 'flex' : 'none'; }

function updateEditorStyles() {
    const fs = document.getElementById('font-size-sel').value;
    const ff = document.getElementById('font-family-sel').value;
    document.querySelectorAll('textarea').forEach(tx => {
        tx.style.fontSize = fs;
        tx.style.fontFamily = ff;
    });
}

function beautifyCode() {
    const h = document.getElementById('html-code');
    h.value = h.value.replace(/>\s+</g, '><').replace(/(<[^>]+>)/g, '$1\n').trim();
    runCode();
}

function exportCode() {
    const code = `<!DOCTYPE html><html><head><style>${document.getElementById('css-code').value}</style></head><body>${document.getElementById('html-code').value}<script>${document.getElementById('js-code').value}<\/script></body></html>`;
    const blob = new Blob([code], {type: "text/html"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "index.html"; a.click();
}

function setDevice(m) { document.getElementById('wrapper').className = 'iframe-wrapper ' + (m==='mobile'?'mobile':''); }
function toggleSettings() { document.getElementById('settingsPanel').classList.toggle('open'); }

document.addEventListener('click', (e) => { if(!e.target.classList.contains('suggestion-item')) sBox.style.display = 'none'; });
window.onload = runCode;
