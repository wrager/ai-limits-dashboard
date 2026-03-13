# AI Limits Dashboard — Руководство для AI-агентов

## Описание

Виджет для отображения лимитов AI-сервисов (OpenAI, Anthropic, Gemini, z.ai) в панели задач Windows и на рабочем столе. Архитектура допускает расширение на Android и Web.

## Архитектура

- **packages/core** — shared TypeScript: модели данных, интерфейс `IUsageProvider`, адаптеры провайдеров. Isomorphic (Node + browser).
- **apps/desktop** — Tauri 2 приложение: taskbar-режим, опция desktop widget, popup и полноэкранный dashboard.

## Команды

| Команда | Описание |
|---------|----------|
| `pnpm dev` | Запуск в режиме разработки |
| `pnpm build` | Сборка core + desktop |
| `pnpm lint` | ESLint по всему проекту |
| `pnpm typecheck` | Проверка типов TypeScript |
| `pnpm test` | Unit + integration тесты |

## Тестирование

- **Unit**: `*.test.ts` в `packages/core`, мокирование `fetch` через `vi.mock` / MSW
- **Integration**: провайдеры с mock API, Tauri commands
- **E2E**: WebdriverIO + tauri-driver (после Tauri scaffold)

Каждая фича сопровождается unit/integration-тестами.

## Конвенции

- TypeScript strict mode, без `any`
- Один провайдер — один адаптер (класс, реализующий `IUsageProvider`)
- Маппинг API-ответов в общий `UsageSnapshot`
