import React, { Component } from 'react';
import start from './camUtils';

class Cam extends Component {
  componentDidMount(){
    start()
  }
  render(){
    return(
      <div id="container">
          <div bgcolor="#000000" align='center' class="overlayWrapper">
              <video controls id="remote-video" autoPlay="" width="450" height="235">
                  Your browser does not support the video tag.
              </video>
          </div>
      </div>
  )
  }
}

export default Cam;
