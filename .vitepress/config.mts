import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "CozyUI Docs",
  description: "Node based AI first workflow editor",
  head: [
   ['link', { rel: 'icon', type: 'image/png', href: '/favicon-96x96.png', sizes: '96x96' }],
   ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
   ['link', { rel: 'shortcut icon', href: '/favicon.ico' }],
   ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],
   ['link', { rel: 'manifest', href: '/site.webmanifest' }]
  ],
  sitemap: {
    hostname: 'https://docs.cozyui.org'
  },
  themeConfig: {
    logo: '/icon-smol.png',
    outline: {
      level: [2,6]
    },

    editLink: {
      pattern: 'https://github.com/molbal/cozyui-docs/blob/main/:path',
      text: 'Edit this page on GitHub'
    },
    lastUpdated: true,
    cleanUrls: true,
    externalLinkIcon: true,


    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started/installation' },
      { text: 'Developer Guide', link: '/developers/dev-index' }
    ],

    sidebar: [

      {
        text: 'Getting Started',
        items: [
          { text: 'Installation', link: '/getting-started/installation' },
          { text: 'Running', link: '/getting-started/running' },
          { text: 'Concepts', link: '/getting-started/concepts' },
          { text: 'Workflows (Agents)', link: '/getting-started/workflows' },
          { text: 'Node Execution Order', link: '/getting-started/execution-order' },
          { text: 'Configuration', link: '/getting-started/configuration' },
          { text: 'Deployment for scale', link: '/getting-started/deployment' },
          { text: 'Workflow Analytics', link: '/getting-started/observability' },
        ]
      },
      {
        text: 'Integrating CozyUI',
        items: [
          { text: 'Model Context Protocol (MCP)', link: '/integration/mcp' },
          { text: 'OpenAI API', link: '/integration/openai-api' },
          { text: 'Triggers', link: '/integration/triggers' },
          { text: 'Secret storage', link: '/integration/secrets' },
          { text: 'Observability in CozyUI', link: '/integration/observability' },
        ]
      },
      {
        text: 'Best Practices',
        items: [
          { text: 'Design patterns', link: '/best-practices/design-patters' },
          { text: 'Prompt Chaining', link: '/best-practices/prompt-chaining' },
          { text: 'Prompt Routing', link: '/best-practices/prompt-routing' },
          { text: 'Prompt Orchestration', link: '/best-practices/prompt-orchestration' },
          { text: 'Evaluation-optimizer', link: '/best-practices/evaluator-optimizer' },
          { text: 'Agentic Workflows', link: '/best-practices/agentic-workflows' }
        ]
      },
      {
        text: 'Real life examples',
        items: [
          { text: 'Deep research', link: '/examples/deep-research' },
          { text: 'Mass image captioning', link: '/examples/image-captioning' },
        ]
      },
      {
        text: 'CozyUI Hub',
        items: [
          { text: 'Community Portal', link: '/community/ch-index' },
          { text: 'Sharing workflows', link: '/community/workflows' },
          { text: 'Community nodes', link: '/community/nodes' },
          { text: 'Community support', link: '/community/support' },
        ]
      },
      {
        text: 'Developer Guide',
        items: [
          { text: 'Starting Point', link: '/developers/dev-index' },
          { text: 'Core Concepts', link: '/developers/core-concepts' },
          { text: 'Execution order', link: '/developers/execution-order' },
          { text: 'Architecture of a node', link: '/developers/node' },
          { text: 'Available helpers', link: '/developers/helpers' },
          { text: 'Triggering leaves', link: '/developers/triggering-leaves' },
          { text: 'Frontend events', link: '/developers/events' },
          { text: 'Publishing nodes', link: '/developers/publishing-nodes' },
        ]
      },

      { text: 'Support', link: '/general/support' },
      { text: 'Licensing', link: '/general/license' },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/molbal/cozyui' },
      { icon: 'reddit', link: 'https://reddit.com/r/cozyui' },
      { icon: 'discord', link: 'https://discord.gg/SwxRjf5x2r' },
    ],


    search: {
      provider: 'local'
    },

    footer: {
      message: 'Free and open source software released under the Apache License 2.0.',
      copyright: 'Copyright © 2025 <a href="https://www.linkedin.com/in/balint-molnar/" target="_blank">Bálint Molnár-Kaló</a'
    }
  }
})
