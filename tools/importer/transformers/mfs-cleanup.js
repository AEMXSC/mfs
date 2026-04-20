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

    // Clean up tracking/analytics attributes
    const allElements = element.querySelectorAll('*');
    allElements.forEach((el) => {
      ['onclick', 'onmouseover', 'data-track', 'data-analytics', 'data-cmp'].forEach((attr) => {
        if (el.hasAttribute(attr)) el.removeAttribute(attr);
      });
    });
  }
}
