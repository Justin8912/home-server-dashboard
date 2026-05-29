export interface AppEntry {
  /** Display name of the application. */
  name: string;
  /** Optional human-readable description of what the app is. */
  description?: string;
  /** URL the dashboard links to and probes for reachability. */
  link: string;
}

export interface AppsConfig {
  apps: AppEntry[];
}

/**
 * Reachability state for a single app.
 * - "checking": a probe is currently in flight.
 * - "up": the server responded (opaque no-cors response resolved).
 * - "down": the probe failed or timed out (connection refused / DNS / timeout).
 */
export type AppStatus = "checking" | "up" | "down";
