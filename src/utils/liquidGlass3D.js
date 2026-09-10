/**
 * liquidGlass3D.js
 * Apple iOS / Vision Pro Refined Liquid Glass Light Tracking Engine
 *
 * What it does:
 *  - Tracks cursor position on glass info-cards and buttons to animate a
 *    specular glare highlight (the hot-spot you see on real frosted glass).
 *  - Does NOT tilt / rotate elements — that was removed for readability.
 *  - Also adds a subtle "breathing" border shimmer so glass feels alive.
 *
 * Which elements get the effect:
 *  - .btn-3d-liquid        — CTA buttons
 *  - .ios-glass-card       — generic glass info cards
 *  - .tile-3d              — legacy alias
 *  - .card-3d-liquid       — named liquid card
 *  - .architecture-card    — platform architecture cards
 *  - .job-card             — curated matches cards
 *  - .radar-card           — skill gap radar card
 *  - .competency-gaps-card — skill gap analytics card
 *  - [data-glass-card]     — opt-in attribute for any extra card
 *
 * Add [data-glass-no-glare] to any element to opt-out of the glare.
 */

const CARD_SELECTORS = [
  '.btn-3d-liquid',
  '.ios-glass-card',
  '.tile-3d',
  '.card-3d-liquid',
  '.architecture-card',
  '.job-card',
  '.radar-card',
  '.competency-gaps-card',
  '[data-glass-card]',
].join(', ');

export function initLiquidGlass3D() {
  if (typeof window === 'undefined') return;

  const trackedElements = new WeakSet();

  // RAF-throttled mouse handler per element
  function attachToElement(el) {
    if (trackedElements.has(el)) return;
    if (el.hasAttribute('data-glass-no-glare')) return;
    trackedElements.add(el);

    let rafId = null;
    let lastX = null;
    let lastY = null;

    function applyGlare() {
      if (lastX === null) return;
      const rect = el.getBoundingClientRect();
      const relX = lastX - rect.left;
      const relY = lastY - rect.top;
      const glareX = ((relX / rect.width) * 100).toFixed(1);
      const glareY = ((relY / rect.height) * 100).toFixed(1);
      el.style.setProperty('--glare-x', `${glareX}%`);
      el.style.setProperty('--glare-y', `${glareY}%`);
      rafId = null;
    }

    function onMouseMove(e) {
      lastX = e.clientX;
      lastY = e.clientY;
      if (!rafId) {
        rafId = requestAnimationFrame(applyGlare);
      }
    }

    function onMouseEnter() {
      el.style.setProperty('--glare-opacity', '1');
    }

    function onMouseLeave() {
      el.style.setProperty('--glare-opacity', '0');
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    el.addEventListener('mousemove', onMouseMove, { passive: true });
    el.addEventListener('mouseenter', onMouseEnter, { passive: true });
    el.addEventListener('mouseleave', onMouseLeave, { passive: true });

    // Initialize CSS variables
    el.style.setProperty('--glare-x', '50%');
    el.style.setProperty('--glare-y', '30%');
    el.style.setProperty('--glare-opacity', '0');
  }

  function attachAll() {
    document.querySelectorAll(CARD_SELECTORS).forEach(attachToElement);
  }

  // Initial attach
  attachAll();

  // Watch for dynamic DOM additions (SPA route changes, portals, etc.)
  const observer = new MutationObserver(() => {
    // Debounce: wait one frame to batch multiple DOM changes
    requestAnimationFrame(attachAll);
  });

  observer.observe(document.body, { childList: true, subtree: true });

  return () => observer.disconnect();
}

// Auto-boot on page load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLiquidGlass3D);
  } else {
    // Slight delay so React has time to render on first load
    setTimeout(initLiquidGlass3D, 80);
  }
}
