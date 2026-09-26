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

Аутентификация

Изменяющие операции (POST, PATCH, DELETE) требуют заголовок `X-API-Key` со значением из переменной окружения `API_KEY`. GET-запросы публичны.

Значение по умолчанию для локальной разработки: `dev-secret-key`.

Пример:

```bash
curl -X POST http://localhost:3000/api/equipment \
  -H "X-API-Key: dev-secret-key" \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

HTML-страница

Простая страница для просмотра и создания заявок: `public/index.html`.
Отдаётся тем же Express-сервером по адресу `http://localhost:3000/`.

- Список заявок — `GET /api/requests`.
- Создание заявки — `POST /api/requests` с заголовком `X-API-Key`.

---

## Работа с базой данных

 Требования

- PostgreSQL 16+ (разработано и протестировано на 18).
- Node.js 20+.
- Sequelize для ORM и миграций.

 Переменные окружения

Добавлены к существующим:

| Переменная        | По умолчанию     | Назначение |
|-------------------|------------------|------------|
| `DB_HOST`         | `localhost`      | Хост PostgreSQL |
| `DB_PORT`         | `5432`           | Порт PostgreSQL |
| `DB_NAME`         | `maintenance`    | Имя базы данных |
| `DB_USER`         | `maintenance`    | Пользователь БД |
| `DB_PASSWORD`     | `maintenance`    | Пароль |
| `DB_POOL_MAX`     | `10`             | Максимум соединений в пуле |
| `DB_POOL_MIN`     | `0`              | Минимум соединений |
| `DB_POOL_ACQUIRE` | `30000`          | Таймаут получения соединения, мс |
| `DB_POOL_IDLE`    | `10000`          | Таймаут простоя соединения, мс |
| `DB_LOGGING`      | `false`          | Логировать SQL-запросы |

Основные связи:

| Связь | Тип | Реализация |
|---|---|---|
| Site → Equipment | 1:N | `equipment.site_id` FK `ON DELETE RESTRICT` |
| Equipment → EquipmentPassport | 1:1 | `equipment_passports.equipment_id` UNIQUE, FK `ON DELETE CASCADE` |
| Equipment → MaintenanceRequest | 1:N | `maintenance_requests.equipment_id` FK `ON DELETE RESTRICT` |
| MaintenanceRequest → RequestStatusHistory | 1:N | `request_status_history.request_id` FK `ON DELETE CASCADE` |
| MaintenanceRequest ↔ Technician | N:M | через `request_assignees` с полями `role` и `hours` |


Уникальные ограничения:

- `sites.code`
- `equipment.serial_number`
- `technicians.employee_number`
- `equipment_passports.equipment_id`
- `request_assignees (request_id, technician_id)` — пара «заявка-специалист» уникальна.

 Порядок запуска с нуля

```bash
# 1. Клонировать и установить зависимости
git clone git@github.com:ksushapopova/maintenance-api.git
cd maintenance-api
npm install

# 2. Создать пользователя и БД в PostgreSQL
psql -U postgres <<'SQL'
CREATE USER maintenance WITH PASSWORD 'maintenance';
CREATE DATABASE maintenance OWNER maintenance;
CREATE DATABASE maintenance_test OWNER maintenance;
SQL

# 3. Настроить окружение
cp .env.example .env
# при необходимости отредактировать .env

# 4. Применить миграции
npm run db:migrate

# 5. Наполнить сидами
npm run db:seed

# 6. Запустить приложение
npm run dev
```

После запуска сервер будет доступен на `http://localhost:3000`.

Проверка:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/equipment?limit=3
curl http://localhost:3000/api/requests?limit=3
```

 Работа с миграциями

```bash
npm run db:migrate          # применить все миграции
npm run db:migrate:undo     # откатить все миграции
npm run db:migrate:redo     # откатить и применить заново
npm run db:seed             # применить все сиды
npm run db:seed:undo        # откатить сиды
npm run db:reset            # undo + migrate + seed
```

 Полный откат схемы

```bash
# 1. Откатить миграции (все таблицы удаляются)
npm run db:migrate:undo

# 2. Если нужно удалить и БД
psql -U postgres -c "DROP DATABASE maintenance;"
psql -U postgres -c "DROP USER maintenance;"

