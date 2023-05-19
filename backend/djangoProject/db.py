from time import time
from django.http import HttpResponse
import sqlite3

city_sheets = [
    '110000_summary', '120000_summary', '130000_summary', '140000_summary', '150000_summary',
    '210000_summary', '220000_summary', '230000_summary', '310000_summary', '320000_summary',
    '330000_summary', '340000_summary', '350000_summary', '360000_summary', '370000_summary',
    '410000_summary', '420000_summary', '430000_summary', '440000_summary', '450000_summary',
    '460000_summary', '500000_summary', '510000_summary', '520000_summary', '530000_summary',
    '540000_summary', '610000_summary', '620000_summary', '630000_summary', '640000_summary',
    '650000_summary', '700000_summary', '810000_summary']

def db(request):
    connection = sqlite3.connect('db.sqlite3')
    cur = connection.cursor()
    result = []
    start = time()
    try:
        # for city_sheet in city_sheets:
        #     sql = "SELECT * FROM `" + city_sheet + "` where `date`='2018_1_3'"
        #     cur.execute(sql)
        #     # 获取所有记录列表
        #     result += cur.fetchall()
        sql = "select * from cities where date ='2017_12_10'"
        cur.execute(sql)
        # 获取所有记录列表
        result = cur.fetchall()
    finally:
        cur.close()
        connection.close()
    print(time() - start)
    return HttpResponse(result)

def getData(request, type, year, month, day):
    if type == 'city':
        sheetName = 'cities'
    elif type == 'china':
        sheetName = 'china'
    connection = sqlite3.connect('db.sqlite3')
    cur = connection.cursor()
    start = time()
    try:
        sql = "select * from {} where date ='{}_{}_{}'".format(sheetName, year, month, day)
        cur.execute(sql)
        # 获取所有记录列表
        result = cur.fetchall()
    finally:
        cur.close()
        connection.close()
    print(time() - start)
    return HttpResponse(result)