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

// --- 2. SETTINGS PANEL (RIGHT SIDEBAR) FIX ---
function toggleSettings() {
    // Tumchya HTML madhla correct ID 'settingsPanel' aahe
    const panel = document.getElementById('settingsPanel');
    
    if (!panel) {
        console.error("Settings panel ID 'settingsPanel' sapdla nahi!");
        return;
    }

    // CSS transition work honyasathi display block asne garjeche aahe
    if (panel.style.display === 'none' || panel.style.display === '') {
        panel.style.display = 'block';
        // Thoda delay jyamule transition effect disel
        setTimeout(() => {
            panel.classList.add('open');
        }, 10);
    } else {
        panel.classList.remove('open');
        // Animation purn jhalya var display none karne
        setTimeout(() => {
            panel.style.display = 'none';
        }, 300);
    }
    
    // Jar shutter open asel tar band karne
    const shutter = document.getElementById('shutter');
    if (shutter && shutter.classList.contains('open')) {
        shutter.classList.remove('open');
        document.getElementById('shutter-trigger').style.left = '0';
    }
}

// Settings: Editors Show/Hide
function updateVisibility() {
    const htmlBox = document.getElementById('box-html');
    const cssBox = document.getElementById('box-css');
    const jsBox = document.getElementById('box-js');

    if(htmlBox) htmlBox.style.display = document.getElementById('chk-html').checked ? 'flex' : 'none';
    if(cssBox) cssBox.style.display = document.getElementById('chk-css').checked ? 'flex' : 'none';
    if(jsBox) jsBox.style.display = document.getElementById('chk-js').checked ? 'flex' : 'none';
}

// Settings: Theme aani Font Change
function updateThemeAndFont() {
    const fontFamily = document.getElementById('font-family-sel').value;
    const theme = document.getElementById('theme-sel').value;
    const textareas = document.querySelectorAll('textarea');

    textareas.forEach(ta => {
        ta.style.fontFamily = fontFamily;
    });
    // Yethil theme logic main-logic.js madhle asave
}

// --- 3. OTHER ACTIONS ---
function runCode() {
    const overlay = document.getElementById('preview-overlay');
    if (overlay) overlay.style.display = 'flex';
    if (typeof updatePreview === "function") updatePreview();
}

function closePreview() {
    document.getElementById('preview-overlay').style.display = 'none';
}

function exportCode() {
    if (typeof downloadProject === "function") downloadProject();
    else alert("Project Exporting...");
}

// --- 4. INITIAL SYNC ---
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const list = document.getElementById('shutter-file-list');
        if(list) {
            // Default list items yethil
            const files = ["index.html", "style.css", "main.js"];
            files.forEach(f => {
                const div = document.createElement('div');
                div.className = 'shutter-item';
                div.style.padding = "10px";
                div.style.cursor = "pointer";
                div.innerHTML = `<i class="fas fa-file-code"></i> ${f}`;
                list.appendChild(div);
            });
        }
    }, 1000);
});
