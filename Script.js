// --- CONFIGURATION ---
const VERCEL_PROJECT_ID = "prj_meM3Eo45r76ByCNXL5PHnEJrMZV8";

const dict = {
    html: { 
        tags: ['div','span','h1','h2','h3','p','button','input','img','a','section','article','header','footer','nav','ul','li','ol','main','canvas','form','label','select','textarea','table','tr','td','th'], 
        attrs: ['class','id','style','src','href','type','placeholder','onclick','value','name','required','alt','target','width','height'] 
    },
    css: { 
        props: ['background','color','margin','padding','display','flex','grid','border','width','height','font-size','position','top','left','opacity','transition','z-index','justify-content','align-items','text-align','border-radius'], 
        vals: ['block','none','flex','grid','center','relative','absolute','fixed','pointer','transparent','inherit','100%','100vh'] 
    },
    js: { 
        keys: ['function','const','let','var','console.log','document.getElementById','document.querySelector','addEventListener','window','setInterval','setTimeout','if','else','for','return','async','await','fetch','JSON.parse','Math.random'] 
    }
};

let selectedIdx = 0;
const sBox = document.getElementById('suggestion-box');

// --- CORE RUN LOGIC ---
function runCode() {
    const overlay = document.getElementById('preview-overlay');
    overlay.style.display = 'flex'; // Flow Screen Open Kara

    const h = document.getElementById('html-code').value;
    const c = `<style>${document.getElementById('css-code').value}</style>`;
    const j = `<script>${document.getElementById('js-code').value}<\/script>`;
    
    const out = document.getElementById('output').contentWindow.document;
    out.open();
    out.write(h + c + j);
    out.close();
}

function closePreview() {
    document.getElementById('preview-overlay').style.display = 'none';
}

function setDevice(mode) {
    const wrapper = document.getElementById('wrapper');
    wrapper.className = 'iframe-wrapper ' + (mode === 'mobile' ? 'mobile' : '');
}

// --- INPUT & AUTOCOMPLETE ---
function handleInput(el, lang) {
    const isLive = document.getElementById('live-toggle')?.checked;
    
    // Auto-close brackets/tags
    el.addEventListener('input', (e) => {
        const pos = el.selectionStart;
        const val = el.value;
        if (e.data === '{') {
            el.value = val.substring(0, pos) + '}' + val.substring(pos);
            el.selectionStart = el.selectionEnd = pos;
        }
        if (e.data === '(') {
            el.value = val.substring(0, pos) + ')' + val.substring(pos);
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
    
    let list = []; let type = '';
    if (lang === 'html') { list = dict.html.tags.concat(dict.html.attrs); type = 'html'; }
    else if (lang === 'css') { list = dict.css.props.concat(dict.css.vals); type = 'css'; }
    else { list = dict.js.keys; type = 'js'; }

    const matches = list.filter(m => m.startsWith(lastWord));

    if (matches.length > 0 && lastWord.length > 0) {
        sBox.innerHTML = matches.map((m, i) => `
            <div class="suggestion-item ${i===0?'active':''}" onclick="insert('${m}','${el.id}')">
                <span>${m}</span><small style="opacity:0.5">${type}</small>
            </div>`).join('');
        sBox.style.display = 'block';
        sBox.style.top = (el.offsetTop + 40) + 'px';
        sBox.style.left = '40px';
        selectedIdx = 0;
    } else { sBox.style.display = 'none'; }
}

function insert(val, id) {
    const el = document.getElementById(id);
    const pos = el.selectionStart;
    const text = el.value;
    const lastWordMatch = text.substring(0, pos).match(/[\w.-]+$/);
    const start = lastWordMatch ? pos - lastWordMatch[0].length : pos;

    el.value = text.substring(0, start) + val + text.substring(pos);
    el.selectionStart = el.selectionEnd = start + val.length;
    sBox.style.display = 'none';
    el.focus();
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

// --- UTILS ---
function toggleSettings() { document.getElementById('settingsPanel').classList.toggle('open'); }

function beautifyCode() {
    const h = document.getElementById('html-code');
    h.value = h.value.replace(/>\s+</g, '><').replace(/(<[^>]+>)/g, '$1\n').trim();
    alert("Code Formatted!");
}

function exportCode() {
    const code = `<!DOCTYPE html><html><head><style>${document.getElementById('css-code').value}</style></head><body>${document.getElementById('html-code').value}<script>${document.getElementById('js-code').value}<\/script></body></html>`;
    const blob = new Blob([code], {type: "text/html"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "index.html";
    a.click();
}

// Close suggestion box on click outside
document.addEventListener('click', (e) => { if(!e.target.classList.contains('suggestion-item')) sBox.style.display = 'none'; });
