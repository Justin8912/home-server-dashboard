import { useEffect, useMemo, useState } from "react";
import { AppTile } from "./AppTile";
import { useHealthCheck } from "./useHealthCheck";
import type { AppsConfig, AppEntry } from "./types";

/** Where the apps config is served from (see public/apps.json). */
const CONFIG_URL = "/apps.json";

export default function App() {
  const [apps, setApps] = useState<AppEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetch(CONFIG_URL, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} loading ${CONFIG_URL}`);
        return res.json() as Promise<AppsConfig>;
      })
      .then((config) => {
        if (!Array.isArray(config.apps)) {
          throw new Error('Config is missing an "apps" array.');
        }
        setApps(config.apps);
      })
      .catch((err: unknown) =>
        setLoadError(err instanceof Error ? err.message : String(err)),
      );
  }, []);

  const { statuses, lastChecked, refresh } = useHealthCheck(apps);

  const summary = useMemo(() => {
    let up = 0;
    let down = 0;
    for (const app of apps) {
      const s = statuses[app.link];
      if (s === "up") up++;
      else if (s === "down") down++;
    }
    return { up, down, total: apps.length };
  }, [apps, statuses]);

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1 className="page__title">Home Server Dashboard</h1>
          <p className="page__subtitle">
            {summary.total > 0 ? (
              <>
                {summary.up} reachable · {summary.down} unreachable ·{" "}
                {summary.total} total
                {lastChecked && (
                  <>
                    {" · "}checked{" "}
                    {new Date(lastChecked).toLocaleTimeString()}
                  </>
                )}
              </>
            ) : (
              "Loading apps…"
            )}
          </p>
        </div>
        <button className="refresh" onClick={refresh} type="button">
          Refresh
        </button>
      </header>

      {loadError && (
        <div className="error" role="alert">
          Could not load <code>{CONFIG_URL}</code>: {loadError}
        </div>
      )}

      <main className="grid">
        {apps.map((app) => (
          <AppTile
            key={app.link}
            app={app}
            status={statuses[app.link] ?? "checking"}
          />
        ))}
      </main>
    </div>
  );
}
