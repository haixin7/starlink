import React, { Component } from 'react';
import axios from 'axios';
import { Spin } from 'antd';
import { feature } from 'topojson-client';
import { geoKavrayskiy7 } from 'd3-geo-projection';
import { geoGraticule, geoPath } from 'd3-geo';
import { select as d3Select } from 'd3-selection';
import { schemeCategory10 } from 'd3-scale-chromatic';
import * as d3Scale from 'd3-scale';
import { timeFormat as d3TimeFormat } from 'd3-time-format';

import {
  WORLD_MAP_URL,
  SATELLITE_POSITION_URL,
  SAT_API_KEY,
} from '../constants';

const width = 960;
const height = 600;

class WorldMap extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
      isDrawing: false,
       this.map = null;
    };
    // this.map = null;
    this.color = d3Scale.scaleOrdinal(schemeCategory10);
    this.refMap = React.createRef();
    this.refTrack = React.createRef();
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

  componentDidUpdate(prevProps, prevState) {
    //每次点worldmap绿色button刷新数据
    if (prevProps.satData !== this.props.satData) {
      //以前选中卫星不等于这次选中卫星
      const { latitude, longitude, elevation, duration } =
        this.props.observerData;
      const endTime = duration * 60; //这里实际是分钟的数据

      this.setState({
        isLoading: true,
      });

      const urls = this.props.satData.map((sat) => {
        //装满了promise数组 每个p和每个卫星一一对应
        const { satid } = sat;
        const url = `/api/${SATELLITE_POSITION_URL}/${satid}/${latitude}/${longitude}/${elevation}/${endTime}/&apiKey=${SAT_API_KEY}`;

        return axios.get(url);
      });

      Promise.all(urls) //打包处理promise
        .then((res) => {
          //当全成功
          const arr = res.map((sat) => sat.data);
          this.setState({
            isLoading: false,
            isDrawing: true,
          });

          if (!prevState.isDrawing) {
            //如果之前没画移动的卫星
            //一个失败全失败
            this.track(arr);
          } else {
            const oHint = document.getElementsByClassName('hint')[0];
            oHint.innerHTML =
              'Please wait for these satellite animation to finish before selection new ones!';
          }
        })
        .catch((e) => {
          console.log('err in fetch satellite position -> ', e.message);
        });
    }
  }

  track = (data) => {
    if (!data[0].hasOwnProperty('positions')) {
      throw new Error('no position data');
    }

    const len = data[0].positions.length;
    const { context2 } = this.map;

    let now = new Date();

    let i = 0;

    let timer = setInterval(() => {
      let ct = new Date();

      let timePassed = i === 0 ? 0 : ct - now;
      let time = new Date(now.getTime() + 60 * timePassed);

      context2.clearRect(0, 0, width, height);

      context2.font = 'bold 14px sans-serif';
      context2.fillStyle = '#333';
      context2.textAlign = 'center';
      context2.fillText(d3TimeFormat(time), width / 2, 10);

      if (i >= len) {
        clearInterval(timer);
        this.setState({ isDrawing: false });
        const oHint = document.getElementsByClassName('hint')[0];
        oHint.innerHTML = '';
        return;
      }

      data.forEach((sat) => {
        const { info, positions } = sat;
        this.drawSat(info, positions[i]);
      });

      i += 60;
    }, 1000);
  };

  drawSat = (sat, pos) => {
    const { satlongitude, satlatitude } = pos;

    if (!satlongitude || !satlatitude) return;

    const { satname } = sat;
    const nameWithNumber = satname.match(/\d+/g).join('');

    const { projection, context2 } = this.map;
    const xy = projection([satlongitude, satlatitude]);

    context2.fillStyle = this.color(nameWithNumber);
    context2.beginPath();
    context2.arc(xy[0], xy[1], 4, 0, 2 * Math.PI);
    context2.fill();

    context2.font = 'bold 11px sans-serif';
    context2.textAlign = 'center';
    context2.fillText(nameWithNumber, xy[0], xy[1] + 14);
  };

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

    this.map = {
      projection: projection,
      graticule: graticule,
      // context: context,
      // context2: context2,
    };
  }

  render() {
    const { isLoading } = this.state;
    return (
      <div className='map-box'>
        {isLoading ? (
          <div className='spinner'>
            <Spin tip='Loading...' size='large' />
          </div>
        ) : null}
        <canvas className='map' ref={this.refMap} />
        <canvas className='track' ref={this.refTrack} />
        <div className='hint' />
      </div>
    );
  }
}

export default WorldMap;
