import React, { Component } from 'react';
import { Row, Col } from 'antd';
import SatSetting from './SatSetting';
import SatelliteList from './SatelliteList';

class Main extends Component {
  render() {
    return (
      <Row className='main'>
        <Col span={8} className='left-side'>
          <SatSetting />
          <SatelliteList />
        </Col>
        <Col span={16} className='right-side'>
          right
        </Col>
      </Row>
    );
  }
}
export default Main;
