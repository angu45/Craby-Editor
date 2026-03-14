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
        const id = fileName.split('.')[0] + "-" + Math.floor(Math.random()*1000);
        addFileToUI(fileName, id, "");
        updateShutterFileList(fileName, id);
    }
}

// --- 2. SETTINGS PANEL (RIGHT SIDEBAR) ---
function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    if (!panel) return;

    if (panel.style.display === 'none' || !panel.classList.contains('open')) {
        panel.style.display = 'block';
        setTimeout(() => panel.classList.add('open'), 10);
    } else {
        panel.classList.remove('open');
        setTimeout(() => panel.style.display = 'none', 300);
    }
}

function updateVisibility() {
    const htmlBox = document.getElementById('box-html');
    const cssBox = document.getElementById('box-css');
    const jsBox = document.getElementById('box-js');

    if(htmlBox) htmlBox.style.display = document.getElementById('chk-html').checked ? 'flex' : 'none';
    if(cssBox) cssBox.style.display = document.getElementById('chk-css').checked ? 'flex' : 'none';
    if(jsBox) jsBox.style.display = document.getElementById('chk-js').checked ? 'flex' : 'none';
}

function closePreview() {
    document.getElementById('preview-overlay').style.display = 'none';
}