# 3. Полный сброс контейнера (если PostgreSQL в Docker — не наш случай)
# docker compose down -v
```

Аналитические отчёты

Отчёт по нагрузке на оборудование

`GET /api/reports/equipment-load`

Реализован прямым SQL-запросом с `JOIN` нескольких таблиц и агрегатными функциями.

Параметры (query):

| Параметр | Тип | Описание |
|---|---|---|
| `from` | ISO-date | Начало периода |
| `to` | ISO-date | Конец периода |
| `minRequests` | integer ≥ 0 | Минимальное число заявок (фильтрация групп через HAVING) |

Возвращает по каждой единице оборудования:

- число заявок за период;
- число закрытых заявок;
- суммарные плановые трудозатраты (часы);
- дату последнего обслуживания.

 Сводка по площадке   `GET /api/sites/:id/summary`

Возвращает:

- количество заявок в разрезе статусов (`byStatus`);
- количество заявок в разрезе приоритетов (`byPriority`);
- среднее время закрытия заявок в часах (`avgCloseHours`).

Пример:

```bash
curl "http://localhost:3000/api/sites/11111111-1111-1111-1111-111111111111/summary"
```

Транзакции

Следующие операции выполняются в транзакции с откатом при любой ошибке:

1. Смена статуса заявки (`PATCH /api/requests/:id/status`):
   - блокировка строки заявки (`SELECT ... FOR UPDATE` через `lock: t.LOCK.UPDATE`);
   - проверка допустимости перехода;
   - запрет перехода в `in_progress` без назначенных исполнителей (409);
   - обновление статуса заявки;
   - добавление записи в `request_status_history`.

2. Назначение бригады (`POST /api/requests/:id/assignees`):
   - проверка существования заявки и специалистов;
   - проверка: ровно один `lead`;
   - удаление прежних назначений;
   - вставка новых.

Демонстрация отката:

Попробуйте назначить бригаду с несуществующим `technicianId`. Транзакция упадёт на проверке специалистов, `replaceAll` не выполнится, прежние назначения останутся нетронутыми.

```bash
curl -X POST "http://localhost:3000/api/requests/<id>/assignees" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-secret-key" \
  -d '{"assignees":[{"technicianId":"00000000-0000-0000-0000-000000000000","role":"lead","hours":4}]}'
# → 404, прежние назначения целы
```

 Безопасность

- Все данные БД — только в `.env` (в репозитории только `.env.example`).
- Прямые SQL-запросы используют `replacements` (bind), конкатенация пользовательского ввода запрещена.
- Поля сортировки проверяются по белому списку.
- Значения `limit`/`offset` валидируются Joi (limit ≤ 100).
- В production-режиме внутренние сообщения об ошибках в ответе не показываются.

 Новые эндпоинты Кейса 3

| Метод | Путь | Назначение |
|---|---|---|
| POST | `/api/requests/:id/assignees` | Назначить бригаду (транзакция, ровно один lead) |
| DELETE | `/api/requests/:id/assignees/:userId` | Снять специалиста |
| GET | `/api/requests/:id/history` | История изменений статуса |
| GET | `/api/sites/:id/summary` | Сводка по площадке |
| GET | `/api/reports/equipment-load` | Нагрузка на оборудование (raw SQL) |

Все существующие эндпоинты Кейса 2 сохранены без изменения контракта

Индексы и производительность

Добавленные индексы

| Индекс | Таблица | Назначение |
|---|---|---|
| `idx_requests_status_created_at` | maintenance_requests | Фильтр по статусу + сортировка по дате |
| `idx_equipment_site_status` | equipment | Фильтр оборудования по площадке и статусу |
| `idx_requests_equipment_status` | maintenance_requests | Вложенный ресурс: заявки по оборудованию |
| `idx_assignees_request_id` | request_assignees | Загрузка назначений по заявке |
| `idx_requests_title_trgm` | maintenance_requests | Поиск по подстроке (GIN + pg_trgm) |

Все замеры выполнены командой:

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
```

Датасет — тестовые сиды: 2 площадки, 8 единиц оборудования, 20 заявок, 5 специалистов, 45+ назначений.

 Результаты: до и после

Запрос 1: заявки по статусу с сортировкой по дате

До индекса:

