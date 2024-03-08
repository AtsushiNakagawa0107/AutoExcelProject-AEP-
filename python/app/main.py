from fastapi import FastAPI
from pydantic import BaseModel, ValidationError
import subprocess

app = FastAPI()

class AEPDataRequest(BaseModel):
    select_excel_file_flag: int
    preset_list: list
    target_year: str
    target_month: str
    working_date_list: list
    closing_date_list: list
    work_details_list: list
    remarks_column_list: list

@app.get("/")
async def root():
    return {"message": "Hello World"}

# リクエストボディ受け取り,Excel操作スクリプトを実行
@app.post("/process_data/")
async def process_data(request_body: AEPDataRequest):
    select_excel_file_flag = request_body.select_excel_file_flag
    if select_excel_file_flag == 0:
        # select_excel_file_flag が 0(佐藤用) ならば AEP_0.py を実行
        result = subprocess.run(
            ["python", "AEP_0.py", str(request_body())],    # request_bodyを渡す
            capture_output=True,
            text=True
        )
        return {"output": result.stdout}
    
    elif select_excel_file_flag == 1:
        result = subprocess.run(["python", "AEP_1.py", str(request_body())], capture_output=True, text=True)
        return {"output": result.stdout}
    else:
        return {"error": "Invalid value for select_excel_file_flag. It should be 0 or 1."}