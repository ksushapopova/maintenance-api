# Maintenance API

REST API на Express для учёта заявок на техническое обслуживание оборудования производственной площадки. Сервис ведёт справочник оборудования и заявок, контролирует жизненный цикл заявки и умеет оценивать погодные условия на объекте перед планированием наружных работ.

Данные хранятся в JSON-файлах в каталоге `data/`. Доступ к данным изолирован за слоем репозиториев — замена хранилища не затрагивает сервисы и контроллеры.

Требования к окружению

- Node.js 20 или выше (используется встроенный `fetch`, ESM)
- npm
- Свободный порт (по умолчанию `3000`)
- Для эндпоинта `/api/equipment/:id/weather` — доступ в интернет к `api.open-meteo.com`.

Установка

```bash
git clone git@github.com:ksushapopova/maintenance-api.git
cd maintenance-api
npm install
cp .env.example .env
```

Отредактируйте `.env` при необходимости 

Переменные окружения

Все параметры читаются из `.env` через `dotenv` и имеют значения по умолчанию.

| Переменная             | По умолчанию                                           | Назначение |
|------------------------|--------------------------------------------------------|------------|
| `PORT`                 | `3000`                                                 | Порт HTTP-сервера |
| `NODE_ENV`             | `development`                                          | Режим (`development` / `production`) |
| `CORS_ORIGINS`         | `http://localhost:5173,http://localhost:3000`          | Список разрешённых origin через запятую |
| `RATE_LIMIT_WINDOW_MS` | `60000`                                                | Окно rate limiting, мс |
| `RATE_LIMIT_MAX`       | `100`                                                  | Максимум запросов на окно |
| `BODY_LIMIT`           | `100kb`                                                | Максимальный размер тела запроса |
| `LOG_LEVEL`            | `info`                                                 | Уровень логов (`error` / `warn` / `info` / `debug`) |
| `WEATHER_API_URL`      | `https://api.open-meteo.com/v1/forecast`               | Базовый URL прогноза погоды |
| `GEOCODING_API_URL`    | `https://geocoding-api.open-meteo.com/v1/search`       | Базовый URL геокодинга |
| `REQUEST_TIMEOUT_MS`   | `5000`                                                 | Таймаут запроса к внешнему API, мс |

`.env` добавлен в `.gitignore` и не попадает в репозиторий. Шаблон — `.env.example`.

Запуск

```bash
npm run dev    
npm start      
```

Сервер поднимется на `http://localhost:3000`. Проверка:

```bash
curl http://localhost:3000/api/health
```

Модель данных

Equipment (оборудование)

| Поле | Тип | Ограничения |
|---|---|---|
| `id` | string (uuid) | генерируется сервером |
| `name` | string | 3–100 символов, обязательное |
| `type` | string | `turbine` \| `inverter` \| `sensor` \| `substation` |
| `serialNumber` | string | уникальный в системе |
| `location` | object | `{ lat: number, lon: number }` |
| `status` | string | `operational` \| `maintenance` \| `fault` \| `decommissioned` |
| `installedAt` | ISO-дата | не в будущем |
| `createdAt` | ISO-дата-время | проставляется сервером |
| `updatedAt` | ISO-дата-время | проставляется сервером |

Maintenance Request

| Поле | Тип | Ограничения |
|---|---|---|
| `id` | string (uuid) | генерируется сервером |
| `equipmentId` | string (uuid) | ссылка на существующее оборудование |
| `title` | string | 5–120 символов, обязательное |
| `description` | string | до 2000 символов |
| `priority` | string | `low` \| `medium` \| `high` \| `critical` |
| `status` | string | `new` \| `in_progress` \| `done` \| `rejected` (по умолчанию `new`) |
| `plannedAt` | ISO-дата-время | необязательное |
| `createdAt` | ISO-дата-время | проставляется сервером |
| `updatedAt` | ISO-дата-время | проставляется сервером |

Схема переходов статусов заявки

```
new → in_progress → done
new → rejected
in_progress → rejected
```

Недопустимый переход возвращает **409 Conflict**. Статус меняется только через `PATCH /api/requests/:id/status`.

Эндпоинты

Служебные

| Метод | Путь | Назначение |
|---|---|---|
| GET | `/api/health` | Проверка доступности сервиса |

Оборудование

| Метод | Путь | Назначение | Успешный код |
|---|---|---|---|
| GET | `/api/equipment` | Список: фильтры `status`, `type`, `search`; сортировка `sort`, `order`; пагинация `page`, `limit` | 200 |
| POST | `/api/equipment` | Создание | 201 + `Location` |
| GET | `/api/equipment/:id` | Карточка | 200 |
| PATCH | `/api/equipment/:id` | Частичное обновление | 200 |
| DELETE | `/api/equipment/:id` | Удаление (запрещено при наличии открытых заявок) | 204 |
| GET | `/api/equipment/:id/requests` | Заявки по конкретной единице оборудования | 200 |
| GET | `/api/equipment/:id/weather` | Прогноз погоды по координатам объекта и признак пригодности окна для наружных работ | 200 |

