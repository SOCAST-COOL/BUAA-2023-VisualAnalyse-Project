//绘制图表的相关函数

//全局调用一次init后，每次绘图时调用initDrawing或者loadData

import * as echarts from "echarts";
import axios from "axios";
import {getTimes, getNameMap, loadChinaGeo, getWind} from "@/js/DataReader";

//记录热力图的颜色
const colors = ["#0000FF","#0080FF","#00FFFF","#00FF80","#00FF00","#80FF00","#FFFF00","#FF8000","#FF0000"]
//记录地图数据、全局的图表、污染物数据和风向
let chinaGeo = null, myChart = null, pollutionData = null, wind=null;
//记录显示的数据种类，是否显示风向
let view_type = null, show_wind = null;
//所有需要异步加载的数据有多少个
let maxLoadedNumber = 2;
//日期数组上当前日期所对应的下标
let timelineIndex = 0;
//行政区编码变化，用于进入省级视图和退出时重新刷新图表
let code = 100000, changeCode = true;
//当前的地图中心经纬度和缩放的尺寸
let center = null, zoom = null;
//右侧排名的省份数据和对应的数值
let xData = null, yData = null;

//初始化echarts，定义监听函数
//监听时间轴变化、地图的双击，地图的缩放
export function init() {
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

//点击返回按钮后调用，用于从省级数据返回到全国数据
export function returnRouter() {
    if (code === 100000) return;
    code = 100000;
    changeCode = true;
    loadData();
}

//改变显示的数据类型时使用，改变视图或者是否显示风向时调用
export function initDrawing(type, show) {
    view_type = type;
    show_wind = show;
    loadData();
}

//异步加载污染数据和风向数据
function loadPollutionData() {
    let loaded = 0;
    getNameMap(code, getTimes()[timelineIndex], view_type, function(data) {
        pollutionData = data;
        calculateRank();
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

//加载地图后，调用函数加载污染物、风向等数据
function loadData() {
    //首先判断是否发生了行政区的变化，变化后重新加载地图数据
    if (changeCode) {
        changeCode = false;
        loadChinaGeo(code, function (data) {
            chinaGeo = data.map;
            center = data.center;
            zoom = 1;
            loadPollutionData()
        });
    }
    else {
        loadPollutionData()
    }
}

//排序污染物数值
function calculateRank() {
    let sortedArray = pollutionData.map.sort(function(a, b) {
        return b.value - a.value
    });
    xData = [];
    yData = [];
    sortedArray.forEach(d => {
        xData.unshift(d.name);
        yData.unshift(d.value);
    })
}

//绘制图表
export function draw() {
    let nameMap = pollutionData.map;
    let range = pollutionData.range;
    //注册地图
    echarts.registerMap('中国', chinaGeo);
    //设置option
    let option = {
        //热力图设置，从数据值映射的颜色上
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
        //时间轴设置
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
                show: true,
                formatter(params) {
                    let strings = params.name.split('_')
                    return strings[0] + '年' + strings[1] + '月' + strings[2] + '日'
                }
            },
            data: getTimes(),
        },
        tooltip: {},
        //右侧排名的基本数据
        grid: {
            right: '1%',
            top: '15%',
            bottom: '10%',
            width: '20%',
            zlevel: 3,
            show: true,
            showBackground: true,
            backgroundColor: '#FFF',
            backgroundStyle: {
                color: "#FFF"
            },
        },
        //右侧排名的x轴
        xAxis: {
            type: 'value',
            scale: true,
            position: 'top',
            boundaryGap: false,
            splitLine: {
                show: false
            },
            axisLine: {
                show: true,
                lineStyle: {
                    color: '#455B77'
                }
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                margin: 2,
                textStyle: {
                    color: '#c0e6f9'
                }
            },
            data: xData
        },
        //右侧排名的y轴
        yAxis: {
            type: 'category',
            axisLine: {
                show: true,
            },
            axisTick: {
                show: false,
            },
            axisLabel: {
                interval: 0,
                textStyle: {
                    color: '#c0e6f9'
                }
            },
            data: xData
        },
        //所有数据
        series: [
            //污染物数据的图表
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
                tooltip: false,
                layoutCenter: ["50%", "50%"],
                layoutSize: "100%",
                data: nameMap,
            },
            //风向数据的图表
            {
                type: 'map',
                mapType: '中国',//#3
                data: [],
                markLine: {
                    zlevel: 2,
                    smooth:false,
                    symbol: ['none', 'arrow'],
                    tooltip: {show: false},
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
            },
            //排名的柱形图图表
            {
                type: 'bar',
                zlevel: 4,
                backgroundColor: '#FFF',
                showBackground: true,
                backgroundStyle: {
                    color: "#FFF"
                },
                barGap: '-100%',
                barCategoryGap: '60%',
                itemStyle: {
                    normal: {
                        color: '#11AAFE'
                    },
                    emphasis: {
                        show: false
                    }
                },
                data: yData
            }
        ]
    }
    myChart.setOption(option);
}