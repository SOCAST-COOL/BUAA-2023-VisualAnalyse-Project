import axios from "axios";

const months = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/*
    2023-5-14 初始化
    将csv数据转储到类中
    csv的格式为date(日期),所有污染物指标,所有数据指标,code(区域代码,xx0000为省份代码,xxyyyy为市代码)
    构造时，按照code->date->data-array的层次储存数据于this.data中,
    同时处理每一个月份的数据,按照code->month->data-array的 层次储存数据于于this.average中
*/
export class PollutionData {
    constructor(strings, china) {
        this.geoJson = china;
        this.data = new Map();
        this.average = new Map();
        let strArray = strings.split("\n");
        //分解各列,初始化this.data
        for (let i = 1; i < strArray.length; i++) {
            let cols = strArray[i].split(",");
            let date = cols[0]
            let code = Number(cols[12])
            if (!this.data.has(code)) {
                this.data.set(code, new Map());
            }
            this.data.get(code).set(date, cols.slice(1, 12).map(Number))
        }
        //分解各列,初始化this.average
        for (let code in this.data) {
            for (let date in this.data[code]) {
                let month = Number(date[1] === '_' ? date.substring(0, 1) : date.substring(0, 2));
                if (!this.average.has(code)) {
                    this.average.set(code, new Map());
                }
                if (!this.average.get(code).has(month)) {
                    this.average.get(code).set(month, new Array(11));
                }
                for (let i = 0; i < 11; i++) {
                    this.average[code][month][i] += this.data[code][date][i] / months[month];
                }
            }
        }
    }

    getPM25(code, month, day) {
        return this.getData(code, month, day, 0);
    }

    getPM25Average(code, month) {
        return this.getAverage(code, month, 0);
    }

    getPM10(code, month, day) {
        return this.getData(code, month, day, 1);
    }

    getPM10Average(code, month) {
        return this.getAverage(code, month, 1);
    }

    getSO2(code, month, day) {
        return this.getData(code, month, day, 2);
    }

    getSO2Average(code, month) {
        return this.getAverage(code, month, 2);
    }

    getNO2(code, month, day) {
        return this.getData(code, month, day, 3);
    }

    getNO2Average(code, month) {
        return this.getAverage(code, month, 3);
    }

    getCO(code, month, day) {
        return this.getData(code, month, day, 4);
    }

    getCOAverage(code, month) {
        return this.getAverage(code, month, 4);
    }

    getO3(code, month, day) {
        return this.getData(code, month, day, 5);
    }

    getO3Average(code, month) {
        return this.getAverage(code, month, 5);
    }

    getU(code, month, day) {
        return this.getData(code, month, day, 6);
    }

    getUAverage(code, month) {
        return this.getAverage(code, month, 6);
    }

    getV(code, month, day) {
        return this.getData(code, month, day, 7);
    }

    getVAverage(code, month) {
        return this.getAverage(code, month, 7);
    }

    getTEMP(code, month, day) {
        return this.getData(code, month, day, 8);
    }

    getTEMPAverage(code, month) {
        return this.getAverage(code, month, 8);
    }

    getRH(code, month, day) {
        return this.getData(code, month, day, 9);
    }

    getRHAverage(code, month) {
        return this.getAverage(code, month, 9);
    }

    getPSFC(code, month, day) {
        return this.getData(code, month, day, 10);
    }

    getPSFCAverage(code, month) {
        return this.getAverage(code, month, 10);
    }

    getData(code, month, day, index) {
        return this.data.get(code).get(month+"_"+day)[index];
    }

    getAverage(code, month, index) {
        return this.average.get(code).get(month)[index];
    }

    getNameMap(day) {
        let json = this.geoJson;
        let map = []
        let date = dayToMonthAndDay(day)
        console.log(day, date)
        for (let featureIndex in json['features']) {
            let code = json['features'][featureIndex]['properties']['code'];
            let name = json['features'][featureIndex]['properties']['name'];
            map.push({name: name, value: this.getPM25(code, date.month, date.day)})
        }
        return map;
    }

}

//day从1到365,返回"MMDD"的日期
export function dayToDate(day) {
    let  sum = 0;
    for (let month = 0; month < 12; month++) {
        if (sum + months[month] > day) {
            return (month < 9 ? "0" : "") + (month + 1) + (day - sum < 10 ? "0" : "") + (day - sum);
        }
        sum += months[month]
    }
}

export function dayToMonthAndDay(day) {
    let  sum = 0;
    for (let month = 1; month <= 12; month++) {
        if (sum + months[month] >= day) {
            return {month: month, day: (day - sum)}
        }
        sum += months[month]
    }
}

export function readChinaPollution(callback) {
    let geoJson, pollution, loaded = 0;
    axios.get("/mapdata/china.json").then(res => {
        geoJson = res.data;
        loaded++;
        if (loaded === 2) callback(new PollutionData(pollution, geoJson));
    })
    axios.get("/summary/china.csv").then(res => {
        pollution = res.data;
        loaded++;
        if (loaded === 2) callback(new PollutionData(pollution, geoJson));
    });
}