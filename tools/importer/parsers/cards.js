/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards
 * Source: https://www.mfs.com
 * Base block: cards
 * Selector: .aem-wrap--asset-list-with-links .asset-list-with-links
 *
 * Source structure:
 *   .asset-list-with-links > .container-content-full-width > .row
 *     .asset-col (×3):
 *       h3.asset-header > a[title] (card title + link)
 *       .image-container > a > picture > img (card image)
 *     .cta-container > a "Learn More" (CTA link)
 *
 * Target (from block library):
 *   Each row = one card: [image cell] [text cell with title + optional CTA]
 */
export default function parse(element, { document }) {
  // Find the card columns
  const cardCols = element.querySelectorAll('.asset-col');
  const cells = [];

  cardCols.forEach((col) => {
    // Extract image
    const picture = col.querySelector('picture');
    const img = col.querySelector('img');
    const imageEl = picture || img;

    // Extract title and link
    const titleLink = col.querySelector('h3.asset-header a, h3 a');
    const title = titleLink ? titleLink.textContent.trim() : '';
    const href = titleLink ? titleLink.getAttribute('href') || '' : '';

    // Build image cell
    const imageCell = imageEl || '';

    // Build text cell with title as linked heading
    const textCell = [];
    if (title) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      if (href) {
        const link = document.createElement('a');
        link.href = href;
        link.textContent = title;
        strong.appendChild(link);
      } else {
        strong.textContent = title;
      }
      p.appendChild(strong);
      textCell.push(p);
    }

    // Add row: [image, text]
    if (imageCell || textCell.length > 0) {
      cells.push([imageCell, textCell.length > 0 ? textCell : '']);
    }
  });

  // Add Learn More CTA as a final row if present
  const ctaLink = element.querySelector('.cta-container a, a.cta-link');
  if (ctaLink) {
    const ctaText = ctaLink.textContent.trim();
    const ctaHref = ctaLink.getAttribute('href') || '';
    if (ctaText && ctaHref) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = ctaHref;
      a.textContent = ctaText;
      p.appendChild(a);
      cells.push(['', p]);
    }
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'cards',
    cells,
  });

  // Remove sibling junk inside the wrapper (e.g., "TOP" scroll link, lightbox remnants)
  const parent = element.parentElement;
  if (parent) {
    parent.querySelectorAll('p').forEach((p) => {
      const text = (p.textContent || '').trim();
      if (text === 'TOP' || text === 'close video' || !text) p.remove();
    });
    // Remove tracking pixels
    parent.querySelectorAll('img[src*="rlcdn"], img[src*="demdex"]').forEach((img) => {
      const p = img.closest('p');
      if (p) p.remove(); else img.remove();
    });
  }

  element.replaceWith(block);
}
