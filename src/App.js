import React, { Component } from 'react';
import logo from './logo.svg';
import Cam from './Cam';
import './App.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import {Tabs, Tab} from 'material-ui/Tabs';


class App extends Component {
  render() {
    return (
	<MuiThemeProvider>
      <div className="App" align='center'>
      <Tabs>
        <Tab label="Cam" >
            <Cam />
        </Tab>
        <Tab label="Temperature" >
            <iframe title='a' src="http://192.168.86.71:3000/dashboard-solo/db/monitoring-environment?orgId=1&panelId=1" frameborder="0"></iframe>
        </Tab>
        <Tab label="Humidity" >
            <iframe title='b' src="http://192.168.86.71:3000/dashboard-solo/db/monitoring-environment?orgId=1&panelId=4" frameborder="0"></iframe>
        </Tab>
      </Tabs>
      </div>
	    </MuiThemeProvider>
    );
  }
}

export default App;
