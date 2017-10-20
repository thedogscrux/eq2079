import React, { Component } from 'react'

import Map from '../Map'
import Status from '../Status'
import Story from '../Story'

class Dashboard extends Component {
  render(){
    return(
      <div>
        Dashboard
        <hr/>
        <Story />
        <Status />
        <Map />
      </div>
    )
  }
}

export default Dashboard
