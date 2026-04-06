# 🐦 Flappy Bot

Мини-игра в стиле Flappy Bird с backend API и системой лидерборда.  
Проект развернут с использованием Docker, nginx и PostgreSQL.

---

## 🚀 Демо локально

После запуска приложение доступно по адресу:

👉 http://localhost

---

## 🧱 Архитектура

```text
browser
   ↓
nginx (frontend + reverse proxy)
   ├── /        → frontend (HTML/CSS/JS)
   └── /api     → backend (FastAPI)
                      ↓
                   PostgreSQL
````

---

## ⚙️ Стек технологий

* **Frontend:** HTML, CSS, JavaScript (Canvas)
* **Backend:** FastAPI (Python)
* **Database:** PostgreSQL
* **Web server:** nginx
* **Контейнеризация:** Docker, Docker Compose

---

## 🎮 Функциональность

* игра в стиле Flappy Bird
* система жизней
* отправка результата на сервер
* таблица лидеров (top 10)
* хранение данных в PostgreSQL
* reset leaderboard через API

---

## 📁 Структура проекта

```text
flappy-bot/
├── backend/
│   ├── main.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── game.js
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
└── .gitignore
```

---

## 🐳 Запуск проекта

Убедись, что установлен Docker и Docker Compose.

### 1. Клонировать репозиторий

```bash
git clone <your-repo-url>
cd flappy-bot
```

### 2. Запустить проект

```bash
docker compose up -d --build
```

---

## ✅ Проверка работы

Открыть в браузере:

👉 [http://localhost](http://localhost)

---

## 🔌 API

### Получить лидерборд

```http
GET /api/leaderboard
```

---

### Добавить результат

```http
POST /api/score
Content-Type: application/json

{
  "name": "player",
  "score": 123
}
```

---

### Очистить лидерборд

```http
POST /api/reset-leaderboard
```

---

## 🗄️ Работа с базой

Подключение к PostgreSQL:

```bash
docker exec -it flappy-devops-db psql -U flappy -d flappy_devops
```

Посмотреть записи:

```sql
SELECT * FROM scores ORDER BY score DESC;
```

---

## 💡 Особенности реализации

* nginx используется как:

  * статический сервер (frontend)
  * reverse proxy для backend
* backend не доступен напрямую с хоста
* взаимодействие сервисов происходит через docker network
* данные сохраняются в volume (`postgres_data`)
* используется healthcheck для базы данных

---

## 📌 Планы на развитие

* UI для базы (Adminer / pgAdmin)
* .env конфигурация
* CI/CD (GitHub Actions)
* улучшение игрового UX
* добавление анимаций и звуков

---

## 👨‍💻 Автор

Разработано как учебный fullstack + DevOps проект.
