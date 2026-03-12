function runCode() {
    const overlay = document.getElementById('preview-overlay');
    overlay.style.display = 'flex';
    const html = document.getElementById('html-code').value;
    const css = "<style>" + document.getElementById('css-code').value + "</style>";
    const js = "<script>" + document.getElementById('js-code').value + "<\/script>";
    const outDoc = document.getElementById('output').contentWindow.document;
    outDoc.open();
    outDoc.write(html + css + js);
    outDoc.close();
}

function closePreview() {
    document.getElementById('preview-overlay').style.display = 'none';
}

function toggleSettings() {
    document.getElementById('settingsPanel').classList.toggle('open');
}

function setDevice(mode) {
    document.getElementById('wrapper').className = 'iframe-wrapper ' + (mode === 'mobile' ? 'mobile' : '');
}

function beautifyCode() {
    const h = document.getElementById('html-code');
    h.value = h.value.replace(/>\s+</g, '><').replace(/(<[^>]+>)/g, '$1\n').trim();
}

function exportCode() {
    const code = `<!DOCTYPE html><html><head><style>${document.getElementById('css-code').value}</style></head><body>${document.getElementById('html-code').value}<script>${document.getElementById('js-code').value}<\/script></body></html>`;
    const blob = new Blob([code], {type: "text/html"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "index.html";
    link.click();
}

function updateEditorStyles() {
    const fs = document.getElementById('font-size-sel').value;
    document.querySelectorAll('textarea').forEach(tx => tx.style.fontSize = fs);
}

// Click outside to close settings
document.addEventListener('mousedown', function(e) {
    const panel = document.getElementById('settingsPanel');
    const btn = document.querySelector('.fa-sliders-h').parentElement;
    if (!panel.contains(e.target) && !btn.contains(e.target) && panel.classList.contains('open')) {
        panel.classList.remove('open');
    }
});
