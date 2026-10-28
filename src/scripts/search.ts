// Busca client-side (docs/05): combobox ARIA 1.2 sobre /search-index.json.
// O índice só é baixado no primeiro foco; a normalização é a mesma usada no build.
import { normalize } from '@/lib/normalize';
import { prefersReducedMotion } from '@/scripts/reduced-motion';
import type { SearchEntry } from '@/lib/search-index';

const MAX_RESULTS = 8;

// Compartilhado entre as instâncias (header e gaveta): uma única requisição por página
let indexPromise: Promise<SearchEntry[]> | undefined;

function loadIndex(): Promise<SearchEntry[]> {
  indexPromise ??= fetch('/search-index.json')
    .then((response) => {
      if (!response.ok) throw new Error(`Índice da busca: HTTP ${response.status}`);
      return response.json() as Promise<SearchEntry[]>;
    })
    .catch((error: unknown) => {
      indexPromise = undefined; // permite tentar de novo no próximo foco
      throw error;
    });
  return indexPromise;
}

/**
 * Todos os termos precisam aparecer nas palavras-chave. Ordem: nome começando pela busca,
 * depois alguma palavra começando pelo primeiro termo, depois o resto (mantendo a ordem do índice).
 */
export function searchEntries(entries: SearchEntry[], query: string): SearchEntry[] {
  const q = normalize(query);
  if (!q) return [];
  const terms = q.split(' ');
  const score = (entry: SearchEntry) => {
    if (normalize(entry.name).startsWith(q)) return 0;
    return entry.keywords.split(' ').some((word) => word.startsWith(terms[0] ?? '')) ? 1 : 2;
  };
  return entries
    .filter((entry) => terms.every((term) => entry.keywords.includes(term)))
    .map((entry, order) => ({ entry, order, score: score(entry) }))
    .sort((a, b) => a.score - b.score || a.order - b.order)
    .slice(0, MAX_RESULTS)
    .map(({ entry }) => entry);
}

/** Campo editável em foco: o atalho "/" não deve roubar a digitação. */
function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    Boolean(target.closest('input, textarea, select, [contenteditable]'))
  );
}

class SearchBox {
  private readonly input: HTMLInputElement;
  private readonly panel: HTMLElement;
  private readonly listbox: HTMLElement;
  private readonly empty: HTMLElement;
  private readonly status: HTMLElement;
  private entries: SearchEntry[] | undefined; // undefined até o índice chegar
  private results: SearchEntry[] = [];
  private active = -1;

  constructor(private readonly root: HTMLElement) {
    const input = root.querySelector<HTMLInputElement>('[data-search-input]');
    const panel = root.querySelector<HTMLElement>('[data-search-panel]');
    const listbox = root.querySelector<HTMLElement>('[data-search-listbox]');
    const empty = root.querySelector<HTMLElement>('[data-search-empty]');
    const status = root.querySelector<HTMLElement>('[data-search-status]');
    if (!input || !panel || !listbox || !empty || !status) {
      throw new Error('SearchBox: marcação incompleta.');
    }
    this.input = input;
    this.panel = panel;
    this.listbox = listbox;
    this.empty = empty;
    this.status = status;

    root.hidden = false; // sem JS a busca não funciona, então só aparece com o script
    this.bind();
  }

  get visible(): boolean {
    return this.input.checkVisibility();
  }

  focus(): void {
    this.input.focus();
    this.input.select();
  }

  private bind(): void {
    this.input.addEventListener('focus', () => this.ensureIndex(), { once: true });
    this.input.addEventListener('input', () => this.update());
    this.input.addEventListener('keydown', (event) => this.onKeydown(event));
    // Fecha ao sair do componente (o pointerdown abaixo evita perder o clique na opção)
    this.root.addEventListener('focusout', (event) => {
      if (!this.root.contains(event.relatedTarget as Node | null)) this.close();
    });
    this.listbox.addEventListener('pointerdown', (event) => event.preventDefault());
    this.listbox.addEventListener('click', (event) => {
      const option = (event.target as Element).closest<HTMLElement>('[role="option"]');
      const i = Number(option?.dataset.index);
      if (option && Number.isInteger(i)) this.select(i);
    });
  }

  private async ensureIndex(): Promise<void> {
    try {
      this.entries = await loadIndex();
      if (this.input.value) this.update(); // o usuário digitou antes do índice chegar
    } catch (error) {
      console.error(error);
      this.input.addEventListener('focus', () => this.ensureIndex(), { once: true });
    }
  }

