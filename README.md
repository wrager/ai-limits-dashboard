# AI Limits Dashboard

Виджет для отображения лимитов AI-сервисов (OpenAI, Anthropic, Gemini, z.ai) в панели задач Windows и на рабочем столе.

## Структура проекта

- `packages/core` — общая TypeScript-логика (провайдеры, модели)
- `apps/desktop` — приложение на Tauri 2 для Windows

## Установка и запуск

```bash
pnpm install
pnpm build
pnpm dev
```

## Команды

| Команда | Описание |
|---------|----------|
| `pnpm dev` | Запуск в режиме разработки |
| `pnpm build` | Сборка всех пакетов |
| `pnpm lint` | Проверка ESLint |
| `pnpm typecheck` | Проверка типов TypeScript |
| `pnpm test` | Запуск тестов |
