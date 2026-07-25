/*
# Tiger Restaurant & Bar — Database Schema

1. Overview
This migration sets up the database for the Tiger Restaurant & Bar website.
It is a single-tenant, no-auth public site: visitors browse the menu (read)
and submit table reservations (write). There is no sign-in screen, so all
policies are scoped to `anon, authenticated` so the anon-key frontend works.

2. New Tables
- `categories`
  - `id` (uuid, primary key)
  - `name` (text, not null) — e.g. "Burgers", "Premium Dishes", "Whisky", "Beer", "Soft Drinks"
  - `sort_order` (int, default 0) — controls display order on the menu page
  - `created_at` (timestamptz)
- `menu_items`
  - `id` (uuid, primary key)
  - `category_id` (uuid, foreign key -> categories.id, on delete cascade)
  - `name` (text, not null)
  - `description` (text) — optional longer description
  - `price` (numeric, not null) — price in kyats (ks)
  - `unit` (text) — optional, e.g. "One Tower", "One Bottle", "One Glass" for beer
  - `image` (text) — image filename in /images
  - `sort_order` (int, default 0)
  - `available` (boolean, default true) — can be toggled to hide out-of-stock items
  - `created_at` (timestamptz)
- `reservations`
  - `id` (uuid, primary key)
  - `first_name` (text, not null)
  - `last_name` (text, not null)
  - `email` (text, not null)
  - `phone` (text, not null)
  - `reserve_at` (timestamptz, not null) — the date & time the guest wants to dine
  - `agreed_terms` (boolean, not null default false) — terms-of-use checkbox
  - `status` (text, not null default 'pending') — pending / confirmed / cancelled
  - `created_at` (timestamptz)

3. Security (RLS)
- Enable RLS on all three tables.
- `categories` and `menu_items`: public read (anon + authenticated), no writes from the frontend (managed via dashboard/SQL).
- `reservations`: public insert (anyone can book a table), public read of own rows is not needed — guests do not retrieve reservations. Insert-only policy for anon + authenticated.

4. Important Notes
- Prices use numeric(12,2) to handle large kyat values precisely.
- The `reservations` table intentionally does NOT expose a SELECT policy to anon,
  so visitors cannot enumerate other people's bookings. Only inserts are allowed.
*/

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_categories" ON categories;
CREATE POLICY "anon_read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

-- Menu items
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric(12,2) NOT NULL,
  unit text,
  image text,
  sort_order int NOT NULL DEFAULT 0,
  available boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_menu_items" ON menu_items;
CREATE POLICY "anon_read_menu_items" ON menu_items FOR SELECT
  TO anon, authenticated USING (true);

-- Reservations
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  reserve_at timestamptz NOT NULL,
  agreed_terms boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_reservations" ON reservations;
CREATE POLICY "anon_insert_reservations" ON reservations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Index for ordering menu items by category
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort_order ON menu_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- Seed categories
INSERT INTO categories (name, sort_order) VALUES
  ('Burgers', 1),
  ('Premium Dishes', 2),
  ('Whisky', 3),
  ('Beer', 4),
  ('Beverages', 5)
ON CONFLICT DO NOTHING;

