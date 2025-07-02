import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "CozyUI",
  description: "Node based AI first workflow editor",
  sitemap: {
    hostname: 'https://docs.cozyui.org'
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    outline: {
      level: [2,6]
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
          { text: 'Configuration', link: '/getting-started/configuration' },
          { text: 'Deployment for scale', link: '/getting-started/deployment' },
          { text: 'Licensing', link: '/getting-started/license' },
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
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/molbal/cozyui' },
      { icon: 'reddit', link: 'https://reddit.com/r/cozyui' },
      { icon: 'discord', link: 'https://discord.gg/SwxRjf5x2r' },
    ],


    search: {
      provider: 'local'
    }
  }
})
