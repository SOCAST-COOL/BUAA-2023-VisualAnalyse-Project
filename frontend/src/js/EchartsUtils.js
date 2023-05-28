import * as echarts from "echarts";
import axios from "axios";
import {getTimes, getNameMap, loadChinaGeo, getWind} from "@/js/DataReader";


const colors = ["#0000FF","#0080FF","#00FFFF","#00FF80","#00FF00","#80FF00","#FFFF00","#FF8000","#FF0000"]
let chinaGeo = null, myChart = null, pollutionData = null, wind=null;
let view_type = null, show_wind = null;
let maxLoadedNumber = 2;
let timelineIndex = 0;
let code = 100000, changeCode = true;
let center = null, zoom = null;

export function init(callback) {
    myChart = echarts.init(document.getElementById('main'));
    myChart.on('timelinechanged', function (timeLineIndex) {
        timelineIndex = timeLineIndex.currentIndex;
        loadData()
    })
    myChart.on('dblclick', function (params) {
        if (code !== 100000) return;
        code = params.data.code;
        changeCode = true;
        loadData();
    })
    myChart.on("georoam", params => {
        zoom = myChart.getOption().series[0].zoom;
        center = myChart.getOption().series[0].center;
    });
}

export function returnRouter() {
    if (code === 100000) return;
    code = 100000;
    changeCode = true;
    loadData();
}

export function initDrawing(type, show) {
    view_type = type;
    show_wind = show;
    loadData();
}

function loadPollutionData() {
    let loaded = 0;
    getNameMap(code, getTimes()[timelineIndex], view_type, function(data) {
        pollutionData = data;
        loaded++;
        if (loaded === maxLoadedNumber) draw();
    });
    if (show_wind) {
        getWind(code, getTimes()[timelineIndex], function(data) {
            wind = data;
            loaded++;
            if (loaded === maxLoadedNumber) draw();
        });
    }
    else {
        wind = [];
        loaded++;
        if (loaded === maxLoadedNumber) draw();
    }
}

function loadData() {
    if (changeCode) {
        changeCode = false;
        loadChinaGeo(code, function (data) {
            chinaGeo = data.map;
            center = data.center;
            zoom = 1;
            loadData()
        });
    }
    else {
        loadPollutionData()
    }

}

export function draw() {
    let nameMap = pollutionData.map;
    let range = pollutionData.range;
    console.log(nameMap, chinaGeo)
    echarts.registerMap('中国', chinaGeo);//#2
    let option = {
        visualMap: {
            min: range.min,
            max: range.max,
            text: ['High', 'Low'],
            realtime: false,
            calculable: true,
            inRange: {
                color: colors
            }
        },
        timeline: {
            zlevel: 999,
            axisType: 'category',
            playInterval: 700,
            label:{
                interval: function(index, value) {
                    return value.endsWith("_1_1")
                },
                formatter: function (item) {
                    return item.substring(0, 4);
                }
            },
            tooltip: {
                trigger: "item",
                formatter(params) {
                    let strings = params.name.split('_')
                    return strings[0] + '年' + strings[1] + '月' + strings[2] + '日'
                }
            },
            data: getTimes(),
        },
        tooltip: {
            trigger: 'axis'
        },
        series: [
            {
                name: '中国地图',
                type: 'map',
                mapType: '中国',//#3
                roam: true,
                label: {
                    show: true
                },
                zoom: zoom,
                center: center,
                itemStyle: {
                    normal: {
                        label: {show: true},
                    },
                    emphasis: {
                        label: {show: true}
                    }
                },
                layoutCenter: ["50%", "50%"],
                layoutSize: "100%",
                data: nameMap,
            },
            {
                type: 'map',
                mapType: '中国',//#3
                data: [],
                markLine: {
                    zlevel: 2,
                    smooth:false,
                    symbol: ['none', 'arrow'],
                    tooltip: false,
                    itemStyle : {
                        normal: {
                            label:{show:false},
                            borderWidth:1,
                            lineStyle: {
                                type: 'solid',
                                shadowBlur: 10
                            }
                        }
                    },
                    effect : {
                        show: true,
                        scaleSize: 1,
                        period: 30,
                        color: '#fff',
                        shadowBlur: 10
                    },
                    animation: true,
                    label: false,
                    data : wind
                },
            }
        ]
    }
    myChart.setOption(option);
}

function getColor(code, month, day) {
    return colors[Math.floor(pollutionData.getPM25(code, month, day) / 25)]
}