/**
 * Craby Editor - Analytics & Tracking System
 * IDs: GTM-TTVQBL6S | G-Z0BGJ1913H
 */

// --- 1. GTM & GA4 INITIALIZATION ---
(function() {
    // Google Tag Manager Setup
    const gtmId = 'GTM-TTVQBL6S';
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
    
    const f = document.getElementsByTagName('script')[0],
          j = document.createElement('script'),
          dl = 'dataLayer' != 'dataLayer' ? '&l=' + 'dataLayer' : '';
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + gtmId + dl;
    f.parentNode.insertBefore(j, f);

    // Google Analytics (gtag.js) Setup
    const gaId = 'G-Z0BGJ1913H';
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(gaScript);

    window.gtag = function() { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', gaId, { 'send_page_view': true });
})();

// --- 2. TRACKING FUNCTIONS ---

/**
 * Global Event Tracker
 * @param {string} eventName - इव्हेंटचे नाव (उदा. code_run, file_download)
 * @param {object} params - जास्तीचा डेटा
 */
function trackCrabyEvent(eventName, params = {}) {
    // GTM DataLayer Push
    window.dataLayer.push({
        'event': eventName,
        ...params
    });

    // GA4 direct push (Backup)
    if (typeof gtag === 'function') {
        gtag('event', eventName, params);
    }
    
    console.log(`[Analytics] Tracked: ${eventName}`, params);
}

// --- 3. AUTO-TRACKERS ON LOAD ---

window.addEventListener('load', () => {
    trackCrabyEvent('editor_open', {
        app_name: 'Craby Editor',
        url: window.location.href
    });
});
