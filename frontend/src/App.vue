<template>
  <div id="app">
    <el-select v-model="value" placeholder="请选择" @change="renew()"
               style="position:absolute; float: right; right:10px; top: 10px;z-index: 999">
      <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value">
      </el-option>
    </el-select>
    <div id="main"></div>
  </div>
</template>

<script>
import axios from 'axios';
import {init} from "@/js/EchartsUtils";
import {PollutionView, WeatherView} from "@/js/DataReader";

export default {
  name: 'App',
  components: {
  },
  data() {
    return {
      value: '0',
      options: [{value: '0', label: '污染视图'}, {value: '1', label: '气象视图'}]
    }
  },
  created() {
    this.$nextTick(()=> {
      this.renew()
    });
  },
  methods: {
    renew(view_type) {
      if (this.value == '0') {
        init(PollutionView);
      }
      else {
        init(WeatherView);
      }
    }
  }
}
</script>

<style>
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
