import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "CozyUI",
  description: "Node based AI first workflow editor",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'User Guide', link: '/users' },
      { text: 'Developer Guide', link: '/developers' }
    ],

    sidebar: [

      {
        text: 'Getting Started',
        items: [
          { text: 'Installation', link: '/getting-started/installation' },
          { text: 'Running', link: '/getting-started/running' },
          { text: 'Concepts', link: '/getting-started/concepts' },
          { text: 'Configuration', link: '/getting-started/configuration' },
          { text: 'Workflows/Agents', link: '/getting-started/workflows' },
          { text: 'Deployment for scale', link: '/getting-started/deployment' },
          { text: 'Licensing', link: '/getting-started/license' },
        ]
      },
      {
        text: 'Integrating CozyUI',
        items: [
          { text: 'MCP (Model Context Protocol)', link: '/integration/mcp' },
          { text: 'OpenAI API', link: '/integration/oepnai' },
          { text: 'Triggers', link: '/integration/triggers' },
          { text: 'Secret storage', link: '/integration/secrets' },
          { text: 'Observability in CozyUI', link: '/integration/observability' },
        ]
      },
      {
        text: 'Best Practices',
        items: [
          { text: 'Design patterns', link: '/best-practices/design-patters' },
          { text: 'LLM Tool use', link: '/best-practices/tool-use' },
          { text: 'Prompt Chaining', link: '/best-practices/prompt-chaining' },
          { text: 'Prompt Routing', link: '/best-practices/prompt-routing' },
          { text: 'Prompt Orchestration', link: '/best-practices/prompt-orchestration' },
          { text: 'Evaluation-optimizer', link: '/best-practices/evaluator-optimizer' },
          { text: 'Agent loop', link: '/best-practices/agent-loop' }
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
          { text: 'Starting Point', link: '/developers/index' },
          { text: 'Core Concepts', link: '/developers/core-concepts' },
          { text: 'Execution order', link: '/developers/execution-order' },
          { text: 'Architecture of a node', link: '/developers/node' },
          { text: 'Available helpers', link: '/developers/helpers' },
          { text: 'Triggering leaves', link: '/developers/triggering-leaves' },
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
