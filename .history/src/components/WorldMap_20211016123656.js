import React, { Component } from 'react';
import { feature } from 'topojson-client';
import axios from 'axios';
import { geoKavrayskiy7 } from 'd3-geo-projection';
import { geoGraticule, geoPath } from 'd3-geo';
import { select as d3Select } from 'd3-selection';

import { WORLD_MAP_URL } from '../constants';

const width = 960;
const height = 600;

class WorldMap extends Component {
  constructor() {
    super();
    this.state = {
      map: null,
    };
    this.refMap = React.createRef();
  }

  componentDidMount() {
    axios
      .get(WORLD_MAP_URL)
      .then((res) => {
        const { data } = res;
        const land = feature(data, data.objects.countries).features; //用topjson library解析数据
        this.generateMap(land);
      })
      .catch((e) => console.log('err in fecth world map data ', e));
  }

  generateMap(land) {
    const projection = geoKavrayskiy7() //地图的投影
      .scale(170)
      .translate([width / 2, height / 2])
      .precision(0.1);

    const graticule = geoGraticule(); //经纬线网格

    const canvas = d3Select(this.refMap.current) //元素的ref传给d3 调整画布属性
      .attr('width', width) //设置属性
      .attr('height', height);

    let context = canvas.node().getContext('2d'); // 画2d的图 画布context抽出来

    let path = geoPath().projection(projection).context(context); // 传给geopath libary给的 把画的数据传给他 path就是配置好的笔

    //下面进行真正画图过程
    land.forEach((ele) => {
      context.fillStyle = '#B3DDEF'; //填充色
      context.strokeStyle = '#000';
      context.globalAlpha = 0.7;
      context.beginPath(); //调用开始作画
      path(ele); //用笔 拿ele元素 画
      context.fill(); //填颜色
      context.stroke(); //画线
      //以上国家就画好了

      context.strokeStyle = 'rgba(220, 220, 220, 0.1)'; //下两步没必要放foreach里 放在里面也没错
      context.beginPath();
      path(graticule()); //画经纬度
      context.lineWidth = 0.5;
      context.stroke();

      context.beginPath();
      context.lineWidth = 0.5;
      path(graticule.outline());
      context.stroke();
    });
  }

  render() {
    return (
      <div className='map-box'>
        <canvas className='map' ref={this.refMap} />
      </div>
    );
  }
}

export default WorldMap;
