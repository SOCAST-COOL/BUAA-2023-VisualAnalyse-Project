import axios from "axios";

//设定所有列对应的下标
const PollutionView = 18, TEMPView = 9, RHView = 10, PSFCView = 11;
//设定部分列的数据范围
const Range = new Map([
    [PollutionView, {min: 0, max: 400}],
    [TEMPView, {min: 238, max: 310}],
    [RHView, {min: 6.75, max: 100}],
    [PSFCView, {min: 53556.65, max: 104488.18}],
]);
//Json格式的地图
let chinaGeo;
//Map对象，从行政区的code映射到名字上
let codeMap;
//每个月对应的天数
const months = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
//日期数组
let times = null;

//获取2015到2018所有的日期数组，[2015_1_1,...,2018_12_31]
export function getTimes() {
    if (times === null) {
        times = []
        for (let year = 2015; year <= 2018; year++) {
            for (let month = 1; month <= 12; month++) {
                let max_day = month === 2 ? (year === 2016 ? 29 : 28) : months[month];
                for (let day = 1; day <= max_day; day++) {
                    times.push(year + "_" + month + "_" + day)
                }
            }
        }
    }
    return times;
}
//获取Json格式的地图数据，同时写入codeMap中
export function loadChinaGeo(code, callback) {
    let fileName;
    if (code === 100000) fileName = "/mapdata/china.json";
    else fileName = "/mapdata/province/" + code + ".json";
    axios.get(fileName).then(res => {
        chinaGeo = res.data;
        codeMap = new Map();
        for (let featureIndex in chinaGeo['features']) {
            let code = chinaGeo['features'][featureIndex]['properties']['code'];
            let name = chinaGeo['features'][featureIndex]['properties']['name'];
            codeMap.set(code, name);
        }
        callback({map: chinaGeo, center: chinaGeo['propertity']['center']});
    });
}

//获取图表的数据，污染物(或者温度等)数据
//传入行政区编码，日期(如2015_1_1)，获取的数据(污染物、温度等)，回调函数
export function getNameMap(code, day, view_type, callback) {
    //记录了行政区名称、数据的值和行政区编码的数组
    let map = []
    let date = day.split('_')
    axios.get("http://127.0.0.1:8000/getData/" + code + "/" + date[0] + "/" + date[1] + "/" + date[2])
        .then(res => {
        let lines = res.data.substring(1, res.data.length - 1).split(')(')
        for (let ind in lines) {
            let cols = lines[ind].split(",")
            let data = {name: codeMap.get(Number(cols[19])), value: Number(cols[view_type]), code: Number(cols[19])}
            map.push(data);
        }
        callback({map: map, range: Range.get(view_type)});
    })
}

//获取风向数据
//传入行政区编码，日期(如2015_1_1)，获取的数据(污染物、温度等)，回调函数
export function getWind(code, day, callback) {
    let scale = 0.7;
    let date = day.split('_')
    axios.get('http://127.0.0.1:8000/getWind/' + date[0] + "/" + date[1] + "/" + date[2])
        .then(res => {
        let result = []
        let lines = res.data.substring(1, res.data.length - 1).split(')(')
        for (let ind in lines) {
            let cols = lines[ind].split(",");
            let u = Number(cols[1]), v = Number(cols[2]), lat = Number(cols[3]), lon = Number(cols[4]);
            let sum = Math.sqrt(u * u + v * v)
            u = u / sum * scale;
            v = v / sum * scale;
            result.push([{coord: [lon + u, lat + v]}, {coord: [lon - u, lat - v]}])
        }
        callback(result);
    })
}

export {PollutionView, TEMPView, RHView, PSFCView};