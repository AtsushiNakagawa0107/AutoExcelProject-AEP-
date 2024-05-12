import sys
import json
import AEP_func as func

# ログ設定
logger = func.set_logger()

# request_bodyを取得してparametersに格納
def get_request_body(request_body):
    parameters = {
        "select_excel_file_flag": request_body["select_excel_file_flag"],     # 選択されているエクセルを指定する
        "target_year": request_body.get("target_year", "2024"),               # 提出年を指定(半角数字, 4桁)
        "target_month": request_body.get("target_month", "01"),               # 提出月を指定(半角数字, 2桁)
        "working_date_list": request_body.get("working_date_list", []),       # 出勤で入力されている文字列をリストに格納
        "closing_date_list": request_body.get("closing_date_list", []),       # 退勤で入力されている文字列をリストに格納
        "work_details_list": request_body.get("work_details_list", []),       # 作業内容で入力されている文字列をリストに格納
        "remarks_column_list": request_body.get("remarks_column_list", [])    # 備考で入力されている文字列をリストに格納
    }
    logger.debug("parameters : %s", parameters)
    return parameters

# メイン処理
def main(request_body):
    # request_bodyを取得
    parameters = get_request_body(request_body)
    
    # エクセル編集処理
    func.edit_excel_excel_file_flag_0(parameters)

    # Gメール送信処理
    from_mail_address = 'matikado3594@gmail.com'
    to_mail_address = 'matikado3594@gmail.com'
    app_pass = 'xanesvvloqnwboiz'
    func.send_g_mail(from_mail_address, app_pass, to_mail_address, parameters['target_year'], parameters['target_month'])

    # レスポンス返却
    return {"message": f"success AEP_0. select_excel_file_flag {parameters['select_excel_file_flag']}."}

if __name__ == "__main__":
    # FastAPIからのリクエストボディを取得
    request_body = json.loads(sys.argv[1])

    # main関数を呼び出し
    result = main(request_body)

    # 結果を表示
    print(result)
