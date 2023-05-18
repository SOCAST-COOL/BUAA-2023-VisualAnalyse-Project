import * as echarts from "echarts";
import axios from "axios";
import {readChinaPollution} from "@/js/DataReader";


const colors = ["#0000FF","#0080FF","#00FFFF","#00FF80","#00FF00","#80FF00","#FFFF00","#FF8000","#FF0000"]
let pollutionData, chinaGeo, myChart;

export function init() {
    myChart = echarts.init(document.getElementById('main'));
    readChinaPollution(function (data) {
        let day = 0;
        pollutionData = data;
        chinaGeo = pollutionData.geoJson;
        setInterval(function () {
            if (day === 365) day = 1;
            else day++;
            draw(day);
        }, 1000)
    })
}

export function draw(day) {
    let nameMap = pollutionData.getNameMap(day);
    echarts.registerMap('中国', chinaGeo);//#2
    let option = {
        visualMap: {
            min: 0,
            max: 150,
            text: ['High', 'Low'],
            realtime: false,
            calculable: true,
            inRange: {
                color: colors
            }
        },
        series: [
            {
                name: '中国地图',
                type: 'map',
                mapType: '中国',//#3
                itemStyle: {
                    normal: {
                        label: {show: true},
                    },
                    emphasis: {label: {show: false}}
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