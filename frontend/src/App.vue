<template>
  <div id="app">
<!--    左侧返回区域-->
    <el-button type="text" class="router-btn" @click="routerReturn">
      返回
    </el-button>
<!--    右侧选择数据区域-->
    <div class="data-selector" style="position:absolute; float: right; right:10px; top: 10px;z-index: 999">
      <div style="margin: 5px 0">
        显示风向
        <el-switch
          v-model="showWind"
          active-color="#13ce66"
          inactive-color="#ff4949"
          @change="renew">
        </el-switch>
      </div>
      <div style="margin: 5px 0">
        <el-select v-model="value" placeholder="请选择" @change="renew()">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </div>
    </div>
<!--    地图区域-->
    <div id="main"></div>
  </div>
</template>

<script>
import axios from 'axios';
import {initDrawing, init, returnRouter} from "@/js/EchartsUtils";
import {PollutionView, TEMPView, RHView, PSFCView} from "@/js/DataReader";

export default {
  name: 'App',
  components: {
  },
  data() {
    return {
      value: '0',
      options: [{value: '0', label: '污染视图'}, {value: '1', label: '温度视图'},
        {value: '2', label: '湿度视图'}, {value: '3', label: '气压视图'}],
      showWind: true,
    }
  },
  created() {
    this.$nextTick(()=> {
      init();
      this.renew()
    });
  },
  methods: {
    renew() {
      if (this.value === '0') {
        initDrawing(PollutionView, this.showWind);
      }
      else if (this.value === '1') {
        initDrawing(TEMPView, this.showWind);
      }
      else if (this.value === '2') {
        initDrawing(RHView, this.showWind);
      }
      else if (this.value == '3') {
        initDrawing(PSFCView, this.showWind);
      }
      else {
        //TODO
      }
    },
    routerReturn() {
      returnRouter();
    },
  }
}
</script>

<style>
.router-btn {
  position:absolute;
  float: left;
  left:30px;
  top: 10px;
  z-index: 999
}
#main {
  width: calc(100% - 1px);
  height: calc(100% - 1px);
}
#chart {
  width: 100%;
  height: 100%;
  /*position: absolute;*/
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  position: absolute;
  color: #2c3e50;
  height: 100%;
  width: 100%;
}
</style>