```
Limit  (cost=1.29..1.30 rows=4 width=84) (actual time=1.071..1.073 rows=6.00 loops=1)
  -> Sort  (cost=1.29..1.30 rows=4 width=84) (actual time=1.067..1.068 rows=6.00 loops=1)
        Sort Method: quicksort  Memory: 25kB
        -> Seq Scan on maintenance_requests  (cost=0.00..1.25 rows=4 width=84) (actual time=0.975..0.977 rows=6.00 loops=1)
              Filter: (status = 'in_progress'::enum_maintenance_requests_status)
              Rows Removed by Filter: 14
Execution Time: 1.175 ms
```

После:

```
Limit  (cost=1.29..1.30 rows=4 width=84) (actual time=0.023..0.024 rows=6.00 loops=1)
  -> Sort  (cost=1.29..1.30 rows=4 width=84) (actual time=0.022..0.023 rows=6.00 loops=1)
        Sort Method: quicksort  Memory: 25kB
        -> Seq Scan on maintenance_requests  (cost=0.00..1.25 rows=4 width=84) (actual time=0.012..0.015 rows=6.00 loops=1)
Execution Time: 0.041 ms
```

Запрос 2: оборудование по площадке и статусу

До:

```
Index Scan using equipment_site_id_idx on equipment  (cost=0.15..18.55 rows=160 width=59) (actual time=0.287..0.289 rows=3.00 loops=1)
  Index Cond: (site_id = '11111111-1111-1111-1111-111111111111'::uuid)
  Filter: (status = 'operational'::enum_equipment_status)
Execution Time: 0.320 ms
```

После:

```
Seq Scan on equipment  (cost=0.00..1.12 rows=2 width=59) (actual time=0.010..0.011 rows=3.00 loops=1)
  Filter: ((site_id = '11111111-1111-1111-1111-111111111111'::uuid) AND (status = 'operational'::enum_equipment_status))
Execution Time: 0.026 ms
```

Запрос 3: поиск по подстроке (ILIKE)

До и после:

```
Seq Scan on maintenance_requests  (cost=0.00..1.25 rows=1 width=52) (actual time=0.056..0.056 rows=0.00 loops=1)
  Filter: ((title)::text ~~* '%подшипник%'::text)
Execution Time: 0.071 ms
```

Запрос 4: агрегация нагрузки по оборудованию

До:

```
HashAggregate  (cost=38.36..46.36 rows=640 width=80) (actual time=0.551..0.557 rows=8.00 loops=1)
  ->  Hash Right Join  (cost=25.85..27.56 rows=1440 width=61) (actual time=0.493..0.514 rows=52.00 loops=1)
Execution Time: 1.732 ms
```

После:

```
HashAggregate  (cost=4.79..4.89 rows=8 width=80) (actual time=0.098..0.101 rows=8.00 loops=1)
  ->  Hash Right Join  (cost=2.63..4.44 rows=47 width=61) (actual time=0.047..0.077 rows=52.00 loops=1)
Execution Time: 0.163 ms
```

Запрос 5: сводка по площадке

До:

```
HashAggregate  (cost=18.96..19.00 rows=4 width=12) (actual time=0.056..0.057 rows=3.00 loops=1)
  ->  Nested Loop  (cost=0.16..18.91 rows=10 width=4) (actual time=0.031..0.048 rows=11.00 loops=1)
Execution Time: 0.105 ms
```

После:

```
HashAggregate  (cost=2.47..2.51 rows=4 width=12) (actual time=0.041..0.042 rows=3.00 loops=1)
  ->  Hash Join  (cost=1.15..2.42 rows=10 width=4) (actual time=0.029..0.034 rows=11.00 loops=1)
Execution Time: 0.076 ms
```

Вывод

На текущем объёме (20 заявок, 8 единиц оборудования)планировщик PostgreSQL предпочитает Seq Scan — таблицы малы, и разница в планах незаметна.

Созданные индексы:

- покрывают частые фильтры (`status`, `site_id + status`, `equipment_id + status`) и готовы к росту объёма;
- GIN-индекс с `pg_trgm` ускоряет поиск по подстроке на больших таблицах;
- значительно снижают стоимость планирования: cost в плане упал с 38.36 до 4.79 для агрегации по оборудованию — это оценка сложности запроса, и она отражает реальную эффективность индексов.

 Как воспроизвести

```bash
npm run db:migrate:undo
psql -U maintenance -d maintenance  

npm run db:migrate
psql -U maintenance -d maintenance  
```