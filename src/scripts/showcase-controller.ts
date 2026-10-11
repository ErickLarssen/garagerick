// Controlador da vitrine (docs/05). O HTML já vem completo do servidor; aqui alternamos o veículo
// ativo (fundo, informações e ficha) por setas, teclado, swipe e hash. Sem cards/carrossel desde
// 2026-10-11 (decisão do Erick).
import { formatRank } from '@/lib/format';
import type { ShowcaseVehicle } from '@/lib/showcase-data';
import { prefersReducedMotion } from '@/scripts/reduced-motion';

/** Movimento (docs/04): mesmo easing do token --ease-garage. */
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const INFO_OUT_MS = 180;
const INFO_IN_MS = 400;
const INFO_STAGGER_MS = 60;
const ZOOM_MS = 900;
const SHINE_MS = 1100;

/** Swipe: deslocamento horizontal mínimo, e ele precisa dominar o vertical. */
const SWIPE_MIN_PX = 50;

/** Espera uma animação terminar (ou ser cancelada), com teto de tempo por segurança. */
function settled(animation: Animation, ms: number): Promise<void> {
  return Promise.race([
    animation.finished.then(
      () => undefined,
      () => undefined,
    ),
    new Promise<void>((resolve) => setTimeout(resolve, ms + 100)),
  ]);
}

/**
 * Espera a imagem carregar e tenta decodificá-la antes de exibir (evita piscar). O `decode()` pode
 * ficar pendente em abas ocultas, então ele tem um teto curto — a troca acontece de qualquer forma.
 */
async function imageReady(img: HTMLImageElement): Promise<void> {
  if (!img.complete) {
    await new Promise<void>((resolve) => {
      img.addEventListener('load', () => resolve(), { once: true });
      img.addEventListener('error', () => resolve(), { once: true });
    });
  }
  await Promise.race([
    img.decode().catch(() => undefined),
    new Promise<void>((resolve) => setTimeout(resolve, 300)),
  ]);
}

/** Roda quando o navegador estiver ocioso (com reserva para quem não tem requestIdleCallback). */
function whenIdle(callback: () => void): void {
  if ('requestIdleCallback' in window) requestIdleCallback(() => callback(), { timeout: 2000 });
  else setTimeout(callback, 200);
}

/** Modo de economia de dados ligado (Network Information API, quando disponível). */
function saveData(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return connection?.saveData === true;
}

function required<T extends Element>(parent: ParentNode, selector: string): T {
  const el = parent.querySelector<T>(selector);
  if (!el) throw new Error(`Vitrine: elemento ${selector} não encontrado.`);
  return el;
}

export class ShowcaseController {
  readonly root: HTMLElement;
  readonly vehicles: ShowcaseVehicle[];
  index = 0; // índice no array (0 = último colocado)

  private readonly layers: [HTMLImageElement, HTMLImageElement];
  private readonly info: InfoView;
  private readonly sheet: SheetView;
  private readonly prevButton: HTMLElement;
  private readonly nextButton: HTMLElement;
  private readonly counter: HTMLElement;
  private readonly preloaded = new Set<number>();
  private token = 0; // incrementa a cada troca; etapas atrasadas de trocas antigas são descartadas

  constructor(root: HTMLElement) {
    this.root = root;
    this.vehicles = readData(root);

    this.layers = [
      required<HTMLImageElement>(root, '[data-backdrop-layer="a"]'),
      required<HTMLImageElement>(root, '[data-backdrop-layer="b"]'),
    ];
    this.info = new InfoView(required<HTMLElement>(root, '[data-showcase-info]'));
    this.sheet = new SheetView(required<HTMLDialogElement>(root, '[data-spec-sheet]'));
    this.prevButton = required<HTMLElement>(root, '[data-showcase-prev]');
    this.nextButton = required<HTMLElement>(root, '[data-showcase-next]');
    this.counter = required<HTMLElement>(root, '[data-counter-rank]');

    root.classList.add('is-enhanced'); // CSS mostra as setas só com JS
    this.bindControls();
    this.updateNavigation();

    // Hash da URL (docs/05): /esportivos#porsche-911 abre direto no veículo
    const initial = this.indexFromHash();
    if (initial !== undefined) this.setActive(initial, { instant: true });

    // Vizinhos só depois da carga, quando a página estiver ociosa (não disputa com o LCP)
    const preloadInitial = () => whenIdle(() => this.preloadAround(this.index));
    if (document.readyState === 'complete') preloadInitial();
    else window.addEventListener('load', preloadInitial, { once: true });
  }

