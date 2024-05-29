from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ValidationError
import subprocess
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import json

app = FastAPI()

# CORS設定
origins = [
    "http://localhost:3000",  # ReactアプリのURLを指定
    "http://autoexcelapp.starfree.jp",
    "https://autoexcelproject-aep.onrender.com"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AEPDataRequest(BaseModel):
    select_excel_file_flag: int
    preset_list: List[str]
    target_year: str
    target_month: str
    working_date_list: List[str]
    closing_date_list: List[str]
    work_details_list: List[str]
    remarks_column_list: List[str]

@app.get("/")
async def root():
    return {"message": "Hello World"}

# リクエストボディ受け取り,Excel操作スクリプトを実行
@app.post("/process_data/")
async def process_data(request_body: AEPDataRequest):
  select_excel_file_flag = request_body.select_excel_file_flag
  try:
      if select_excel_file_flag == 0:
          # select_excel_file_flag が 0 の場合の処理
          result = subprocess.run(
              ["python", "AEP_0.py", json.dumps(request_body.dict())],  # JSON文字列を引数として渡す
              capture_output=True,
              text=True,
              check=True  # エラーチェックを有効にする
          )
          return {"output": result.stdout}

      elif select_excel_file_flag == 1:
          # select_excel_file_flag が 1 の場合の処理
          result = subprocess.run(
              ["python", "AEP_1.py", json.dumps(request_body.dict())],  # JSON文字列を引数として渡す
              capture_output=True,
              text=True,
              check=True  # エラーチェックを有効にする
          )
          return {"output": result.stdout}

      else:
          raise HTTPException(status_code=400, detail="Invalid value for select_excel_file_flag. It should be 0 or 1.")

  except subprocess.CalledProcessError as e:
      raise HTTPException(status_code=500, detail=f"Subprocess error: {e.stderr}")
  except Exception as e:
      raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")