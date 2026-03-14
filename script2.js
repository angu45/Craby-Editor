// --- 1. SHUTTER (LEFT SIDEBAR) LOGIC ---
function toggleShutter() {
    const shutter = document.getElementById('shutter');
    const trigger = document.getElementById('shutter-trigger');
    
    if (!shutter) return;

    shutter.classList.toggle('open');

    const icon = trigger.querySelector('i');
    if (shutter.classList.contains('open')) {
        icon.className = 'fas fa-chevron-left';
        trigger.style.left = '300px'; 
    } else {
        icon.className = 'fas fa-chevron-right';
        trigger.style.left = '0';
    }
}

// Shutter madhun navin file create karnyache function
function addNewFilePrompt() {
    const fileName = prompt("Navin file che naav dya (e.g. index.html, style.css, main.js):");
    
    if (fileName && fileName.trim() !== "") {
        const id = fileName.split('.')[0].toLowerCase().replace(/\s+/g, '-') + "-" + Math.floor(Math.random() * 1000);
        
        // main-logic.js madhle function call karne
        if (typeof addFileToUI === "function") {
            addFileToUI(fileName, id, "");
            updateShutterFileList(fileName, id);
        }
    }
}

// Shutter list update karne
function updateShutterFileList(name, id) {
    const list = document.getElementById('shutter-file-list');
    if (!list) return;

    const item = document.createElement('div');
    item.className = 'shutter-item';
    item.id = `tab-${id}`;
    item.style.cssText = "padding:10px; margin-top:5px; background:rgba(255,255,255,0.05); border-radius:4px; cursor:pointer; font-size:13px; display:flex; justify-content:space-between;";
    item.innerHTML = `<span><i class="fas fa-file-code" style="color:var(--accent);"></i> ${name}</span>`;
    
    item.onclick = () => {
        if (typeof restoreBox === "function") {
            restoreBox(id);
            toggleShutter();
        }
    };
    list.appendChild(item);
}

// --- 2. SETTINGS PANEL (RIGHT SIDEBAR) FIX ---
function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    if (!panel) {
        console.error("Settings panel sapdla nahi!");
        return;
    }

    // Jar panel 'none' asel tar tyala aadhi 'block' karne jyamule animation disel
    if (window.getComputedStyle(panel).display === 'none') {
        panel.style.setProperty('display', 'block', 'important');
        // Thoda micro-delay jyamule browser toggle transition detect karel
        setTimeout(() => {
            panel.classList.add('open');
        }, 10);
    } else {
        // Jar open asel tar aadhi class kadhane
        panel.classList.remove('open');
        // Transition purn jhalya var (0.3s) display none karne
        setTimeout(() => {
            if (!panel.classList.contains('open')) {
                panel.style.display = 'none';
            }
        }, 300);
    }
    
    // Jar Shutter open asel tar tyala band karne (Clean layout sathi)
    const shutter = document.getElementById('shutter');
    if (shutter && shutter.classList.contains('open')) {
        toggleShutter();
    }
}

// Settings: Editors Show/Hide (Corrected IDs)
function updateVisibility() {
    // Tumchya main-logic.js madhye IDs 'box-html' ki 'box-css' asaveet
    const htmlBox = document.getElementById('box-html');
    const cssBox = document.getElementById('box-css');
    const jsBox = document.getElementById('box-js');

    const chkHtml = document.getElementById('chk-html');
    const chkCss = document.getElementById('chk-css');
    const chkJs = document.getElementById('chk-js');

    if(htmlBox && chkHtml) htmlBox.style.display = chkHtml.checked ? 'flex' : 'none';
    if(cssBox && chkCss) cssBox.style.display = chkCss.checked ? 'flex' : 'none';
    if(jsBox && chkJs) jsBox.style.display = chkJs.checked ? 'flex' : 'none';
}

// Settings: Theme aani Font Change (Conflict Avoided)
function changeAppearance() {
    const fontFamily = document.getElementById('font-family-sel').value;
    const themeKey = document.getElementById('theme-sel').value;
    
    // Sagle textareas shodhun tyancha font badalne
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(ta => {
        ta.style.fontFamily = fontFamily;
    });

    // Theme logic: Jar main-logic madhe function asel tar call karne
    if (typeof applyTheme === "function") {
        applyTheme(themeKey);
    } else {
        console.log("Theme applied: " + themeKey);
        // Basic theme change logic (example)
        document.documentElement.style.setProperty('--accent', themeKey === 'matrix' ? '#0f0' : '#ffb400');
    }
}

// --- 1. SHUTTER LOGIC (RE-ADDED FOR SAFETY) ---
function toggleShutter() {
    const shutter = document.getElementById('shutter');
    const trigger = document.getElementById('shutter-trigger');
    if (!shutter) return;

    shutter.classList.toggle('open');
    const icon = trigger.querySelector('i');
    
    if (shutter.classList.contains('open')) {
        icon.className = 'fas fa-chevron-left';
        trigger.style.left = '300px';
    } else {
        icon.className = 'fas fa-chevron-right';
        trigger.style.left = '0';
    }
}

// --- 3. CORE ACTION FUNCTIONS ---
function runCode() {
    const overlay = document.getElementById('preview-overlay');
    if (overlay) overlay.style.display = 'flex';
    
    // main-logic.js madhle run logic trigger karne
    const h = document.getElementById('html-code')?.value || '';
    const c = `<style>${document.getElementById('css-code')?.value || ''}</style>`;
    const j = `<script>${document.getElementById('js-code')?.value || ''}<\/script>`;
    const frame = document.getElementById('output-frame');
    if(frame) {
        const out = frame.contentWindow.document;
        out.open(); out.write(h + c + j); out.close();
    }
}

function closePreview() {
    const overlay = document.getElementById('preview-overlay');
    if (overlay) overlay.style.display = 'none';
}

function exportCode() {
    const html = document.getElementById('html-code')?.value || '';
    const blob = new Blob([html], {type: "text/html"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "index.html";
    a.click();
}

function beautifyCode() {
    document.querySelectorAll('textarea').forEach(tx => {
        tx.value = tx.value.replace(/>\s+</g, '><').replace(/</g, '>\n<').replace(/;/g, ';\n  ');
    });
}

// --- 4. INITIAL SYNC ---
window.addEventListener('DOMContentLoaded', () => {
    // Default Shutter Items
    setTimeout(() => {
        const defaultFiles = [
            { name: "index.html", id: "html" },
            { name: "style.css", id: "css" },
            { name: "main.js", id: "js" }
        ];

        defaultFiles.forEach(file => {
            if (document.getElementById(`box-${file.id}`)) {
                updateShutterFileList(file.name, file.id);
            }
        });
    }, 1000);
});