  /** Índice do veículo cujo slug está no hash; outros hashes (#ranking, #conteudo) são ignorados. */
  private indexFromHash(): number | undefined {
    const slug = decodeURIComponent(location.hash.slice(1));
    if (!slug) return undefined;
    const i = this.vehicles.findIndex((v) => v.slug === slug);
    return i >= 0 ? i : undefined;
  }

  /** Vai para o índice `i` (limitado às pontas). */
  go(i: number): void {
    this.setActive(Math.max(0, Math.min(i, this.vehicles.length - 1)));
  }

  /** Próximo = em direção ao #1 (índice +1 no array decrescente). */
  next(): void {
    this.go(this.index + 1);
  }

  prev(): void {
    this.go(this.index - 1);
  }

  /** Setas, teclado, swipe e hash (docs/05). A roda do mouse não troca de veículo. */
  private bindControls(): void {
    this.prevButton.addEventListener('click', () => this.prev());
    this.nextButton.addEventListener('click', () => this.next());

    // ex.: a busca navegando para outro veículo na mesma página
    window.addEventListener('hashchange', () => {
      const i = this.indexFromHash();
      if (i !== undefined && i !== this.index) this.go(i);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (!this.keyboardAllowed()) return;
      event.preventDefault();
      if (event.key === 'ArrowRight') this.next();
      else this.prev();
    });

    this.bindSwipe();
  }

