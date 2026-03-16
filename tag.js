/**
 * Craby Editor - Analytics & Tracking System
 * IDs: GTM-TTVQBL6S | G-Z0BGJ1913H
 */

(function() {
    const gtmId = 'GTM-TTVQBL6S';
    const gaId = 'G-Z0BGJ1913H';

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', gaId, { 'send_page_view': true });

    // GTM Script Injection
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer',gtmId);
})();

// ग्लोबल ट्रॅकिंग फंक्शन
function trackCrabyEvent(eventName, params = {}) {
    window.dataLayer.push({
        'event': eventName,
        ...params
    });
    if (typeof gtag === 'function') {
        gtag('event', eventName, params);
    }
    console.log(`[Analytics] ${eventName}`, params);
}

// ऑटो ट्रॅकर
window.addEventListener('load', () => {
    trackCrabyEvent('editor_open', { platform: 'Vercel' });
});

window.onload = () => {
    // १. बॅकग्राउंडला एडिटरचे काम (फाईल्स लोड करणे) सुरू करू द्या
    if (typeof updateTaskbar === 'function') updateTaskbar();
    
    const loadVal = document.getElementById('load-val');
    const barFill = document.getElementById('bar-fill');
    const loader = document.getElementById('craby-loader');
    
    let currentPct = 0;

    // २. Random Jumps Logic (Total duration ~1.2s)
    function fastRandomLoader() {
        // ३ ते ४ स्टेप्समध्ये १००% पूर्ण करायचे आहे
        let nextJump = Math.floor(Math.random() * 40) + 20; // २० ते ६० च्या दरम्यान रँडम उडी
        currentPct += nextJump;

        if (currentPct >= 100) {
            currentPct = 100;
            loadVal.innerText = currentPct;
            barFill.style.width = currentPct + "%";
            
            // १००% झाल्यावर लगेच (१००ms नंतर) गायब
            setTimeout(() => {
                loader.classList.add('hide-loader');
                setTimeout(() => loader.remove(), 300);
            }, 100);
            return;
        }

        // व्हॅल्यू आणि बार अपडेट करा
        loadVal.innerText = currentPct;
        barFill.style.width = currentPct + "%";

        // पुढची उडी किती वेळानंतर घ्यायची (Random delay between 200ms to 400ms)
        let nextDelay = Math.floor(Math.random() * 200) + 200;
        setTimeout(fastRandomLoader, nextDelay);
    }

    // लोडर सुरू करा
    fastRandomLoader();
};
