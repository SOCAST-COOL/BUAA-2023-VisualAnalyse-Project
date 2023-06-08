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

def getDateHeatMap(request, code, year):
    connection = sqlite3.connect('db.sqlite3')
    cur = connection.cursor()
    start = time()
    try:
        if code % 10000 == 0:
            sql = "select * from china where date like'{}_%' and code={}".format(year, code)
        else:
            sql = "select * from cities where date like '{}_%' and code={}".format(year, code)
        cur.execute(sql)
        # 获取所有记录列表
        result = cur.fetchall()
    finally:
        cur.close()
        connection.close()
    print('{} to get {}'.format(time() - start, sql))
    return HttpResponse(result)

def getMonthAverage(request, code, year):
    connection = sqlite3.connect('db.sqlite3')
    cur = connection.cursor()
    start = time()
    try:
        if code == 100000:
            sql = "select * from china_average where date like'{}_%'".format(year)
        else:
            sql = "select * from month_to_code where date like '{}_%' and code={}".format(year, code)
        cur.execute(sql)
        # 获取所有记录列表
        result = cur.fetchall()
    finally:
        cur.close()
        connection.close()
    print('{} to get {}'.format(time() - start, sql))
    return HttpResponse(result)


def getYearAverage(request, code):
    connection = sqlite3.connect('db.sqlite3')
    cur = connection.cursor()
    start = time()
    try:
        if code == 100000:
            sql = "select * from china_average2"
        else:
            sql = "select * from year_to_code where code={}".format(code)
        cur.execute(sql)
        # 获取所有记录列表
        result = cur.fetchall()
    finally:
        cur.close()
        connection.close()
    print('{} to get {}'.format(time() - start, sql))
    return HttpResponse(result)