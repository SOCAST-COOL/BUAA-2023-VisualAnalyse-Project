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

def getData(request, code, year, month, day):
    connection = sqlite3.connect('db.sqlite3')
    cur = connection.cursor()
    start = time()
    if code == 100000:
        sql = "select * from china where date ='{}_{}_{}'".format(year, month, day)
    else:
        sql = "select * from cities where date ='{}_{}_{}' and {} <= code and code < {}".format(year, month, day, code, code + 10000)
    try:
        cur.execute(sql)
        # 获取所有记录列表
        result = cur.fetchall()
    finally:
        cur.close()
        connection.close()
    print('{} to get {}'.format(time() - start, sql))
    return HttpResponse(result)

def getWind(request, year, month, day):
    connection = sqlite3.connect('db.sqlite3')
    cur = connection.cursor()
    start = time()
    try:
        sql = "select * from `wind_{}_2` where date ='{}_{}'".format(year, month, day)
        cur.execute(sql)
        # 获取所有记录列表
        result = cur.fetchall()
    finally:
        cur.close()
        connection.close()
    print('{} to get {}'.format(time() - start, sql))
    return HttpResponse(result)