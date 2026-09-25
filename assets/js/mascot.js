(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var mascot = document.getElementById('mascot');
  var main = document.getElementById('contenido');
  var header = document.getElementById('cabecera');
  var menu = document.getElementById('menu');
  if (!mascot || !main || !header) return;

  var sections = Array.prototype.slice.call(main.querySelectorAll(':scope > section'));
  var cita = document.getElementById('cita');
  if (!sections.length || !cita) return;

  // The footer sits outside <main> but still holds text/links the tooth must
  // avoid — tracked as one more zone so there is never a scroll position
  // where nothing counts as "active" and the tooth freezes mid-air over it.
  var footer = document.querySelector('.site-footer');
  var zones = footer ? sections.concat([footer]) : sections;

  // Elements the tooth should never sit on top of: readable text and the
  // form/price cards. Photos are excluded on purpose — during the arch
  // sections they can fill the whole screen, and floating over a photo reads
  // as a companion character rather than a mistake.
  var AVOID = 'h1,h2,h3,p,li,blockquote,figcaption,dt,dd,label,button,a,th,td,summary,legend,.form-panel,.price-table,.photo-panel';

  var HALF = 34; // half the mascot's footprint at full size, in px

  var state = { x: -999, y: 160, tx: -999, ty: 160, squeeze: 1, tsqueeze: 1, active: false, peeking: false, mood: 'neutral' };
  var raf = null;
  var dirty = true;

  function headerBottom() {
    return header.getBoundingClientRect().bottom + 32;
  }

  function overlaps(a, b) {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  }

  function wholePageRects() {
    return footer ? avoidRects(main).concat(avoidRects(footer)) : avoidRects(main);
  }

  function avoidRects(section) {
    var pad = 10;
    var out = [];
    var els = section.querySelectorAll(AVOID);
    for (var i = 0; i < els.length; i++) {
      var r = els[i].getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        out.push({ left: r.left - pad, right: r.right + pad, top: r.top - pad, bottom: r.bottom + pad });
      }
    }
    return out;
  }

  function findActiveSection(vh) {
    for (var i = 0; i < zones.length; i++) {
      var r = zones[i].getBoundingClientRect();
      if (r.top <= vh * 0.55 && r.bottom >= vh * 0.45) return zones[i];
    }
    return null;
  }

  // Every spot the tooth could rest in, as an x/y grid across the part of the
  // active section actually on screen — plus, when the section centers its
  // content (a `.wrap`), the two page margins beside it, which are always
  // empty and so tried first.
  function candidateXs(vw, wrapRect) {
    var xs = [];
    for (var i = 1; i <= 11; i++) xs.push((i / 12) * vw);
    if (wrapRect) {
      if (wrapRect.left > 4) xs.unshift(wrapRect.left / 2);
      if (vw - wrapRect.right > 4) xs.unshift((vw + wrapRect.right) / 2);
    }
    return xs;
  }

  function candidateYs(top, bottom, preferred, sectionRect, rects) {
    if (bottom - top < HALF * 2) return [(top + bottom) / 2];
    var count = Math.max(3, Math.min(9, Math.round((bottom - top) / (HALF * 1.5))));
    var ys = [];
    for (var i = 0; i < count; i++) ys.push(top + HALF + (i / (count - 1)) * (bottom - top - HALF * 2));
    var mid = Math.max(top + HALF, Math.min(bottom - HALF, preferred));
    if (ys.indexOf(mid) === -1) ys.push(mid);
    // The empty padding at the very top/bottom of the section (before its
    // first line and after its last) is always content-free — worth trying
    // first when that edge is the part currently on screen.
    var padTop = sectionRect.top + HALF + 4, padBottom = sectionRect.bottom - HALF - 4;
    if (padTop >= top && padTop <= bottom) ys.unshift(padTop);
    if (padBottom >= top && padBottom <= bottom) ys.unshift(padBottom);
    // A uniform grid can straddle every line in a text-dense section without
    // ever landing in the real gap between two paragraphs or list items —
    // so also try just above and below each avoided element directly.
    for (var r = 0; r < rects.length; r++) {
      var above = rects[r].top - HALF - 2, below = rects[r].bottom + HALF + 2;
      if (above >= top && above <= bottom) ys.push(above);
      if (below >= top && below <= bottom) ys.push(below);
    }
    return ys;
  }

  // Scans every (x, y) candidate at the given half-size and returns the one
  // that touches the fewest avoided elements, breaking ties by distance to
  // where the tooth currently is so it doesn't hop around pointlessly.
  function bestSpot(rects, xs, ys, half, prevX, prevY) {
    var best = null, bestHits = Infinity, bestDist = Infinity;
    for (var yi = 0; yi < ys.length; yi++) {
      for (var xi = 0; xi < xs.length; xi++) {
        var x = xs[xi], y = ys[yi];
        var box = { left: x - half, right: x + half, top: y - half, bottom: y + half };
        var hits = 0;
        for (var k = 0; k < rects.length; k++) if (overlaps(box, rects[k])) hits++;
        var dist = Math.abs(x - prevX) + Math.abs(y - prevY) * 0.5;
        if (hits < bestHits || (hits === bestHits && dist < bestDist)) {
          bestHits = hits; bestDist = dist; best = { x: x, y: y, hits: hits };
        }
        if (hits === 0 && dist < 4) return best; // already parked in a clear spot — stop early
      }
    }
    return best;
  }

  // Last resort when no clear spot exists anywhere on screen: retreat to a
  // corner and duck down so only the head pokes up past the bottom edge —
  // still visible, never on top of anything, never fully gone. Sweeps
  // corners, then the whole bottom edge, then a couple of other peek
  // heights, and only shrinks if a narrow phone gutter genuinely has no
  // full-size gap — the tooth would rather be a little smaller than sit on
  // top of a line of text.
  function peekSpot(vw, vh, rects, prevX) {
    var heights = [34, 24, 46, 16];
    var sizes = [1, 0.72, 0.5, 0.32, 0.2];

    for (var s = 0; s < sizes.length; s++) {
      var half = HALF * sizes[s];
      // Corners hug the true screen edge at the size being tried, so a
      // narrow phone gutter still has somewhere to shrink into.
      var corners = [vw - half - 3, half + 3];
      corners.sort(function (a, b) { return Math.abs(a - prevX) - Math.abs(b - prevX); });
      var xs = corners.concat(candidateXs(vw, null));
      for (var h = 0; h < heights.length; h++) {
        var visibleTop = vh - heights[h];
        for (var i = 0; i < xs.length; i++) {
          var x = xs[i];
          var visible = { left: x - half, right: x + half, top: visibleTop, bottom: vh };
          var clear = true;
          for (var k = 0; k < rects.length; k++) if (overlaps(visible, rects[k])) { clear = false; break; }
          if (clear) return { x: x, y: vh - heights[h] + 35, squeeze: sizes[s] };
        }
      }
    }
    // Content wall-to-wall at every size tried: sit in the nearest corner
    // anyway, as small as we go — better than nothing found at all.
    var last = sizes[sizes.length - 1];
    return { x: prevX < vw / 2 ? HALF * last + 3 : vw - HALF * last - 3, y: vh - 16 + 35, squeeze: last };
  }

  function pickTarget() {
    var vw = window.innerWidth, vh = window.innerHeight;
    var active = findActiveSection(vh);

    if (!active) {
      var firstTop = sections[0].getBoundingClientRect().top;
      var lastBottom = zones[zones.length - 1].getBoundingClientRect().bottom;
      state.active = !(firstTop > vh * 0.9 || lastBottom < vh * 0.15);
      state.tsqueeze = 1;
      return { x: state.tx < 0 ? vw / 2 : state.tx, y: state.ty < 0 ? vh * 0.5 : state.ty };
    }

    state.active = true;
    state.mood = active === cita ? 'happy' : 'neutral';

    var rect = active.getBoundingClientRect();
    var top = Math.max(rect.top, headerBottom());
    var bottom = Math.min(rect.bottom, vh - 20);
    var wrapEl = active.querySelector('.wrap');
    var wrapRect = wrapEl ? wrapEl.getBoundingClientRect() : null;

    var rects = avoidRects(active);
    var xs = candidateXs(vw, wrapRect);
    var ys = candidateYs(top, bottom, vh * 0.58, rect, rects);
    var prevX = state.tx < 0 ? vw / 2 : state.tx;
    var prevY = state.ty < 0 ? vh * 0.5 : state.ty;

    // Try full size, then shrink in two steps — the tooth only gets smaller
    // when a truly empty spot at full size doesn't exist, so it never sits
    // on top of text or the price/form cards.
    var half = HALF, squeeze = 1;
    var spot = bestSpot(rects, xs, ys, half, prevX, prevY);
    if (spot.hits > 0) {
      var spot2 = bestSpot(rects, xs, ys, HALF * 0.72, prevX, prevY);
      if (spot2.hits < spot.hits) { spot = spot2; half = HALF * 0.72; squeeze = 0.72; }
    }
    if (spot.hits > 0) {
      var spot3 = bestSpot(rects, xs, ys, HALF * 0.45, prevX, prevY);
      if (spot3.hits < spot.hits) { spot = spot3; half = HALF * 0.45; squeeze = 0.45; }
    }

    // If even the smallest size still touches something, there is no honest
    // free spot in the open — hide in a corner instead of covering anything.
    // The corner sits right at the bottom edge, where the next section can
    // already be peeking into view, so this checks the whole page rather
    // than just the section currently counted as "active".
    if (spot.hits > 0) {
      state.peeking = true;
      var peek = peekSpot(vw, vh, wholePageRects(), prevX);
      state.tsqueeze = peek.squeeze;
      return peek;
    }

    state.peeking = false;
    state.tsqueeze = squeeze;
    return { x: spot.x, y: spot.y };
  }

  function tick() {
    raf = null;
    if (menu && menu.classList.contains('is-open')) {
      mascot.style.opacity = '0';
      dirty = true;
      return;
    }
    if (dirty) {
      dirty = false;
      var t = pickTarget();
      state.tx = t.x;
      state.ty = t.y;
    }
    var dx = state.tx - state.x, dy = state.ty - state.y, ds = state.tsqueeze - state.squeeze;
    var moving = Math.abs(dx) + Math.abs(dy) > 0.05 || Math.abs(ds) > 0.002;
    if (state.x < 0) { state.x = state.tx; state.y = state.ty; state.squeeze = state.tsqueeze; dx = 0; dy = 0; ds = 0; }
    else if (moving) { state.x += dx * 0.09; state.y += dy * 0.11; state.squeeze += ds * 0.1; }

    var tilt = state.peeking ? 0 : Math.max(-14, Math.min(14, dx * 0.09 * 0.6));
    var squash = state.peeking ? 0 : Math.max(-0.07, Math.min(0.07, dy * 0.11 * 0.012));
    var s = state.squeeze;
    mascot.style.transform = 'translate3d(' + state.x.toFixed(1) + 'px,' + state.y.toFixed(1) + 'px,0) rotate(' + tilt.toFixed(1) + 'deg) scale(' + (s * (1 + squash)).toFixed(3) + ',' + (s * (1 - squash)).toFixed(3) + ')';
    mascot.style.opacity = state.active ? '1' : '0';
    mascot.dataset.mood = state.mood;
    mascot.dataset.peeking = state.peeking ? 'true' : 'false';

    if (moving || dirty) raf = requestAnimationFrame(tick);
  }

  function schedule() {
    dirty = true;
    if (!raf) raf = requestAnimationFrame(tick);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  if (menu) {
    menu.addEventListener('transitionend', schedule);
    document.querySelector('.menu-toggle').addEventListener('click', schedule);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
  window.addEventListener('load', schedule);

  schedule();
  setTimeout(schedule, 60); // belt-and-braces: guarantees a second attempt right after load

  (function blink() {
    var eyes = mascot.querySelectorAll('.mascot-eye');
    for (var i = 0; i < eyes.length; i++) eyes[i].style.transform = 'scaleY(.15)';
    setTimeout(function () {
      for (var i = 0; i < eyes.length; i++) eyes[i].style.transform = '';
    }, 140);
    setTimeout(blink, 2400 + Math.random() * 2600);
  })();
})();
