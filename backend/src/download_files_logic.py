import threading
import time
import requests as r
import re
import zipfile
from src.consts import PATH_TO_DUCKDB
import duckdb
from tqdm.auto import tqdm
import os
from datetime import datetime
from dateutil.relativedelta import relativedelta
import concurrent.futures
import sys
from src import sql


def run_download(status_dict):
    """
    Фоновая задача для загрузки файлов. Обновляет status_dict.
    """
    try:
        con = duckdb.connect(PATH_TO_DUCKDB)
        files_names = get_files(con)
        total = len(files_names)
        if total == 0:
            status_dict["status"] = "done"
            status_dict["progress"] = 100
            status_dict["message"] = "Нет новых файлов для загрузки"
            return
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
            futures = [executor.submit(process_file, file_name, con) for file_name in files_names]
            for i, future in enumerate(concurrent.futures.as_completed(futures)):
                try:
                    future.result()
                except Exception as e:
                    print(f"Ошибка при обработке файла: {e}")
                status_dict["progress"] = int((i+1)/total*100)
                status_dict["message"] = f"Загружено {i+1} из {total} файлов"
        status_dict["status"] = "done"
        status_dict["progress"] = 100
        status_dict["message"] = "Загрузка завершена"
        con.close()
    except Exception as e:
        status_dict["status"] = "error"
        status_dict["message"] = str(e)

def extract_date(filename):
    date_pattern = r"\d{4}-\d{2}(?:-\d{2})?"
    match = re.search(date_pattern, filename)
    if match:
        date_str = match.group(0)
        try:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            date_obj = datetime.strptime(date_str, "%Y-%m").date()
        return date_obj
    else:
        return None

def get_files(con):
    html = r.get("https://web.ais.dk/aisdata/").text
    files = set(re.findall(r"aisdk-?\d*-\d*-\d*.zip", html))
    min_date = datetime.today().date().replace(day=1) - relativedelta(months=6)
    exists_files = (
        con.execute(sql.dml.SELECT_DISTINCT_DATES_FROM_LOGS).fetchdf().dt.to_list()
    )
    files = list(
        filter(
            lambda x: extract_date(x) >= min_date
            and extract_date(x) not in (extract_date(y) for y in exists_files),
            files,
        )
    )
    return sorted(files)

def download_file(file_name: str, chunk_size=2 * 1024 * 1024):
    url = f"https://web.ais.dk/aisdata/{file_name}"
    temp_file = f"{file_name}.tmp"
    if os.path.exists(file_name):
        print(f"Файл {file_name} уже существует, пропускаем.")
        return
    headers = {}
    downloaded_size = 0
    if os.path.exists(temp_file):
        downloaded_size = os.path.getsize(temp_file)
        headers = {"Range": f"bytes={downloaded_size}-"}
    session = r.Session()
    response = session.get(url, headers=headers, stream=True)
    response.raise_for_status()
    total_size = int(response.headers.get("content-length", 0))
    if headers:
        total_size += downloaded_size
    mode = "ab" if headers else "wb"
    progress = tqdm(
        total=total_size,
        unit="B",
        unit_scale=True,
        unit_divisor=1024,
        desc=f"Скачивание {file_name}",
        initial=downloaded_size if headers else 0,
    )
    buffer = bytearray()
    buffer_size = chunk_size * 5
    with open(temp_file, mode) as f:
        for chunk in response.iter_content(chunk_size=chunk_size):
            if chunk:
                buffer.extend(chunk)
                if len(buffer) >= buffer_size:
                    f.write(buffer)
                    progress.update(len(buffer))
                    buffer.clear()
        if buffer:
            f.write(buffer)
            progress.update(len(buffer))
    progress.close()
    os.rename(temp_file, file_name)
    print(f"Файл {file_name} успешно скачан!")

def unzip_file(zip_path, extract_to="."):
    if not os.path.exists(zip_path):
        print(f"Файл {zip_path} не найден.")
        return []
    if not zipfile.is_zipfile(zip_path):
        print(f"Файл {zip_path} не является ZIP-архивом.")
        return []
    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        if not os.path.exists(extract_to):
            os.makedirs(extract_to)
        zip_ref.extractall(extract_to)
        print(f"Файлы успешно распакованы в {extract_to}.")
        return zip_ref.namelist()

def delete_file(file_path):
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"Файл {file_path} успешно удален.")
    except Exception as e:
        print(f"Ошибка при удалении файла {file_path}: {e}")

def save_to_duck(duckdb_con, file_name: str):
    local_con = duckdb_con.cursor()
    local_con.execute(sql.dml.INSERT_LOGS.format(file_name=file_name))

def process_file(file_name, con):
    download_file(file_name)
    csv_files = unzip_file(file_name)
    delete_file(file_name)
    for csv_file in csv_files:
        print(csv_file)
        save_to_duck(con, csv_file)
        delete_file(csv_file)
