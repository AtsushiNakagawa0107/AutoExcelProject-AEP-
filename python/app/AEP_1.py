import sys
import json

def main(request_body):
    # request_bodyを処理するコードをここに記述する
    select_excel_file_flag = request_body["select_excel_file_flag"]
    # 必要な処理を実行する
    return {"message": f"select_excel_file_flag {select_excel_file_flag}."}

if __name__ == "__main__":
    # FastAPIからのリクエストボディを取得
    request_body = json.loads(sys.argv[1])

    # main関数を呼び出し
    result = main(request_body)

    # 結果を表示
    print(result)