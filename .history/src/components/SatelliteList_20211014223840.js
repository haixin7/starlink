import React, { Component } from 'react';
import { List, Avatar, Button, Checkbox, Spin } from 'antd';
import satellite from '../assets/images/spacex_logo.svg';

class SatelliteList extends Component {
  state = {
    selected: [], //[{id:xxx,checked:false},{},{}]存这些信息
  };
  onChange = (e) => {
    const { dataInfo, checked } = e.target;
    const { selected } = this.state;
    const list = this.addOrRemove(dataInfo, checked, selected);
    this.setState({ selected: list });
  };

  addOrRemove = (item, status, list) => {
    const found = list.some((entry) => entry.satid === item.satid);
    //some 把satid作用在list 每一个卫星 一个一个判断 用户点的在不在这个list里
    if (status && !found) {
      list.push(item);
    }

    if (!status && found) {
      list = list.filter((entry) => {
        //filter 像map 用来删除
        return entry.satid !== item.satid;
      });
    }
    return list;
  };

  onShowSatMap = () => {
    this.props.onShowMap(this.state.selected);
  };

  render() {
    const satList = this.props.satInfo ? this.props.satInfo.above : [];
    const { isLoad } = this.props; //都是parent传下来的
    const { selected } = this.state;

    return (
      <div className='sat-list-box'>
        <Button
          className='sat-list-btn'
          size='large'
          disabled={selected.length === 0}
        >
          Track on the map
        </Button>
        <hr />

        {isLoad ? (
          <div className='spin-box'>
            <Spin tip='Loading...' size='large' />
          </div>
        ) : (
          <List
            className='sat-list'
            itemLayout='horizontal'
            size='small'
            dataSource={satList}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Checkbox dataInfo={item} onChange={this.onChange} />,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar size={50} src={satellite} />}
                  title={<p>{item.satname}</p>}
                  description={`Launch Date: ${item.launchDate}`}
                />
              </List.Item>
            )}
          />
        )}
      </div>
    );
  }
}

export default SatelliteList;
