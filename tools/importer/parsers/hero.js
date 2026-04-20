/* eslint-disable */
/* global WebImporter */

/**
 * Parser: hero
 * Source: https://www.mfs.com
 * Base block: hero
 * Selector: .heroBannerWithRoleContainer
 *
 * Source structure:
 *   .heroBannerWithRoleContainer
 *     .image-container > picture > img[alt="Hero"] (background image)
 *     .header-text-container > h1 "Welcome to MFS" + h2 subtitle
 *     .role-box-container (role selection cards - interactive, skip)
 *
 * Target (from block library):
 *   Row 1: Background image (picture element)
 *   Row 2: Title (h1) + Subheading (h2) + optional CTA
 */
export default function parse(element, { document }) {
  // Extract background image from the hero
  const picture = element.querySelector('.image-container picture');
  const img = element.querySelector('.image-container img');

  // Extract heading content
  const h1 = element.querySelector('h1');
  const h2 = element.querySelector('h2');

  // Build cells matching hero block library structure:
  // Row 1: background image
  // Row 2: heading + subheading content
  const cells = [];

  // Row 1: Background image
  if (picture) {
    cells.push([picture]);
  } else if (img) {
    cells.push([img]);
  }

  // Row 2: Title + subtitle content
  const contentCell = [];
  if (h1) contentCell.push(h1);
  if (h2) contentCell.push(h2);

  if (contentCell.length > 0) {
    cells.push(contentCell);
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'hero',
    cells,
  });

  element.replaceWith(block);
}
