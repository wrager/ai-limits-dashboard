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

Откройте http://localhost:5173/ в браузере. **Примечание:** API Tauri (store, overlay) не работают в браузере — для полной проверки нужна сборка Tauri (см. ниже).

### Как проверить собранный фронтенд

```bash
pnpm preview
```

Соберёт проект и запустит `vite preview` на http://localhost:4173/ — можно проверить UI, но без Tauri API.

### Полная сборка (Tauri, Windows)

Требуется [Rust](https://rustup.rs/) и Visual Studio Build Tools. Сборка:

```bash
pnpm build
cd apps/desktop && pnpm tauri build
```

Артефакты: `apps/desktop/src-tauri/target/release/bundle/` (.msi, .exe).

## Команды

| Команда | Описание |
|---------|----------|
| `pnpm dev` | Vite dev‑сервер (http://localhost:5173/) |
| `pnpm build` | Сборка всех пакетов |
| `pnpm preview` | Сборка и предпросмотр в браузере |
| `pnpm lint` | Проверка ESLint |
| `pnpm typecheck` | Проверка типов TypeScript |
| `pnpm test` | Запуск тестов |
