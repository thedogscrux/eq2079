import React, { Component } from 'react'

import Map from '../Map'
import Status from '../Status'
import Story from '../Story'
import Pzs from './Pzs'

class Dashboard extends Component {
  render(){
    return(
      <div>
        <h1>Dashboard</h1>
        <hr/>
        <Story />
        <Status />

        <div className='component-wrapper add'>
          <input type='text' placeholder='Puzzle Code' />
          <button>Check Code</button>
        </div>

        <Map />
      </div>
    )
  }
}

export default Dashboard
