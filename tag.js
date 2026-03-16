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

// १. लोडर फंक्शन जे रँडम उड्या मारेल
function startCrabyLoader() {
    const loadVal = document.getElementById('load-val');
    const barFill = document.getElementById('bar-fill');
    const loader = document.getElementById('craby-loader');
    
    if (!loadVal || !barFill || !loader) return;

    let currentPct = 0;

    function fastRandomJumps() {
        // २० ते ५० च्या दरम्यान मोठी रँडम उडी
        let nextJump = Math.floor(Math.random() * 30) + 20; 
        currentPct += nextJump;

        if (currentPct >= 100) {
            currentPct = 100;
            loadVal.innerText = currentPct;
            barFill.style.width = currentPct + "%";
            
            // १००% झाले की लगेच लोडर गायब करा
            setTimeout(() => {
                loader.classList.add('hide-loader');
                // ३००ms नंतर मेमरीमधून काढून टाका
                setTimeout(() => {
                    loader.style.display = 'none';
                    loader.remove();
                }, 300);
            }, 150); // थोडा वेळ १००% दिसू द्या
            return;
        }

        // अपडेट स्क्रीन
        loadVal.innerText = currentPct;
        barFill.style.width = currentPct + "%";

        // पुढची उडी एकदम फास्ट (१५०ms ते ३००ms च्या आत)
        let nextDelay = Math.floor(Math.random() * 150) + 150;
        setTimeout(fastRandomJumps, nextDelay);
    }

    fastRandomJumps();
}

// २. 'window.onload' ची वाट न पाहता, स्क्रिप्ट येताच काम सुरू करा!
// यामुळे ०% वर अडकण्याचा प्रश्नच येणार नाही.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startCrabyLoader);
} else {
    startCrabyLoader();
}

// ३. एडिटरचे बाकीचे फंक्शन नेहमीप्रमाणे चालू राहतील
window.addEventListener('load', () => {
    if (typeof updateTaskbar === 'function') updateTaskbar();
    // इतर फाईल्स लोड करण्याचे लॉजिक...
});
