/* CRABY EDITOR - DYNAMIC LAYOUT & DOWNLOAD FIX
   हे लॉजिक स्क्रीनवर जेवढे टेक्स्टएरिया आहेत, त्याप्रमाणे बॉडीची जागा डिवाइड करेल.
*/

// --- 1. SETTINGS MANAGEMENT ---
window.applySettings = () => {
    const font = localStorage.getItem('craby_font') || "'Plus Jakarta Sans', sans-serif";
    const theme = localStorage.getItem('craby_theme') || "dark";
    const fontSize = localStorage.getItem('craby_font_size') || "14px";

    document.documentElement.style.setProperty('--current-font', font);
    document.body.className = `theme-${theme}`;
    
    document.querySelectorAll('textarea').forEach(tx => {
        tx.style.fontSize = fontSize;
    });

    if(document.getElementById('font-select')) document.getElementById('font-select').value = font;
    if(document.getElementById('theme-select')) document.getElementById('theme-select').value = theme;
    if(document.getElementById('size-select')) document.getElementById('size-select').value = fontSize;
};

// --- 2. DYNAMIC LAYOUT ENGINE (Divide Body Screen) ---
window.updateLayout = () => {
    const wrapper = document.getElementById('editor-wrapper');
    // फक्त तेच बॉक्सेस मोजा जे 'display: none' नाहीत
    const visibleBoxes = Array.from(wrapper.children).filter(box => box.style.display !== 'none');
    const count = visibleBoxes.length;

    if (count > 0) {
        const percentage = 100 / count;
        visibleBoxes.forEach(box => {
            box.style.flex = `1 1 ${percentage}%`;
            box.style.height = `${percentage}%`;
        });
    }
};

// --- 3. FILE & TEXTAREA LOGIC ---
window.addFileToUI = function(name, id, content = "") {
    const wrapper = document.getElementById('editor-wrapper');
    const fileList = document.getElementById('file-list');
    
    if(!wrapper || document.getElementById(`box-${id}`)) return;

    // Sidebar Tab
    const item = document.createElement('div');
    item.className = 'file-item';
    item.id = `tab-${id}`;
    item.innerHTML = `<i class="fas fa-file-code"></i> <span>${name}</span>`;
    item.onclick = () => window.restoreBox(id);
    fileList.appendChild(item);

    // Editor Box
    const newBox = document.createElement('div');
    newBox.className = 'editor-box';
    newBox.id = `box-${id}`;
    newBox.innerHTML = `
        <div class="label">
            <span>${name.toUpperCase()}</span>
            <div class="box-controls">
                <button onclick="minimizeBox('${id}')"><i class="fas fa-minus"></i></button>
                <button onclick="deleteFile('${id}')"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>
        <textarea id="${id}-code" spellcheck="false" oninput="localStorage.setItem('craby_code_${id}', this.value)">${content}</textarea>
    `;
    
    wrapper.appendChild(newBox);
    window.applySettings();
    window.updateLayout(); // जागा डिवाइड करण्यासाठी कॉल करा
};

window.minimizeBox = (id) => {
    const box = document.getElementById(`box-${id}`);
    box.style.display = 'none';
    window.updateLayout(); // एक बॉक्स कमी झाला की बाकीचे जागा पसरवून घेतील
};

window.restoreBox = (id) => {
    const box = document.getElementById(`box-${id}`);
    if(box) {
        box.style.display = 'flex';
        window.updateLayout(); // बॉक्स परत आला की जागा पुन्हा डिवाइड होईल
    }
};

window.deleteFile = (id) => {
    if(confirm(`Delete ${id}?`)) {
        document.getElementById(`box-${id}`).remove();
        document.getElementById(`tab-${id}`).remove();
        localStorage.removeItem(`craby_code_${id}`);
        window.updateLayout(); // फाईल गेल्यावर जागा री-मॅनेज करा
    }
};

// --- 4. DOWNLOAD BUTTON FIX (Tested) ---
window.downloadCode = () => {
    // व्हॅल्यूज गोळा करा
    const html = document.getElementById('html-code')?.value || '';
    const css = document.getElementById('css-code')?.value || '';
    const js = document.getElementById('js-code')?.value || '';
    
    // पूर्ण फाईल स्ट्रक्चर तयार करा
    const fullContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Craby Project</title>
    <style>
    ${css}
    </style>
</head>
<body>
    ${html}
    <script>
    ${js}
    </script>
</body>
</html>`;

    const blob = new Blob([fullContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = "index.html"; // डाऊनलोड होणाऱ्या फाईलचे नाव
    document.body.appendChild(a);
    a.click();
    
    // क्लीनअप
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
};

// --- 5. INITIALIZE ---
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('editor-wrapper').innerHTML = '';
    document.getElementById('file-list').innerHTML = '';

    window.addFileToUI("index.html", "html", localStorage.getItem('craby_code_html') || "<h1>Craby Editor</h1>");
    window.addFileToUI("style.css", "css", localStorage.getItem('craby_code_css') || "h1 { color: #ffb400; }");
    window.addFileToUI("main.js", "js", localStorage.getItem('craby_code_js') || "console.log('Ready');");
    
    window.applySettings();
});

// UI Toggles
window.toggleSettings = () => document.getElementById('settingsPanel').classList.toggle('open');
window.toggleLeftSidebar = () => {
    document.getElementById('leftSidebar').classList.toggle('open');
    document.getElementById('shutterBtn').classList.toggle('active');
};
