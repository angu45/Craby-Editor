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

function startCrabyLoader() {
    const loadVal = document.getElementById('load-val');
    const barFill = document.getElementById('bar-fill');
    const loader = document.getElementById('craby-loader');
    
    if (!loadVal || !barFill || !loader) return;

    let currentPct = 0;

    function fastRandomJumps() {
        // Randomly 20% te 45% chi udi
        let nextJump = Math.floor(Math.random() * 25) + 20; 
        currentPct += nextJump;

        if (currentPct >= 100) {
            currentPct = 100;
            loadVal.innerText = currentPct;
            barFill.style.width = currentPct + "%";
            
            // 100% zalya zalya thoda thambun (Coolness sathi) lagech editor open
            setTimeout(() => {
                loader.classList.add('hide-loader');
                setTimeout(() => {
                    loader.remove();
                    // Editor loading functions
                    if (typeof updateTaskbar === 'function') updateTaskbar();
                }, 500);
            }, 300); // 300ms cha delay 100% status dakhavnyasathi
            return;
        }

        // Screen update
        loadVal.innerText = currentPct;
        barFill.style.width = currentPct + "%";

        // Random Delay: 250ms te 500ms (Thoda delay sathi)
        let nextDelay = Math.floor(Math.random() * 250) + 250;
        setTimeout(fastRandomJumps, nextDelay);
    }

    // Pehla jump thodya velane start kara (Visual impact sathi)
    setTimeout(fastRandomJumps, 400);
}

// Initial Trigger
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startCrabyLoader);
} else {
    startCrabyLoader();
}
