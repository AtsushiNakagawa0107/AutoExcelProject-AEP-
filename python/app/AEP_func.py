## AEP関数群
import openpyxl
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from email.header import Header
import xlwings as xw

# ログ設定
def set_logger(loglevel = "DEBUG"):
    logger = logging.getLogger(__name__)
    logger.setLevel(loglevel)
    return logger

# エクセル編集処理(佐藤用)
def edit_excel_excel_file_flag_0(parameters):
    # 変数設定
    target_year = parameters['target_year']                 # 年
    target_month = parameters['target_month']               # 月
    excel_name = f'{target_month}月作業報告書.xlsx'          # Excelファイル名 
    excel_file = f'excel_format/backup/{excel_name}'        # Excelファイルパス
    format_excel_file = 'excel_format/sample_format.xlsx'   # Excelフォーマットパス

    # Excelファイルを開く
    wb = openpyxl.load_workbook(format_excel_file)

    # コピー元のシートを取得
    source_sheet = wb['FM※コピーして使用']

    # 新しいシートの名前を指定した形式に変更
    new_sheet_name = f'{target_year}年{target_month}月'

    # 既に同名のシートが存在する場合は削除
    if new_sheet_name in wb.sheetnames:
        del wb[new_sheet_name]
    
    # 新しいシートをコピー元のシートの後ろに挿入
    new_sheet = wb.copy_worksheet(source_sheet)

    # 新しいシートの名前を指定した形式に変更
    new_sheet.title = new_sheet_name

    # A8セルをYYYY/MM/DD形式に編集
    int_month = int(target_month)               # 先頭の0を除外
    date_str = f'{target_year}/{int_month}/1'   # YYYY/MM/01形式の文字列
    active_cell = new_sheet['A8']
    active_cell.value = date_str
    active_cell.number_format = 'yyyy"年"m"月"'
    
    # B9セル以降を編集 (出勤)
    for i, working_str in enumerate(parameters['working_date_list'], start=9):
        active_cell = new_sheet[f'B{i}']
        active_cell.value = working_str
        active_cell.number_format = 'h":"mm'
    
    # C9セル以降を編集 (退勤)
    for i, closing_str in enumerate(parameters['closing_date_list'], start=9):
        active_cell = new_sheet[f'C{i}']
        active_cell.value = closing_str
        active_cell.number_format = 'h":"mm'

    # F9セル以降を編集 (作業内容)
    for i, work_details_str in enumerate(parameters['work_details_list'], start=9):
        active_cell = new_sheet[f'F{i}']
        active_cell.value = work_details_str
    
    # G9セル以降を編集 (備考)
    for i, remarks_column_str in enumerate(parameters['remarks_column_list'], start=9):
        active_cell = new_sheet[f'G{i}']
        active_cell.value = remarks_column_str

    # Excelファイルを保存
    wb.save(excel_file)
    wb.save(format_excel_file)

    ### ここから A8セルの書式がうまく反映されないための対処処理↓ ###

    # Excelアプリケーションを起動
    app = xw.App(visible=False)
    wb = app.books.open(excel_file)  # Excelファイルを開く
    ws = wb.sheets[new_sheet_name]

    # A8セルをYYYY/MM/DD形式に編集
    ws.range('A8').value = date_str
    # ユーザー定義の書式設定を適用
    ws.range('A8').number_format = 'yyyy"年"m"月"'

    # Excelファイルを保存
    wb.save(excel_file)
    wb.save(format_excel_file)

    # Excelアプリケーションを閉じる
    wb.close()
    app.quit()
    
    return

# Gメール送信処理
def send_g_mail(from_mail_address, ap_pass, to_mail_address, target_year, target_month):
    # メールの作成
    msg = MIMEMultipart()
    msg['From'] = from_mail_address
    msg['To'] = to_mail_address
    msg['Subject'] = f'{target_month}月作業報告書'

    # メール本文の追加
    body = f'''お疲れ様です。
{target_month}月分の作業報告書になります。
よろしくお願いします。
'''
    msg.attach(MIMEText(body, 'plain'))

    # 添付ファイルの追加
    excel_name = f'{target_month}月作業報告書.xlsx'
    filename = f'excel_format/backup/{excel_name}'
    attachment = open(filename, 'rb')
    part = MIMEBase('application', 'octet-stream')
    part.set_payload(attachment.read())
    encoders.encode_base64(part)

    # 日本語ファイル名を適切にエンコードしてヘッダーを追加
    encoded_filename = Header(excel_name, 'utf-8').encode()
    part.add_header('Content-Disposition', 'attachment', filename=encoded_filename)
    msg.attach(part)

    # Gmailに接続してメール送信
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(from_mail_address, ap_pass)
        text = msg.as_string()
        server.sendmail(from_mail_address, to_mail_address, text)
        server.quit()
        print('メールが送信されました。')
    except Exception as e:
        print('エラーが発生しました:', str(e))