  /**
   * Swipe no celular/tablet: deslizar para a esquerda = próximo (em direção ao #1).
   * Só toque/caneta (o mouse não arrasta); a vitrine tem `touch-action: pan-y`, então a rolagem
   * vertical continua com o navegador.
   */
  private bindSwipe(): void {
    let start: { x: number; y: number; id: number } | undefined;

    this.root.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' || !event.isPrimary) return;
      start = { x: event.clientX, y: event.clientY, id: event.pointerId };
    });

    this.root.addEventListener('pointerup', (event) => {
      if (!start || event.pointerId !== start.id) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      start = undefined;
      if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      if (dx < 0) this.next();
      else this.prev();
    });

    this.root.addEventListener('pointercancel', () => (start = undefined));
  }

  /** ←/→ só com foco na vitrine ou na página — nunca em campos, menus ou com a ficha aberta. */
  private keyboardAllowed(): boolean {
    if (document.querySelector('dialog[open], :popover-open')) return false;
    const active = document.activeElement;
    // body, html e o <main tabindex=-1> (alvo do "pular para o conteúdo", que recebe foco ao
    // clicar numa área vazia) contam como "foco na página"
    if (!active || active === document.body || active === document.documentElement) return true;
    if (active.matches('main')) return true;
    if (active.closest('input, textarea, select, [contenteditable]')) return false;
    return this.root.contains(active);
  }

  /** Contador (posição no ranking, não índice) e setas desabilitadas nas pontas. */
  private updateNavigation(): void {
    const vehicle = this.vehicles[this.index];
    if (vehicle) this.counter.textContent = vehicle.isTop ? 'TOP 1' : formatRank(vehicle.rank);
    this.prevButton.setAttribute('aria-disabled', String(this.index === 0));
    this.nextButton.setAttribute('aria-disabled', String(this.index === this.vehicles.length - 1));
  }

  /**
   * Ativa o veículo de índice `i`: tom ambiente, fundo, informações e ficha.
   * `instant`: sem animação e sem mexer na URL (carga inicial vinda do hash).
   */
  setActive(i: number, { instant = false } = {}): void {
    const vehicle = this.vehicles[i];
    if (i === this.index || !vehicle) return;
    this.index = i;
    const token = ++this.token;

    this.updateNavigation();
    this.root.style.setProperty('--ambient', vehicle.ambientColor);
    this.root.classList.toggle('is-top', vehicle.isTop);
    this.preloadAround(i);
    this.sheet.render(vehicle);

    if (instant) {
      this.showBackdropNow(vehicle);
      this.info.show(vehicle);
      if (vehicle.isTop) this.shineTop();
      return;
    }

    void this.swapBackdrop(vehicle, token);
    void this.info
      .swap(vehicle, () => token === this.token)
      .then(() => {
        if (vehicle.isTop && token === this.token) this.shineTop();
      });
    // não polui o histórico; só roda em trocas feitas pelo usuário (nunca na carga)
    history.replaceState(null, '', `${location.pathname}${location.search}#${vehicle.slug}`);
  }

  /**
   * Pré-carrega fundo e logo do anterior e do próximo (docs/05). Uma <img> fora do DOM com o mesmo
   * srcset/sizes faz o navegador baixar a variante que a troca vai usar. Respeita "Save-Data".
   */
  private preloadAround(i: number): void {
    if (saveData()) return;
    for (const n of [i + 1, i - 1]) {
      const vehicle = this.vehicles[n];
      if (!vehicle || this.preloaded.has(n)) continue;
      this.preloaded.add(n);
      const hero = new Image();
      hero.decoding = 'async';
      hero.sizes = vehicle.hero.sizes;
      hero.srcset = vehicle.hero.srcset;
      hero.src = vehicle.hero.src;
      new Image().src = vehicle.logo.src;
    }
  }

  /** Faixa de luz que atravessa o selo dourado do Top 1, uma vez por chegada (docs/04). */
  private shineTop(): void {
    const badge = this.root.querySelector<HTMLElement>('[data-showcase-info] [data-rank-badge]');
    if (!badge || prefersReducedMotion()) return;
    badge.getAnimations().forEach((animation) => animation.cancel());
    badge.animate([{ backgroundPosition: '100% 0' }, { backgroundPosition: '0% 0' }], {
      duration: SHINE_MS,
      delay: 200,
      easing: EASE,
    });
  }

  /** Troca o fundo na camada visível, sem crossfade (carga inicial). */
  private showBackdropNow(vehicle: ShowcaseVehicle): void {
    const visible = this.layers.find((layer) => layer.classList.contains('is-active'));
    if (!visible) return;
    visible.style.objectPosition = vehicle.heroFocus;
    visible.sizes = vehicle.hero.sizes;
    visible.srcset = vehicle.hero.srcset;
    visible.src = vehicle.hero.src;
  }

  /** Crossfade A/B: carrega na camada oculta, espera decodificar e troca (docs/04). */
  private async swapBackdrop(vehicle: ShowcaseVehicle, token: number): Promise<void> {
    const [a, b] = this.layers;
    const next = a.classList.contains('is-active') ? b : a;
    const current = next === a ? b : a;

    next.style.objectPosition = vehicle.heroFocus;
    next.sizes = vehicle.hero.sizes;
    next.srcset = vehicle.hero.srcset;
    next.src = vehicle.hero.src;
    await imageReady(next);
    if (token !== this.token) return;

    next.classList.add('is-active');
    current.classList.remove('is-active');
    if (!prefersReducedMotion()) {
      next.animate([{ transform: 'scale(1.04)' }, { transform: 'scale(1)' }], {
        duration: ZOOM_MS,
        easing: EASE,
      });
    }
  }
}

