// --- 1. ALL 12 THEMES ---
const themes = {
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

// --- 2. THEME & FONT APPLICATION ---
function updateThemeAndFont() {
    const themeKey = document.getElementById('theme-sel').value;
    const font = document.getElementById('font-family-sel').value;
    const fontSize = document.getElementById('font-size-range')?.value || 14;
    
    const fsDisplay = document.getElementById('font-size-val');
    if(fsDisplay) fsDisplay.innerText = fontSize + "px"; 
    
    const theme = themes[themeKey] || themes.dark;

    // Root Variables
    document.documentElement.style.setProperty('--bg', theme.bg);
    document.documentElement.style.setProperty('--panel', theme.panel);
    document.documentElement.style.setProperty('--accent', theme.accent);
    document.documentElement.style.setProperty('--border', theme.border);
    
    document.querySelectorAll('textarea').forEach(tx => {
        tx.style.fontFamily = font;
        tx.style.fontSize = fontSize + "px";
        tx.style.color = theme.text;
        tx.style.background = theme.bg;
        
        const eb = tx.closest('.window-frame');
        if(eb) eb.style.borderColor = theme.border;
    });

    document.querySelectorAll('.window-header').forEach(h => h.style.background = theme.panel);
    document.querySelectorAll('.icon-btn i').forEach(i => i.style.color = theme.accent);
}

// --- 1. Update Font Size Function ---
function updateFontSize(val) {
    // Update the label next to the slider
    const sizeLabel = document.getElementById('font-size-val');
    if (sizeLabel) sizeLabel.innerText = val + "px";

    // Apply the font size to all textareas in the editor
    const editors = document.querySelectorAll('.editor-container textarea');
    editors.forEach(editor => {
        editor.style.fontSize = val + "px";
    });

    // Also update line numbers to match the font size
    const lineNumbers = document.querySelectorAll('.line-numbers');
    lineNumbers.forEach(ln => {
        ln.style.fontSize = val + "px";
    });
}

// --- 2. Update Theme and Font Family Function ---
function updateThemeAndFont() {
    const fontFamily = document.getElementById('font-family-sel').value;
    const theme = document.getElementById('theme-sel').value;

    // Apply Font Family to all textareas
    const editors = document.querySelectorAll('.editor-container textarea');
    editors.forEach(editor => {
        editor.style.fontFamily = fontFamily;
    });

    // Apply Theme (Change background and colors based on selection)
    // This is a simple implementation, you can expand it for different themes
    const editorFrames = document.querySelectorAll('.window-body');
    
    editorFrames.forEach(frame => {
        if (theme === 'dark') {
            frame.style.background = "#0b1619";
        } else if (theme === 'monokai') {
            frame.style.background = "#272822";
        } else if (theme === 'light') {
            frame.style.background = "#ffffff";
            const tx = frame.querySelector('textarea');
            if(tx) tx.style.color = "#000000";
        }
        // Add more theme conditions as per your dropdown list...
    });

    console.log("Font changed to: " + fontFamily + " and Theme to: " + theme);
}

// --- PREVIEW DEVICE REALITY LOGIC ---
function setPreviewSize(device) {
    const frame = document.getElementById('output-frame');
    const overlayBody = frame.parentElement; // Preview body container

    if (!frame || !overlayBody) return;

    // Reset styles aadhi
    frame.style.transition = "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    
    if (device === '100%') {
        // --- REAL DESKTOP VIEW ---
        frame.style.width = "100%";
        frame.style.height = "100%";
        frame.style.border = "none";
        frame.style.borderRadius = "0";
        frame.style.boxShadow = "none";
        overlayBody.style.padding = "0";
    } 
    else if (device === '375px') {
        // --- REAL MOBILE VIEW (iPhone Size) ---
        frame.style.width = "375px";
        frame.style.height = "750px"; // Mobile height logic
        frame.style.border = "12px solid #222"; // Mobile bezel
        frame.style.borderRadius = "35px"; // Rounded corners like phone
        frame.style.boxShadow = "0 25px 50px -12px rgba(0, 0, 0, 0.5)";
        overlayBody.style.padding = "20px";
        overlayBody.style.overflowY = "auto";
    }
}
