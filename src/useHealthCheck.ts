import { useCallback, useEffect, useState } from "react";
import type { AppEntry, AppStatus } from "./types";

const PROBE_TIMEOUT_MS = 5000;

/**
 * Probe a single URL for reachability from the browser.
 *
 * Browsers cannot read cross-origin responses without CORS headers, so we use
 * `mode: "no-cors"`. That returns an *opaque* response — we can't read the
 * status code — but the fetch promise still RESOLVES when the server responds
 * and REJECTS on a genuine network failure (connection refused, DNS failure,
 * or our AbortController timeout). For LAN/home-server apps this is a reliable
 * reachable / not-reachable signal.
 *
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Request/mode
 */
async function probe(url: string): Promise<AppStatus> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    await fetch(url, {
      mode: "no-cors",
      // Avoid caching so repeated checks reflect current state.
      cache: "no-store",
      signal: controller.signal,
    });
    return "up";
  } catch {
    return "down";
  } finally {
    clearTimeout(timeout);
  }
}

export interface HealthState {
  /** Status keyed by app link URL. */
  statuses: Record<string, AppStatus>;
  /** Timestamp (ms) of the last completed sweep, or null if none yet. */
  lastChecked: number | null;
  /** Re-probe every app immediately. */
  refresh: () => void;
}

/**
 * Tracks reachability for a list of apps, re-probing on an interval.
 *
 * @param apps          Apps to monitor.
 * @param intervalMs    How often to re-probe all apps. 0 disables auto-refresh.
 */
export function useHealthCheck(
  apps: AppEntry[],
  intervalMs = 30_000,
): HealthState {
  const [statuses, setStatuses] = useState<Record<string, AppStatus>>({});
  const [lastChecked, setLastChecked] = useState<number | null>(null);

  const refresh = useCallback(() => {
    if (apps.length === 0) return;

    setStatuses((prev) => {
      const next = { ...prev };
      for (const app of apps) next[app.link] = "checking";
      return next;
    });

    void Promise.all(
      apps.map(async (app) => {
        const status = await probe(app.link);
        setStatuses((prev) => ({ ...prev, [app.link]: status }));
      }),
    ).then(() => setLastChecked(Date.now()));
  }, [apps]);

  useEffect(() => {
    refresh();
    if (intervalMs <= 0) return;
    const id = setInterval(refresh, intervalMs);
    return () => clearInterval(id);
  }, [refresh, intervalMs]);

  return { statuses, lastChecked, refresh };
}
