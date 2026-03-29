/* * CRABY EDITOR - UNIVERSAL THEME & SETTINGS (Custom Light Version)
 * हा कोड Index Page आणि Editor Page दोन्हीवर सारखाच काम करतो.
 */

const themes = {
    // 'light' थीमला तुमच्या आवडीनुसार कस्टमाइझ केले आहे
    light: { 
        bg: '#f0f4f8',      // Faint Soft Blue background (Header/Footer/Page साठी)
        panel: '#ffffff',   // शुद्ध पांढरा पॅनेल (टेक्स्ट एरियासाठी)
        accent: '#be123c',  // Deep Wine / Rose Red (Heading आणि हायलाईट्ससाठी)
        text: '#1e293b',    // Dark Slate text (वाचायला सोपे)
        border: '#cbd5e1'   // Soft gray border
    },  
    dark: { bg: '#0d1117', panel: '#161b22', accent: '#ffb400', text: '#c9d1d9', border: '#30363d' }, 
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
    if (!saved) {
        // जर काहीच सेव्ह नसेल तर डीफॉल्ट 'light' थीम आणि 16px साईज लावा
        updateCSSVariables(themes.light, 'sans-serif', 16);
        return;
    }

    const s = JSON.parse(saved);
    const theme = themes[s.theme] || themes.light;
    const font = s.font || 'sans-serif';
    const size = s.size || 16;

    updateCSSVariables(theme, font, size);

    // सेटिंग पॅनेल मधील इनपुट अपडेट करणे (जर अस्तित्वात असतील तर)
    const themeSel = document.getElementById('theme-sel');
    const fontSel = document.getElementById('font-family-sel');
    const sizeRange = document.getElementById('font-size-range');
    const sizeValDisplay = document.getElementById('font-size-val');

    if(themeSel) themeSel.value = s.theme || 'light';
    if(fontSel) fontSel.value = s.font || 'sans-serif';
    if(sizeRange) sizeRange.value = s.size || 16;
    if(sizeValDisplay) sizeValDisplay.innerText = (s.size || 16) + "px";
}

// --- २. CSS व्हेरिएबल्स अपडेट करणे (JavaScript Code) ---
function updateCSSVariables(theme, font, size) {
    const root = document.documentElement;
    root.style.setProperty('--bg', theme.bg);
    root.style.setProperty('--panel', theme.panel);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--text', theme.text);
    root.style.setProperty('--border', theme.border);
    
    // हेडर आणि फुटरचा रंग बॅकग्राउंडपेक्षा थोडा वेगळा करण्यासाठी लॉजिक
    let headerBg;
    if (theme.bg === '#f0f4f8' || theme.bg === '#ffffff' || theme.bg === '#eef1f4') {
        // लाईट थीम असेल तर हेडर/फुटर थोडा डार्क (Greyish Blue) दिसेल
        headerBg = '#e2e8f0'; 
    } else {
        // डार्क थीम असेल तर हेडर/फुटर थोडा फिकट (Light Dark) दिसेल
        headerBg = '#1c2128'; 
    }
    
    root.style.setProperty('--bg-header', headerBg); 

    // Body आणि संपूर्ण पेजचा फॉन्ट
    document.body.style.fontFamily = font;

    // सर्व Textareas अपडेट करणे (Editor साठी)
    document.querySelectorAll('textarea').forEach(tx => { 
        tx.style.fontFamily = font; 
        tx.style.fontSize = size + "px";
        tx.style.color = theme.text;
    });
}



// --- ३. सेटिंग सेव्ह करणे ---
function saveSettings() {
    const themeVal = document.getElementById('theme-sel')?.value || 'light';
    const sizeVal = document.getElementById('font-size-range')?.value || '16';
    const fontVal = document.getElementById('font-family-sel')?.value || 'sans-serif';

    const s = { theme: themeVal, size: sizeVal, font: fontVal };
    localStorage.setItem('craby_settings', JSON.stringify(s));
    
    // लगेच बदल लागू करा
    applyGlobalSettings();
}

// --- ४. सेटिंग पॅनेल चालू/बंद करणे ---
function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    if (!panel) return;

    if (panel.style.display === 'none' || panel.style.display === '' || !panel.classList.contains('open')) {
        panel.style.display = 'block';
        setTimeout(() => panel.classList.add('open'), 10);
    } else {
        panel.classList.remove('open');
        setTimeout(() => { 
            panel.style.display = 'none'; 
            saveSettings(); 
        }, 400); // CSS transition शी मॅच करा
    }
}

// --- ५. रॅपिड अपडेट फंक्शन्स (On Input/Change) ---
function updateThemeAndFont() { saveSettings(); }
function updateFontSize(val) { 
    const display = document.getElementById('font-size-val');
    if(display) display.innerText = val + "px";
    saveSettings(); 
}

// --- ६. इनीशियलायझेशन (DOM लोड झाल्यावर) ---
window.addEventListener('DOMContentLoaded', () => {
    const panel = document.getElementById('settingsPanel');
    if(panel) {
        panel.style.display = 'none'; // सुरुवातीला लपवा
        panel.classList.remove('open');
    }
    applyGlobalSettings(); // सेव्ह केलेली थीम लोड करा
});

function openEditor(){
    window.location.href = "https://craby-editor.vercel.app/html-editor.html";
}
