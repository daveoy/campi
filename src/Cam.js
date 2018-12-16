import React, { Component } from 'react';
import start from './camUtils';
import RaisedButton from 'material-ui/RaisedButton'
class Cam extends Component {
  async disconnectCamera(){
	const refreshResponse = await fetch('http://192.168.86.71:4666/refresh')
	const refreshResponseJSON = await refreshResponse.json()
	const refresh = await refreshResponseJSON.resp
	console.log(refresh)
  }
  componentDidMount(){
    start()
  }
  render(){
    return(
      <div id="container">
          <div bgcolor="#000000" align='center' class="overlayWrapper">
              <video controls id="remote-video" width="450" height="235">
                  Your browser does not support the video tag.
              </video>
          </div>
          <RaisedButton primary={true} label='take video'  onClick={() => this.disconnectCamera()}/>
      </div>
  )
  }
}

export default Cam;
