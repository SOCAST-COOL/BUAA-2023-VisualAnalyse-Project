import * as d3 from 'd3';
import axios from "axios";
import {readChinaPollution} from "@/js/DataReader";
import h337 from "heatmap.js";

let scale = 15, pointSize = 0.08;
const colors = ["#0000FF","#0080FF","#00FFFF","#00FF80","#00FF00","#80FF00","#FFFF00","#FF8000","#FF0000"]
const width = (window.innerWidth - 15) * scale / 15, height = (window.innerHeight - 15) * scale / 15;
const range = {x:{min:73.66, max:135.05}, y:{min:18.158, max:53.55}}, center = [(range.x.max + range.x.min) / 2, (range.y.max + range.y.min) / 2]
let chinaGeo;
let pollutionData;

export function setScale(newSize) {
    let scale = newSize;
}

function project(x, y) {
    return [projectX(x), projectY(y)]
}

function projectX(x) {
    return (x - center[0]) * scale + width / 2;
}

function projectY(y) {
    return (center[1] - y) * scale + height / 2
}

export function initMap() {
    console.log('init')
    readChinaPollution(function (data) {
        pollutionData = data;
        chinaGeo = pollutionData.geoJson;
        console.log(chinaGeo)
        draw();
    })
}

export function draw() {


        // console.log(chinaGeo)
    var svg = d3.select('#chart')
        // .append("svg")
        // .attr("width", width)
        // .attr("height", height)
        // .style('background', 'none');
svg.data(pollutionData).enter().append('p').text(function (e) {return e;})

    // var groups=svg.append("g");
    for (let j = 0; j < chinaGeo.features.length; j++) {
        let code = Number(chinaGeo.features[j].properties.code);

        let paths = chinaGeo.features[j].geometry.coordinates[0][0]
        let lineFunction = d3.line()
            .x(function (d) {
                return project(d[0],d[1])[0]})
            .y(function(d) {return project(d[0], d[1])[1]})
        svg.append("path")
            .attr("d", lineFunction(paths))
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("fill", getColor(code, 1, 1));
    }
    function zoomed() {
        console.log('zoom')
        const t = d3.event.transform;
        svg.attr("transform", `translate(${t.x}, ${t.y}) scale(${t.k})`);
    }
    const zoom = d3.zoom()
        .scaleExtent([1, 3])  //设置监听范围
        .on("zoom", function (e) {console.log(e)});  //设置监听事件

    svg.call(zoom);
    svg.on('mouseover', function () {console.log("mouseover")})
}

function getColor(code, month, day) {
    return colors[Math.floor(pollutionData.getPM25(code, month, day) / 25)]
}

function initHeatMapOrigin(pointArr) {
    // create configuration object
    let x = document.getElementById("mapTest");
    let config = {
        container: x,
        radius: 10,
        maxOpacity: 0.5,
        minOpacity: 0,
        blur: 0.75,
        gradient: {
            // enter n keys between 0 and 1 here
            // for gradient color customization
            ".5": "blue",
            ".8": "red",
            ".95": "white",
        },
    };
    // create heatmap with configuration
    let heapMapIns = h337.create(config);

    // a single datapoint
    // let point = {
    //     x: 150, // x coordinate of the datapoint, number
    //     y: 215, // y coordinate of the datapoint, number
    //     value: 50, // the value at datapoint(x, y)
    // };
    // let dataPoint = point;
    // heapMapIns.addData(dataPoint);
    heapMapIns.addData(pointArr)
    // multiple datapoint
    // (for data initialization use setData!!)
    // heapMapIns.addData(this.pointsArr);
}