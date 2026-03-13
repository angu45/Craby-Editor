function toggleLeftSidebar() {
    const sb = document.getElementById('leftSidebar');
    const shutter = document.getElementById('shutterBtn');
    sb.classList.toggle('open');
    shutter.classList.toggle('active');
    shutter.querySelector('i').className = sb.classList.contains('open') ? 'fas fa-chevron-left' : 'fas fa-chevron-right';
}

function addFileToUI(name, id, content = "") {
    const fileList = document.getElementById('file-list');
    const newTab = document.createElement('div');
    newTab.className = 'file-item';
    newTab.id = `tab-${id}`;
    newTab.innerHTML = `<span><i class="fas fa-file-code"></i> ${name}</span>`;
    newTab.onclick = () => restoreBox(id);
    fileList.appendChild(newTab);

    const wrapper = document.getElementById('editor-wrapper');
    const newBox = document.createElement('div');
    newBox.className = 'editor-box';
    newBox.id = `box-${id}`;
    newBox.innerHTML = `
        <div class="label">
            <span>${name.toUpperCase()}</span>
            <div class="window-controls">
                <i class="fas fa-minus" onclick="minimizeBox('${id}')"></i>
                <i class="fas fa-trash" onclick="deleteBox('${id}')"></i>
            </div>
        </div>
        <textarea id="${id}-code" spellcheck="false">${content}</textarea>
    `;
    wrapper.appendChild(newBox);
    
    // Core Engine मधील फंक्शन कॉल करणे
    if (typeof attachInputListeners === "function") {
        attachInputListeners(document.getElementById(`${id}-code`));
    }
    updateThemeAndFont();
}

function minimizeBox(id) { document.getElementById(`box-${id}`).style.display = 'none'; }
function restoreBox(id) { document.getElementById(`box-${id}`).style.display = 'flex'; }
function deleteBox(id) { if(confirm("Delete?")) { document.getElementById(`box-${id}`).remove(); document.getElementById(`tab-${id}`).remove(); }}