Заявки

| Метод | Путь | Назначение | Успешный код |
|---|---|---|---|
| GET | `/api/requests` | Список: фильтры `equipmentId`, `status`, `priority`, `plannedFrom`, `plannedTo`; сортировка; пагинация | 200 |
| POST | `/api/requests` | Создание | 201 + `Location` |
| GET | `/api/requests/:id` | Карточка | 200 |
| PATCH | `/api/requests/:id` | Обновление `title`, `description`, `priority`, `plannedAt` | 200 |
| PATCH | `/api/requests/:id/status` | Смена статуса с проверкой переходов | 200 |
| DELETE | `/api/requests/:id` | Удаление | 204 |

Формат списочных ответов

Все списочные эндпоинты возвращают объект с данными и метаданными:

```json
{
  "data": [ /* ... */ ],
  "total": 42,
  "page": 1,
  "limit": 10
}
```
Погодный эндпоинт

`GET /api/equipment/:id/weather` берёт координаты оборудования, обращается к внешнему API прогноза и возвращает:

```json
{
  "forecast": [ /* прогноз по дням */ ],
  "suitable": true,
  "reason": "Погода подходит"
}
```

Правило пригодности задаётся в `src/services/weather.service.js` (например, отсутствие осадков и скорость ветра ниже порога). При недоступности внешнего API сервис не падает, а возвращает:

```json
{
  "forecast": null,
  "suitable": false,
  "reason": "Не удалось получить прогноз",
  "error": "..."
}
```

Формат ответа об ошибке

Все ошибки возвращаются в едином формате:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Некорректные данные запроса",
    "details": [
      { "field": "body.priority", "message": "Недопустимое значение" }
    ],
    "requestId": "b1f2c3d4"
  }
}
```

- `code` — строковый код (`VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, `CORS_FORBIDDEN`, `INVALID_JSON`, `PAYLOAD_TOO_LARGE`, `INTERNAL_ERROR`).
- `details` — только у ошибок валидации.
- `requestId` — id запроса; тот же id есть в заголовке `X-Request-Id` и в логах.
- В `production` внутренние сообщения и стек-трейсы не возвращаются.

Примеры запросов и ответов

Создание оборудования

```bash
curl -X POST http://localhost:3000/api/equipment \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Turbine A1",
    "type": "turbine",
    "serialNumber": "WT-A1-0001",
    "location": { "lat": 55.75, "lon": 37.62 },
    "status": "operational",
    "installedAt": "2024-05-01T00:00:00.000Z"
  }'
```

Ответ (201):

```json
{
  "id": "e1da0966-f1e0-4eca-b2d7-ae5c0bdd879c",
  "name": "Turbine A1",
  "type": "turbine",
  "serialNumber": "WT-A1-0001",
  "location": { "lat": 55.75, "lon": 37.62 },
  "status": "operational",
  "installedAt": "2024-05-01T00:00:00.000Z",
  "createdAt": "2026-09-17T10:15:00.000Z",
  "updatedAt": "2026-09-17T10:15:00.000Z"
}
```

Создание заявки

```bash
curl -X POST http://localhost:3000/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "equipmentId": "e1da0966-f1e0-4eca-b2d7-ae5c0bdd879c",
    "title": "Replace bearing",
    "description": "Wear detected",
    "priority": "high",
    "plannedAt": "2026-09-20T08:00:00.000Z"
  }'
```

Ответ (201):

```json
{
  "id": "3ba1c4ae-7842-462f-be8c-1a6d140104d1",
  "equipmentId": "e1da0966-f1e0-4eca-b2d7-ae5c0bdd879c",
  "title": "Replace bearing",
  "description": "Wear detected",
  "priority": "high",
  "status": "new",
  "plannedAt": "2026-09-20T08:00:00.000Z",
  "createdAt": "2026-09-17T10:20:00.000Z",
  "updatedAt": "2026-09-17T10:20:00.000Z"
}
```

Смена статуса

```bash
curl -X PATCH http://localhost:3000/api/requests/3ba1c4ae-7842-462f-be8c-1a6d140104d1/status \
  -H "Content-Type: application/json" \
  -d '{"status":"in_progress"}'
```

Недопустимый переход

```bash
curl -X PATCH http://localhost:3000/api/requests/3ba1c4ae-7842-462f-be8c-1a6d140104d1/status \
  -H "Content-Type: application/json" \
  -d '{"status":"new"}'
```

Ответ (409):

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Недопустимый переход статуса: in_progress → new",
    "requestId": "b1f2c3d4"
  }
}
```

Ошибка валидации 

```bash
curl -X POST http://localhost:3000/api/equipment \
  -H "Content-Type: application/json" \
  -d '{"name":"A","type":"wrong","serialNumber":"","location":{"lat":999,"lon":0},"status":"weird","installedAt":"2099-01-01T00:00:00.000Z"}'
