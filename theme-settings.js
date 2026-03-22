function openEditor(){
    window.location.href = "https://craby-editor.vercel.app/html-editor.html";
}
function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    if (panel.style.display === 'none' || !panel.classList.contains('open')) {
        panel.style.display = 'block';
        setTimeout(() => panel.classList.add('open'), 10);
    } else {
        panel.classList.remove('open');
        setTimeout(() => { panel.style.display = 'none'; saveSettings(); }, 300);
    }
}