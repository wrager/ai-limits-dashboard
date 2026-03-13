/**
 * Экран настроек: провайдеры, API ключи, режим taskbar/desktop
 */
import { useState, useCallback } from "react";
import { load } from "@tauri-apps/plugin-store";
import type { ProviderConfig, ProviderType } from "@ai-limits/core";

const STORE_KEY = "providerConfigs";

const PROVIDER_TYPES: { value: ProviderType; label: string }[] = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "gemini", label: "Gemini" },
  { value: "zai", label: "z.ai" },
];

interface SettingsScreenProps {
  configs: ProviderConfig[];
  onConfigsChange: (configs: ProviderConfig[]) => void;
}

export function SettingsScreen({
  configs,
  onConfigsChange,
}: SettingsScreenProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<ProviderConfig>>({});

  const saveToStore = useCallback(
    async (newConfigs: ProviderConfig[]) => {
      try {
        const store = await load("settings.json", {
        autoSave: 100,
        defaults: {},
      });
        await store.set(STORE_KEY, newConfigs);
        await store.save();
        onConfigsChange(newConfigs);
      } catch {
        // Not in Tauri or store error
      }
    },
    [onConfigsChange]
  );

  const addProvider = () => {
    const id = `provider-${Date.now()}`;
    const newConfig: ProviderConfig = {
      id,
      type: "openai",
      displayName: "OpenAI",
    };
    setEditingId(id);
    setForm(newConfig);
  };

  const startEdit = (c: ProviderConfig) => {
    setEditingId(c.id);
    setForm({ ...c });
  };

  const saveEdit = async () => {
    if (!editingId || !form.type || !form.id) return;
    const updated: ProviderConfig = {
      id: form.id,
      type: form.type,
      apiKey: form.apiKey || undefined,
      customEndpoint: form.customEndpoint || undefined,
      displayName: form.displayName || undefined,
      manualLimit: form.manualLimit,
      manualUsed: form.manualUsed,
    };
    const idx = configs.findIndex((c) => c.id === editingId);
    const newConfigs =
      idx >= 0
        ? configs.map((c) => (c.id === editingId ? updated : c))
        : [...configs, updated];
    await saveToStore(newConfigs);
    setEditingId(null);
    setForm({});
  };

  const removeProvider = async (id: string) => {
    const newConfigs = configs.filter((c) => c.id !== id);
    await saveToStore(newConfigs);
    if (editingId === id) {
      setEditingId(null);
      setForm({});
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({});
  };

  return (
    <main className="flex-1 p-4 overflow-auto">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-medium">Провайдеры</h2>
          <button
            type="button"
            onClick={addProvider}
            className="px-3 py-1.5 text-sm rounded bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600"
          >
            + Добавить
          </button>
        </div>

        <ul className="space-y-2">
          {configs.map((c) => (
            <li
              key={c.id}
              className="p-3 rounded border border-neutral-200 dark:border-neutral-700 flex justify-between items-center"
            >
              <span className="font-medium">{c.displayName ?? c.id}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => startEdit(c)}
                  className="px-2 py-1 text-xs rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                >
                  Изменить
                </button>
                <button
                  type="button"
                  onClick={() => removeProvider(c.id)}
                  className="px-2 py-1 text-xs rounded text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                >
                  Удалить
                </button>
              </div>
            </li>
          ))}
        </ul>

        {editingId && (
          <div className="p-4 rounded border border-neutral-200 dark:border-neutral-700 space-y-3">
            <h3 className="font-medium">
              {configs.some((c) => c.id === editingId) ? "Изменить" : "Новый"}{" "}
              провайдер
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-0.5">
                  Тип
                </label>
                <select
                  value={form.type ?? "openai"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value as ProviderType,
                      displayName:
                        PROVIDER_TYPES.find((p) => p.value === e.target.value)
                          ?.label ?? form.displayName,
                    })
                  }
                  className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
                >
                  {PROVIDER_TYPES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-0.5">
                  Отображаемое имя
                </label>
                <input
                  type="text"
                  value={form.displayName ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, displayName: e.target.value })
                  }
                  placeholder="OpenAI"
                  className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
                />
              </div>
              {(form.type === "openai" || form.type === "anthropic") && (
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-0.5">
                    API ключ
                  </label>
                  <input
                    type="password"
                    value={form.apiKey ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, apiKey: e.target.value })
                    }
                    placeholder="sk-..."
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
                  />
                </div>
              )}
              {(form.type === "gemini" || form.type === "zai") && (
                <>
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400 mb-0.5">
                      Использовано (ручной ввод)
                    </label>
                    <input
                      type="number"
                      value={form.manualUsed ?? ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          manualUsed: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      placeholder="0"
                      className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400 mb-0.5">
                      Лимит (ручной)
                    </label>
                    <input
                      type="number"
                      value={form.manualLimit ?? ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          manualLimit: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      placeholder="100"
                      className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={saveEdit}
                className="px-3 py-1.5 text-sm rounded bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 hover:opacity-90"
              >
                Сохранить
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="px-3 py-1.5 text-sm rounded border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Отмена
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
