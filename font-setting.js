// Themes Global Object
window.themes = {
    dark: { bg: '#0d1117', panel: '#161b22', accent: '#ffb400', text: '#9cdcfe', border: '#30363d' }, 
    light: { bg: '#ffffff', panel: '#f8fafc', accent: '#1e40af', text: '#0f172a', border: '#cbd5e1' },
    monokai: { bg: '#272822', panel: '#3e3d32', accent: '#f92672', text: '#f8f8f2', border: '#49483e' },
    dracula: { bg: '#282a36', panel: '#44475a', accent: '#bd93f9', text: '#f8f8f2', border: '#6272a4' },
    matrix: { bg: '#000000', panel: '#001a00', accent: '#00ff00', text: '#00ff00', border: '#003300' },
    nord: { bg: '#2e3440', panel: '#3b4252', accent: '#88c0d0', text: '#d8dee9', border: '#4c566a' },
    midnight: { bg: '#020617', panel: '#1e293b', accent: '#38bdf8', text: '#f1f5f9', border: '#334155' },
    solarized: { bg: '#002b36', panel: '#073642', accent: '#268bd2', text: '#859900', border: '#586e75' },
    cyberpunk: { bg: '#0b0e14', panel: '#1a1f29', accent: '#00ff41', text: '#f3f3f3', border: '#00ff41' },
    evergreen: { bg: '#0a1a12', panel: '#142b20', accent: '#4ade80', text: '#e2e8f0', border: '#2d4a3e' },
    midnight_purple: { bg: '#0f0c29', panel: '#1c184a', accent: '#a855f7', text: '#f3e8ff', border: '#3b2d7d' },
    oceanic: { bg: '#1b2b34', panel: '#23333b', accent: '#6699cc', text: '#d8dee9', border: '#343d46' }
};

window.updateThemeAndFont = function() {
    const themeKey = document.getElementById('theme-sel').value;
    const font = document.getElementById('font-family-sel').value;
    const fontSize = document.getElementById('font-size-bar').value;
    
    if(document.getElementById('fs-display')) {
        document.getElementById('fs-display').innerText = fontSize + "px"; 
    }

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

// Internal function to sync UI with Script.js themes
function updateThemeAndFont() {
    const themeKey = document.getElementById('theme-sel').value;
    const font = document.getElementById('font-family-sel').value;
    const fontSize = document.getElementById('font-size-bar').value;
    document.getElementById('fs-display').innerText = fontSize + "px"; 

    // Accessing themes from font-settings.js
    const theme = (typeof themes !== 'undefined') ? (themes[themeKey] || themes.dark) : null;

    if (theme) {
        document.documentElement.style.setProperty('--bg', theme.bg);
        document.documentElement.style.setProperty('--panel', theme.panel);
        document.documentElement.style.setProperty('--accent', theme.accent);
        
        document.querySelectorAll('textarea').forEach(tx => {
            tx.style.fontFamily = font;
            tx.style.fontSize = fontSize + "px"; 
            tx.style.color = theme.text;
            tx.style.background = theme.bg;
            const eb = tx.closest('.editor-box');
            if(eb && theme.border) eb.style.borderColor = theme.border;
        });

        document.querySelectorAll('.label').forEach(el => {
            el.style.background = theme.panel;
            el.style.color = theme.accent;
        });

        document.querySelectorAll('.icon-btn i').forEach(el => {
            el.style.color = theme.accent;
        });
    }
}
