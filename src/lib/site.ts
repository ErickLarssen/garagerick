// Fonte única dos dados do site (docs/06). O astro.config.mjs lê SITE.url daqui.
export const SITE = {
  name: 'Garagerick',
  url: 'https://garagerick.online',
  author: 'Erick Silva',
  description: 'Meus carros e motos favoritos em contagem regressiva até o Top 1.',
  links: {
    cinerick: 'https://cinerick.online',
    portfolio: 'https://ericksilva.dev',
    instagram: 'https://www.instagram.com/elarssen.design/',
    youtube: 'https://www.youtube.com/@ElarssenDesign/',
    github: 'https://github.com/ErickLarssen/',
    behance: 'https://www.behance.net/ericklarssen/',
  },
} as const;
