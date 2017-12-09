import React, { Component } from 'react'

import Map from '../Map'
import Status from '../Status'
import Story from '../Story'
import CheckPzCode from '../CheckPzCode'
import AI from '../AI'

class Dashboard extends Component {
  render(){
    return(
      <div id='component-dashboard'>
        <AI />
        <div class='console-wrapper'>
          <div class='story-top'></div>
          <Story />
          <div class='story-bottom'></div>
        </div>
        <div class='console-wrapper -white'>
          <div class='launch-top'></div>
            <Status />
          <div class='launch-bottom'></div>
        </div>
        <div class='console-wrapper'>
          <div class='puzzle-top'></div>
          <CheckPzCode history={this.props.history} />
          <div class='puzzle-bottom'></div>
        </div>
        <div class='console-wrapper'>
          <div class='map-top'></div>
          <Map />
          <div class='map-bottom'></div>
        </div>
      </div>
    )
  }
}

export default Dashboard
