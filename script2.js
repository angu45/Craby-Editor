// --- 1. SHUTTER (LEFT SIDEBAR) LOGIC ---

function toggleShutter() {
    const shutter = document.getElementById('shutter');
    const trigger = document.getElementById('shutter-trigger');
    
    if (!shutter) return;

    // Open/Close class toggle karne
    shutter.classList.toggle('open');

    // Trigger button cha icon aani position badalne
    const icon = trigger.querySelector('i');
    if (shutter.classList.contains('open')) {
        icon.className = 'fas fa-chevron-left';
        trigger.style.left = '300px'; // Shutter chya width pramane
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
        const ext = fileName.split('.').pop();
        
        // main-logic.js madhle function call karne
        if (typeof addFileToUI === "function") {
            addFileToUI(fileName, id, "");
            updateShutterFileList(fileName, id);
        }
    }
}

// Shutter madhli list update karne
function updateShutterFileList(name, id) {
    const list = document.getElementById('shutter-file-list');
    if (!list) return;

    const item = document.createElement('div');
    item.className = 'shutter-item';
    item.id = `tab-${id}`;
    item.innerHTML = `
        <span><i class="fas fa-file-code"></i> ${name}</span>
        <small id="status-${id}" style="display:none; color:var(--accent); font-size:10px;"> (minimized)</small>
    `;
    
    // File var click kelyavar ti restore honar
    item.onclick = () => {
        if (typeof restoreBox === "function") {
            restoreBox(id);
            toggleShutter(); // File select kelyavar shutter band honyasathi
        }
    };
    
    list.appendChild(item);
}

// --- 2. SETTINGS PANEL (RIGHT SIDEBAR) LOGIC ---

function toggleSettings() {
    const panel = document.getElementById('settings-panel');
    if (!panel) {
        console.error("Settings panel ID 'settings-panel' sapdla nahi!");
        return;
    }

    panel.classList.toggle('open');
    
    // Jar shutter open asel tar to band karne (Layout clean disto)
    const shutter = document.getElementById('shutter');
    if (shutter && shutter.classList.contains('open') && panel.classList.contains('open')) {
        toggleShutter();
    }
}

// --- 3. INITIAL SYNC ---

// Jevha page load hoil tevha default files shutter list madhe distil
window.addEventListener('DOMContentLoaded', () => {
    // Thoda vel thambun files list madhe add karne jyamule main-logic load jhalele asel
    setTimeout(() => {
        const defaultFiles = [
            { name: "index.html", id: "html" },
            { name: "style.css", id: "css" }
        ];

        defaultFiles.forEach(file => {
            if (document.getElementById(`box-${file.id}`)) {
                updateShutterFileList(file.name, file.id);
            }
        });
    }, 500);
});
