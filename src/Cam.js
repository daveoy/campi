const { spawnSync } = require('child_process');
import React, { Component } from 'react';
import start from './camUtils';
import 'Button' from 'material-ui/core/Button'
class Cam extends Component {
  disconnectCamera(){
    const resp = spawnSync('/bin/systemctl restart uv4l_raspicam')
    return 0
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
          <Button variat='contained' onClick=disconnectCamera()/>
      </div>
  )
  }
}

export default Cam;
