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
});window.onload = () => {
    // विद्यमान फंक्शन्स रन करा
    updateTaskbar();
    addFileToUI("index.html", "html", files["index.html"].content);
    addFileToUI("style.css", "css", files["style.css"].content);

    // लोडर बंद करण्याची लॉजिक
    const loader = document.getElementById('craby-loader');
    setTimeout(() => {
        loader.classList.add('loader-hidden');
        // मेमरी वाचवण्यासाठी १ सेकंदानंतर लोडर पूर्णपणे काढून टाका
        setTimeout(() => loader.remove(), 1000);
    }, 2500); // २.५ सेकंद लोडर दिसेल
};