```

Ответ (422):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Некорректные данные запроса",
    "details": [
      { "field": "body.name", "message": "\"name\" length must be at least 3 characters long" },
      { "field": "body.type", "message": "\"type\" must be one of [turbine, inverter, sensor, substation]" },
      { "field": "body.location.lat", "message": "\"lat\" must be less than or equal to 90" }
    ],
    "requestId": "b1f2c3d4"
  }
}
```

Дублирующий serialNumber (409)

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Серийный номер WT-A1-0001 уже занят",
    "requestId": "b1f2c3d4"
  }
}
```

Оборудование не найдено (404)

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Оборудование e1da0966-... не найдено",
    "requestId": "b1f2c3d4"
  }
}
```

Rate limit (429)

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Слишком много запросов. Попробуйте позже.",
    "requestId": "b1f2c3d4"
  }
}
```

Безопасность

CORS

Разрешённые источники задаются через `CORS_ORIGINS` (список через запятую). Никакого `*` — только явный whitelist.

- `http://localhost:5173` — для локальной HTML-страницы разработки.
- `http://localhost:3000` — для отладки через Postman/browser, если понадобится.

Запросы без заголовка `Origin` (curl, Postman, серверные вызовы) разрешены — они не подпадают под CORS. Запросы с чужим `Origin` отклоняются с 403 и кодом `CORS_FORBIDDEN`.

Rate limiting

На все маршруты `/api` действует ограничение `RATE_LIMIT_MAX` запросов за `RATE_LIMIT_WINDOW_MS` миллисекунд (по умолчанию 100 запросов в минуту). При превышении возвращается 429 с заголовками `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`.

Защитные HTTP-заголовки

Подключён `helmet` — добавляет `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, `Content-Security-Policy` и другие.

Лимит тела запроса

`express.json({ limit: '100kb' })` — превышение даёт 413 с `PAYLOAD_TOO_LARGE`.

Идентификатор запроса

Каждому запросу присваивается `requestId` (или берётся из `X-Request-Id`, если клиент прислал). Он возвращается в заголовке `X-Request-Id` и в теле ошибки, а также попадает в логи — так можно найти конкретный запрос.

Секреты и production

- Все параметры окружения — в `.env`, который не попадает в репозиторий.
- В `production` (`NODE_ENV=production`) внутренние сообщения и стек-трейсы в ответах не возвращаются — только код и общее сообщение.

Логирование

Каждый запрос логируется: метод, путь, статус ответа, длительность и `requestId`. Формат:

```
[2026-09-17T10:15:00.000Z] [INFO] GET /api/equipment 200 { requestId: 'b1f2c3d4', durationMs: 3.42 }
[2026-09-17T10:15:05.000Z] [WARN] POST /api/equipment 422 { requestId: 'e5f6a7b8', durationMs: 1.87 }
[2026-09-17T10:15:10.000Z] [ERROR] GET /api/equipment/... 500 { requestId: 'c9d0e1f2', durationMs: 15.2 }
```

Уровни: `error`, `warn`, `info`, `debug`. Уровень задаётся через `LOG_LEVEL`. В бизнес-коде нет прямых `console.log` — только вызов `log(level, ...)`.

Тестирование API в Postman

Коллекция с запросами и примерами ответов лежит в `docs/postman/`. В ней:

- группировка по ресурсам: Health, Equipment, Requests;
- переменные коллекции: `{{baseUrl}}`, `{{equipmentId}}`, `{{requestId}}`;
- автотесты `pm.test` на коды ответа и структуру;
- негативные сценарии: 400, 404, 409, 422, 429.

Структура проекта

```
maintenance-api/
├─ src/
│  ├─ app.js                  # сборка Express-приложения
│  ├─ server.js               # запуск сервера
│  ├─ config/index.js         # чтение переменных окружения
│  ├─ routes/                 # маршруты
│  ├─ controllers/            # HTTP-слой
│  ├─ services/               # бизнес-логика
│  ├─ repositories/           # доступ к данным (JSON-файлы)
│  ├─ middlewares/            # requestId, logger, validate, rateLimiter, notFound, errorHandler
│  ├─ validators/             # Joi-схемы для body/params/query
│  ├─ errors/                 # AppError, NotFoundError, ValidationError, ConflictError
│  ├─ weather/                # модуль внешнего погодного API (из Кейса 1)
│  └─ utils/asyncHandler.js   # обёртка для контроллеров
├─ tests/                     # тесты
├─ docs/postman/              # экспортированная коллекция Postman
├─ data/                      # JSON-хранилище (в .gitignore)
├─ .env.example
├─ .gitignore
├─ package.json
└─ README.md
```

Слоистая архитектура

```
HTTP-запрос → middleware → routes → controllers → services → repositories → JSON-файл
```

- routes — только сопоставление метода/пути с контроллером + валидаторы.
- controllers — извлекают данные из `req`, вызывают сервис, формируют HTTP-ответ.
- services — бизнес-логика (проверки, переходы статусов), не знают про Express и файлы.
- repositories — единственное место, которое знает, где хранятся данные.

Замена JSON на PostgreSQL затронет только слой `repositories`.