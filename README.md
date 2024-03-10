# AutoExcelProject-AEP-

●Python側の使い方
・環境用意
① python/ に移動
②「pip3 install -r requirements.txt」を実行

・テスト実行
①「python/app/」 に移動

②以下のようなコマンドでテスト
python .\AEP_0.py '{\"select_excel_file_fla\": 0, \"target_year\": \"2024\", \"target_month\": \"02\", \"working_date_list\": [\"9:15\", \"9:30\"],  \"closing_date_list\": [\"18:15\", \"18:30\"],  \"work_details_list\": [0, 2],  \"remarks_column_list\": [\"有給\", \"\"]}'