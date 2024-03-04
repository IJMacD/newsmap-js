if (window['env'] && window['env']['GA_TRACKING']) {
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());

    gtag('config', window['env']['GA_TRACKING']);

    const a = document.createElement('script');
    a.async = true;
    a.src = `https://www.google-analytics.com/analytics.js?id=${window['env']['GA_TRACKING']}`;
    document.head.appendChild(a);
}
