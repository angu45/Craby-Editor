// --- 1. SETTINGS & THEMES ---
window.updateThemeAndFont = () => {
    const themeKey = document.getElementById('theme-sel').value;
    const font = document.getElementById('font-family-sel').value;
    const fontSize = document.getElementById('font-size-bar').value;
    
    document.getElementById('fs-display').innerText = fontSize + "px"; 
    const theme = window.themes[themeKey] || window.themes.dark;

    document.documentElement.style.setProperty('--bg', theme.bg);
    document.documentElement.style.setProperty('--panel', theme.panel);
    document.documentElement.style.setProperty('--accent', theme.accent);
    
    document.querySelectorAll('textarea').forEach(tx => {
        tx.style.fontFamily = font;
        tx.style.fontSize = fontSize + "px";
        tx.style.color = theme.text;
        tx.style.background = theme.bg;
    });
};

// --- 2. DYNAMIC LAYOUT ENGINE ---
window.updateLayout = () => {
    const wrapper = document.getElementById('editor-wrapper');
    const visibleBoxes = Array.from(wrapper.children).filter(box => box.style.display !== 'none');
    const count = visibleBoxes.length;

    if (count > 0) {
        const height = 100 / count;
        visibleBoxes.forEach(box => {
            box.style.flex = `1 1 ${height}%`;
            box.style.height = `${height}%`;
        });
    }
};

// --- 3. FILE SYSTEM (Add, Minimize, Delete, Create New) ---

// नवीन फाईल क्रिएट करण्यासाठी (Prompt)
window.createNewFile = () => {
    const fileName = prompt("Enter file name (e.g. script.js, about.html):");
    if (fileName) {
        const id = fileName.replace('.', '-').toLowerCase();
        window.addFileToUI(fileName, id, "");
        // फाईल बनवल्यावर शटर बंद करा
        window.toggleLeftSidebar();
    }
};

window.addFileToUI = (name, id, content = "") => {
    const wrapper = document.getElementById('editor-wrapper');
    const fileList = document.getElementById('file-list');
    
    if(!wrapper || document.getElementById(`box-${id}`)) return;

    // Sidebar Tab
    const item = document.createElement('div');
    item.className = 'file-item';
    item.id = `tab-${id}`;
    item.innerHTML = `<span><i class="fas fa-file-code"></i> ${name}</span> <small id="status-${id}" style="display:none; color:var(--accent)">(min)</small>`;
    item.onclick = () => window.restoreBox(id);
    fileList.appendChild(item);

    // Editor Box
    const newBox = document.createElement('div');
    newBox.className = 'editor-box';
    newBox.id = `box-${id}`;
    newBox.innerHTML = `
        <div class="label">
            <span>${name.toUpperCase()} <i class="fas fa-code"></i></span>
            <div class="box-controls">
                <i class="fas fa-minus" onclick="window.minimizeBox('${id}')"></i>
                <i class="fas fa-trash-alt" onclick="window.deleteBox('${id}')" style="color:#ff4d4d; margin-left:10px;"></i>
            </div>
        </div>
        <textarea id="${id}-code" spellcheck="false" oninput="localStorage.setItem('craby_code_${id}', this.value)">${content}</textarea>
    `;
    
    wrapper.appendChild(newBox);
    window.updateThemeAndFont();
    window.updateLayout();
};

window.minimizeBox = (id) => {
    document.getElementById(`box-${id}`).style.display = 'none';
    document.getElementById(`status-${id}`).style.display = 'inline';
    window.updateLayout();
};

window.restoreBox = (id) => {
    const box = document.getElementById(`box-${id}`);
    if(box) {
        box.style.display = 'flex';
        document.getElementById(`status-${id}`).style.display = 'none';
        window.updateLayout();
    }
};

window.deleteBox = (id) => {
    if(confirm(`तुम्हाला '${id}' फाईल डिलीट करायची आहे का?`)) {
        document.getElementById(`box-${id}`).remove();
        document.getElementById(`tab-${id}`).remove();
        localStorage.removeItem(`craby_code_${id}`);
        window.updateLayout();
    }
};

// --- 4. SHUTTER & MENU (Slide Logic) ---
window.toggleLeftSidebar = () => {
    const sb = document.getElementById('leftSidebar');
    const shutter = document.getElementById('shutterBtn');
    sb.classList.toggle('open');
    shutter.classList.toggle('active');
    shutter.querySelector('i').className = sb.classList.contains('open') ? 'fas fa-chevron-left' : 'fas fa-chevron-right';
};

window.toggleSettings = () => {
    document.getElementById('settingsPanel').classList.toggle('open');
};

// --- 5. INITIAL LOAD (Default 2 Files Only) ---
window.onload = () => {
    // स्क्रीन क्लीयर करणे
    document.getElementById('editor-wrapper').innerHTML = '';
    document.getElementById('file-list').innerHTML = '';

    // फक्त HTML आणि CSS लोड करणे
    const htmlData = localStorage.getItem('craby_code_html') || "<h1>Welcome to Craby</h1>";
    const cssData = localStorage.getItem('craby_code_css') || "h1 { color: orange; text-align: center; }";

    window.addFileToUI("index.html", "html", htmlData);
    window.addFileToUI("style.css", "css", cssData);

    window.updateThemeAndFont();
};
