/**
 * CRABY EDITOR - UNIVERSAL THEME & SETTINGS (Final Optimized Version)
 * हा कोड Index Page आणि Editor Page दोन्हीवर सारखाच काम करतो.
 */

const themes = {
    dark: { bg: '#0d1117', panel: '#161b22', accent: '#ffb400', text: '#c9d1d9', border: '#30363d' }, 
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
    if (!saved) {
        updateCSSVariables(themes.dark, 'monospace', 14);
        return;
    }

    const s = JSON.parse(saved);
    const theme = themes[s.theme] || themes.dark;
    const font = s.font || 'monospace';
    const size = s.size || 14;

    updateCSSVariables(theme, font, size);

    const themeSel = document.getElementById('theme-sel');
    const fontSel = document.getElementById('font-family-sel');
    const sizeRange = document.getElementById('font-size-range');
    const sizeValDisplay = document.getElementById('font-size-val');

    if(themeSel) themeSel.value = s.theme;
    if(fontSel) fontSel.value = s.font;
    if(sizeRange) sizeRange.value = s.size;
    if(sizeValDisplay) sizeValDisplay.innerText = s.size + "px";
}

// --- २. CSS व्हेरिएबल्स अपडेट करणे ---
function updateCSSVariables(theme, font, size) {
    const root = document.documentElement;
    root.style.setProperty('--bg', theme.bg);
    root.style.setProperty('--panel', theme.panel);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--text', theme.text);
    root.style.setProperty('--border', theme.border);

    document.body.style.fontFamily = font;

    document.querySelectorAll('textarea').forEach(tx => { 
        tx.style.fontFamily = font; 
        tx.style.fontSize = size + "px";
        tx.style.color = theme.text;
    });

    // *** ओरिजिनल लाईन नंबर पट्टीचा फॉन्ट आणि साईज सिंक करणे ***
    const lineNumbersEle = document.getElementById('lineNumbers');
    if (lineNumbersEle) {
        lineNumbersEle.style.fontFamily = font;
        lineNumbersEle.style.fontSize = size + "px";
    }

    // पेज लोड किंवा रिफ्रेश झाल्यावर लाईन नंबर्स अपडेट करणे
    const codeInputEle = document.getElementById('codeInput');
    if (codeInputEle) {
        updateLineNumbers(codeInputEle.value);
    }
}

// --- ३. ओरिजिनल लाईन नंबरिंग फंक्शन्स (जसे आहेत तसे) ---
function updateLineNumbers(code) {
  const lineNumbersEle = document.getElementById('lineNumbers');
  if (!lineNumbersEle) return; // जर इंडेक्स पेजवर नसेल तर एरर येऊ नये म्हणून
  
  // जर सेटिंग्जमध्ये lineNumbers फॉल्स असेल तर लपवा (ऑप्शनल)
  lineNumbersEle.style.display = 'block';
  
  const lines = code.split('\n').length;
  let html = '';
  for (let i = 1; i <= lines; i++) {
    html += `<div>${i}</div>`;
  }
  lineNumbersEle.innerHTML = html;
}

function syncScroll() {
  const codeInputEle = document.getElementById('codeInput');
  const highlightOverlayEle = document.getElementById('highlightOverlay');
  const lineNumbersEle = document.getElementById('lineNumbers');

  if (highlightOverlayEle && codeInputEle) {
      highlightOverlayEle.scrollTop = codeInputEle.scrollTop;
      highlightOverlayEle.scrollLeft = codeInputEle.scrollLeft;
  }
  if (lineNumbersEle && codeInputEle) {
      lineNumbersEle.scrollTop = codeInputEle.scrollTop;
  }
}

// --- ४. सेटिंग सेव्ह करणे ---
function saveSettings() {
    const themeVal = document.getElementById('theme-sel')?.value || 'dark';
    const sizeVal = document.getElementById('font-size-range')?.value || '14';
    const fontVal = document.getElementById('font-family-sel')?.value || 'monospace';

    const s = { theme: themeVal, size: sizeVal, font: fontVal };
    localStorage.setItem('craby_settings', JSON.stringify(s));
    
    applyGlobalSettings();
}

// --- ५. सेटिंग पॅनेल चालू/बंद करणे ---
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
        }, 400); 
    }
}

// --- ६. रॅपिड अपडेट फंक्शन्स ---
function updateThemeAndFont() { saveSettings(); }
function updateFontSize(val) { 
    const display = document.getElementById('font-size-val');
    if(display) display.innerText = val + "px";
    saveSettings(); 
}

// --- ७. इनीशियलायझेशन (DOM लोड झाल्यावर) ---
window.addEventListener('DOMContentLoaded', () => {
    const panel = document.getElementById('settingsPanel');
    if(panel) {
        panel.style.display = 'none'; 
        panel.classList.remove('open');
    }
    
    // लोड झाल्यावर सेटिंग्ज लावा
    applyGlobalSettings(); 

    // इव्हेंट लिसनर्स सेट करणे
    const codeInputEle = document.getElementById('codeInput');
    if (codeInputEle) {
        codeInputEle.addEventListener('input', () => {
            updateLineNumbers(codeInputEle.value);
        });
        codeInputEle.addEventListener('scroll', syncScroll);
    }
});

function openEditor(){
    window.location.href = "https://craby-editor.vercel.app/html-editor.html";
}
