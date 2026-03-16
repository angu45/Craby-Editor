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
    // १. बॅकग्राउंडला एडिटरचे काम सुरू करू द्या
    if (typeof updateTaskbar === 'function') updateTaskbar();
    
    const loadVal = document.getElementById('load-val');
    const barFill = document.getElementById('bar-fill');
    const loader = document.getElementById('craby-loader');
    
    let start = null;
    const duration = 1200; // १.२ सेकंद (1.2 Seconds Fixed)

    function animate(timestamp) {
        if (!start) start = timestamp;
        let progress = timestamp - start;
        let percentage = Math.min(Math.floor((progress / duration) * 100), 100);
        
        // अपडेट व्हॅल्यू आणि बार
        loadVal.innerText = percentage;
        barFill.style.width = percentage + "%";

        if (progress < duration) {
            window.requestAnimationFrame(animate);
        } else {
            // १००% झाले! आता झटक्यात बाहेर
            setTimeout(() => {
                loader.classList.add('hide-loader');
                // ३००ms नंतर डोममधून काढून टाका
                setTimeout(() => loader.remove(), 300);
            }, 100);
        }
    }

    // अ‍ॅनिमेशन सुरू करा
    window.requestAnimationFrame(animate);
};
