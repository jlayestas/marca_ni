# Marcas NI — Roadmap

## Phase 1 — MVP (Core)

### Public
- [x] Trademark detail page (`/marca/[id]`) — two-column layout, all fields, click-to-call on mobile, social links as icon buttons
- [x] Status filter on public search (Registrada / En Trámite / Cancelada)

### Admin
- [x] Edit trademark — wire up the edit button in the dashboard to a pre-filled intake form
- [x] Admin table search/filter — filter by name or status inline in the dashboard
- [x] Form auto-save draft every 30s to localStorage
- [x] Keyboard shortcuts: Cmd+S to save draft, Cmd+Enter to publish

### Backend / Security
- [x] Rate limiting on `GET /api/search` — max 60 requests/min per IP
- [ ] Image storage — swap local disk uploads for AWS S3 or Cloudflare R2

---

## Phase 2 — Enhanced Search & Filters

- [x] Spanish phonetic normalization — map K→C, PH→F, etc. before trigram comparison so "Koka" matches "Coca"
- [x] NICE Classification — add class/category field to the data model and intake form, filter by class on search
- [x] Advanced search filters — status, date range, owner name
- [x] Export results to PDF — for legal reference, includes similarity scores and full trademark details

---

## Phase 3 — Self-Service & Notifications

- [x] Public user accounts — free registration to save searches and bookmark trademarks
- [ ] Email alerts — notify registered users when a similar mark is filed after their search
- [ ] Admin audit log — track who created, edited, or deleted each trademark and when
- [ ] Law firm API access — rate-limited, API key-based access to the search endpoint for third-party integrations
