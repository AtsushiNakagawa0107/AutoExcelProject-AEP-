## AEP関数群
import openpyxl
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

# ログ設定
def set_logger(loglevel = "DEBUG"):
    logger = logging.getLogger(__name__)
    logger.setLevel(loglevel)
    return logger

# エクセル編集処理(佐藤用)
def edit_excel_excel_file_flag_0(parameters):
    # 変数設定
    target_year = parameters['target_year']
    target_month = parameters['target_month']

    # Excelファイルを開く
    wb = openpyxl.load_workbook('excel_format/sample_format.xlsx')

    # コピー元のシートを取得
    source_sheet = wb['FM※コピーして使用']

    # 新しいシートをコピー元のシートの後ろに挿入
    new_sheet = wb.copy_worksheet(source_sheet)

    # 新しいシートの名前を指定した形式に変更
    new_sheet.title = f'{target_year}年{target_month}月'

    # A8セルをYYYY/MM/DD形式に編集
    date_str = f'{target_year}/{target_month}/1'  # YYYY/MM/01形式の文字列
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
    wb.save('excel_format/sample_format_updated.xlsx')  # テストが終わったらformat自体上書きに書き換える
    
    return

# Gメール送信処理
def send_g_mail(from_mail_address, ap_pass, to_mail_address, target_year, target_month):
    # メールの作成
    msg = MIMEMultipart()
    msg['From'] = from_mail_address
    msg['To'] = to_mail_address
    msg['Subject'] = f'AutoExcelProject {target_year}/{target_month}'

    # メール本文の追加
    body = 'AutoExcelProjectからの送信'
    msg.attach(MIMEText(body, 'plain'))

    # 添付ファイルの追加
    filename = 'excel_format/sample_format_updated.xlsx'
    attachment = open(filename, 'rb')
    part = MIMEBase('application', 'octet-stream')
    part.set_payload((attachment).read())
    encoders.encode_base64(part)
    part.add_header('Content-Disposition', "attachment; filename= %s" % filename)
    msg.attach(part)

    # Gmailに接続してメール送信
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(from_mail_address, ap_pass)
        text = msg.as_string()
        server.sendmail(to_mail_address, 'recipient_email@example.com', text)
        server.quit()
        print('メールが送信されました。')
    except Exception as e:
        print('エラーが発生しました:', str(e))