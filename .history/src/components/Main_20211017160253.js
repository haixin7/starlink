import React, { Component } from 'react';
import { Row, Col } from 'antd';
import axios from 'axios';
import SatSetting from './SatSetting';
import SatelliteList from './SatelliteList';
import { NEARBY_SATELLITE, SAT_API_KEY, STARLINK_CATEGORY } from '../constants';
import WorldMap from './WorldMap';

class Main extends Component {
  constructor() {
    super();
    this.state = {
      satInfo: null,
      satList: null,
      setting: null,
      isLoadingList: false,
    };
  }
  render() {
    const { isLoadingList, satInfo, satList, setting } = this.state;
    return (
      <Row className='main'>
        <Col span={8} className='left-side'>
          <SatSetting onShow={this.showNearbySatellite} />
          <SatelliteList
            isLoad={isLoadingList}
            satInfo={satInfo}
            onShowMap={this.showMap}
          />
        </Col>
        <Col span={16} className='right-side'>
          <WorldMap satData={satList} observerData={setting} />
        </Col>
      </Row>
    );
  }

  showMap = (selected) => {
    //让main也存一份 用户选择了多少 最终传给worldmap  我们做不到silbing传递 就要父传子
    this.setState((preState) => ({
      ...preState,
      satList: [...selected],
    }));
  };

  showNearbySatellite = (setting) => {
    //setting 就是表格里填好的信息通过satsetting传进来
    this.setState({
      isLoadingList: true,
      setting: setting,
    });
    this.fetchSatellite(setting);
  };

  fetchSatellite = (setting) => {
    const { latitude, longitude, elevation, altitude } = setting;
    const url = `/api/${NEARBY_SATELLITE}/${latitude}/${longitude}/${elevation}/${altitude}/${STARLINK_CATEGORY}/&apiKey=${SAT_API_KEY}`;

    this.setState({
      isLoadingList: true,
    });

    axios
      .get(url)
      .then((response) => {
        //成功就进入.then
        console.log(response.data);
        this.setState({
          satInfo: response.data,
          isLoadingList: false,
        });
      })
      .catch((error) => {
        console.log('err in fetch satellite -> ', error);
      });
  };
}
export default Main;
