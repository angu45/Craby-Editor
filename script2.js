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
// Function to update the Shutter List manually (if needed)
function updateShutterFileList(name, id) {
    const list = document.getElementById('shutter-file-list');
    if (!list) return;
    
    const item = document.createElement('div');
    item.className = 'shutter-item';
    item.innerHTML = `<i class="fas fa-file-code"></i> <span>${name}</span>`;
    
    // Using addFileToUI to ensure the file opens/restores correctly
    item.onclick = () => { 
        if(typeof addFileToUI === "function") {
            const type = name.split('.').pop().toLowerCase();
            addFileToUI(name, type, files[name] ? files[name].content : "");
        }
        if(typeof toggleShutter === "function") toggleShutter(); 
    };
    list.appendChild(item);
}

// Fixed function to add new file and REFRESH Shutter automatically
function addNewFilePrompt() {
    const fileName = prompt("File Name (e.g. script.js):");
    
    if (fileName) {
        // Checking if file already exists in our global 'files' object
        if (typeof files !== "undefined" && files[fileName]) {
            alert("This file already exists!");
            return;
        }

        // Determine file type
        const type = fileName.split('.').pop().toLowerCase();

        // 1. Add file to the global logic (Main Object)
        if (typeof files !== "undefined") {
            files[fileName] = { content: "", type: type };
        }

        // 2. Open the file in UI
        if (typeof addFileToUI === "function") {
            addFileToUI(fileName, type, "");
        }

        // 3. AUTO-REFRESH Shutter List
        if (typeof updateTaskbar === "function") {
            updateTaskbar();
        } else {
            // Fallback if updateTaskbar is missing
            const safeId = fileName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
            updateShutterFileList(fileName, safeId);
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
// --- PAGE REFRESH WARNING FUNCTION ---
function enableExitWarning() {
    window.onbeforeunload = function (e) {
        const message = "Do you want to leave this page? Your unsaved changes might be lost.";
        e = e || window.event;
        if (e) {
            e.returnValue = message;
        }
        return message;
    };
}

enableExitWarning();

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
function beautifyCode() {
    // Select all textareas inside your editor grid
    const textareas = document.querySelectorAll('.editor-grid textarea');

    textareas.forEach(textarea => {
        let code = textarea.value.trim();
        const fileName = textarea.getAttribute('data-filename') || "";
        const id = textarea.id.toLowerCase();

        // 1. HTML Formatting Logic
        if (fileName.endsWith('.html') || id.includes('html')) {
            code = code
                .replace(/>\s+</g, '>\n<') // New line between tags
                .replace(/(<[^/][^>]*>)/g, '  $1') // Basic indent
                .split('\n').map(line => line.trim()).join('\n'); // Clean edges
        } 
        
        // 2. CSS Formatting Logic
        else if (fileName.endsWith('.css') || id.includes('css')) {
            code = code
                .replace(/\s*\{\s*/g, ' {\n  ') // Space before { and newline after
                .replace(/;\s*/g, ';\n  ')      // Newline after ;
                .replace(/\s*\}\s*/g, '\n}\n\n') // Newline before and after }
                .replace(/\s*:\s*/g, ': ');     // Space after :
        } 
        
        // 3. JavaScript Formatting Logic
        else if (fileName.endsWith('.js') || id.includes('js')) {
            code = code
                .replace(/;\s*/g, ';\n')        // Newline after semicolon
                .replace(/\{\s*/g, ' {\n  ')    // Newline after {
                .replace(/\}\s*/g, '\n}\n')     // Newline before }
                .replace(/,\s*/g, ', ');        // Space after comma
        }

        // Apply formatted code back to the UI
        textarea.value = code;

        // Sync with the global files object for saving/running
        if (typeof files !== "undefined" && fileName && files[fileName]) {
            files[fileName].content = code;
        }
    });
    
    // No alert notification shown as requested
}

/**
 * 2. DOWNLOAD FUNCTION
 * Targets the logic for the file-download action.
 * Shows a list of active files from your taskbar/files object.
 */
function exportCode() {
    // Accessing your global 'files' object from main-logic.js
    if (typeof files === "undefined" || Object.keys(files).length === 0) {
        alert("No files found in Taskbar to download.");
        return;
    }

    const fileList = Object.keys(files);
    let promptText = "Enter the number of the file you want to download:\n\n";
    
    fileList.forEach((name, index) => {
        promptText += `${index + 1}. ${name}\n`;
    });

    const choice = prompt(promptText);
    const selectedIndex = parseInt(choice) - 1;

    if (fileList[selectedIndex]) {
        const fileName = fileList[selectedIndex];
        const content = files[fileName].content;
        
        // Create the download trigger
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.style.display = 'none';
        a.href = url;
        // Setting the download name
        a.download = fileName; 
        
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } else if (choice !== null) {
        alert("Invalid selection. Please try again.");
    }
}

// Ensure the buttons in your header point to these functions
// (Your HTML already has onclick="beautifyCode()" and onclick="exportCode()")
