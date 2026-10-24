# 11holidays web

The 11holidays.com website, built with [TanStack Start](https://tanstack.com/start) (TanStack Router + SSR) and deployed to Cloudflare Workers. Holiday data is read from the `holidays` D1 database through server functions in `src/server/holidays.ts`.

## Development

```bash
npm run dev      # vite dev on http://localhost:3000 (uses the remote D1 binding; run `wrangler login` first)
npm run build    # production build into dist/
npm run deploy   # build and deploy with wrangler
```

## Layout

- `src/routes/` - file-based routes. `_site.tsx` is the layout with header/footer; `embed/` renders the iframe widget without site chrome; `sitemap[.]xml.ts` and `ics.$country.ts` are server routes.
- `src/server/` - server functions (D1 access via `cloudflare:workers`).
- `src/lib/` - data helpers, holiday themes (`holiday-themes.ts`), calendar customisation (`custom-calendar.ts`) and iCal export (`ics.ts`).
- `src/components/` - UI components; `ui/` holds the shadcn primitives.

## Features

- Searchable holidays (header search with `Ctrl/⌘ K`, `/search?q=`).
- Themed holiday detail pages with countdown, add-to-calendar and share.
- Calendar maker (`/calendars/:country`): select or deselect holidays, add custom days off, save as a named calendar (stored in the browser), share by link, print, or download PDF/PNG/iCal/CSV. All settings are stored in the URL.
- Embeddable widget (`/widget`, `/embed/:country`).
- iCal subscription feed: `/ics/:countryCode` (`?year=`, `?public=1`).
