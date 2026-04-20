/* eslint-disable */
/* global WebImporter */

/**
 * MFS section transformer
 * Adds section breaks (<hr>) and section-metadata blocks between content sections
 * Runs in afterTransform (after block parsing)
 * Source: https://www.mfs.com
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) return;

  const { template } = payload;
  if (!template || !template.sections || template.sections.length < 2) return;

  const doc = element.ownerDocument || document;

  // Process sections in reverse order to avoid offset issues when inserting elements
  const sections = [...template.sections];
  const reversedSections = [...sections].reverse();

  for (const section of reversedSections) {
    if (!section.selector) continue;

    // Find the first element matching this section's selector
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    let sectionEl = null;
    for (const sel of selectors) {
      sectionEl = element.querySelector(sel);
      if (sectionEl) break;
    }
    if (!sectionEl) continue;

    // Add section-metadata block if section has a style
    if (section.style) {
      const metaBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      sectionEl.after(metaBlock);
    }

    // Add section break (<hr>) before every section EXCEPT the first one
    const isFirstSection = section.id === sections[0].id;
    if (!isFirstSection) {
      const hr = doc.createElement('hr');
      sectionEl.before(hr);
    }
  }
}
