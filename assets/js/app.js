(function () {
  'use strict';

  // Datos de contacto de la clínica: cámbialos aquí por los reales.
  var CLINIC_EMAIL = 'citas@arco-dental.example';
  var CLINIC_WHATSAPP = '34600000000';

  var root = document.documentElement;
  var qs = function (s, ctx) { return (ctx || document).querySelector(s); };
  var qsa = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* header background once the page moves */
  var header = qs('#cabecera');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* phone menu */
  var toggle = qs('.menu-toggle');
  var menu = qs('#menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  toggle.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('click', function (e) {
    if (menu.classList.contains('is-open') && !e.target.closest('nav')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
  });

  /* legal dialogs */
  var lastTrigger = null;
  qsa('[data-open-modal]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dlg = document.getElementById(btn.getAttribute('data-open-modal'));
      if (dlg && dlg.showModal) { lastTrigger = btn; dlg.showModal(); }
    });
  });
  qsa('.legal-modal').forEach(function (dlg) {
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', function () { if (lastTrigger) lastTrigger.focus(); });
    qs('[data-close]', dlg).addEventListener('click', function () { dlg.close(); });
  });

  /* appointment form */
  var form = qs('#booking-form');
  var status = qs('#form-status');
  var result = qs('#form-result');
  var waLink = qs('#whatsapp-link');

  (function setMinDate() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    form.elements.date.min = d.getFullYear() + '-' + m + '-' + day;
  })();

  var rules = {
    name: { msg: 'Escribe tu nombre y apellidos.', ok: function (f) { return f.value.trim().length >= 3; } },
    phone: { msg: 'Escribe un teléfono de 9 cifras, por ejemplo 600 000 000.', ok: function (f) { return /^\+?[0-9 ]+$/.test(f.value.trim()) && f.value.replace(/\D/g, '').length >= 9; } },
    service: { msg: 'Elige el tratamiento que te interesa.', ok: function (f) { return !!f.value; } },
    email: { msg: 'Revisa el correo: tiene que ser como nombre@ejemplo.es.', ok: function (f) { return !f.value.trim() || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value.trim()); } },
    consent: { msg: 'Marca la casilla para que podamos contactarte.', ok: function (f) { return f.checked; } }
  };

  function checkField(name) {
    var field = form.elements[name];
    var err = document.getElementById('err-' + name);
    var valid = rules[name].ok(field);
    field.setAttribute('aria-invalid', valid ? 'false' : 'true');
    err.hidden = valid;
    err.textContent = valid ? '' : rules[name].msg;
    return valid;
  }
  Object.keys(rules).forEach(function (name) {
    var field = form.elements[name];
    var recheck = function () { if (field.getAttribute('aria-invalid') === 'true') checkField(name); };
    field.addEventListener('input', recheck);
    field.addEventListener('change', recheck);
  });

  function readForm() {
    var e = form.elements;
    return { name: e.name.value.trim(), phone: e.phone.value.trim(), email: e.email.value.trim(), service: e.service.value, slot: e.slot.value, date: e.date.value, comment: e.comment.value.trim() };
  }
  function buildMessage(d) {
    var lines = ['Solicitud de cita', ''];
    lines.push('Nombre: ' + d.name);
    lines.push('Teléfono: ' + d.phone);
    if (d.email) lines.push('Correo: ' + d.email);
    lines.push('Tratamiento: ' + d.service);
    lines.push('Franja: ' + d.slot);
    if (d.date) lines.push('Día que prefiere: ' + d.date);
    if (d.comment) lines.push('Comentario: ' + d.comment);
    return lines.join('\n');
  }

  waLink.addEventListener('click', function () {
    var d = readForm();
    var href = 'https://wa.me/' + CLINIC_WHATSAPP;
    if (d.name && d.phone && d.service) href += '?text=' + encodeURIComponent(buildMessage(d));
    waLink.setAttribute('href', href);
  });

  function showResult(message) {
    result.textContent = '';
    var h = document.createElement('h4');
    h.textContent = 'Tu correo está listo para enviar';
    var p = document.createElement('p');
    p.textContent = 'Pulsa «Enviar» en tu programa de correo para terminar. Si no se abrió, copia el mensaje y mándalo por correo o WhatsApp.';
    var ta = document.createElement('textarea');
    ta.readOnly = true; ta.rows = 6; ta.value = message;
    ta.setAttribute('aria-label', 'Mensaje de la solicitud');
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'btn btn--ghost'; btn.textContent = 'Copiar mensaje';
    btn.addEventListener('click', function () {
      ta.select();
      var done = function () { btn.textContent = 'Mensaje copiado'; setTimeout(function () { btn.textContent = 'Copiar mensaje'; }, 2200); };
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(message).then(done, function () { document.execCommand('copy'); done(); }); }
      else { document.execCommand('copy'); done(); }
    });
    result.appendChild(h); result.appendChild(p); result.appendChild(ta); result.appendChild(btn);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var invalid = Object.keys(rules).filter(function (n) { return !checkField(n); });
    if (invalid.length) {
      status.textContent = invalid.length === 1 ? 'Hay un campo que revisar.' : 'Hay ' + invalid.length + ' campos que revisar.';
      form.elements[invalid[0]].focus();
      return;
    }
    status.textContent = '';
    var d = readForm();
    var message = buildMessage(d);
    form.reset();
    Object.keys(rules).forEach(function (n) { form.elements[n].setAttribute('aria-invalid', 'false'); });
    showResult(message);
    window.location.href = 'mailto:' + CLINIC_EMAIL + '?subject=' + encodeURIComponent('Solicitud de cita: ' + d.service) + '&body=' + encodeURIComponent(message);
    result.scrollIntoView({ block: 'nearest' });
  });

  /* stages: the photo sits in an arch and opens to full bleed.
     The photo layer always fills the pane; only clip-path and transform change,
     so phones and desktops share the same motion and nothing triggers layout. */
  var ZOOM = 1.15;
  var isWide = function () { return window.matchMedia('(min-width: 900px)').matches; };

  function Stage(el) {
    var pane = qs('.stage-sticky', el);
    var media = qs('.stage-media', el);
    var img = qs('img', media);
    var copy = qs('.hero-copy, .room-copy', el);
    var caption = qs('.stage-caption', media);
    var mirrored = el.classList.contains('stage--room');
    var isHero = el.classList.contains('stage--hero');
    var s = { el: el, value: 0, geo: null, size: '', scrolling: false, timeline: null };

    s.measure = function () {
      var W = pane.clientWidth, H = pane.clientHeight;
      var l, r, t, b;
      if (isWide()) {
        l = (mirrored ? .06 : .56) * W; r = (mirrored ? .56 : .06) * W; t = .16 * H; b = .16 * H;
      } else {
        l = r = .09 * W;
        b = Math.max(20, .04 * H);
        t = copy.getBoundingClientRect().bottom - pane.getBoundingClientRect().top + 28;
        t = Math.min(t, H - b - 200);
      }
      var ww = W - l - r, wh = H - t - b;
      var iw = +img.getAttribute('width'), ih = +img.getAttribute('height');
      var pos = getComputedStyle(img).objectPosition.split(' ').map(parseFloat);
      var px = (isNaN(pos[0]) ? 50 : pos[0]) / 100, py = (isNaN(pos[1]) ? 50 : pos[1]) / 100;
      var kp = Math.max(W / iw, H / ih);
      var kw = Math.max(ww / iw, wh / ih) * ZOOM;
      var S0 = kw / kp;
      var Ox = (W - iw * kp) * px, Oy = (H - ih * kp) * py;
      var Dx = l + (ww - iw * kw) * px, Dy = t + (wh - ih * kw) * py;
      s.geo = { l: l, r: r, t: t, b: b, R0: Math.min(ww / 2, wh * .95), S0: S0, tx0: Dx - S0 * Ox, ty0: Dy - S0 * Oy };
      s.size = W + 'x' + H;
      s.apply(s.value);
    };

    s.apply = function (v) {
      s.value = v;
      var g = s.geo;
      if (!g) return;
      var k = 1 - v;
      var rad = g.R0 * k;
      media.style.clipPath = 'inset(' + g.t * k + 'px ' + g.r * k + 'px ' + g.b * k + 'px ' + g.l * k + 'px round ' + rad + 'px ' + rad + 'px 0 0)';
      img.style.transform = 'translate3d(' + g.tx0 * k + 'px,' + g.ty0 * k + 'px,0) scale(' + (1 + (g.S0 - 1) * k) + ')';
      if (caption && s.scrolling) caption.style.opacity = clamp((v - .62) / .15, 0, 1);
      if (isHero && s.scrolling) copy.toggleAttribute('inert', v > .55);
    };

    s.enable = function () {
      var proxy = { v: s.value };
      s.scrolling = true;
      s.timeline = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: .6 } });
      s.timeline.to(proxy, { v: 1, duration: .8, ease: 'none', onUpdate: function () { s.apply(proxy.v); } }, 0);
      s.timeline.to({}, { duration: .2 }, .8);
    };

    s.disable = function () {
      s.scrolling = false;
      if (s.timeline) { s.timeline.scrollTrigger.kill(); s.timeline.kill(); s.timeline = null; }
      if (caption) caption.style.opacity = '';
      if (isHero) copy.removeAttribute('inert');
      s.apply(0);
    };

    return s;
  }

  var stages = qsa('.stage').map(Stage);
  function measureAll() { stages.forEach(function (s) { s.measure(); }); }
  measureAll();

  var lastW = window.innerWidth, lastH = window.innerHeight, resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var w = window.innerWidth, h = window.innerHeight;
      if (w === lastW && Math.abs(h - lastH) < 120) return;
      lastW = w; lastH = h;
      measureAll();
    }, 120);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureAll);
  window.addEventListener('load', measureAll);

  /* scroll-driven motion */
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  var mm = gsap.matchMedia();

  function photoDrift(img) {
    gsap.fromTo(img, { yPercent: -6, scale: 1.1 }, { yPercent: 6, scale: 1, ease: 'none',
      scrollTrigger: { trigger: img.closest('.photo-bg'), start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  mm.add('(prefers-reduced-motion: no-preference) and (min-height: 520px)', function () {
    root.classList.add('motion');
    stages.forEach(function (s) { s.enable(); });
    ScrollTrigger.refresh();
    return function () {
      stages.forEach(function (s) { s.disable(); });
      root.classList.remove('motion');
    };
  });

  mm.add('(prefers-reduced-motion: no-preference)', function () {
    qsa('.photo-bg-img').forEach(photoDrift);
  });

  ScrollTrigger.addEventListener('refresh', measureAll);
})();
