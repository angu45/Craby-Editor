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
    // 1. आधी एडिटरची बॅकग्राउंडची कामे उरकून घेऊ
    updateTaskbar();
    if(files["index.html"]) addFileToUI("index.html", "html", files["index.html"].content);
    if(files["style.css"]) addFileToUI("style.css", "css", files["style.css"].content);

    // 2. Percentage Logic (1.5 Seconds total)
    const pctLabel = document.getElementById('load-pct');
    const bar = document.getElementById('progress-fill');
    const loader = document.getElementById('craby-loader');
    
    let count = 0;
    const duration = 1200; // १.२ सेकंदात १००% होणार
    const startTime = performance.now();

    function updateLoader(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        count = Math.floor(progress * 100);
        pctLabel.innerText = count;
        bar.style.width = count + "%";

        if (progress < 1) {
            requestAnimationFrame(updateLoader);
        } else {
            // १००% झाले की लगेच गायब
            setTimeout(() => {
                loader.classList.add('loader-hidden');
                setTimeout(() => loader.remove(), 400); // डोममधून पूर्णपणे बाहेर
            }, 100);
        }
    }

    requestAnimationFrame(updateLoader);
};
