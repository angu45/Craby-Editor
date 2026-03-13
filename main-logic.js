/* ==========================================
   1. FILE SYSTEM (Add to Stack)
   ========================================== */

window.addFileToUI = function(name, id, content = "") {
    const wrapper = document.getElementById('editor-wrapper');
    if(!wrapper) return;

    // Check if box already exists to avoid duplicates
    if(document.getElementById(`box-${id}`)) return;

    const newBox = document.createElement('div');
    newBox.className = 'editor-box';
    newBox.id = `box-${id}`;
    
    // Simple UI with -, Expand, and Trash as per your photo
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
        <button class="exit-full-btn" id="exit-${id}" onclick="toggleFullscreen('${id}')" style="display:none;">EXIT FULLSCREEN</button>
    `;
    
    wrapper.appendChild(newBox);
    
    // Add to Sidebar too
    updateSidebarList(name, id);
    if(window.updateThemeAndFont) window.updateThemeAndFont();
};

function updateSidebarList(name, id) {
    const fileList = document.getElementById('file-list');
    const item = document.createElement('div');
    item.className = 'file-item';
    item.id = `tab-${id}`;
    item.innerHTML = `<i class="fas fa-file-code"></i> ${name}`;
    item.onclick = () => {
        // Scroll to that specific box instead of hiding others
        document.getElementById(`box-${id}`).scrollIntoView({ behavior: 'smooth' });
    };
    fileList.appendChild(item);
}

window.createNewFile = function() {
    const name = prompt("Enter file name (e.g. script.js):");
    if(name) {
        const id = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        window.addFileToUI(name, id, "");
    }
};

/* ==========================================
   2. WINDOW ACTIONS
   ========================================== */

window.minimizeBox = function(id) {
    const area = document.getElementById(`${id}-code`);
    // Toggle only the textarea height for "Minimize" effect
    if(area.style.display === 'none') {
        area.style.display = 'block';
    } else {
        area.style.display = 'none';
    }
};

window.deleteFile = function(id) {
    if(confirm("Delete this window?")) {
        document.getElementById(`box-${id}`).remove();
        const tab = document.getElementById(`tab-${id}`);
        if(tab) tab.remove();
    }
};

window.toggleFullscreen = function(id) {
    const box = document.getElementById(`box-${id}`);
    const exitBtn = document.getElementById(`exit-${id}`);
    box.classList.toggle('fullscreen-mode');
    exitBtn.style.display = box.classList.contains('fullscreen-mode') ? 'block' : 'none';
};

/* ==========================================
   3. INITIAL LOAD
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Clear everything first
    document.getElementById('editor-wrapper').innerHTML = '';
    document.getElementById('file-list').innerHTML = '';

    // Default Stacks (One below another)
    window.addFileToUI("index.html", "html", "<h1>Craby Editor</h1>");
    window.addFileToUI("style.css", "css", "h1 { color: orange; }");
    window.addFileToUI("main.js", "js", "console.log('Hello');");
});
