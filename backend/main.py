from fastapi import FastAPI, UploadFile, File, BackgroundTasks, Request, Body
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
import os
from src import download_files_logic, process_data_logic
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Разрешаем CORS для фронтенда (например, React/Vue)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Можно указать ["http://localhost:3000"] для безопасности
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Глобальный статус загрузки файлов
DOWNLOAD_STATUS = {"status": "idle", "progress": 0, "message": ""}

@app.post("/download_files")
def download_files_endpoint(background_tasks: BackgroundTasks):
    """
    Запуск загрузки файлов в фоне. Возвращает текущий статус.
    """
    if DOWNLOAD_STATUS["status"] == "in_progress":
        return DOWNLOAD_STATUS
    DOWNLOAD_STATUS["status"] = "in_progress"
    DOWNLOAD_STATUS["progress"] = 0
    DOWNLOAD_STATUS["message"] = "Загрузка начата"
    background_tasks.add_task(download_files_logic.run_download, DOWNLOAD_STATUS)
    return DOWNLOAD_STATUS

@app.get("/download_files/status")
def download_status():
    """
    Получить статус загрузки файлов.
    """
    return DOWNLOAD_STATUS

class DataJsonModel(BaseModel):
    pathPoints: list
    gridAroundPath: list

@app.post("/process_data")
async def process_data_endpoint(data: dict = Body(...)):
    try:
        result_json = process_data_logic.run_process_json(data)
        print('*' * 30)
        print('*' * 30)
        print(result_json)
        print('*' * 30)
        print('*' * 30)
        return JSONResponse(content=result_json)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000, log_level="info")

