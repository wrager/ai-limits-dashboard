import { useEffect, useState, useCallback } from "react";
import { load } from "@tauri-apps/plugin-store";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { aggregateUsage } from "@ai-limits/core";
import type { ProviderConfig } from "@ai-limits/core";
import type { AggregatedState } from "@ai-limits/core";
import { RefreshCw, Settings, Maximize2, ArrowLeft } from "lucide-react";
import { SettingsScreen } from "./SettingsScreen";

const STORE_KEY = "providerConfigs";
const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 min

type View = "popup" | "settings" | "dashboard";

function statusColor(status: string): string {
  switch (status) {
    case "ok":
      return "bg-emerald-500";
    case "warning":
      return "bg-amber-500";
    case "error":
      return "bg-red-500";
    default:
      return "bg-neutral-400";
  }
}

function PopupView({
  configs,
  state,
  loading,
  refreshing,
  onRefresh,
  onOpenSettings,
  onOpenDashboard,
}: {
  configs: ProviderConfig[];
  state: AggregatedState | null;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onOpenSettings: () => void;
  onOpenDashboard: () => void;
}) {
  return (
    <>
      <header className="flex items-center justify-between p-3 border-b border-neutral-200 dark:border-neutral-700 shrink-0">
        <h1 className="text-lg font-semibold">AI Limits</h1>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing || loading}
            className="p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50"
            title="Обновить"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
            title="Настройки"
          >
            <Settings size={18} />
          </button>
          <button
            type="button"
            onClick={onOpenDashboard}
            className="p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
            title="Полный dashboard"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </header>
      <main className="flex-1 p-4 overflow-auto">
        {loading && configs.length > 0 ? (
          <div className="text-neutral-500 dark:text-neutral-400 text-sm">
            Загрузка…
          </div>
        ) : configs.length === 0 ? (
          <div className="text-neutral-500 dark:text-neutral-400 text-sm">
            Добавьте провайдеры в настройках
          </div>
        ) : state?.snapshots.length === 0 ? (
          <div className="text-neutral-500 dark:text-neutral-400 text-sm">
            Нет валидных провайдеров
          </div>
        ) : (
          <ul className="space-y-3">
            {state?.snapshots.map((s) => {
              const pct =
                s.limit > 0 ? Math.min(100, (s.used / s.limit) * 100) : 0;
              return (
                <li key={s.providerId} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      {s.displayName ?? s.providerId}
                    </span>
                    <span className="text-neutral-500">
                      {s.used} / {s.limit} {s.unit}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                    <div
                      className={`h-full transition-all ${statusColor(s.status)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}

function App() {
  const [view, setView] = useState<View>("popup");
  const [configs, setConfigs] = useState<ProviderConfig[]>([]);
  const [state, setState] = useState<AggregatedState | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConfigs = useCallback(async () => {
    try {
      const store = await load("settings.json", {
        autoSave: 100,
        defaults: {},
      });
      const stored = await store.get<ProviderConfig[]>(STORE_KEY);
      const parsed = Array.isArray(stored) ? stored : [];
      setConfigs(parsed);
    } catch {
      setConfigs([]);
    }
  }, []);

  const fetchUsage = useCallback(async () => {
    if (configs.length === 0) {
      setState({ snapshots: [], lastUpdated: Date.now(), hasErrors: false });
      return;
    }
    const aggregated = await aggregateUsage(configs);
    setState(aggregated);
    try {
      const summary = aggregated.snapshots
        .map((s) => `${s.displayName ?? s.providerId}: ${s.used}/${s.limit}`)
        .join(" · ");
      const win = getCurrentWindow();
      win.setTitle(summary || "AI Limits");
      const worst =
        aggregated.snapshots.some((s) => s.status === "error")
          ? "error"
          : aggregated.snapshots.some((s) => s.status === "warning")
            ? "warning"
            : aggregated.snapshots.length > 0
              ? "ok"
              : null;
      await invoke("set_taskbar_overlay", { status: worst });
    } catch {
      // Not in Tauri
    }
  }, [configs]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUsage();
    setRefreshing(false);
  }, [fetchUsage]);

  const onConfigsChange = useCallback((newConfigs: ProviderConfig[]) => {
    setConfigs(newConfigs);
  }, []);

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  useEffect(() => {
    if (configs.length > 0) {
      setLoading(true);
      fetchUsage().finally(() => setLoading(false));
    } else {
      setState(null);
      setLoading(false);
    }
  }, [configs, fetchUsage]);

  useEffect(() => {
    if (configs.length === 0) return;
    const id = setInterval(fetchUsage, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [configs, fetchUsage]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex flex-col">
      {view === "settings" ? (
        <>
          <header className="flex items-center gap-2 p-3 border-b border-neutral-200 dark:border-neutral-700 shrink-0">
            <button
              type="button"
              onClick={() => setView("popup")}
              className="p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
              title="Назад"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-lg font-semibold">Настройки</h1>
          </header>
          <SettingsScreen
            configs={configs}
            onConfigsChange={onConfigsChange}
          />
        </>
      ) : view === "dashboard" ? (
        <>
          <header className="flex items-center gap-2 p-3 border-b border-neutral-200 dark:border-neutral-700 shrink-0">
            <button
              type="button"
              onClick={() => setView("popup")}
              className="p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
              title="Назад"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-lg font-semibold">Dashboard</h1>
            <button
              type="button"
              onClick={refresh}
              disabled={refreshing || loading}
              className="ml-auto p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50"
              title="Обновить"
            >
              <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            </button>
          </header>
          <main className="flex-1 p-4 overflow-auto">
            {loading && configs.length > 0 ? (
              <div className="text-neutral-500 dark:text-neutral-400 text-sm">
                Загрузка…
              </div>
            ) : configs.length === 0 ? (
              <div className="text-neutral-500 dark:text-neutral-400 text-sm">
                Добавьте провайдеры в настройках
              </div>
            ) : state?.snapshots.length === 0 ? (
              <div className="text-neutral-500 dark:text-neutral-400 text-sm">
                Нет валидных провайдеров
              </div>
            ) : (
              <ul className="space-y-3">
                {state?.snapshots.map((s) => {
                  const pct =
                    s.limit > 0
                      ? Math.min(100, (s.used / s.limit) * 100)
                      : 0;
                  return (
                    <li key={s.providerId} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">
                          {s.displayName ?? s.providerId}
                        </span>
                        <span className="text-neutral-500">
                          {s.used} / {s.limit} {s.unit}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                        <div
                          className={`h-full transition-all ${statusColor(s.status)}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </main>
        </>
      ) : (
        <PopupView
          configs={configs}
          state={state}
          loading={loading}
          refreshing={refreshing}
          onRefresh={refresh}
          onOpenSettings={() => setView("settings")}
          onOpenDashboard={() => setView("dashboard")}
        />
      )}
    </div>
  );
}

export default App;
