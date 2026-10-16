CREATE TABLE IF NOT EXISTS produtos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  categoria VARCHAR(80) NOT NULL,
  preco NUMERIC(10,2) NOT NULL CHECK (preco >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO produtos (nome, categoria, preco) VALUES
  ('Câmera externa', 'Eletrônicos', 389.90),
  ('Teclado mecânico', 'Eletrônicos', 229.50),
  ('Mouse sem fio', 'Eletrônicos', 89.90),
  ('Caderno', 'Papelaria', 19.90),
  ('Caneta azul', 'Papelaria', 4.50),
  ('Garrafa térmica', 'Casa', 79.90);