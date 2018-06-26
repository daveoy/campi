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
      <Tabs>
        <Tab label="Cam" >
          <Cam />
        </Tab>
        <Tab label="Graphs" >
	    <div align='center'>
            <iframe title='b' src="http://192.168.86.71:3000/dashboard-solo/db/monitoring-environment?orgId=1&panelId=3" frameborder="0"></iframe>
            <iframe title='a' src="http://192.168.86.71:3000/dashboard-solo/db/monitoring-environment?orgId=1&panelId=2" frameborder="0"></iframe>
            <iframe title='b' src="http://192.168.86.71:3000/dashboard-solo/db/monitoring-environment?orgId=1&panelId=4" frameborder="0"></iframe>
            <iframe title='a' src="http://192.168.86.71:3000/dashboard-solo/db/monitoring-environment?orgId=1&panelId=1" frameborder="0"></iframe>
	        <iframe name='hole' width='0' height='0'></iframe>
	        <iframe name='hole2' width='0' height='0'></iframe>
	    </div>
        </Tab>
        <Tab label="Control" >
	    <div align='center'>
	    <form id='lightform' target='hole' action='http://192.168.86.71/cgi-bin/pixels.cgi' method='post'>
	    <table>
	     <tr>
	      <td colspan='2' align='center'>
	       <font color='#FFFFFF'> night light </font>
	      </td>
	     </tr>
	     <tr>
        <td align='center'>
          <select name='nightlight' form='lightform'>
            <option value='off'>off</option>
            <option value='dim'>dim</option>
            <option value='bright'>bright</option>
            <option value='medium'>medium</option>
            <option value='green'>green</option>
            <option value='red'>red</option>
            <option value='blue'>blue</option>
          </select>
        </td>
        <td colspan='2' align='center'>
          <input type='submit'></input>
        </td>
      </tr>
      </table>
      </form>
	    <form id='musicform' target='hole2' action='http://192.168.86.71/cgi-bin/music.cgi' method='post'>
	    <table>
        <tr>
          <td colspan='2' align='center'>
            <font color='#FFFFFF'> music </font>
          </td>
        </tr>
        <tr>
          <td align='center'>
            <select name='track' form='musicform'>
              <option value='stopped'>stopped</option>
              <option value='nature'>nature</option>
              <option value='sailboat'>sailboat</option>
              <option value='ocean'>ocean</option>
            </select>
          </td>
          <td colspan='2' align='center'>
            <input type='submit'></input>
          </td>
        </tr>
        </table>
        </form>
	    </div>
        </Tab>
      </Tabs>
	    </MuiThemeProvider>
    );
  }
}

export default App;
