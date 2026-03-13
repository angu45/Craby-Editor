/* --- 1. STORAGE --- */
window.saveHistory = (id, content) => localStorage.setItem(`craby_code_${id}`, content);

/* --- 2. NEW FILE & WINDOW GENERATION (FIXED) --- */
window.addFileToUI = function(name, id, content = "") {
    const wrapper = document.getElementById('editor-wrapper');
    const fileList = document.getElementById('file-list');
    
    // Safety check
    if(!wrapper || document.getElementById(`box-${id}`)) return;

    // 1. Sidebar Item
    const item = document.createElement('div');
    item.className = 'file-item';
    item.id = `tab-${id}`;
    item.innerHTML = `<i class="fas fa-file-code"></i> <span>${name}</span>`;
    item.onclick = () => window.restoreBox(id);
    fileList.appendChild(item);

    // 2. Editor Box
    const newBox = document.createElement('div');
    newBox.className = 'editor-box';
    newBox.id = `box-${id}`;
    newBox.innerHTML = `
        <div class="label">
            <span>${name.toUpperCase()}</span>
            <div class="box-controls">
                <button onclick="minimizeBox('${id}')"><i class="fas fa-minus"></i></button>
                <button onclick="toggleFullscreen('${id}')"><i class="fas fa-expand-arrows-alt"></i></button>
                <button onclick="deleteFile('${id}')"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>
        <textarea id="${id}-code" spellcheck="false" oninput="saveHistory('${id}', this.value)">${content}</textarea>
        <button class="exit-full-btn" id="exit-${id}" onclick="toggleFullscreen('${id}')" style="display:none;">EXIT</button>
    `;
    wrapper.appendChild(newBox);
    
    // Apply theme and font settings
    if(window.updateThemeAndFont) window.updateThemeAndFont();
};

// FIXED: Function to create a brand new file
window.createNewFile = function() {
    let fileName = prompt("Enter file name (e.g. script.js):");
    if (fileName) {
        // Clean the ID (remove dots and spaces)
        let fileId = fileName.replace(/\./g, '-').replace(/\s+/g, '-').toLowerCase();
        
        if (document.getElementById(`box-${fileId}`)) {
            alert("File already exists!");
        } else {
            window.addFileToUI(fileName, fileId, "");
            window.restoreBox(fileId); // Focus on new file
        }
    }
};

/* --- 3. CONTROLS --- */
window.minimizeBox = (id) => {
    const box = document.getElementById(`box-${id}`);
    if(box) box.style.display = 'none';
};

window.restoreBox = (id) => {
    const box = document.getElementById(`box-${id}`);
    if(box) {
        box.style.display = 'flex';
        box.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

window.toggleFullscreen = (id) => {
    const box = document.getElementById(`box-${id}`);
    box.classList.toggle('fullscreen-mode');
    document.getElementById(`exit-${id}`).style.display = box.classList.contains('fullscreen-mode') ? 'block' : 'none';
};

window.toggleLeftSidebar = () => {
    document.getElementById('leftSidebar').classList.toggle('open');
    document.getElementById('shutterBtn').classList.toggle('active');
};

window.toggleSettings = () => document.getElementById('settingsPanel').classList.toggle('open');

/* --- 4. INIT --- */
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('editor-wrapper').innerHTML = '';
    document.getElementById('file-list').innerHTML = '';
    
    // Load default files
    window.addFileToUI("index.html", "html", localStorage.getItem('craby_code_html') || "<h1>Ready</h1>");
    window.addFileToUI("style.css", "css", localStorage.getItem('craby_code_css') || "h1 { color: orange; }");
});
