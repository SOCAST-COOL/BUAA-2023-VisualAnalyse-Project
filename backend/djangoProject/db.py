from time import time
from django.http import HttpResponse
import sqlite3


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