  private onKeydown(event: KeyboardEvent): void {
    const open = !this.panel.hidden;
    const hasResults = open && this.results.length > 0;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        if (!hasResults) {
          this.update();
          return;
        }
        const step = event.key === 'ArrowDown' ? 1 : -1;
        const count = this.results.length;
        this.setActive(
          this.active < 0 && step < 0 ? count - 1 : (this.active + step + count) % count,
        );
        break;
      }
      case 'Enter':
        if (!hasResults) return;
        event.preventDefault();
        this.select(Math.max(this.active, 0)); // sem item marcado, abre o primeiro resultado
        break;
      case 'Escape':
        // 1º Esc fecha a lista; 2º limpa o campo (padrão de combobox); o 3º segue adiante e,
        // na gaveta mobile, fecha a gaveta (o preventDefault segura o fechamento antes disso)
        if (open) this.close();
        else if (this.input.value) this.input.value = '';
        else return;
        event.preventDefault();
        break;
    }
  }

  private update(): void {
    if (!this.entries) return; // ensureIndex chama de novo quando o índice chegar
    this.results = searchEntries(this.entries, this.input.value);
    this.render();
  }

  private render(): void {
    this.listbox.replaceChildren(...this.results.map((entry, i) => this.option(entry, i)));
    this.active = -1;
    this.input.removeAttribute('aria-activedescendant');

    // Com texto, o painel abre: lista de resultados ou "Nada encontrado nessa garagem."
    const n = this.results.length;
    const hasQuery = normalize(this.input.value) !== '';
    this.panel.hidden = !hasQuery;
    this.listbox.hidden = n === 0;
    this.empty.hidden = n > 0;
    this.input.setAttribute('aria-expanded', String(n > 0));
    this.status.textContent = !hasQuery
      ? ''
      : n === 0
        ? (this.empty.textContent ?? '')
        : n === 1
          ? '1 resultado'
          : `${n} resultados`;
  }

  private option(entry: SearchEntry, i: number): HTMLElement {
    const li = document.createElement('li');
    li.id = `${this.listbox.id}-${i}`;
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', 'false');
    li.dataset.index = String(i);
    li.className = 'search-option';

    const img = document.createElement('img');
    img.src = entry.thumbSrc;
    img.alt = '';
    img.width = 80;
    img.height = 60;
    img.decoding = 'async';
    img.className = 'search-option__thumb';

    const text = document.createElement('span');
    text.className = 'search-option__text';
    const name = document.createElement('span');
    name.className = 'search-option__name';
    name.textContent = entry.name;
    const meta = document.createElement('span');
    meta.className = 'search-option__meta';
    meta.textContent = `${entry.brand} · ${entry.rankingLabel}`;
    text.append(name, meta);

    li.append(img, text);
    return li;
  }

  private setActive(i: number): void {
    const options = this.listbox.querySelectorAll<HTMLElement>('[role="option"]');
    options.forEach((option, j) => option.setAttribute('aria-selected', String(j === i)));
    this.active = i;
    const option = options[i];
    if (!option) return;
    this.input.setAttribute('aria-activedescendant', option.id);
    option.scrollIntoView({ block: 'nearest' });
  }

  private close(): void {
    this.panel.hidden = true;
    this.input.setAttribute('aria-expanded', 'false');
    this.input.removeAttribute('aria-activedescendant');
    this.active = -1;
  }

  /** Abre o veículo: outra página navega; na mesma página, troca pelo hash e volta à vitrine. */
  private select(i: number): void {
    const entry = this.results[i];
    if (!entry) return;
    const url = new URL(entry.href, location.href);
    this.close();
    this.input.value = '';
    this.status.textContent = '';

    if (url.pathname !== location.pathname) {
      location.assign(url);
      return;
    }
    // O controlador da vitrine escuta o hashchange (docs/05)
    location.hash = url.hash;
    document.querySelector<HTMLElement>(':popover-open')?.hidePopover(); // gaveta mobile
    const showcase = document.querySelector<HTMLElement>('[data-showcase]');
    showcase?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
    showcase?.querySelector<HTMLElement>('[data-info-name]')?.focus({ preventScroll: true });
  }
}

export function initSearch(): void {
  const boxes = [...document.querySelectorAll<HTMLElement>('[data-search]')].map(
    (root) => new SearchBox(root),
  );

  // "/" foca a busca visível (header no desktop; na gaveta só quando ela estiver aberta)
  document.addEventListener('keydown', (event) => {
    if (event.key !== '/' || event.altKey || event.ctrlKey || event.metaKey) return;
    if (isTyping(event.target) || document.querySelector('dialog[open]')) return;
    const box = boxes.find((b) => b.visible);
    if (!box) return;
    event.preventDefault();
    box.focus();
  });
}
