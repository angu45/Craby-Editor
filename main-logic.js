/* CRABY EDITOR - FULL JAVASCRIPT LOGIC
   Features: Persistence, File Management, Download, and UI Toggles
*/

// --- 1. SETTINGS & THEME PERSISTENCE ---
window.applySettings = () => {
    // LocalStorage मधून डेटा मिळवणे किंवा Default व्हॅल्यू वापरणे
    const font = localStorage.getItem('craby_font') || "'Plus Jakarta Sans', sans-serif";
    const theme = localStorage.getItem('craby_theme') || "dark";
    const fontSize = localStorage.getItem('craby_font_size') || "14px";

    // CSS Variables आणि Body Class अपडेट करणे
    document.documentElement.style.setProperty('--current-font', font);
    document.body.className = `theme-${theme}`;
    
    // सर्व Textareas ची फॉन्ट साईज अपडेट करणे
    document.querySelectorAll('textarea').forEach(tx => {
        tx.style.fontSize = fontSize;
    });

    // Settings Panel मधील UI सिंक करणे
    if(document.getElementById('font-select')) document.getElementById('font-select').value = font;
    if(document.getElementById('theme-select')) document.getElementById('theme-select').value = theme;
    if(document.getElementById('size-select')) document.getElementById('size-select').value = fontSize;
};

// सेटिंग्ज बदलण्यासाठी फंक्शन्स
window.changeFont = (font) => { localStorage.setItem('craby_font', font); window.applySettings(); };
window.changeTheme = (theme) => { localStorage.setItem('craby_theme', theme); window.applySettings(); };
window.changeFontSize = (size) => { localStorage.setItem('craby_font_size', size); window.applySettings(); };

// Reset All Settings
window.resetAllSettings = () => {
    if(confirm("सर्व सेटिंग्ज पहिल्यासारख्या (Default) करायच्या आहेत का?")) {
        localStorage.removeItem('craby_font');
        localStorage.removeItem('craby_theme');
        localStorage.removeItem('craby_font_size');
        location.reload(); // पेज रिफ्रेश करून डिफॉल्ट अप्लाय करणे
    }
};

// --- 2. TEXTAREA & FILE LOGIC ---
window.saveHistory = (id, content) => {
    localStorage.setItem(`craby_code_${id}`, content);
};

window.addFileToUI = function(name, id, content = "") {
    const wrapper = document.getElementById('editor-wrapper');
    const fileList = document.getElementById('file-list');
    
    if(!wrapper || document.getElementById(`box-${id}`)) return;

    // Sidebar (Slider) मध्ये फाईल आयटम ॲड करणे
    const item = document.createElement('div');
    item.className = 'file-item';
    item.id = `tab-${id}`;
    item.innerHTML = `<i class="fas fa-file-code"></i> <span>${name}</span>`;
    item.onclick = () => window.restoreBox(id);
    fileList.appendChild(item);

    // मुख्य एडिटर बॉक्स (Textarea सह) तयार करणे
    const newBox = document.createElement('div');
    newBox.className = 'editor-box';
    newBox.id = `box-${id}`;
    newBox.innerHTML = `
        <div class="label">
            <span>${name.toUpperCase()}</span>
            <div class="box-controls">
                <button onclick="minimizeBox('${id}')" title="Minimize"><i class="fas fa-minus"></i></button>
                <button onclick="toggleFullscreen('${id}')" title="Fullscreen"><i class="fas fa-expand-arrows-alt"></i></button>
                <button onclick="deleteFile('${id}')" title="Delete"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>
        <textarea id="${id}-code" spellcheck="false" oninput="saveHistory('${id}', this.value)">${content}</textarea>
    `;
    wrapper.appendChild(newBox);
    window.applySettings(); // नवीन टेक्स्टएरियाला फॉन्ट साईज अप्लाय करणे
};

// Minimize, Restore आणि Delete
window.minimizeBox = (id) => {
    document.getElementById(`box-${id}`).style.display = 'none';
};

window.restoreBox = (id) => {
    const box = document.getElementById(`box-${id}`);
    if(box) {
        box.style.display = 'flex';
        box.scrollIntoView({ behavior: 'smooth' });
    }
};

window.deleteFile = (id) => {
    if(confirm(`तुम्हाला '${id}' फाईल कायमची डिलीट करायची आहे का?`)) {
        document.getElementById(`box-${id}`).remove();
        document.getElementById(`tab-${id}`).remove();
        localStorage.removeItem(`craby_code_${id}`);
    }
};

window.toggleFullscreen = (id) => {
    document.getElementById(`box-${id}`).classList.toggle('fullscreen-mode');
};

// --- 3. UI SLIDER & SIDEBAR TOGGLES ---
window.toggleLeftSidebar = () => {
    document.getElementById('leftSidebar').classList.toggle('open');
    document.getElementById('shutterBtn').classList.toggle('active');
};

window.toggleSettings = () => {
    document.getElementById('settingsPanel').classList.toggle('open');
};

// --- 4. RUN & DOWNLOAD LOGIC ---
window.runCode = () => {
    document.getElementById('preview-overlay').style.display = 'flex';
    const html = document.getElementById('html-code')?.value || '';
    const css = `<style>${document.getElementById('css-code')?.value || ''}</style>`;
    const js = `<script>${document.getElementById('js-code')?.value || ''}<\/script>`;
    
    const output = document.getElementById('output').contentWindow.document;
    output.open();
    output.write(html + css + js);
    output.close();
};

window.closePreview = () => {
    document.getElementById('preview-overlay').style.display = 'none';
};

window.downloadCode = () => {
    const html = document.getElementById('html-code')?.value || '';
    const css = `<style>${document.getElementById('css-code')?.value || ''}</style>`;
    const js = `<script>${document.getElementById('js-code')?.value || ''}<\/script>`;
    
    const fullCode = `<!DOCTYPE html>\n<html>\n<head>\n${css}\n</head>\n<body>\n${html}\n${js}\n</body>\n</html>`;
    
    const blob = new Blob([fullCode], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'craby_project.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

// --- 5. INITIALIZATION ON LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    // जुना कचरा साफ करणे
    document.getElementById('editor-wrapper').innerHTML = '';
    document.getElementById('file-list').innerHTML = '';

    // डिफॉल्ट फाईल्स लोड करणे (LocalStorage चेक करून)
    const defaultHTML = localStorage.getItem('craby_code_html') || "<h1>Craby Editor Ready!</h1>";
    const defaultCSS = localStorage.getItem('craby_code_css') || "h1 { color: #ffb400; text-align: center; }";
    const defaultJS = localStorage.getItem('craby_code_js') || "console.log('Hello from Craby!');";

    window.addFileToUI("index.html", "html", defaultHTML);
    window.addFileToUI("style.css", "css", defaultCSS);
    window.addFileToUI("main.js", "js", defaultJS);

    // युजरच्या जुन्या सेटिंग्ज अप्लाय करणे
    window.applySettings();
});

// फाईल रिफ्रेश करताना वॉर्निंग देणे
window.onbeforeunload = function() {
    return "तुमचा कोड सेव्ह झाला आहे का? पेज रिफ्रेश केल्यास बदल जाण्याची शक्यता आहे.";
};
