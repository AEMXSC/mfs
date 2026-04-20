/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import cardsParser from './parsers/cards.js';

// TRANSFORMER IMPORTS
import mfsCleanupTransformer from './transformers/mfs-cleanup.js';
import mfsSectionsTransformer from './transformers/mfs-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero': heroParser,
  'cards': cardsParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  mfsCleanupTransformer,
];

// Section transformer runs conditionally (only if template has 2+ sections)
const sectionTransformers = [
  mfsSectionsTransformer,
];

// PAGE TEMPLATE CONFIGURATION (from page-templates.json)
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'MFS.com homepage - financial services landing page with hero, role selection, value proposition, and three pillar cards',
  urls: [
    'https://www.mfs.com',
    'https://www.mfs.com/corporate/en/home.html',
  ],
  blocks: [
    {
      name: 'hero',
      instances: ['.heroBannerWithRoleContainer'],
    },
    {
      name: 'cards',
      instances: ['.aem-wrap--asset-list-with-links .asset-list-with-links'],
    },
  ],
  sections: [
    {
      id: 'section-hero',
      name: 'Hero with Role Selection',
      selector: '.heroBannerWithRoleContainer',
      style: null,
      blocks: ['hero'],
      defaultContent: [],
    },
    {
      id: 'section-value-proposition',
      name: 'Value Proposition',
      selector: '.aem-wrap--rich-text',
      style: null,
      blocks: [],
      defaultContent: ['.rich-text h2', '.rich-text h3'],
    },
    {
      id: 'section-pillars',
      name: 'Three Pillars',
      selector: '.aem-wrap--asset-list-with-links',
      style: null,
      blocks: ['cards'],
      defaultContent: [],
    },
  ],
};

/**
 * Execute page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });

  // Run section transformers only in afterTransform and only if template has sections
  if (hookName === 'afterTransform' && PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1) {
    sectionTransformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Section transformer failed:`, e);
      }
    });
  }
}

/**
 * Find all blocks on the page using template selectors
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;

    // 1. Execute beforeTransform (cleanup: modals, cookie consent, move hero)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using template selectors
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform (remove header/footer + add section breaks)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname
        .replace(/\/$/, '')
        .replace(/\.html$/, '')
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
