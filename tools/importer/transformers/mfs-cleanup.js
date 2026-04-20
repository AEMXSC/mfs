/* eslint-disable */
/* global WebImporter */

/**
 * MFS site-wide cleanup transformer
 * Removes non-authorable content: modals, cookie consent, overlays, footer, nav
 * Preserves hero banner (inside header) by moving it to main before header removal
 * Source: https://www.mfs.com
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove elements that block parsing: modals, overlays, cookie consent, role gate
    WebImporter.DOMUtils.remove(element, [
      '.modal',                              // Login modals, T&C modals
      '.js-country-role-overlay',            // Country/role selection overlay
      '.roleGate__container',                // Role gate overlay
      '#onetrust-consent-sdk',               // OneTrust cookie consent
      '.onetrust-pc-dark-filter',            // OneTrust dark overlay
      '#onetrust-pc-sdk',                    // OneTrust preference center
      '.horizontal-nav-header__nav__overlay', // Nav overlay
      '.search-overlay',                     // Search flyout overlays
    ]);

    // Remove scroll-to-top links, video lightbox remnants, tracking pixels early
    element.querySelectorAll('p').forEach((p) => {
      const text = (p.textContent || '').trim();
      if (text === 'TOP' || text === 'close video') p.remove();
    });
    element.querySelectorAll('a[title="Close Modal"], a.close-lightbox').forEach((a) => {
      const p = a.closest('p');
      if (p) p.remove(); else a.remove();
    });
    element.querySelectorAll('img[src*="rlcdn.com"], img[src*="demdex.net"]').forEach((img) => {
      const p = img.closest('p');
      if (p) p.remove(); else img.remove();
    });

    // CRITICAL: Move hero banner from header to main BEFORE header removal
    // The hero (.heroBannerWithRoleContainer) is inside <header> but is authorable content
    const hero = element.querySelector('.heroBannerWithRoleContainer');
    const main = element.querySelector('main');
    if (hero && main) {
      // Insert hero as first child of main
      main.insertBefore(hero, main.firstChild);
    }
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove non-authorable content: header (hero already moved), footer, nav
    WebImporter.DOMUtils.remove(element, [
      'header',                  // Main site header (hero already extracted)
      'footer',                  // Footer with links and social
      'nav',                     // Any remaining navigation
      '[role="region"]',         // Accessibility labels region
      'noscript',                // No-script fallbacks
      'iframe',                  // Tracking iframes
      'link',                    // Stylesheet links
      '.hidden',                 // Hidden elements
      '.sr-only',                // Screen reader only elements
      'svg:not(.heroBannerWithRoleContainer svg)', // SVG icons (not hero)
    ]);

    // Remove leftover junk: "TOP" scroll link, "close video" modal, tracking pixels
    element.querySelectorAll('p').forEach((p) => {
      const text = (p.textContent || '').trim();
      if (text === 'TOP') p.remove();
      if (text === 'close video') p.remove();
    });
    element.querySelectorAll('a[title="Close Modal"]').forEach((a) => a.closest('p')?.remove() || a.remove());
    // Remove tracking pixels (1x1 gifs, rlcdn, etc.)
    element.querySelectorAll('img').forEach((img) => {
      const src = img.src || '';
      if (src.includes('rlcdn.com') || src.includes('demdex.net') || src.includes('.gif') && !src.includes('content/dam')) {
        const p = img.closest('p');
        if (p) p.remove(); else img.remove();
      }
    });
    // Remove empty headings
    element.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
      if (!(h.textContent || '').trim()) h.remove();
    });
    // Fix broken alt text from Handlebars templates
    element.querySelectorAll('img[alt*="assetDetails"]').forEach((img) => {
      const src = img.src || '';
      if (src.includes('Collective_Expertise')) img.alt = 'Collective Expertise';
      else if (src.includes('Risk_Management')) img.alt = 'Risk Management';
      else if (src.includes('Longterm_Discipline')) img.alt = 'Long-Term Discipline';
      else img.alt = '';
    });

    // Clean up tracking/analytics attributes
    const allElements = element.querySelectorAll('*');
    allElements.forEach((el) => {
      ['onclick', 'onmouseover', 'data-track', 'data-analytics', 'data-cmp'].forEach((attr) => {
        if (el.hasAttribute(attr)) el.removeAttribute(attr);
      });
    });
  }
}
