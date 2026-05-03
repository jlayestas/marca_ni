# Nicaragua Trademark Search — Project Plan

## Overview

A web platform where the public can search Nicaragua's trademark registry and find phonetic/visual similarity matches, while admin users can quickly intake and manage trademark records.

---

## Core User Flows

### Public User
1. Land on search page → type a brand name
2. See ranked results with similarity scores (exact + fuzzy/phonetic matches)
3. Click a result to see full trademark detail
4. Optionally filter by status (Registrada / Pending / Cancelled)

### Admin User
1. Log in to protected admin panel
2. Fill intake form for a new trademark
3. Upload figurative mark image
4. Save draft → review → publish to registry
5. Edit or update existing trademarks

---

## Data Model

### `Trademark` record

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `nombre_marca` | string | Denominative mark name |
| `marca_figurativa` | image URL | Uploaded logo/image |
| `marca_denominativa` | string | Exact text of the mark |
| `status` | enum | `Registrada`, `En Tramite`, `Cancelada` |
| `dueno` | string | Owner full name or company |
| `contactos` | string[] | Phone numbers |
| `redes_sociales` | object | `{ instagram, facebook, tiktok, website }` |
| `direccion` | string | Physical address |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |
| `published` | boolean | Draft vs live |

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router) — SSR for SEO + fast search
- **Styling:** Tailwind CSS + shadcn/ui components
- **Search UX:** Debounced input with instant results panel
- **Image handling:** Next.js Image component with CDN

### Backend
- **API:** Next.js API routes (or a standalone Node/Express service)
- **Database:** PostgreSQL with `pg_trgm` extension for fuzzy text matching
- **Auth:** NextAuth.js (admin-only, credential or Google OAuth)
- **File Storage:** AWS S3 or Cloudflare R2 for trademark images
- **Search:** `pg_trgm` similarity + optional Typesense for phonetic/fuzzy

### Infrastructure
- **Hosting:** Vercel (frontend) + Railway or Supabase (DB)
- **CDN:** Cloudflare for images
- **CI/CD:** GitHub Actions

---

## Feature Breakdown

### Phase 1 — Core (MVP)

#### Public Search Page
- Full-width search bar, centered hero layout
- Instant results as user types (debounce 300ms)
- Results card shows: mark name, image thumbnail, status badge, owner
- Similarity score label (Exact / Alta similitud / Similitud parcial)
- Click → detail modal or page with all fields
- Mobile-first responsive design

#### Admin Intake Form
- Protected route `/admin`
- Step-by-step form (3 steps, progress indicator):
  - **Step 1 — Identidad:** Nombre de la marca, Marca denominativa, upload Marca figurativa (drag & drop)
  - **Step 2 — Estado y Titular:** Status dropdown, Dueño de la marca
  - **Step 3 — Contacto:** Phone numbers (add multiple), Redes sociales links, Dirección física
- Save as draft / Publish toggle
- Image preview before save
- Form auto-saves to local draft every 30s

#### Admin Dashboard
- Table of all trademarks with search + filter
- Quick status-change pill (click to change inline)
- Edit / Delete / Duplicate actions per row
- Bulk publish / unpublish

### Phase 2 — Enhanced Search

- Phonetic matching (Soundex / Spanish phonetic rules) so "Koka" matches "Coca"
- Class/category filter (NICE Classification)
- Advanced filter: status, date range, owner name
- Export results to PDF (for legal use)

### Phase 3 — Self-Service & Notifications
- Public users can create a free account to save searches
- Email alert when a similar mark is registered after their search
- Admin audit log (who changed what, when)
- API access for law firms (rate-limited, API key)

---

## UI/UX Design Direction

### Public Interface

**Tone:** Clean, trustworthy, official — not corporate-stiff, but professional.

