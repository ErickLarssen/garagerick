// Controlador da vitrine (docs/05). O HTML já vem completo do servidor; aqui só ligamos o
// carrossel (Embla) e alternamos o veículo ativo.
import EmblaCarousel, { type EmblaCarouselType } from 'embla-carousel';
import type { ShowcaseVehicle } from '@/lib/showcase-data';

/** Valores do coverflow (docs/04) por distância ao centro: 0 = ativo, 1 = vizinho, 2 = extremo. */
const COVERFLOW = {
  scale: [1, 0.85, 0.7],
  brightness: [1, 0.5, 0.35],
  blur: [0, 1, 1.5],
};

/** Sobreposição entre cards vizinhos, em fração da largura do card (como na referência). */
const OVERLAP = 0.06;

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

/** Interpola linearmente na tabela acima para uma distância contínua (0…2). */
function lerpStep(values: number[], distance: number): number {
  const d = Math.min(Math.abs(distance), values.length - 1);
  const i = Math.floor(d);
  const next = values[Math.min(i + 1, values.length - 1)] ?? values[i];
  const current = values[i] ?? 0;
  return current + ((next ?? current) - current) * (d - i);
}

export class ShowcaseController {
  readonly root: HTMLElement;
  readonly vehicles: ShowcaseVehicle[];
  readonly embla: EmblaCarouselType;
  private readonly slides: HTMLElement[];
  private readonly cards: HTMLElement[];
  private frame = 0;
  index = 0; // índice no array (0 = último colocado)

  constructor(root: HTMLElement) {
    this.root = root;
    this.vehicles = readData(root);

    const carousel = root.querySelector<HTMLElement>('[data-carousel]');
    const viewport = root.querySelector<HTMLElement>('[data-carousel-viewport]');
    if (!carousel || !viewport) throw new Error('Vitrine sem carrossel.');

    this.slides = [...viewport.querySelectorAll<HTMLElement>('[data-slide]')];
    this.cards = [...viewport.querySelectorAll<HTMLElement>('[data-card]')];

    carousel.classList.add('is-enhanced'); // CSS troca a faixa rolável pelo Embla
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

  /** Ativa o veículo de índice `i`. As tarefas seguintes da Fase 4 completam a troca. */
  setActive(i: number): void {
    if (i === this.index || !this.vehicles[i]) return;
    this.index = i;
    this.slides.forEach((slide, n) =>
      slide.setAttribute('data-distance', String(Math.min(Math.abs(n - i), 2))),
    );
    this.cards.forEach((card, n) => {
      if (n === i) card.setAttribute('aria-current', 'true');
      else card.removeAttribute('aria-current');
    });
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

function readData(root: HTMLElement): ShowcaseVehicle[] {
  const el = root.querySelector<HTMLScriptElement>('script[data-showcase-data]');
  return el?.textContent ? (JSON.parse(el.textContent) as ShowcaseVehicle[]) : [];
}

/** Inicia a vitrine da página (se houver). */
export function initShowcase(): ShowcaseController | undefined {
  const root = document.querySelector<HTMLElement>('[data-showcase]');
  return root ? new ShowcaseController(root) : undefined;
}