/** Bloco de informações (ShowcaseInfo): troca de conteúdo com saída e entrada escalonada. */
class InfoView {
  private readonly root: HTMLElement;
  private readonly logo: HTMLImageElement;
  private readonly name: HTMLElement;
  private readonly specRow: HTMLElement;
  private readonly year: HTMLElement;
  private readonly quick: HTMLElement[];
  private readonly badge: HTMLElement;
  private readonly body: HTMLElement;
  private readonly video: HTMLAnchorElement;
  private readonly actions: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
    this.logo = required(root, '[data-brand-logo]');
    this.name = required(root, '[data-info-name]');
    this.specRow = required(root, '[data-spec-row]');
    this.year = required(root, '[data-spec-year]');
    this.quick = [...root.querySelectorAll<HTMLElement>('[data-spec-quick]')];
    this.badge = required(root, '[data-rank-badge]');
    this.body = required(root, '[data-info-body]');
    this.video = required(root, '[data-info-video]');
    this.actions = this.video.parentElement ?? root;
  }

  /** Ordem do escalonamento (docs/04): logo → nome → specs → texto → botões. */
  private get parts(): HTMLElement[] {
    return [this.logo, this.name, this.specRow, this.body, this.actions];
  }

  async swap(vehicle: ShowcaseVehicle, isCurrent: () => boolean): Promise<void> {
    this.root.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
    const reduced = prefersReducedMotion();

    const out = this.root.animate(
      reduced
        ? [{ opacity: 1 }, { opacity: 0 }]
        : [
            { opacity: 1, transform: 'none' },
            { opacity: 0, transform: 'translateY(-8px)' },
          ],
      { duration: reduced ? 75 : INFO_OUT_MS, easing: EASE, fill: 'forwards' },
    );
    await settled(out, INFO_OUT_MS);
    if (!isCurrent()) return;

    this.show(vehicle);
    out.cancel();

    if (reduced) {
      this.root.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 75, easing: EASE });
      return;
    }
    this.parts.forEach((part, n) =>
      part.animate(
        [
          { opacity: 0, transform: 'translateY(12px)' },
          { opacity: 1, transform: 'none' },
        ],
        { duration: INFO_IN_MS, delay: n * INFO_STAGGER_MS, easing: EASE, fill: 'backwards' },
      ),
    );
  }

  /** Preenche o bloco com o veículo, sem animação. */
  show(v: ShowcaseVehicle): void {
    this.logo.src = v.logo.src;
    this.logo.alt = v.brandName;
    this.logo.width = v.logo.width;
    this.logo.height = v.logo.height;
    this.logo.style.height = `${v.logo.height}px`;
    this.logo.classList.toggle('brand-logo--white', v.logo.white);

    const brand = document.createElement('span');
    brand.className = 'sr-only';
    brand.textContent = `${v.brandName} `;
    this.name.replaceChildren(brand, v.name);

    this.year.hidden = v.year === undefined;
    this.year.textContent = v.year === undefined ? '' : String(v.year);
    this.quick.forEach((li, n) => {
      const spec = v.quickSpecs[n];
      li.hidden = !spec;
      li.textContent = spec ?? '';
    });

    this.badge.classList.toggle('rank-badge--top', v.isTop);
    const [visual, spoken] = this.badge.children;
    if (visual) visual.textContent = v.isTop ? 'TOP 1' : formatRank(v.rank);
    if (spoken) spoken.textContent = v.isTop ? 'Top 1' : `Posição ${v.rank}`;

    this.body.innerHTML = v.body; // HTML gerado no build a partir do Markdown do Erick

    this.video.hidden = !v.videoUrl;
    this.video.href = v.videoUrl ?? '';

    this.root.dispatchEvent(new Event('showcase:content-change')); // reavalia o "Ler mais"
  }
}

/** Ficha técnica (SpecSheet): título e itens do veículo ativo. */
class SheetView {
  private readonly vehicle: HTMLElement;
  private readonly list: HTMLElement;
  private readonly template: HTMLTemplateElement;

  constructor(root: HTMLDialogElement) {
    this.vehicle = required(root, '[data-sheet-vehicle]');
    this.list = required(root, '[data-sheet-specs]');
    this.template = required(root, '[data-sheet-item-template]');
  }

  render(v: ShowcaseVehicle): void {
    this.vehicle.textContent = `${v.brandName} ${v.name}`;
    this.list.replaceChildren(
      ...v.specs.map((spec) => {
        const item = this.template.content.firstElementChild?.cloneNode(true) as HTMLElement;
        const dt = item.querySelector('dt');
        const dd = item.querySelector('dd');
        if (dt) dt.textContent = spec.label;
        if (dd) dd.textContent = spec.value;
        return item;
      }),
    );
  }
}

function readData(root: HTMLElement): ShowcaseVehicle[] {
  const el = root.querySelector<HTMLScriptElement>('script[data-showcase-data]');
  return el?.textContent ? (JSON.parse(el.textContent) as ShowcaseVehicle[]) : [];
}

/** Inicia a vitrine da página (se houver). */
export function initShowcase(): ShowcaseController | undefined {
  const root = document.querySelector<HTMLElement>('[data-showcase]');
  const controller = root ? new ShowcaseController(root) : undefined;
  // Só em desenvolvimento: acesso pelo console para testar trocas (removido do build de produção)
  if (import.meta.env.DEV && controller) {
    (window as Window & { __showcase?: ShowcaseController }).__showcase = controller;
  }
  return controller;
}
