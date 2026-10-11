// Controlador da vitrine (docs/05). O HTML já vem completo do servidor; aqui só ligamos o
// carrossel (Embla) e alternamos o veículo ativo (fundo, informações e ficha técnica).
import EmblaCarousel, { type EmblaCarouselType } from 'embla-carousel';
import { formatRank } from '@/lib/format';
import type { ShowcaseVehicle } from '@/lib/showcase-data';
import { prefersReducedMotion } from '@/scripts/reduced-motion';

/** Valores do coverflow (docs/04) por distância ao centro: 0 = ativo, 1 = vizinho, 2 = extremo. */
const COVERFLOW = {
  scale: [1, 0.85, 0.7],
  brightness: [1, 0.5, 0.35],
  blur: [0, 1, 1.5],
};

/** Sobreposição entre cards vizinhos, em fração da largura do card (como na referência). */
const OVERLAP = 0.06;

/** Movimento (docs/04): mesmo easing do token --ease-garage. */
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const INFO_OUT_MS = 180;
const INFO_IN_MS = 400;
const INFO_STAGGER_MS = 60;
const ZOOM_MS = 900;

/** Interpola linearmente numa tabela de valores para uma distância contínua (0…2). */
function lerpStep(values: number[], distance: number): number {
  const d = Math.min(Math.abs(distance), values.length - 1);
  const i = Math.floor(d);
  const next = values[Math.min(i + 1, values.length - 1)] ?? values[i];
  const current = values[i] ?? 0;
  return current + ((next ?? current) - current) * (d - i);
}

/**
 * Posição do centro de um card a `d` posições do ativo, já que os cards encolhem com a distância:
 * cada um encosta no anterior (meias-larguras escaladas) menos a sobreposição. Interpola entre inteiros.
 */
function packedOffset(d: number, width: number): number {
  const whole = Math.floor(d);
  let position = 0;
  for (let k = 1; ; k++) {
    const next =
      position +
      (width * (lerpStep(COVERFLOW.scale, k - 1) + lerpStep(COVERFLOW.scale, k))) / 2 -
      width * OVERLAP;
    if (k === whole + 1) return position + (next - position) * (d - whole);
    position = next;
  }
}

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

function required<T extends Element>(parent: ParentNode, selector: string): T {
  const el = parent.querySelector<T>(selector);
  if (!el) throw new Error(`Vitrine: elemento ${selector} não encontrado.`);
  return el;
}

export class ShowcaseController {
  readonly root: HTMLElement;
  readonly vehicles: ShowcaseVehicle[];
  readonly embla: EmblaCarouselType;
  index = 0; // índice no array (0 = último colocado)

  private readonly slides: HTMLElement[];
  private readonly cards: HTMLElement[];
  private readonly layers: [HTMLImageElement, HTMLImageElement];
  private readonly info: InfoView;
  private readonly sheet: SheetView;
  private frame = 0;
  private token = 0; // incrementa a cada troca; etapas atrasadas de trocas antigas são descartadas

  constructor(root: HTMLElement) {
    this.root = root;
    this.vehicles = readData(root);

    const viewport = required<HTMLElement>(root, '[data-carousel-viewport]');
    this.slides = [...viewport.querySelectorAll<HTMLElement>('[data-slide]')];
    this.cards = [...viewport.querySelectorAll<HTMLElement>('[data-card]')];
    this.layers = [
      required<HTMLImageElement>(root, '[data-backdrop-layer="a"]'),
      required<HTMLImageElement>(root, '[data-backdrop-layer="b"]'),
    ];
    this.info = new InfoView(required<HTMLElement>(root, '[data-showcase-info]'));
    this.sheet = new SheetView(required<HTMLDialogElement>(root, '[data-spec-sheet]'));

    required<HTMLElement>(root, '[data-carousel]').classList.add('is-enhanced');
    this.embla = EmblaCarousel(viewport, {
      loop: false,
      align: 'center',
      containScroll: false,
      startIndex: this.index,
      skipSnaps: false,
    });

    this.embla.on('scroll', () => this.scheduleCoverflow());
    this.embla.on('reInit', () => this.applyCoverflow());
    this.embla.on('resize', () => this.applyCoverflow());
    this.embla.on('select', () => this.setActive(this.embla.selectedScrollSnap()));
    this.applyCoverflow();
  }

  /** Ativa o veículo de índice `i`: carrossel, tom ambiente, fundo, informações e ficha. */
  setActive(i: number): void {
    const vehicle = this.vehicles[i];
    if (i === this.index || !vehicle) return;
    this.index = i;
    const token = ++this.token;

    this.slides.forEach((slide, n) =>
      slide.setAttribute('data-distance', String(Math.min(Math.abs(n - i), 2))),
    );
    this.cards.forEach((card, n) => {
      if (n === i) card.setAttribute('aria-current', 'true');
      else card.removeAttribute('aria-current');
    });

    this.root.style.setProperty('--ambient', vehicle.ambientColor);
    this.sheet.render(vehicle);
    void this.swapBackdrop(vehicle, token);
    void this.info.swap(vehicle, () => token === this.token);
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

  /** Agrupa os eventos de scroll num único cálculo por quadro. */
  private scheduleCoverflow(): void {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.applyCoverflow();
    });
  }

  /** Distância contínua de cada slide ao centro → escala, brilho, desfoque e empilhamento. */
  private applyCoverflow(): void {
    const snaps = this.embla.scrollSnapList();
    const progress = this.embla.scrollProgress();
    const step = snaps.length > 1 ? (snaps[1] ?? 1) - (snaps[0] ?? 0) : 1;
    const width = this.slides[0]?.offsetWidth ?? 0;

    this.slides.forEach((slide, i) => {
      const distance = ((snaps[i] ?? 0) - progress) / (step || 1);
      const abs = Math.abs(distance);
      slide.style.setProperty('--cf-scale', lerpStep(COVERFLOW.scale, abs).toFixed(3));
      slide.style.setProperty('--cf-brightness', lerpStep(COVERFLOW.brightness, abs).toFixed(3));
      slide.style.setProperty('--cf-blur', `${lerpStep(COVERFLOW.blur, abs).toFixed(2)}px`);
      // aproxima o card do centro: posição "empacotada" menos a posição natural do Embla
      const shift = Math.sign(distance) * (packedOffset(abs, width) - abs * width);
      slide.style.setProperty('--cf-shift', `${shift.toFixed(1)}px`);
      slide.style.setProperty('--cf-focus', Math.max(0, 1 - abs).toFixed(3)); // celular: só escurece
      slide.style.zIndex = String(100 - Math.round(abs * 10));
    });
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

    this.render(vehicle);
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

  private render(v: ShowcaseVehicle): void {
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
