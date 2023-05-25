import * as echarts from "echarts";
import axios from "axios";
import {getTimes, getNameMap, loadChinaGeo} from "@/js/DataReader";


const colors = ["#0000FF","#0080FF","#00FFFF","#00FF80","#00FF00","#80FF00","#FFFF00","#FF8000","#FF0000"]
let pollutionData = null, chinaGeo = null, myChart = null;
let timelineIndex = 0;
let currentThread = 0;

export function init(view_type) {
    //限制只能够由一个视图进行绘制
    currentThread++;
    let thread = currentThread;
    //初始化时调用
    if (myChart == null) {
        myChart = echarts.init(document.getElementById('main'));
    }
    //读取数据并绘制地图
    if (chinaGeo == null) {
        loadChinaGeo(function (data) {
            chinaGeo = data
            getNameMap(getTimes()[timelineIndex], view_type, function(data) {
                draw(data.map, data.range);
            });
        })
    }
    //根据当前日期绘制地图
    else {
        getNameMap(getTimes()[timelineIndex], view_type, function(data) {
            draw(data.map, data.range);
        });
    }
    //每次日期发生变化时调用
    myChart.on('timelinechanged', function (timeLineIndex) {
        if (thread !== currentThread) return;
        timelineIndex = timeLineIndex.currentIndex;
        getNameMap(getTimes()[timelineIndex], view_type, function(data) {
            draw(data.map, data.range);
        });
    })
}

export function draw(nameMap, range) {
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
            axisType: 'category',
            playInterval: 500,
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
                label: {
                    show: true
                },
                itemStyle: {
                    normal: {
                        label: {show: true},
                    },
                    emphasis: {

                        label: {show: true}
                    }
                },
                tooltip: {
                    trigger: "item",
                    formatter(params) {
                        return "str" + params.data.value
                    }
                },
                layoutCenter: ["50%", "50%"],
                layoutSize: "100%",
                data: nameMap,
            }
        ]
    }
    myChart.setOption(option);
}

function getColor(code, month, day) {
    return colors[Math.floor(pollutionData.getPM25(code, month, day) / 25)]
}