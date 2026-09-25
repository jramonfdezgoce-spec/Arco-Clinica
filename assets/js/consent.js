(function () {
  'use strict';

  // Sustituye por tu id de medición real de Google Analytics 4 (formato G-XXXXXXXXXX).
  // Mientras contenga "XXXX" no se carga ningún script de analítica, aunque el
  // visitante acepte: así el placeholder nunca envía datos a ningún sitio.
  var GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
  var STORAGE_KEY = 'arco-cookie-consent';

  var banner = document.getElementById('cookie-banner');
  if (!banner) return;

  var qs = function (s) { return document.getElementById(s); };
  var prefs = qs('cookie-prefs');
  var analyticsToggle = qs('cookie-analytics');
  var configureBtn = qs('cookie-configure');
  var saveBtn = qs('cookie-save');
  var acceptBtn = qs('cookie-accept');
  var rejectBtn = qs('cookie-reject');
  var settingsLink = qs('cookie-settings-link');

  function readConsent() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { return null; }
  }

  function writeConsent(analytics) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: analytics, date: new Date().toISOString() }));
    } catch (e) { /* almacenamiento no disponible (modo privado): no persiste, se preguntará de nuevo */ }
  }

  function loadAnalytics() {
    if (GA_MEASUREMENT_ID.indexOf('XXXX') !== -1) return;
    if (document.getElementById('ga4-loader')) return;
    var s = document.createElement('script');
    s.id = 'ga4-loader';
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
  }

  // The mascot in mascot.js treats this banner as an obstacle to dodge, and
  // recomputes its position on scroll/resize — nudging it here means it
  // reacts immediately when the banner appears or disappears mid-page too.
  function nudgeMascot() { window.dispatchEvent(new Event('resize')); }

  function showBanner() {
    banner.hidden = false;
    prefs.hidden = true;
    configureBtn.hidden = false;
    saveBtn.hidden = true;
    nudgeMascot();
  }

  function resolve(analytics) {
    writeConsent(analytics);
    banner.hidden = true;
    if (analytics) loadAnalytics();
    nudgeMascot();
  }

  var existing = readConsent();
  if (existing) {
    if (existing.analytics) loadAnalytics();
  } else {
    showBanner();
  }

  acceptBtn.addEventListener('click', function () { resolve(true); });
  rejectBtn.addEventListener('click', function () { resolve(false); });
  configureBtn.addEventListener('click', function () {
    var current = readConsent();
    analyticsToggle.checked = !!(current && current.analytics);
    prefs.hidden = false;
    configureBtn.hidden = true;
    saveBtn.hidden = false;
  });
  saveBtn.addEventListener('click', function () { resolve(analyticsToggle.checked); });
  if (settingsLink) settingsLink.addEventListener('click', showBanner);
})();
