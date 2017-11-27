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
        <Story />
        <Status />
        <CheckPzCode history={this.props.history} />
        <Map />
      </div>
    )
  }
}

export default Dashboard
