// prefers-reduced-motion (docs/04): sempre consultar na hora, pois a preferência pode mudar.
const query = window.matchMedia('(prefers-reduced-motion: reduce)');

export const prefersReducedMotion = (): boolean => query.matches;
