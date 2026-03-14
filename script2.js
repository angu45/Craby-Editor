// --- 1. GLOBAL VARIABLES ---
let currentLang = 'html';

// --- 2. SLIDER & PANEL TOGGLE LOGIC ---

// Shutter (Left Sidebar) Toggle
function toggleShutter() {
    const shutter = document.getElementById('shutter');
    const trigger = document.getElementById('shutter-trigger');
    
    shutter.classList.toggle('open');
    
    // Icon badalnyasaathi logic
    const icon = trigger.querySelector('i');
    if (shutter.classList.contains('open')) {
        icon.className = 'fas fa-chevron-left';
    } else {
        icon.className = 'fas fa-chevron-right';
    }
}

// Settings Panel (Right Sidebar) Toggle
function toggleSettings() {
    const panel = document.getElementById('settings-panel'); 
    // Jar tumchya HTML madhe ID 'settings-panel' nasel tar to add kara
    if (panel) {
        panel.classList.toggle('open');
    } else {
        // Temporary alert jar panel HTML madhe naseel tar
        alert("Settings Panel ID 'settings-panel' not found in HTML!");
    }
}

// --- 3. SMART FILE & GRID SYSTEM ---

// Navin file banavnyasathi function
function addNewFilePrompt() {
    const fileName = prompt("Enter file name (e.g. script.js or style.css):");
    if (fileName) {
        const id = fileName.split('.')[0] + Math.floor(Math.random() * 1000);
        const ext = fileName.split('.').pop();
        addFileToUI(fileName, id, "", ext);
    }
}

// File UI madhe add karne (Grid + Shutter List)
function addFileToUI(name, id, content = "", type = "html") {
    // A. Shutter (Taskbar) List madhe item add karne
    const shutterList = document.getElementById('shutter-file-list');
    const listItem = document.createElement('div');
    listItem.className = 'shutter-item';
    listItem.id = `tab-${id}`;
    listItem.innerHTML = `
        <span><i class="fas fa-file-code"></i> ${name}</span>
        <small id="status-${id}" style="display:none; color:var(--accent)">(minimized)</small>
    `;
    listItem.onclick = () => { restoreBox(id); toggleShutter(); };
    shutterList.appendChild(listItem);

    // B. Main Editor Grid madhe Box add karne
    const grid = document.getElementById('editor-grid');
    const frame = document.createElement('div');
    frame.className = 'window-frame';
    frame.id = `box-${id}`;
    frame.innerHTML = `
        <div class="window-header">
            <span class="window-title">${name.toUpperCase()} <i class="fas fa-code"></i></span>
            <div class="window-controls">
                <i class="fas fa-minus" onclick="minimizeBox('${id}')"></i>
                <i class="fas fa-expand" onclick="expandBox('${id}')"></i>
                <i class="fas fa-trash" onclick="deleteBox('${id}')"></i>
            </div>
        </div>
        <div class="window-body">
            <textarea id="${id}-code" spellcheck="false" placeholder="Type your ${type} code here...">${content}</textarea>
        </div>
    `;
    grid.appendChild(frame);
}

// --- 4. WINDOW CONTROLS ---

function minimizeBox(id) {
    document.getElementById(`box-${id}`).style.display = 'none';
    document.getElementById(`status-${id}`).style.display = 'inline';
}

function restoreBox(id) {
    document.getElementById(`box-${id}`).style.display = 'flex';
    document.getElementById(`status-${id}`).style.display = 'none';
}

function expandBox(id) {
    const box = document.getElementById(`box-${id}`);
    const allBoxes = document.querySelectorAll('.window-frame');
    
    if (box.classList.contains('fullscreen')) {
        box.classList.remove('fullscreen');
        allBoxes.forEach(b => b.style.display = 'flex');
    } else {
        allBoxes.forEach(b => {
            b.classList.remove('fullscreen');
            b.style.display = 'none';
        });
        box.classList.add('fullscreen');
        box.style.display = 'flex';
    }
}

function deleteBox(id) {
    if (confirm("Kharach file delete karaychi?")) {
        document.getElementById(`box-${id}`).remove();
        document.getElementById(`tab-${id}`).remove();
    }
}

// --- 5. PREVIEW & RUN ---

function runCode() {
    const overlay = document.getElementById('preview-overlay');
    overlay.style.display = 'flex';
    
    // Sagle code ekatra karne (Smart Logic)
    let html = "";
    let css = "<style>";
    let js = "<script>";
    
    document.querySelectorAll('textarea').forEach(tx => {
        if (tx.id.includes('html')) html += tx.value;
        if (tx.id.includes('css')) css += tx.value;
        if (tx.id.includes('js')) js += tx.value;
    });
    
    css += "</style>";
    js += "<\/script>";
    
    const frame = document.getElementById('output-frame');
    const doc = frame.contentWindow.document;
    doc.open();
    doc.write(html + css + js);
    doc.close();
}

function closePreview() {
    document.getElementById('preview-overlay').style.display = 'none';
}

// --- 6. INITIAL LOAD ---
window.onload = () => {
    // Default don files
    addFileToUI("index.html", "html-main", "<!DOCTYPE html>\n<html>\n<body>\n  <h1>Craby Editor</h1>\n</body>\n</html>", "html");
    addFileToUI("style.css", "css-main", "h1 { color: #ffb400; text-align: center; }", "css");
};