**Search Page**
```
┌─────────────────────────────────────────────────────┐
│  [Logo]                        Nicaragua Marcas™    │
├─────────────────────────────────────────────────────┤
│                                                     │
│   Busca tu marca en el registro de Nicaragua        │
│                                                     │
│   ┌─────────────────────────────────┐ [Buscar]      │
│   │  Escribe el nombre de tu marca  │               │
│   └─────────────────────────────────┘               │
│                                                     │
│   ── Resultados ──────────────────────────────────  │
│   [Imagen] MARCA A   ● Registrada   Dueño: X        │
│   [Imagen] MARCA B   ○ En Trámite   Dueño: Y        │
└─────────────────────────────────────────────────────┘
```

- Color palette: Deep navy `#1B2A4A` + gold accent `#C8960C` + white
- Status badges: green (Registrada), amber (En Trámite), gray (Cancelada)
- Similarity indicator: colored left border on result cards
- Font: Inter for body, Fraunces or Playfair for headings

**Trademark Detail Page**
- Two-column layout: image left, details right
- Status prominently displayed at top
- Contact info with click-to-call links on mobile
- Social links as icon buttons

### Admin Interface

**Tone:** Dense but fast — optimized for power users entering many records.

**Intake Form UX patterns:**
- Keyboard-navigable (Tab through fields)
- Inline validation (don't wait for submit)
- Drag & drop image upload with instant preview
- Phone number field: `+505` country code pre-filled, add/remove rows
- Social media: icons next to each platform field
- Sticky "Save Draft / Publish" bar at bottom of form — always visible
- Keyboard shortcut: `Cmd+S` to save draft, `Cmd+Enter` to publish

**Admin Dashboard UX patterns:**
- Sticky header with search input to filter the table
- Column sorting on all fields
- Row click expands inline preview (no full page nav needed)
- Color-coded status column
- Recent activity feed in sidebar

---

## Search Algorithm

```
Query: "Nica Cola"

1. Exact match check → score 100
2. pg_trgm similarity (trigram) → score 0–100
3. Phonetic normalization (remove accents, map K→C, PH→F, etc.)
4. Re-run trigram on normalized strings
5. Rank: exact > normalized exact > trigram > phonetic trigram
6. Return top 20, show score label:
   ≥ 90  → "Coincidencia exacta"
   70–89 → "Alta similitud"
   50–69 → "Similitud parcial"
   < 50  → hidden (or "Resultados relacionados" section)
```

---

## API Routes

| Method | Path | Description |
|---|---|---|
| GET | `/api/search?q=` | Public search |
| GET | `/api/trademarks/:id` | Public detail |
| POST | `/api/admin/trademarks` | Create trademark |
| PATCH | `/api/admin/trademarks/:id` | Update trademark |
| DELETE | `/api/admin/trademarks/:id` | Delete trademark |
| POST | `/api/admin/upload` | Upload image to CDN |
| POST | `/api/auth/[...nextauth]` | Auth |

---

## Security Considerations

- Admin routes protected by session middleware
- Image uploads: validate MIME type, max 5MB, strip EXIF
- Rate limit public search to 60 req/min per IP
- Input sanitization on all text fields (prevent XSS/SQL injection)
- HTTPS enforced, secure cookies for admin session

---

## Milestones

| # | Milestone | Deliverable |
|---|---|---|
| 1 | DB schema + auth | Postgres schema, NextAuth admin login |
| 2 | Admin intake form | Full 3-step form with image upload |
| 3 | Public search (basic) | Exact + trigram search, results page |
| 4 | Detail page | Full trademark detail view |
| 5 | Admin dashboard | Table, filters, inline edit |
| 6 | Phonetic search | Spanish phonetic normalization layer |
| 7 | Polish + QA | Responsive QA, accessibility audit, perf |
| 8 | Launch | Deploy to production |

---

## Open Questions

- Will this need to comply with any official MIFIC (Nicaragua IP office) data format?
- Should "En Trámite" marks be visible to the public, or admin-only?
- Do admins need multi-role support (editor vs. super-admin)?
- Any legal disclaimer required on search results ("this is not official legal advice")?
