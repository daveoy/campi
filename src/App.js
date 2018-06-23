import React, { Component } from 'react';
import logo from './logo.svg';
import Cam from './Cam';
import './App.css';

import {Tabs, Tab} from 'material-ui/Tabs';
import Slider from 'material-ui/Slider';

const styles = {
  headline: {
    fontSize: 24,
    paddingTop: 16,
    marginBottom: 12,
    fontWeight: 400,
  },
};

function handleActive(tab) {
  alert(`A tab with this route property ${tab.props['data-route']} was activated.`);
}

class App extends Component {
  render() {
    return (
      <div className="App">
      <Tabs>
        <Tab label="Cam" >
          <div>
            <Cam />
          </div>
        </Tab>
        <Tab label="Temperature" >
          <div>
            <iframe src="http://192.168.86.71:3000/dashboard-solo/db/monitoring-environment?orgId=1&panelId=1" width="225" height="200" frameborder="0"></iframe>
          </div>
        </Tab>
        <Tab label="Humidity" >
          <div>
            <iframe src="http://192.168.86.71:3000/dashboard-solo/db/monitoring-environment?orgId=1&panelId=4" width="225" height="200" frameborder="0"></iframe>
          </div>
        </Tab>
      </Tabs>
      </div>
    );
  }
}

export default App;
