import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // Documentation sidebar
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/index',
        'getting-started/installation',
        'getting-started/first-config',
        'getting-started/understanding-fluidnc',
      ],
    },
    {
      type: 'category',
      label: 'Recipes',
      collapsed: false,
      items: [
        'recipes/index',
        'recipes/basic-3axis-router',
        'recipes/laser-engraver',
        'recipes/4axis-mill',
        'recipes/custom-board',
      ],
    },
    {
      type: 'category',
      label: 'Features',
      collapsed: true,
      items: [
        'features/wizard',
        'features/expert-editor',
        'features/pin-mapper',
        'features/import-export',
      ],
    },
    {
      type: 'category',
      label: 'Troubleshooting',
      collapsed: true,
      items: [
        'troubleshooting/index',
        'troubleshooting/common-issues',
        'troubleshooting/pin-conflicts',
        'troubleshooting/legacy-configs',
      ],
    },
  ],
};

export default sidebars;
