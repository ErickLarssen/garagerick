// Fonte única dos dados do site (docs/06). O astro.config.mjs lê SITE.url daqui.
export const SITE = {
  name: 'Garagerick',
  url: 'https://garagerick.vercel.app', // provisório até o domínio próprio ser definido
  author: 'Erick Silva',
  description: 'Meus carros e motos favoritos em contagem regressiva até o Top 1.',
  links: {
    cinerick: 'https://cinerick.online',
    portfolio: 'https://ericksilva.dev',
    instagram: 'https://www.instagram.com/elarssen.design/',
    linkedin: 'https://www.linkedin.com/in/ericklarssen/',
    github: 'https://github.com/ErickLarssen/',
  },
} as const;
