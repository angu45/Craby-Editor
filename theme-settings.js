// Global Themes Object
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
};
// --- SHUTTER & MENU LOGIC ---

// 1. Left Sidebar (Shutter) Toggle
// जेव्हा तू पिवळ्या शटर बटणवर क्लिक करशील, तेव्हा फाईल लिस्ट उघडेल/बंद होईल
window.toggleLeftSidebar = () => {
    const sidebar = document.getElementById('leftSidebar');
    const shutter = document.getElementById('shutterBtn');

    if (sidebar && shutter) {
        sidebar.classList.toggle('open');    // Sidebar उघडण्यासाठी/बंद करण्यासाठी
        shutter.classList.toggle('active');  // शटर बटणची जागा बदलण्यासाठी
    }
};

// 2. Settings Panel (Menu) Toggle
// जेव्हा तू सेटिंग आयकॉनवर क्लिक करशील, तेव्हा उजव्या बाजूचे पॅनल उघडेल
window.toggleSettings = () => {
    const settings = document.getElementById('settingsPanel');
    
    if (settings) {
        settings.classList.toggle('open'); // Settings Panel उघडण्यासाठी/बंद करण्यासाठी
    }
};


// 3. Close On Outside Click (Optional पण कामाचं)
// स्क्रीनवर कुठेही बाहेर क्लिक केल्यावर पॅनल बंद व्हावेत असं वाटत असेल तर:
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('leftSidebar');
    const settings = document.getElementById('settingsPanel');
    const shutter = document.getElementById('shutterBtn');

    // जर क्लिक साईडबार किंवा बटणच्या बाहेर असेल तर बंद करा
    if (sidebar && sidebar.classList.contains('open') && 
        !sidebar.contains(e.target) && !shutter.contains(e.target)) {
        window.toggleLeftSidebar();
    }

    // जर क्लिक सेटिंग पॅनलच्या बाहेर असेल तर बंद करा
    if (settings && settings.classList.contains('open') && 
        !settings.contains(e.target) && !e.target.closest('.icon-btn')) {
        window.toggleSettings();
    }
});// --- SHUTTER & MENU LOGIC ---

// 1. Left Sidebar (Shutter) Toggle
// जेव्हा तू पिवळ्या शटर बटणवर क्लिक करशील, तेव्हा फाईल लिस्ट उघडेल/बंद होईल
window.toggleLeftSidebar = () => {
    const sidebar = document.getElementById('leftSidebar');
    const shutter = document.getElementById('shutterBtn');

    if (sidebar && shutter) {
        sidebar.classList.toggle('open');    // Sidebar उघडण्यासाठी/बंद करण्यासाठी
        shutter.classList.toggle('active');  // शटर बटणची जागा बदलण्यासाठी
    }
};

// 2. Settings Panel (Menu) Toggle
// जेव्हा तू सेटिंग आयकॉनवर क्लिक करशील, तेव्हा उजव्या बाजूचे पॅनल उघडेल
window.toggleSettings = () => {
    const settings = document.getElementById('settingsPanel');
    
    if (settings) {
        settings.classList.toggle('open'); // Settings Panel उघडण्यासाठी/बंद करण्यासाठी
    }
};

// 3. Close On Outside Click (Optional पण कामाचं)
// स्क्रीनवर कुठेही बाहेर क्लिक केल्यावर पॅनल बंद व्हावेत असं वाटत असेल तर:
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('leftSidebar');
    const settings = document.getElementById('settingsPanel');
    const shutter = document.getElementById('shutterBtn');

    // जर क्लिक साईडबार किंवा बटणच्या बाहेर असेल तर बंद करा
    if (sidebar && sidebar.classList.contains('open') && 
        !sidebar.contains(e.target) && !shutter.contains(e.target)) {
        window.toggleLeftSidebar();
    }

    // जर क्लिक सेटिंग पॅनलच्या बाहेर असेल तर बंद करा
    if (settings && settings.classList.contains('open') && 
        !settings.contains(e.target) && !e.target.closest('.icon-btn')) {
        window.toggleSettings();
    }
});// --- 1. CONFIGURATION & ALL 12 THEMES ---
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

const dictionary = {
    html: ['a','alt','article','aside','audio','b','base','body','br','button','canvas','caption','cite','class','code','col','colgroup','datalist','dd','del','details','dfn','dialog','div','dl','dt','em','embed','fieldset','figcaption','figure','footer','form','h1','h2','h3','h4','h5','h6','head','header','height','hr','html','href','i','id','iframe','img','input','label','legend','li','link','main','map','mark','meta','name','nav','ol','onclick','optgroup','option','p','param','picture','placeholder','pre','progress','q','rel','required','s','samp','script','section','select','small','source','span','strong','style','sub','summary','sup','svg','table','tbody','td','template','textarea','tfoot','th','thead','time','title','tr','track','type','u','ul','value','var','video','width'],
    css: ['absolute','align-items','animation','background','background-color','border','border-radius','bottom','box-shadow','box-sizing','clear','color','column-count','column-gap','content','cursor','display','flex','flex-direction','flex-wrap','float','font','font-family','font-size','font-style','font-weight','gap','grid','grid-area','grid-template-columns','grid-template-rows','height','inline','inline-block','justify-content','left','letter-spacing','line-height','margin','margin-bottom','margin-left','margin-right','margin-top','max-height','max-width','min-height','min-width','none','opacity','overflow','padding','padding-bottom','padding-left','padding-right','padding-top','pointer','position','relative','right','text-align','text-decoration','text-transform','top','transform','transition','transparent','visibility','width','word-spacing','z-index'],
    js: ['addEventListener','alert','Array','async','await','break','catch','class','clearInterval','clearTimeout','console','console.log','const','continue','Date','debugger','default','delete','document','document.getElementById','document.querySelector','else','export','fetch','finally','for','forEach','function','if','import','in','instanceof','isNaN','JSON','JSON.parse','JSON.stringify','let','map','Math','Math.floor','Math.random','new','null','Object','parseFloat','parseInt','pop','push','querySelector','querySelectorAll','return','setInterval','setTimeout','shift','slice','some','split','splice','String','this','throw','trim','try','typeof','undefined','var','window','while']
};

const sBox = document.createElement('div');
sBox.id = 'suggestion-box';
document.body.appendChild(sBox);

let selectedIdx = 0;
let currentLang = '';


