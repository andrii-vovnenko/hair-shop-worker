-- products
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT,
  description TEXT,
  short_description TEXT,
  type TEXT,
  length INTEGER,
  base_price DECIMAL(10,2),
  base_promo_price DECIMAL(10,2),
  category_id TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- variants
CREATE TABLE variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  sku TEXT,
  price DECIMAL(10,2),
  promo_price DECIMAL(10,2),
  color TEXT,
  stock_quantity INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(product_id) REFERENCES products(id)
);

-- variant images
CREATE TABLE variant_images (
  id TEXT PRIMARY KEY,
  variant_id TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY(variant_id) REFERENCES variants(id)
);

CREATE TABLE colors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT,
  color_category NUMBER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);