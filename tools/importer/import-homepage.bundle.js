var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document: document2 }) {
    const picture = element.querySelector(".image-container picture");
    const img = element.querySelector(".image-container img");
    const h1 = element.querySelector("h1");
    const h2 = element.querySelector("h2");
    const cells = [];
    if (picture) {
      cells.push([picture]);
    } else if (img) {
      cells.push([img]);
    }
    const contentCell = [];
    if (h1) contentCell.push(h1);
    if (h2) contentCell.push(h2);
    if (contentCell.length > 0) {
      cells.push(contentCell);
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "hero",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function parse2(element, { document: document2 }) {
    const cardCols = element.querySelectorAll(".asset-col");
    const cells = [];
    cardCols.forEach((col) => {
      const picture = col.querySelector("picture");
      const img = col.querySelector("img");
      const imageEl = picture || img;
      const titleLink = col.querySelector("h3.asset-header a, h3 a");
      const title = titleLink ? titleLink.textContent.trim() : "";
      const href = titleLink ? titleLink.getAttribute("href") || "" : "";
      const imageCell = imageEl || "";
      const textCell = [];
      if (title) {
        const p = document2.createElement("p");
        const strong = document2.createElement("strong");
        if (href) {
          const link = document2.createElement("a");
          link.href = href;
          link.textContent = title;
          strong.appendChild(link);
        } else {
          strong.textContent = title;
        }
        p.appendChild(strong);
        textCell.push(p);
      }
      if (imageCell || textCell.length > 0) {
        cells.push([imageCell, textCell.length > 0 ? textCell : ""]);
      }
    });
    const ctaLink = element.querySelector(".cta-container a, a.cta-link");
    if (ctaLink) {
      const ctaText = ctaLink.textContent.trim();
      const ctaHref = ctaLink.getAttribute("href") || "";
      if (ctaText && ctaHref) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = ctaHref;
        a.textContent = ctaText;
        p.appendChild(a);
        cells.push(["", p]);
      }
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "cards",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/transformers/mfs-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".modal",
        // Login modals, T&C modals
        ".js-country-role-overlay",
        // Country/role selection overlay
        ".roleGate__container",
        // Role gate overlay
        "#onetrust-consent-sdk",
        // OneTrust cookie consent
        ".onetrust-pc-dark-filter",
        // OneTrust dark overlay
        "#onetrust-pc-sdk",
        // OneTrust preference center
        ".horizontal-nav-header__nav__overlay",
        // Nav overlay
        ".search-overlay"
        // Search flyout overlays
      ]);
      const hero = element.querySelector(".heroBannerWithRoleContainer");
      const main = element.querySelector("main");
      if (hero && main) {
        main.insertBefore(hero, main.firstChild);
      }
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        // Main site header (hero already extracted)
        "footer",
        // Footer with links and social
        "nav",
        // Any remaining navigation
        '[role="region"]',
        // Accessibility labels region
        "noscript",
        // No-script fallbacks
        "iframe",
        // Tracking iframes
        "link",
        // Stylesheet links
        ".hidden",
        // Hidden elements
        ".sr-only",
        // Screen reader only elements
        "svg:not(.heroBannerWithRoleContainer svg)"
        // SVG icons (not hero)
      ]);
      const allElements = element.querySelectorAll("*");
      allElements.forEach((el) => {
        ["onclick", "onmouseover", "data-track", "data-analytics", "data-cmp"].forEach((attr) => {
          if (el.hasAttribute(attr)) el.removeAttribute(attr);
        });
      });
    }
  }

  // tools/importer/transformers/mfs-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.afterTransform) return;
    const { template } = payload;
    if (!template || !template.sections || template.sections.length < 2) return;
    const doc = element.ownerDocument || document;
    const sections = [...template.sections];
    const reversedSections = [...sections].reverse();
    for (const section of reversedSections) {
      if (!section.selector) continue;
      const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
      let sectionEl = null;
      for (const sel of selectors) {
        sectionEl = element.querySelector(sel);
        if (sectionEl) break;
      }
      if (!sectionEl) continue;
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        sectionEl.after(metaBlock);
      }
      const isFirstSection = section.id === sections[0].id;
      if (!isFirstSection) {
        const hr = doc.createElement("hr");
        sectionEl.before(hr);
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "hero": parse,
    "cards": parse2
  };
  var transformers = [
    transform
  ];
  var sectionTransformers = [
    transform2
  ];
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "MFS.com homepage - financial services landing page with hero, role selection, value proposition, and three pillar cards",
    urls: [
      "https://www.mfs.com",
      "https://www.mfs.com/corporate/en/home.html"
    ],
    blocks: [
      {
        name: "hero",
        instances: [".heroBannerWithRoleContainer"]
      },
      {
        name: "cards",
        instances: [".aem-wrap--asset-list-with-links .asset-list-with-links"]
      }
    ],
    sections: [
      {
        id: "section-hero",
        name: "Hero with Role Selection",
        selector: ".heroBannerWithRoleContainer",
        style: null,
        blocks: ["hero"],
        defaultContent: []
      },
      {
        id: "section-value-proposition",
        name: "Value Proposition",
        selector: ".aem-wrap--rich-text",
        style: null,
        blocks: [],
        defaultContent: [".rich-text h2", ".rich-text h3"]
      },
      {
        id: "section-pillars",
        name: "Three Pillars",
        selector: ".aem-wrap--asset-list-with-links",
        style: null,
        blocks: ["cards"],
        defaultContent: []
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
    if (hookName === "afterTransform" && PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1) {
      sectionTransformers.forEach((transformerFn) => {
        try {
          transformerFn.call(null, hookName, element, enhancedPayload);
        } catch (e) {
          console.error(`Section transformer failed:`, e);
        }
      });
    }
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document: document2, url, html, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
