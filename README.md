# Tiger Restaurant & Bar — Modern Website

A refined, fully responsive website for Tiger Restaurant & Bar, rebuilt from the original static
HTML into a component-based vanilla JavaScript application backed by a Supabase database.

The site works beautifully on desktop, mobile, and inside WebViews. Pages are split into clean,
separate **HTML**, **CSS**, and **JavaScript** files — no JSX, no framework lock-in.

---

## What's Inside

| Page | File | Purpose |
|------|------|---------|
| Home | `index.html` + `js/pages/home.js` | Hero, signature dishes, brand values |
| Menu | `menu.html` (served via `index.html` shell) + `js/pages/menu.js` | Live menu loaded from the database, searchable & filterable |
| About | `js/pages/about.js` | Story, values, ambiance |
| Contact / Reserve | `js/pages/contact.js` | Reservation form that writes to the database |

A single `index.html` shell holds the header, footer, and a `<main id="app">` mount point. Each
page is rendered by a small JS module, keeping markup, styling, and logic cleanly separated.

---

## Project Structure

```
.
├── index.html              # App shell: header, nav, footer, mount point
├── styles.css             # All styling (responsive, dark, premium theme)
├── js/
│   ├── main.js            # Router: picks the right page renderer
│   ├── supabaseClient.js  # Supabase client singleton (reads .env)
│   ├── ui.js              # Shared helpers (toast, price format, escape)
│   └── pages/
│       ├── home.js        # Home page markup
│       ├── menu.js        # Loads categories + items from Supabase
│       ├── about.js       # About page markup
│       └── contact.js      # Reservation form -> Supabase insert
├── images/                # Food & poster images
├── supabase/
│   └── functions/         # Edge functions (if needed later)
├── .env                   # VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
└── README.md
```

---

## Database Structure

The backend is a provisioned **Supabase** (Postgres) database. Three tables power the site:

### 1. `categories`
Groups menu items into sections on the menu page.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | Auto-generated |
| `name` | text | e.g. "Burgers", "Whisky", "Beer" |
| `sort_order` | int | Controls display order |
| `created_at` | timestamptz | Default `now()` |

### 2. `menu_items`
Every dish and drink on the menu.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | Auto-generated |
| `category_id` | uuid (FK → categories) | `ON DELETE CASCADE` |
| `name` | text | Dish name |
| `description` | text | Optional longer description |
| `price` | numeric(12,2) | Price in kyats (ks) |
| `unit` | text | e.g. "One Tower", "One Bottle", "One Glass" (beer) |
| `image` | text | Filename in `/images` |
| `sort_order` | int | Display order within a category |
| `available` | boolean | `false` hides an item without deleting it |
| `created_at` | timestamptz | Default `now()` |

### 3. `reservations`
Table bookings submitted through the Contact page form.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | Auto-generated |
| `first_name` | text | Required |
| `last_name` | text | Required |
| `email` | text | Required |
| `phone` | text | Required |
| `reserve_at` | timestamptz | The date & time the guest wants to dine |
| `agreed_terms` | boolean | Terms-of-use checkbox |
| `status` | text | `pending` / `confirmed` / `cancelled` (default `pending`) |
| `created_at` | timestamptz | Default `now()` |

### Relationships

```
categories 1 ────∞ menu_items        (category_id foreign key)
reservations        standalone       (public insert-only)
```

### Row Level Security (RLS)

This is a **no-auth public site** — visitors never sign in, so the frontend always talks to
Supabase with the anonymous key. Policies are therefore scoped to `anon, authenticated`:

- `categories` and `menu_items` → **public read only**. Anyone can browse the menu; nobody can
  edit it from the frontend (items are managed in the Supabase dashboard).
- `reservations` → **insert only**. Anyone can submit a booking, but visitors cannot list other
  people's reservations, so guest details stay private.

---

## How the JavaScript Integration Works

### 1. Supabase client (`js/supabaseClient.js`)

A single Supabase client is created once and imported wherever needed:

```js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);
```

The connection details come from `.env` (already provisioned — no manual setup needed).

### 2. Routing (`js/main.js`)

There is one `index.html` shell. `main.js` looks at `window.location.pathname` and calls the
matching page renderer, passing it the `<main id="app">` element plus shared helpers:

```js
const routes = {
  '/index.html': renderHome,
  '/menu.html':  renderMenu,
  '/about.html': renderAbout,
  '/contact.html': renderContact,
};
```

Each renderer fills `app.innerHTML` with the page's markup and then wires up any interactivity.

### 3. Menu page — reading data (`js/pages/menu.js`)

The menu is fetched live from the database in two parallel queries:

```js
const [catRes, itemRes] = await Promise.all([
  supabase.from('categories').select('id, name, sort_order').order('sort_order'),
  supabase.from('menu_items').select('id, category_id, name, description, price, unit, image, available').order('sort_order'),
]);
```

- Categories become filter chips at the top of the menu.
- Items render as cards. The search box and chips filter the list in-memory — no extra network
  requests, so filtering feels instant.
- Only items with `available = true` are shown, so out-of-stock dishes can be hidden from the
  dashboard without touching code.

### 4. Reservation form — writing data (`js/pages/contact.js`)

When a guest submits the booking form, the data is inserted into the `reservations` table:

```js
const { error } = await supabase.from('reservations').insert({
  first_name: form.firstName.value.trim(),
  last_name:  form.lastName.value.trim(),
  email:      form.email.value.trim(),
  phone:      form.phone.value.trim(),
  reserve_at: new Date(form.reserveAt.value).toISOString(),
  agreed_terms: form.terms.checked,
});
```

- The form is validated with the browser's built-in constraints before submitting.
- A toast notification confirms success or shows an error.
- Because the `reservations` table has an **insert-only** RLS policy, the submission works for
  any anonymous visitor, but no visitor can read back other guests' bookings.

### 5. Shared UI helpers (`js/ui.js`)

- `showToast(message, type)` — non-intrusive success/error notifications.
- `formatPrice(value)` — formats kyat values with thousands separators.
- `escapeHtml(str)` — safely renders user/database text to prevent XSS.

---

## Responsive Design

The layout adapts across three tiers:

- **Desktop (> 900px)** — multi-column grids for menu cards, featured dishes, and footer.
- **Tablet (720–900px)** — two-column grids, stacked about/contact sections.
- **Mobile (< 720px)** — single-column layout, slide-in navigation drawer, full-width buttons,
  and `background-attachment: scroll` so the hero image renders correctly on mobile browsers.

The header is `position: fixed` with a blur effect that intensifies on scroll. Breakpoints use
a fluid `clamp()` typography scale so text scales smoothly between viewport sizes rather than
jumping at hard breakpoints — ideal for WebView rendering where viewport widths vary.

---

## Running Locally

The dev server starts automatically in this environment. To run manually elsewhere:

```bash
npm install
npm run dev
```

Environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are pre-populated in `.env`.

---

## Tech Stack

- **Vite** — fast dev server and build tooling
- **Vanilla JavaScript (ES modules)** — no framework, no JSX
- **Supabase** — Postgres database, RLS-secured
- **CSS custom properties** — theming via a token system (primary, accent, success, warning, error, neutrals)
- **Google Fonts** — Playfair Display (headings) + Inter (body)
