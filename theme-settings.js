/**
 * CRABY EDITOR - UNIVERSAL THEME & SETTINGS
 * हा कोड सर्व पेजेसवर (Index, Editor, इ.) सारखाच काम करेल.
 */

const themes = {
    dark: { bg: '#0d1117', panel: '#161b22', accent: '#ffb400', text: '#9cdcfe', border: '#30363d' }, 
    light: { bg: '#eef1f4', panel: '#ffffff', accent: '#f59e0b', text: '#374151', border: '#e5e7eb' },  
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

// --- १. थीम लागू करणारे मुख्य फंक्शन ---
function applyGlobalSettings() {
    const saved = localStorage.getItem('craby_settings');
    if (!saved) return;

    const s = JSON.parse(saved);
    const theme = themes[s.theme] || themes.dark;
    const font = s.font || 'monospace';

    // संपूर्ण वेबसाइटचे CSS Variables सेट करणे (:root ला लागू होतात)
    const root = document.documentElement;
    root.style.setProperty('--bg', theme.bg);
    root.style.setProperty('--panel', theme.panel);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--text', theme.text);
    root.style.setProperty('--border', theme.border);

    // Body चा बॅकग्राउंड आणि फॉन्ट बदलणे (Index page साठी महत्त्वाचे)
    document.body.style.backgroundColor = theme.bg;
    document.body.style.color = theme.text;
    document.body.style.fontFamily = font;

    // सर्व Textareas अपडेट करणे (जर Editor पेजवर असाल तर)
    document.querySelectorAll('textarea').forEach(tx => { 
        tx.style.fontFamily = font; 
        tx.style.fontSize = s.size + "px";
        tx.style.color = theme.text; 
        tx.style.background = theme.bg; 
    });

    // ड्रॉपडाऊन आणि रेंज इनपुटची व्हॅल्यू सेट करणे (जर सेटिंग पॅनेल उघडे असेल तर)
    if(document.getElementById('theme-sel')) document.getElementById('theme-sel').value = s.theme;
    if(document.getElementById('font-family-sel')) document.getElementById('font-family-sel').value = s.font;
    if(document.getElementById('font-size-range')) document.getElementById('font-size-range').value = s.size;
}

// --- २. सेटिंग सेव्ह करणे ---
function saveSettings() {
    const themeVal = document.getElementById('theme-sel')?.value || 'dark';
    const sizeVal = document.getElementById('font-size-range')?.value || '16';
    const fontVal = document.getElementById('font-family-sel')?.value || 'monospace';

    const s = { theme: themeVal, size: sizeVal, font: fontVal };
    localStorage.setItem('craby_settings', JSON.stringify(s));
    
    // सेव्ह केल्या केल्या लगेच लागू करा
    applyGlobalSettings();
}

// --- ३. इनीशियलायझेशन (पेज लोड झाल्यावर) ---
window.addEventListener('DOMContentLoaded', applyGlobalSettings);

// एक्सपोर्ट केलेले जुने फंक्शन्स (सुसंगततेसाठी)
function updateThemeAndFont() { saveSettings(); }
function updateFontSize(val) { saveSettings(); }

function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    if (!panel) return;
    if (panel.style.display === 'none' || !panel.classList.contains('open')) {
        panel.style.display = 'block';
        setTimeout(() => panel.classList.add('open'), 10);
    } else {
        panel.classList.remove('open');
        setTimeout(() => { 
            panel.style.display = 'none'; 
            saveSettings(); 
        }, 300);
    }
}
