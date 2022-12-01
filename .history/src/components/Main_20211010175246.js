import React, { Component } from 'react';
import { Row, Col } from 'antd';

class Main extends Component {
  render() {
    return (
      <Row className='main'>
        <Col span={8} className='left-side'>
          left
        </Col>
        <Col span={16} className='right-side'>
          right
        </Col>
      </Row>
    );
  }
}
export default Main;
