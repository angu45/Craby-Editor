window.toggleLeftSidebar = function() {
    const sb = document.getElementById('leftSidebar');
    const shutter = document.getElementById('shutterBtn');
    if(sb && shutter) {
        sb.classList.toggle('open');
        shutter.classList.toggle('active');
        shutter.querySelector('i').className = sb.classList.contains('open') ? 'fas fa-chevron-left' : 'fas fa-chevron-right';
    }
};

window.addFileToUI = function(name, id, content = "") {
    const fileList = document.getElementById('file-list');
    const wrapper = document.getElementById('editor-wrapper');
    if(!fileList || !wrapper) return;

    // Explorer Tab
    const newTab = document.createElement('div');
    newTab.className = 'file-item';
    newTab.id = `tab-${id}`;
    newTab.innerHTML = `<span><i class="fas fa-file-code"></i> ${name}</span>`;
    newTab.onclick = () => {
        document.querySelectorAll('.editor-box').forEach(b => b.style.display = 'none');
        document.getElementById(`box-${id}`).style.display = 'flex';
    };
    fileList.appendChild(newTab);

    // Editor ডबा
    const newBox = document.createElement('div');
    newBox.className = 'editor-box';
    newBox.id = `box-${id}`;
    newBox.innerHTML = `
        <div class="label"><span>${name.toUpperCase()}</span></div>
        <textarea id="${id}-code" spellcheck="false">${content}</textarea>
    `;
    wrapper.appendChild(newBox);
    
    if(window.updateThemeAndFont) window.updateThemeAndFont();
};
