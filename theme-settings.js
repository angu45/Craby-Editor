// --- 1. GLOBAL THEMES OBJECT ---
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

// --- 2. THEME, FONT & SIZE APPLICATION ---
window.updateThemeAndFont = function() {
    // HTML IDs check karne
    const themeSelect = document.getElementById('theme-sel');
    const fontSelect = document.getElementById('font-family-sel');
    const sizeRange = document.getElementById('font-size-range');
    const sizeDisplay = document.getElementById('font-size-val');

    if (!themeSelect || !fontSelect || !sizeRange) return;

    const themeKey = themeSelect.value;
    const font = fontSelect.value;
    const fontSize = sizeRange.value;

    // Font size label update karne
    if (sizeDisplay) sizeDisplay.innerText = fontSize + "px";

    const theme = window.themes[themeKey] || window.themes.dark;

    // Main Layout Colors (CSS Variables)
    document.documentElement.style.setProperty('--bg', theme.bg);
    document.documentElement.style.setProperty('--panel', theme.panel);
    document.documentElement.style.setProperty('--accent', theme.accent);
    document.documentElement.style.setProperty('--border', theme.border);

    // Apply to Textareas
    document.querySelectorAll('textarea').forEach(tx => {
        tx.style.fontFamily = font;
        tx.style.fontSize = fontSize + "px"; 
        tx.style.color = theme.text;
        tx.style.backgroundColor = theme.bg;
        
        // Editor box border
        const eb = tx.closest('.window-frame') || tx.closest('.editor-box') || tx.parentElement;
        if(eb) eb.style.borderColor = theme.border;
    });

    // Icons aani Labels
    document.querySelectorAll('.icon-btn i, .s-group label').forEach(el => {
        el.style.color = theme.accent;
    });
};

// Font Size Slider sathi direct function
window.updateFontSize = function(val) {
    window.updateThemeAndFont(); // Range badalli ki full update trigger karne
};

// --- 3. SETTINGS PANEL TOGGLE FIX ---
window.toggleSettings = () => {
    const settings = document.getElementById('settingsPanel');
    if (!settings) return;

    settings.classList.toggle('open');
    
    // Smooth transition sathi display control
    if (settings.classList.contains('open')) {
        settings.style.display = 'block';
    } else {
        setTimeout(() => {
            if (!settings.classList.contains('open')) settings.style.display = 'none';
        }, 300);
    }
};

// --- 4. PREVIEW SIZE LOGIC ---
window.setPreviewSize = function(width) {
    const frame = document.getElementById('output-frame');
    if (!frame) return;

    frame.style.width = width;
    if (width === '100%') {
        frame.style.height = '100%';
        frame.style.borderRadius = '0';
        frame.style.border = 'none';
    } else {
        frame.style.height = '600px'; 
        frame.style.borderRadius = '15px';
        frame.style.border = '10px solid #333';
        frame.style.boxShadow = '0 20px 50px rgba(0,0,0,0.5)';
    }
};

// --- 5. INITIAL SYNC ---
document.addEventListener('DOMContentLoaded', () => {
    // Page load jhalya var themes apply karne
    setTimeout(window.updateThemeAndFont, 500);
});

// Dictionary (as it is)
window.dictionary = {
    html: ['div','span','h1','p','a','button','input','img','ul','li'],
    css: ['color','background','margin','padding','display','flex','grid'],
    js: ['console.log','document','window','function','const','let']
};
