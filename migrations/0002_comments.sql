CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  author TEXT,
  text TEXT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);
