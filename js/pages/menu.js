import { formatPrice, escapeHtml } from '../ui.js';

export async function renderMenu(app, ctx) {
  app.innerHTML = `
    <section class="page-hero menu-hero">
      <div class="page-hero-overlay"></div>
      <div class="page-hero-content">
        <p class="eyebrow">Our Offerings</p>
        <h1 class="page-title">Tiger's Menu</h1>
        <p class="page-lead">From classic burgers to premium delicacies and a curated bar — every plate is prepared to impress.</p>
      </div>
    </section>

    <section class="menu-section">
      <div class="menu-toolbar">
        <input type="search" id="menuSearch" class="menu-search" placeholder="Search dishes..." aria-label="Search menu" />
        <div class="menu-filters" id="menuFilters" role="tablist" aria-label="Menu categories"></div>
      </div>

      <div id="menuGrid" class="menu-grid" aria-live="polite">
        <div class="menu-loading">Loading the menu…</div>
      </div>
    </section>
  `;

  const { supabase } = ctx;

  const [catRes, itemRes] = await Promise.all([
    supabase.from('categories').select('id, name, sort_order').order('sort_order', { ascending: true }),
    supabase.from('menu_items').select('id, category_id, name, description, price, unit, image, sort_order, available').order('sort_order', { ascending: true }),
  ]);

  if (catRes.error) throw new Error(catRes.error.message);
  if (itemRes.error) throw new Error(itemRes.error.message);

  const categories = catRes.data || [];
  const items = (itemRes.data || []).filter((i) => i.available);

  const grid = document.getElementById('menuGrid');
  const filters = document.getElementById('menuFilters');
  const search = document.getElementById('menuSearch');

  let activeCategory = 'all';
  let query = '';

  function renderFilters() {
    const chips = [{ id: 'all', name: 'All' }, ...categories];
    filters.innerHTML = chips
      .map(
        (c) => `<button class="chip ${c.id === activeCategory ? 'active' : ''}" data-cat="${c.id}" role="tab" aria-selected="${c.id === activeCategory}">${escapeHtml(c.name)}</button>`
      )
      .join('');
    filters.querySelectorAll('.chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeCategory = btn.dataset.cat;
        renderFilters();
        renderGrid();
      });
    });
  }

  function renderGrid() {
    let list = items;
    if (activeCategory !== 'all') list = list.filter((i) => i.category_id === activeCategory);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (i) => i.name.toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q)
      );
    }

    if (list.length === 0) {
      grid.innerHTML = `<div class="menu-empty">No dishes match your search.</div>`;
      return;
    }

    grid.innerHTML = list
      .map((item) => {
        const img = item.image ? `/images/${item.image}` : '';
        const desc = item.description ? `<p class="card-desc">${escapeHtml(item.description)}</p>` : '';
        const unit = item.unit ? `<span class="card-unit">${escapeHtml(item.unit)}</span>` : '';
        return `
          <article class="menu-card">
            <div class="card-media">
              ${img ? `<img src="${img}" alt="${escapeHtml(item.name)}" loading="lazy" />` : '<div class="card-noimg"></div>'}
            </div>
            <div class="card-body">
              <h3 class="card-title">${escapeHtml(item.name)}</h3>
              ${desc}
              <div class="card-foot">
                ${unit}
                <span class="card-price">${formatPrice(item.price)}</span>
              </div>
            </div>
          </article>
        `;
      })
      .join('');
  }

  search.addEventListener('input', (e) => {
    query = e.target.value;
    renderGrid();
  });

  renderFilters();
  renderGrid();
}
