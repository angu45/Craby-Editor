/* --- 1. SETTINGS & STORAGE --- */
window.applySettings = () => {
    const font = localStorage.getItem('craby_font') || "'Plus Jakarta Sans', sans-serif";
    const theme = localStorage.getItem('craby_theme') || "dark";
    document.body.className = `theme-${theme}`;
    document.documentElement.style.setProperty('--current-font', font);
    document.querySelectorAll('textarea').forEach(t => t.style.fontSize = localStorage.getItem('craby_font_size') || "14px");
};

/* --- 2. UI ENGINE --- */
window.addFileToUI = function(name, id, content = "") {
    const wrapper = document.getElementById('editor-wrapper');
    if(!wrapper || document.getElementById(`box-${id}`)) return;

    const newBox = document.createElement('div');
    newBox.className = 'editor-box';
    newBox.id = `box-${id}`;
    newBox.innerHTML = `
        <div class="label" style="background:#010409; padding:10px; color:var(--accent); font-weight:800; display:flex; justify-content:space-between;">
            <span>${name.toUpperCase()}</span>
            <div class="box-controls">
                <button onclick="minimizeBox('${id}')" style="background:none; border:none; color:#fff; margin-right:10px;">-</button>
                <button onclick="deleteFile('${id}')" style="background:none; border:none; color:#fff;">×</button>
            </div>
        </div>
        <textarea id="${id}-code" spellcheck="false" oninput="localStorage.setItem('craby_code_${id}', this.value)" style="width:100%; flex:1; background:transparent; border:none; color:#9cdcfe; padding:15px; outline:none; font-family:monospace;">${content}</textarea>
    `;
    wrapper.appendChild(newBox);
    window.applySettings();
};

/* --- 3. RUN & PREVIEW FIX --- */
window.runCode = () => {
    const overlay = document.getElementById('preview-overlay');
    overlay.style.display = 'flex';
    
    const h = document.getElementById('html-code')?.value || '';
    const c = `<style>${document.getElementById('css-code')?.value || ''}</style>`;
    const j = `<script>${document.getElementById('js-code')?.value || ''}<\/script>`;
    
    const out = document.getElementById('output').contentWindow.document;
    out.open(); out.write(h + c + j); out.close();
};

window.closePreview = () => {
    document.getElementById('preview-overlay').style.display = 'none';
};

/* --- 4. INITIALIZE --- */
document.addEventListener('DOMContentLoaded', () => {
    // Clear and Reload Default Files to fix visual clutter
    const wrap = document.getElementById('editor-wrapper');
    if(wrap) wrap.innerHTML = ''; 

    window.addFileToUI("index.html", "html", localStorage.getItem('craby_code_html') || "<h1>Ready</h1>");
    window.addFileToUI("style.css", "css", localStorage.getItem('craby_code_css') || "h1 { color: orange; }");
    
    window.applySettings();
});
