-- Enable fuzzy search extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enum for trademark status
CREATE TYPE trademark_status AS ENUM ('Registrada', 'En Tramite', 'Cancelada');

-- Main trademarks table
CREATE TABLE IF NOT EXISTS trademarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_marca TEXT NOT NULL,
  marca_figurativa TEXT,
  marca_denominativa TEXT NOT NULL,
  status trademark_status NOT NULL DEFAULT 'En Tramite',
  dueno TEXT NOT NULL,
  contactos JSONB NOT NULL DEFAULT '[]',
  redes_sociales JSONB NOT NULL DEFAULT '{}',
  direccion TEXT,
  nice_class SMALLINT CHECK (nice_class BETWEEN 1 AND 45),
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigram indexes for fast fuzzy search
CREATE INDEX IF NOT EXISTS idx_marca_nombre_trgm ON trademarks USING GIN (nombre_marca gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_marca_denominativa_trgm ON trademarks USING GIN (marca_denominativa gin_trgm_ops);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Public user accounts
CREATE TABLE IF NOT EXISTS public_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Saved searches (belong to public users)
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public_users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bookmarked trademarks (belong to public users)
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public_users(id) ON DELETE CASCADE,
  trademark_id UUID NOT NULL REFERENCES trademarks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, trademark_id)
);
