// --- 1. SHUTTER (LEFT SIDEBAR) ---
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

function updateShutterFileList(name, id) {
    const list = document.getElementById('shutter-file-list');
    if (!list) return;
    const item = document.createElement('div');
    item.className = 'shutter-item';
    item.innerHTML = `<span><i class="fas fa-file-code"></i> ${name}</span>`;
    item.onclick = () => { restoreBox(id); toggleShutter(); };
    list.appendChild(item);
}

function addNewFilePrompt() {
    const fileName = prompt("File Name (e.g. script.js):");
    if (fileName) {
        // Generating a unique safe ID for the new file
        const id = fileName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        // Checking if extension exists to determine type
        const type = fileName.split('.').pop();
        
        // This assumes addFileToUI is available in main-logic.js
        if(typeof addFileToUI === "function") {
            addFileToUI(fileName, type, "");
        }
    }
}

// --- 2. SETTINGS PANEL & LOCALSTORAGE LOGIC ---

// Function to save all settings to localStorage
function saveSettings() {
    const settings = {
        theme: document.getElementById('theme-sel').value,
        fontSize: document.getElementById('font-size-range').value,
        fontFamily: document.getElementById('font-family-sel').value,
        visibility: {
            html: document.getElementById('chk-html').checked,
            css: document.getElementById('chk-css').checked,
            js: document.getElementById('chk-js').checked
        }
    };
    localStorage.setItem('craby_settings', JSON.stringify(settings));
}

// Function to load settings from localStorage
function loadSettings() {
    const saved = localStorage.getItem('craby_settings');
    if (!saved) return;

    const settings = JSON.parse(saved);

    // Apply Theme
    if(settings.theme) document.getElementById('theme-sel').value = settings.theme;
    
    // Apply Font Size
    if(settings.fontSize) {
        document.getElementById('font-size-range').value = settings.fontSize;
        document.getElementById('font-size-val').innerText = settings.fontSize + "px";
        updateFontSize(settings.fontSize);
    }

    // Apply Font Family
    if(settings.fontFamily) document.getElementById('font-family-sel').value = settings.fontFamily;

    // Apply Visibility Checks
    if(settings.visibility) {
        document.getElementById('chk-html').checked = settings.visibility.html;
        document.getElementById('chk-css').checked = settings.visibility.css;
        document.getElementById('chk-js').checked = settings.visibility.js;
        updateVisibility();
    }

    // Apply Visuals
    if(typeof updateThemeAndFont === "function") updateThemeAndFont();
}

function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    if (!panel) return;

    if (panel.style.display === 'none' || !panel.classList.contains('open')) {
        panel.style.display = 'block';
        setTimeout(() => panel.classList.add('open'), 10);
    } else {
        panel.classList.remove('open');
        setTimeout(() => {
            panel.style.display = 'none';
            saveSettings(); // Save settings automatically when panel closes
        }, 300);
    }
}

function updateVisibility() {
    // Note: This logic depends on the IDs generated in main-logic.js
    const htmlBox = document.querySelector('[id*="index-html"]')?.closest('.window-frame');
    const cssBox = document.querySelector('[id*="style-css"]')?.closest('.window-frame');
    const jsBox = document.querySelector('[id*="script-js"]')?.closest('.window-frame');

    if(htmlBox) htmlBox.style.display = document.getElementById('chk-html').checked ? 'flex' : 'none';
    if(cssBox) cssBox.style.display = document.getElementById('chk-css').checked ? 'flex' : 'none';
    if(jsBox) jsBox.style.display = document.getElementById('chk-js').checked ? 'flex' : 'none';
}

function updateFontSize(val) {
    document.getElementById('font-size-val').innerText = val + "px";
    document.querySelectorAll('textarea').forEach(tx => {
        tx.style.fontSize = val + "px";
    });
}

// --- 3. RESET FUNCTION ---
function resetAllSettings() {
    if(confirm("Are you sure you want to reset all settings to default?")) {
        localStorage.removeItem('craby_settings');
        alert("Settings Reset! The page will now reload.");
        location.reload();
    }
}

function closePreview() {
    document.getElementById('preview-overlay').style.display = 'none';
}

function setPreviewSize(width) {
    const frame = document.getElementById('output-frame');
    if(frame) frame.style.width = width;
}

// --- 4. INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
    // Add Reset Button to settings panel dynamically if not present in HTML
    const settingsPanel = document.getElementById('settingsPanel');
    if (settingsPanel && !document.getElementById('reset-btn')) {
        const resetBtn = document.createElement('button');
        resetBtn.id = 'reset-btn';
        resetBtn.className = 'add-btn';
        resetBtn.style.backgroundColor = '#ff4d4d';
        resetBtn.style.marginTop = '10px';
        resetBtn.innerHTML = '<i class="fas fa-undo"></i> RESET ALL SETTINGS';
        resetBtn.onclick = resetAllSettings;
        settingsPanel.appendChild(resetBtn);
    }

    loadSettings();
});
