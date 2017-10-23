import React, { Component } from 'react'

import { staticLaunches } from '../data/static.js'

class Status extends Component {
  getLaunchStatus() {
    let html = ''
    let launch = staticLaunches.filter( launch => launch.status === 'active')
    launch = launch[0]
    return(
      <div>
        Status: {launch.status}<br/>
        Start: {launch.start}<br/>
        End: {launch.end}<br/>
        Players: {launch.players}<br/>
        Total Score: {launch.totalScore}<br/>
        Total Game Plays: {launch.totalGamePlays}<br/>
      </div>
    )
  }

  render(){
    return(
      <div className='component-wrapper'>
        <h2>Status</h2>
        {this.getLaunchStatus()}
      </div>
    )
  }
}

export default Status
