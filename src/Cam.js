import React, { Component } from 'react';
import start from './camUtils';

class Cam extends Component {
  componentDidMount(){
    start()
  }
  render(){
    return(
      <div id="container">
          <div bgcolor="#000000" class="overlayWrapper">
              <video id="remote-video" autoplay="" width="450" height="235">
                  Your browser does not support the video tag.
              </video>
          </div>
      </div>
  )
  }
}

export default Cam;
