# Home Server Dashboard

A tiny React SPA that reads a list of apps from a JSON file and shows whether
each one is reachable from your browser. Click a tile to open the app.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
```

## Configuring your apps

Edit `public/apps.json`:

```json
{
  "apps": [
    {
      "name": "Jellyfin",
      "description": "Self-hosted media server.",
      "link": "http://jellyfin.local:8096"
    }
  ]
}
```

- `name` — required, shown as the tile title.
- `description` — optional, shown under the title.
- `link` — required, the URL the tile opens and probes for reachability.

`apps.json` lives in `public/`, so it's served as-is and you can edit it
without rebuilding — just refresh the page.

## How the "is it up?" check works — and its limits

The check runs entirely in your browser using `fetch(url, { mode: "no-cors" })`.

Because browsers block reading cross-origin responses without
[CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) headers, the
response is **opaque** — we cannot read the HTTP status code. We can only
observe whether the request **resolved** (server responded → marked
**Reachable**) or **rejected** (connection refused, DNS failure, or our 5s
timeout → marked **Unreachable**).

What this means in practice:

- It's a **reachability** signal, not a true HTTP health check. A server
  returning 500 still counts as "reachable" because it responded.
- For home-server / LAN apps you control, this is a solid up/down indicator.
- It cannot detect "the app loads but is broken."

If you later want real HTTP-status health checks (e.g. require a `200`), that
requires a small backend proxy to make the request server-side and report the
status. Not included here to keep this a pure static SPA.

## Build

```bash
npm run build    # type-checks and bundles to dist/
npm run preview  # serve the production build
```