-- Seed menu items (prices in kyats)
INSERT INTO menu_items (category_id, name, description, price, unit, image, sort_order) VALUES
  ((SELECT id FROM categories WHERE name='Burgers'), 'Double Cheese Chicken Burger', 'With French Fries', 14500, NULL, 'chicken_burger.jpg', 1),
  ((SELECT id FROM categories WHERE name='Burgers'), 'Double Cheese Pork Burger', 'With French Fries', 18500, NULL, 'pork_burger.jpg', 2),
  ((SELECT id FROM categories WHERE name='Burgers'), 'Double Cheese Beef Burger', 'With French Fries', 22500, NULL, 'beef_burger.jpg', 3),
  ((SELECT id FROM categories WHERE name='Premium Dishes'), 'Premium Chilean Sea Bass', 'With Ginger Soy Sauce (Premium Export Quality Chilean Sea Bass)', 487000, NULL, 'chilean_sea_bass.jpg', 1),
  ((SELECT id FROM categories WHERE name='Premium Dishes'), 'Signature Roasted Whole Peking Duck', 'With Our Premium House-Made Sauce', 1050000, NULL, 'roasted_peking_duck.jpg', 2),
  ((SELECT id FROM categories WHERE name='Premium Dishes'), 'Premium Australian Beef Steak', 'With Our Premium House-Made BBQ Sauces', 135000, NULL, 'beef_steak.jpg', 3),
  ((SELECT id FROM categories WHERE name='Premium Dishes'), 'Grilled Boston Lobster', 'With Garlic Herb Butter Sauce And Lemon Herb Butter Sauce', 485000, NULL, 'grilled_lobster.jpg', 4),
  ((SELECT id FROM categories WHERE name='Premium Dishes'), 'Premium Signature Crispy Lechon', 'The Roasted Whole Suckling Pig With Our Premium House-Made Sauce', 2025000, NULL, 'roasted_pig.jpg', 5),
  ((SELECT id FROM categories WHERE name='Premium Dishes'), 'Signature Truffle-Infused Whole Roasted Chicken', 'With Our Premium House-Made Sauce', 600000, NULL, 'roasted_chicken.jpg', 6),
  ((SELECT id FROM categories WHERE name='Whisky'), 'Johnny Walker Blue Label', NULL, 1300000, NULL, 'blue_label.jpg', 1),
  ((SELECT id FROM categories WHERE name='Whisky'), 'Johnny Walker Gold Label', NULL, 750000, NULL, 'gold_label.jpg', 2),
  ((SELECT id FROM categories WHERE name='Whisky'), 'Johnny Walker Black Label', NULL, 250000, NULL, 'black_label.jpg', 3),
  ((SELECT id FROM categories WHERE name='Beer'), 'Heineken Beer', NULL, 60000, 'One Tower', 'heineken_beer.jpg', 1),
  ((SELECT id FROM categories WHERE name='Beer'), 'Heineken Beer', NULL, 12000, 'One Bottle', 'heineken_beer.jpg', 2),
  ((SELECT id FROM categories WHERE name='Beer'), 'Heineken Beer', NULL, 6000, 'One Glass', 'heineken_beer.jpg', 3),
  ((SELECT id FROM categories WHERE name='Beer'), 'Carlsberg Beer', NULL, 55000, 'One Tower', 'carlsberg_beer.jpg', 4),
  ((SELECT id FROM categories WHERE name='Beer'), 'Carlsberg Beer', NULL, 11000, 'One Bottle', 'carlsberg_beer.jpg', 5),
  ((SELECT id FROM categories WHERE name='Beer'), 'Carlsberg Beer', NULL, 5500, 'One Glass', 'carlsberg_beer.jpg', 6),
  ((SELECT id FROM categories WHERE name='Beer'), 'Tiger Beer', NULL, 50000, 'One Tower', 'tiger_beer.jpg', 7),
  ((SELECT id FROM categories WHERE name='Beer'), 'Tiger Beer', NULL, 10000, 'One Bottle', 'tiger_beer.jpg', 8),
  ((SELECT id FROM categories WHERE name='Beer'), 'Tiger Beer', NULL, 5000, 'One Glass', 'tiger_beer.jpg', 9),
  ((SELECT id FROM categories WHERE name='Beverages'), 'Ice Bucket', NULL, 3000, NULL, 'ice_bucket.jpg', 1),
  ((SELECT id FROM categories WHERE name='Beverages'), 'Evian Water One Litre', NULL, 12000, NULL, 'evian_water.jpg', 2),
  ((SELECT id FROM categories WHERE name='Beverages'), 'Red Bull', NULL, 8000, NULL, 'red_bull.jpg', 3),
  ((SELECT id FROM categories WHERE name='Beverages'), 'Coca Cola', NULL, 4000, NULL, 'coca_cola.jpg', 4),
  ((SELECT id FROM categories WHERE name='Beverages'), 'Fanta Orange', NULL, 7000, NULL, 'fanta_orange.jpg', 5),
  ((SELECT id FROM categories WHERE name='Beverages'), 'Sprite', NULL, 3000, NULL, 'sprite.jpg', 6)
ON CONFLICT DO NOTHING;
