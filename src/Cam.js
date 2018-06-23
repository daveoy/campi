import React, { Component } from 'react';
import start from './camUtils';

class Cam extends Component {
  componentDidMount(){
    start()
  }
  render(){
    <div id="container">
        <div bgcolor="#000000" class="overlayWrapper">
            <video id="remote-video" autoplay="" width="450" height="235">
                Your browser does not support the video tag.
            </video>
            <p class="overlay">remote</p>
        </div>
    </div>
  }
}

export default Cam;
