import React, { Component } from 'react'

import Map from '../Map'
import Status from '../Status'
import Story from '../Story'

class Dashboard extends Component {
  render(){
    return(
      <div>
        <h1>Dashboard</h1>
        <hr/>
        <Story />
        <Status />
        <Map />
      </div>
    )
  }
}

export default Dashboard
