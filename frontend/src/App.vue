<template>
  <div id="app">
<!--    <svg id="chart"></svg>-->
    <div id="main"></div>
  </div>
</template>

<script>
import axios from 'axios';
import {init} from "@/js/EchartsUtils";

export default {
  name: 'App',
  components: {
  },
  data() {
    return {
      value: 15
    }
  },
  created() {
    this.$nextTick(()=> {
      this.renew()
    });
  },
  methods: {
    renew() {
      // let startTime = new Date().getTime();
      // axios.get('http://127.0.0.1:8000/db/').then(function(e) {
      //   console.log(e.data);
      //   console.log(new Date().getTime() - startTime);
      // })
      // initMap();
      init();
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
