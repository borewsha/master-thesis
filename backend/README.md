# Запуск backend через uv (FastAPI)

## 1. Установка uv

### Linux/macOS/Windows
```sh
pip install uv
```

## 2. Установка зависимостей проекта

```sh
uv venv 
uv sync
```

## 3. Запуск сервера FastAPI

```sh
uv run main.py
```
Перейдите в браузере по адресу: [http://localhost:8000/docs](http://localhost:8000/docs)


---

**ВАЖНО:**
- Перед запуском фронтенда, запустите метод downoload_files для скачивания логов. Примерное время ожидания - **8 часов**! Требуемое место в процессе загрузке - 70 GB
