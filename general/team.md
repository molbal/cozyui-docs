---
layout: page
---

<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers
} from 'vitepress/theme'

const members = [
  {
    avatar: 'https://avatars.githubusercontent.com/u/5754480?v=4',
    name: 'Bálint Molnár-Kaló',
    title: 'Creator',
    links: [
      { icon: 'github', link: 'https://github.com/molbal' },
      { icon: 'huggingface', link: 'https://huggingface.co/molbal' },
      { icon: 'substack', link: 'https://molbal94.substack.com/' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/balint-molnar/' }
    ]
  },
  {
    avatar: 'https://avatars.githubusercontent.com/u/8932571?v=4',
    name: 'Dániel Mihó',
    title: 'UX Specialist',
    links: [
      { icon: 'github', link: 'https://github.com/molbal' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/balint-molnar/' }
    ]
  },
]
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      Core Team
    </template>
    <template #lead>
      The development of CozyUI is guided by an EU-based
      team, some of whom have chosen to be featured below.
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers :members />
</VPTeamPage>