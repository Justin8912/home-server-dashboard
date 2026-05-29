import type { AppEntry, AppStatus } from "./types";

const STATUS_LABEL: Record<AppStatus, string> = {
  checking: "Checking…",
  up: "Reachable",
  down: "Unreachable",
};

interface AppTileProps {
  app: AppEntry;
  status: AppStatus;
}

export function AppTile({ app, status }: AppTileProps) {
  let host: string;
  try {
    host = new URL(app.link).host;
  } catch {
    host = app.link;
  }

  return (
    <a
      className="tile"
      href={app.link}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="tile__header">
        <span className={`status status--${status}`} aria-hidden="true" />
        <h2 className="tile__name">{app.name}</h2>
      </div>

      {app.description && <p className="tile__desc">{app.description}</p>}

      <div className="tile__footer">
        <span className="tile__host">{host}</span>
        <span className={`tile__status-label status-label--${status}`}>
          {STATUS_LABEL[status]}
        </span>
      </div>
    </a>
  );
}
