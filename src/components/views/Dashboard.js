import React, { Component } from 'react'

import Map from '../Map'
import Status from '../Status'
import Story from '../Story'
import CheckPzCode from '../CheckPzCode'

class Dashboard extends Component {
  render(){
    return(
      <div>
        <h1>Dashboard</h1>
        <Story />
        <Status />
        <CheckPzCode history={this.props.history} />
        <Map />
      </div>
    )
  }
}

export default Dashboard
